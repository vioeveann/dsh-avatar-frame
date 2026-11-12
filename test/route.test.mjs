/**
 * 宿主路由的回归测试：用假的 ctx 把 index.js 的 handler 挂到本地 HTTP 服务上。
 *
 * 覆盖三件容易回退的事：
 * - 同源 / 桌面版（dsh-app 传输会删掉 Origin）两种合法来源；
 * - 跨站 simple request（text/plain）和跨源 JSON 的拦截；
 * - 启动脚本的临时目录会在 stop 时被清掉（曾经每次停止都留一个目录）。
 *
 * 测试把 HOME 指到临时目录，不碰真实的配置和 debug.log。
 */
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const home = fs.mkdtempSync(path.join(os.tmpdir(), 'daf-test-home-'));
process.env.USERPROFILE = home;
process.env.HOME = home;

const storeDir = path.join(home, '.dsh', 'storages', 'dsh-avatar-frame');
fs.mkdirSync(storeDir, { recursive: true });
fs.writeFileSync(
  path.join(storeDir, 'service.json'),
  JSON.stringify({ command: 'echo launch-script-leak-test', cwd: home, env: 'ALPHA=1\nBETA=2', autostart: false, allowRemote: false }),
  'utf8',
);

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const { apply } = await import('../index.js');

let handler = null;
const launched = [];

/** 假的子进程句柄：terminate()/settleWith() 才让 done 结算，测试里不真的起进程。 */
function fakeSpawn(options) {
  let settle;
  const done = new Promise((resolve) => {
    settle = resolve;
  });
  const handle = {
    options,
    done,
    stderr: undefined,
    stdout: undefined,
    terminate() {
      settle({ exitCode: null, signal: 'SIGTERM' });
    },
    settleWith(exitCode) {
      settle({ exitCode, signal: null });
    },
  };
  launched.push(handle);
  return handle;
}

apply({
  inject(dependencies, callback) {
    callback({
      webServer: {
        register(route) {
          handler = route.handler;
          return () => {};
        },
      },
      subprocess: { spawn: fakeSpawn },
      logger: { info() {}, warn() {} },
      effect(fn) {
        return fn();
      },
    });
  },
});

assert.equal(typeof handler, 'function', 'route handler should be registered');

const server = http.createServer((req, res) => {
  void handler(req, res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const origin = `http://127.0.0.1:${port}`;
const route = '/dsh-avatar-frame/service';
const JSON_HEADERS = { 'Content-Type': 'application/json' };
const TEXT_HEADERS = { 'Content-Type': 'text/plain' };

function request(options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port, path: route, method: options.method || 'GET', headers: options.headers || {} },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => resolve({ status: res.statusCode, body }));
      },
    );
    req.on('error', reject);
    if (options.body !== undefined) req.write(options.body);
    req.end();
  });
}

function launchDirs() {
  return new Set(fs.readdirSync(os.tmpdir()).filter((name) => name.startsWith('dsh-avatar-frame-')));
}

async function readState() {
  const response = await request({ headers: { Origin: origin } });
  assert.equal(response.status, 200);
  return JSON.parse(response.body);
}

/** 等状态满足条件（进程退出、lastExit 写入都是异步的）。 */
async function waitForState(predicate, timeoutMs = 4000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const state = await readState();
    if (predicate(state)) return state;
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
  throw new Error('state condition was not met in time');
}

test('非法 JSON 返回 400，超大请求体返回 413', async () => {
  const bad = await request({
    method: 'POST',
    headers: { ...JSON_HEADERS },
    body: 'not json',
  });
  assert.equal(bad.status, 400);
  assert.equal(JSON.parse(bad.body).error, 'invalid JSON body');

  const huge = await request({
    method: 'POST',
    headers: { ...JSON_HEADERS },
    body: '{"action":"debug","message":"' + 'x'.repeat(300 * 1024) + '"}',
  });
  assert.equal(huge.status, 413);
  assert.equal(JSON.parse(huge.body).error, 'body too large');
});

after(() => {
  server.close();
  fs.rmSync(home, { recursive: true, force: true });
});

test('GET 无 Origin（地址栏 / 桌面版转发）放行', async () => {
  const response = await request();
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(response.body).ok, true);
});

test('GET 同源 Origin 放行', async () => {
  const response = await request({ headers: { Origin: origin } });
  assert.equal(response.status, 200);
});

test('GET 别的本地端口 Origin 拒绝', async () => {
  const response = await request({ headers: { Origin: 'http://localhost:3000' } });
  assert.equal(response.status, 403);
});

test('POST 别的本地端口 + text/plain（原漏洞）拒绝', async () => {
  const response = await request({
    method: 'POST',
    headers: { Origin: 'http://localhost:3000', ...TEXT_HEADERS },
    body: '{"action":"debug","message":"csrf"}',
  });
  assert.equal(response.status, 403);
});

test('POST 别的本地端口 + json 拒绝', async () => {
  const response = await request({
    method: 'POST',
    headers: { Origin: 'http://localhost:3000', ...JSON_HEADERS },
    body: '{"action":"debug","message":"csrf"}',
  });
  assert.equal(response.status, 403);
});

test('POST 外部来源 + json 拒绝', async () => {
  const response = await request({
    method: 'POST',
    headers: { Origin: 'https://evil.example.com', ...JSON_HEADERS },
    body: '{"action":"debug","message":"csrf"}',
  });
  assert.equal(response.status, 403);
});

test('POST 同源 + text/plain 拒绝（415）', async () => {
  const response = await request({
    method: 'POST',
    headers: { Origin: origin, ...TEXT_HEADERS },
    body: '{"action":"debug","message":"csrf"}',
  });
  assert.equal(response.status, 415);
});

test('POST 同源 + 无 Content-Type 拒绝（415）', async () => {
  const response = await request({
    method: 'POST',
    headers: { Origin: origin },
    body: '{"action":"debug","message":"csrf"}',
  });
  assert.equal(response.status, 415);
});

test('POST 无 Origin + json 放行（桌面版 dsh-app 转发后的形态）', async () => {
  const response = await request({
    method: 'POST',
    headers: { ...JSON_HEADERS },
    body: JSON.stringify({ action: 'debug', message: 'no-origin transport' }),
  });
  assert.equal(response.status, 200);
});

test('POST Origin: dsh-app://app + json 放行', async () => {
  const response = await request({
    method: 'POST',
    headers: { Origin: 'dsh-app://app', ...JSON_HEADERS },
    body: JSON.stringify({ action: 'debug', message: 'dsh-app origin' }),
  });
  assert.equal(response.status, 200);
});

test('POST 同源但 host 不同（localhost vs 127.0.0.1）拒绝', async () => {
  const response = await request({
    method: 'POST',
    headers: { Origin: `http://localhost:${port}`, ...JSON_HEADERS },
    body: '{"action":"debug","message":"csrf"}',
  });
  assert.equal(response.status, 403);
});

test('POST 未知 action 仍是 400（action 语义没变）', async () => {
  const response = await request({
    method: 'POST',
    headers: { Origin: origin, ...JSON_HEADERS },
    body: JSON.stringify({ action: 'no-such-action' }),
  });
  assert.equal(response.status, 400);
});

test('POST Content-Type 必须完整匹配 application/json', async () => {
  const prefixed = await request({
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/jsonx' },
    body: JSON.stringify({ action: 'debug' }),
  });
  assert.equal(prefixed.status, 415, 'a same-prefix media type must not pass');

  const withCharset = await request({
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ action: 'debug', message: 'charset ok' }),
  });
  assert.equal(withCharset.status, 200, 'a charset parameter is fine');
});

test('PUT 同源仍是 405', async () => {
  const response = await request({
    method: 'PUT',
    headers: { Origin: origin, ...JSON_HEADERS },
    body: '{}',
  });
  assert.equal(response.status, 405);
});

test('start / stop 走通，且启动脚本临时目录会被清理', async () => {
  const before = launchDirs();

  const started = await request({
    method: 'POST',
    headers: { ...JSON_HEADERS },
    body: JSON.stringify({ action: 'start' }),
  });
  assert.equal(started.status, 200);
  assert.equal(JSON.parse(started.body).state.running, true);
  assert.equal(launched.length, 1, 'subprocess.spawn should be called once');

  const afterStart = launchDirs();
  const created = [...afterStart].filter((name) => !before.has(name));
  assert.equal(created.length, 1, 'start should create exactly one launch script dir');

  const stopped = await request({
    method: 'POST',
    headers: { ...JSON_HEADERS },
    body: JSON.stringify({ action: 'stop' }),
  });
  assert.equal(stopped.status, 200);
  assert.equal(JSON.parse(stopped.body).state.running, false);

  const afterStop = launchDirs();
  const leaked = [...afterStop].filter((name) => !before.has(name));
  assert.deepEqual(leaked, [], 'stop should remove the launch script dir');
});

test('tts 代理：本机地址放行，远程地址默认拒绝（SSRF 面）', async () => {
  const tts = http.createServer((req, res) => {
    if (req.url === '/tts') {
      res.writeHead(200, { 'Content-Type': 'audio/wav' });
      res.end(Buffer.from('RIFF-fake-wave'));
      return;
    }
    res.writeHead(404);
    res.end();
  });
  await new Promise((resolve) => tts.listen(0, '127.0.0.1', resolve));
  const ttsPort = tts.address().port;

  const local = await request({
    method: 'POST',
    headers: { ...JSON_HEADERS },
    body: JSON.stringify({ action: 'tts', endpoint: `http://127.0.0.1:${ttsPort}`, text: '测试', speed: 1, tone: 'normal' }),
  });
  assert.equal(local.status, 200);
  const localPayload = JSON.parse(local.body);
  assert.equal(localPayload.ok, true);
  assert.ok(localPayload.base64.length > 0);

  const remote = await request({
    method: 'POST',
    headers: { ...JSON_HEADERS },
    body: JSON.stringify({ action: 'tts', endpoint: 'http://192.168.1.10:18124', text: '测试' }),
  });
  assert.equal(remote.status, 400);
  assert.match(JSON.parse(remote.body).error, /remote speech service is disabled/);

  await new Promise((resolve) => tts.close(resolve));
});

test('save 能打开 / 关掉 allowRemote（默认关）', async () => {
  const read = () =>
    request({ headers: { Origin: origin } }).then((response) => JSON.parse(response.body).config.allowRemote);
  assert.equal(await read(), false);

  const enabled = await request({
    method: 'POST',
    headers: { ...JSON_HEADERS },
    body: JSON.stringify({ action: 'save', allowRemote: true }),
  });
  assert.equal(enabled.status, 200);
  assert.equal(JSON.parse(enabled.body).state.config.allowRemote, true);

  const disabled = await request({
    method: 'POST',
    headers: { ...JSON_HEADERS },
    body: JSON.stringify({ action: 'save', allowRemote: false }),
  });
  assert.equal(disabled.status, 200);
  assert.equal(JSON.parse(disabled.body).state.config.allowRemote, false);
});

test('手动停止会复位内部状态：之后自然退出的输出仍然被捕获', async () => {
  // 起一个，再手动停掉；这一步过去会把 stopRequested 留在 true。
  await request({ method: 'POST', headers: { ...JSON_HEADERS }, body: JSON.stringify({ action: 'start' }) });
  const stopped = await request({ method: 'POST', headers: { ...JSON_HEADERS }, body: JSON.stringify({ action: 'stop' }) });
  assert.equal(stopped.status, 200);
  let state = await readState();
  assert.equal(state.running, false);
  assert.equal(state.lastExit, null, 'a manual stop should not keep an old exit record');

  // 再起一个，让它自己退出：输出必须被捕获，不能被当成「手动停止」清空。
  await request({ method: 'POST', headers: { ...JSON_HEADERS }, body: JSON.stringify({ action: 'start' }) });
  const handle = launched[launched.length - 1];
  handle.stderr = { readFrom: () => ({ text: 'fatal: port already in use' }) };
  handle.settleWith(3);

  state = await waitForState((value) => value.lastExit !== null);
  assert.equal(state.running, false);
  assert.equal(state.lastExit.exitCode, 3);
  assert.match(state.lastExit.output, /port already in use/);
});

test('diagnostics 返回版本、状态和日志尾巴，但不泄露环境变量的值', async () => {
  const response = await request({
    method: 'POST',
    headers: { Origin: origin, ...JSON_HEADERS },
    body: JSON.stringify({ action: 'diagnostics' }),
  });
  assert.equal(response.status, 200);
  const payload = JSON.parse(response.body);
  assert.equal(payload.ok, true);
  assert.match(payload.text, new RegExp('dsh-avatar-frame ' + pkg.version.replace(/\./g, '\\.')));
  assert.match(payload.text, /running: false/);
  assert.match(payload.text, /env: 2 key\(s\), values hidden/);
  assert.match(payload.text, /allow remote tts: false/);
  assert.equal(payload.text.includes('ALPHA=1'), false, 'env values must not leak');
});
