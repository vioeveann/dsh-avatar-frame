/**
 * 宿主端：管理用户自己的语音服务进程。
 *
 * 插件的界面跑在浏览器里，不能启动本地进程，所以由这一半负责：
 * - 注册同源路由 `/dsh-avatar-frame/service`，界面通过它读写状态；
 * - 用 `ctx.subprocess.spawn` 启动使用者配置的命令行；
 * - 配置（命令、目录、环境变量、是否随 DSH 启动）只存在本机。
 *
 * 这里不携带、不下载任何服务：命令完全由使用者填写。
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROUTE = '/dsh-avatar-frame/service';
const STORE_DIR = path.join(os.homedir(), '.dsh', 'storages', 'dsh-avatar-frame');
const STORE_FILE = path.join(STORE_DIR, 'service.json');
const DEBUG_FILE = path.join(STORE_DIR, 'debug.log');

const EMPTY_CONFIG = { command: '', cwd: '', env: '', autostart: false, allowRemote: false };

/** 本包版本号：诊断信息里带上，报障时一眼能对版本。 */
const PKG_VERSION = (() => {
  try {
    return JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version || '?';
  } catch {
    return '?';
  }
})();

/** debug.log 的最后几行；读不到就返回空串。 */
function debugTail(maxLines) {
  try {
    const text = fs.readFileSync(DEBUG_FILE, 'utf8');
    return text
      .split('\n')
      .filter((line) => line.trim() !== '')
      .slice(-maxLines)
      .join('\n');
  } catch {
    return '';
  }
}

/** 把客户端的诊断信息追加到 debug.log，方便排查"点了没反应"这类问题。 */
function appendDebug(message) {
  try {
    fs.mkdirSync(STORE_DIR, { recursive: true });
    fs.appendFileSync(DEBUG_FILE, new Date().toISOString() + ' ' + String(message) + '\n', 'utf8');
    const lines = fs.readFileSync(DEBUG_FILE, 'utf8').split('\n');
    if (lines.length > 300) fs.writeFileSync(DEBUG_FILE, lines.slice(-300).join('\n'), 'utf8');
  } catch {
    // 诊断写入失败不影响主流程。
  }
}

function readConfig() {
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    return {
      command: typeof parsed.command === 'string' ? parsed.command : '',
      cwd: typeof parsed.cwd === 'string' ? parsed.cwd : '',
      env: typeof parsed.env === 'string' ? parsed.env : '',
      autostart: parsed.autostart === true,
      allowRemote: parsed.allowRemote === true,
    };
  } catch {
    return { ...EMPTY_CONFIG };
  }
}

function writeConfig(next) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(next, null, 2), 'utf8');
}

/** 把 "KEY=VALUE" 多行文本解析成环境变量。 */
function parseEnv(text) {
  const env = {};
  for (const line of String(text || '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;
    const at = trimmed.indexOf('=');
    if (at <= 0) continue;
    env[trimmed.slice(0, at).trim()] = trimmed.slice(at + 1).trim();
  }
  return env;
}

/**
 * 只接受本机（loopback）的语音服务地址。
 * 宿主代理会把响应原样交回；不限制的话，任何同源页面都能把宿主进程当成
 * 访问内网地址的代理（SSRF）。要用局域网/远程服务的人显式打开 allowRemote。
 */
function isLoopbackTtsTarget(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '0:0:0:0:0:0:0:1';
  } catch {
    return false;
  }
}

function jsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    req.on('data', (chunk) => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > 256 * 1024) {
        // 不 destroy：把剩余数据读完再回 413，客户端才能收到响应（而不是连接被重置）。
        tooLarge = true;
        chunks.length = 0;
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (tooLarge) {
        reject(new Error('body too large'));
        return;
      }
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

/**
 * 来源校验：这条路由能启动进程，不能让别的本地页面借道。
 *
 * 两种合法来源：
 * - 桌面版 DSH：页面在 `dsh-app://app`，自定义协议转发到本机服务时会把 Origin 删掉
 *   （dsh-desktop 的 forwardWebRequest 会删 host/origin/cookie/sec-fetch-site），
 *   所以不带 Origin 的请求必须放行。跨站伪造由下面的 Content-Type 检查挡住：
 *   `text/plain` 这类 simple request 到不了 action。
 * - 浏览器直接打开 Web 界面：Origin 的 `scheme://host:port` 必须与本次请求的 Host
 *   完全一致；其它 loopback 页面（例如 `http://localhost:3000`）不等于本页面，一律拒绝。
 */
function originAllowed(req) {
  const origin = req.headers?.origin;
  if (origin === undefined) return true;
  if (origin === 'dsh-app://app') return true;
  const host = req.headers?.host;
  if (typeof host !== 'string' || host === '') return false;
  try {
    const { protocol, host: originHost } = new URL(origin);
    return protocol === 'http:' && originHost.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

/** 把一行命令写成临时启动脚本：cmd 对 argv 的引号转义会吃掉内层引号。 */
function writeLaunchScript(command) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-avatar-frame-'));
  const file = path.join(dir, process.platform === 'win32' ? 'launch.cmd' : 'launch.sh');
  const body =
    process.platform === 'win32' ? `@echo off\r\n${command}\r\n` : `#!/bin/sh\n${command}\n`;
  fs.writeFileSync(file, body, 'utf8');
  return file;
}

export function apply(ctx) {
  if (typeof ctx.inject !== 'function') {
    ctx.logger?.warn?.('dsh-avatar-frame: inject unavailable, service control disabled');
    return;
  }
  // webServer 与 subprocess 都是注入式服务，用 inject 等它们就绪。
  ctx.inject(['webServer', 'subprocess'], (host) => setup(host));
}

function setup(ctx) {
  const server = ctx.webServer;
  const subprocess = ctx.subprocess;
  if (server === undefined || typeof server.register !== 'function') {
    ctx.logger?.warn?.('dsh-avatar-frame: webServer unavailable, service control disabled');
    return;
  }
  if (subprocess === undefined || typeof subprocess.spawn !== 'function') {
    ctx.logger?.warn?.('dsh-avatar-frame: subprocess unavailable, service control disabled');
    return;
  }

  let config = readConfig();
  let handle = null;
  let startedAt = null;
  let lastExit = null;
  // 主动停止时不要把服务日志当成「失败输出」显示出来。
  let stopRequested = false;
  // 临时启动脚本的清理函数：正常退出、手动停止、启动失败都走它，别在 %TEMP% 里留目录。
  let cleanupCurrentLaunch = () => {};

  const state = () => ({
    ok: true,
    version: PKG_VERSION,
    running: handle !== null,
    startedAt,
    lastExit,
    config,
    storePath: STORE_FILE,
  });

  /** 诊断文本：给界面「复制诊断信息」用。环境变量只报数量，值不外传。 */
  const diagnosticsText = () => {
    const current = state();
    const envCount = Object.keys(parseEnv(current.config.env)).length;
    const lines = [
      'dsh-avatar-frame ' + PKG_VERSION,
      'time: ' + new Date().toISOString(),
      'platform: ' + process.platform + ' ' + process.arch + ' / node ' + process.version,
      'running: ' + current.running + (current.startedAt === null ? '' : ' (since ' + new Date(current.startedAt).toISOString() + ')'),
      'command: ' + (current.config.command || '(empty)'),
      'cwd: ' + (current.config.cwd || '(default)'),
      'env: ' + (envCount === 0 ? '(none)' : envCount + ' key(s), values hidden'),
      'allow remote tts: ' + (current.config.allowRemote === true),
      'store: ' + STORE_FILE,
    ];
    if (current.lastExit !== null) {
      const exit = current.lastExit;
      lines.push(
        'last exit: code=' + String(exit.exitCode) + ' signal=' + String(exit.signal) + ' at=' + new Date(exit.at).toISOString(),
      );
      const output = String(exit.output || '').trim();
      if (output !== '') lines.push('output tail:', output.slice(-800));
    }
    const tail = debugTail(40);
    if (tail !== '') lines.push('', 'debug.log tail:', tail);
    return lines.join('\n');
  };

  const stop = async () => {
    if (handle === null) return false;
    const current = handle;
    handle = null;
    stopRequested = true;
    try {
      current.terminate();
    } catch {
      // 已退出。
    }
    try {
      await current.done;
    } catch {
      // 忽略退出细节。
    }
    // dispose / 手动停止走的是这条路，done 回调已经提前返回，清理得在这里做。
    cleanupCurrentLaunch();
    cleanupCurrentLaunch = () => {};
    // 复位：否则下一次自然退出会被当成「手动停止」，输出会被清空。
    stopRequested = false;
    // 手动停止后不要再挂着上一次的退出记录，界面会把它当成这次的结果显示。
    lastExit = null;
    startedAt = null;
    return true;
  };

  const start = async () => {
    if (handle !== null) return { ok: false, error: 'service already running' };
    // 上一次如果没走到清理（异常/旧版本残留），先收掉再起新的。
    cleanupCurrentLaunch();
    cleanupCurrentLaunch = () => {};
    stopRequested = false;
    const command = String(config.command || '').trim();
    if (command === '') return { ok: false, error: 'no command configured' };
    const cwd = String(config.cwd || '').trim() || os.homedir();
    try {
      if (!fs.statSync(cwd).isDirectory()) return { ok: false, error: `cwd is not a directory: ${cwd}` };
    } catch {
      return { ok: false, error: `cwd does not exist: ${cwd}` };
    }

    const env = { ...process.env, ...parseEnv(config.env) };
    // 命令行不能直接塞给 cmd 的 argv：Node 的 Windows 参数转义会把内层引号
    // 变成 `\"`，cmd 就找不到程序。写成临时脚本再执行，引号原样保留。
    let scriptFile = null;
    let argv;
    try {
      scriptFile = writeLaunchScript(command);
      argv =
        process.platform === 'win32'
          ? [process.env.ComSpec || 'cmd.exe', '/d', '/s', '/c', scriptFile]
          : ['/bin/sh', scriptFile];
    } catch (error) {
      return { ok: false, error: `cannot prepare launch script: ${String(error && error.message ? error.message : error)}` };
    }

    /**
     * 删掉这次启动用的临时脚本目录。
     * 只在 finish() 里删不够：手动停止时 handle 先被置空，done 回调看到 handle 变了
     * 就直接返回，finish() 根本不会跑，目录会一直留在 %TEMP%。
     */
    const cleanupLaunchScript = () => {
      if (scriptFile === null) return;
      const file = scriptFile;
      scriptFile = null;
      try {
        fs.rmSync(path.dirname(file), { recursive: true, force: true });
      } catch {
        // 临时目录交给系统清理。
      }
    };
    cleanupCurrentLaunch = cleanupLaunchScript;

    const collectedText = (stream) => {
      try {
        if (stream === undefined || stream === null || typeof stream.readFrom !== 'function') return '';
        const read = stream.readFrom(0);
        return typeof read?.text === 'string' ? read.text : '';
      } catch {
        return '';
      }
    };

    /**
     * 进程退出后立刻读输出常常读到空串：`done` 先于收集器把最后一段写进缓冲区。
     * 这里轮询几百毫秒，拿到为止。
     */
    const readOutput = async (spawned) => {
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const text = (collectedText(spawned.stderr) + collectedText(spawned.stdout)).trim();
        if (text !== '') return text.slice(-1600);
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      return '';
    };

    const finish = async (spawned, exitCode, signal) => {
      if (handle === spawned) {
        handle = null;
        startedAt = null;
      }
      const raw = stopRequested ? '' : await readOutput(spawned);
      stopRequested = false;
      // 只回原始输出：空的时候由界面按当前语言给出提示，避免这里写死一种语言。
      lastExit = { exitCode, signal, at: Date.now(), output: raw };
      cleanupLaunchScript();
    };

    try {
      const spawned = subprocess.spawn({
        argv,
        cwd,
        stdio: { stdin: 'ignore', stdout: { maxBytes: 64 * 1024 }, stderr: { maxBytes: 64 * 1024 } },
        graceMs: 3000,
        env,
      });
      handle = spawned;
      startedAt = Date.now();
      spawned.done.then(
        (outcome) => {
          if (handle !== spawned) return;
          void finish(spawned, outcome.exitCode, outcome.signal);
        },
        () => {
          if (handle !== spawned) return;
          void finish(spawned, null, null);
        },
      );
      return { ok: true };
    } catch (error) {
      cleanupLaunchScript();
      cleanupCurrentLaunch = () => {};
      return { ok: false, error: String(error && error.message ? error.message : error) };
    }
  };

  const saveConfig = (patch) => {
    const next = {
      command: typeof patch.command === 'string' ? patch.command : config.command,
      cwd: typeof patch.cwd === 'string' ? patch.cwd : config.cwd,
      env: typeof patch.env === 'string' ? patch.env : config.env,
      autostart: typeof patch.autostart === 'boolean' ? patch.autostart : config.autostart,
      allowRemote: typeof patch.allowRemote === 'boolean' ? patch.allowRemote : config.allowRemote,
    };
    try {
      writeConfig(next);
    } catch (error) {
      return { ok: false, error: `cannot save: ${String(error && error.message ? error.message : error)}` };
    }
    config = next;
    return { ok: true };
  };

  const handler = async (req, res) => {
    const url = (req.url || '').split('?')[0];
    if (url !== ROUTE) {
      send(res, 404, { ok: false, error: 'not found' });
      return;
    }
    if (!originAllowed(req)) {
      send(res, 403, { ok: false, error: 'origin not trusted' });
      return;
    }
    try {
      if (req.method === 'GET') {
        send(res, 200, state());
        return;
      }
      if (req.method !== 'POST') {
        send(res, 405, { ok: false, error: 'method not allowed' });
        return;
      }
      // 必须先查 Content-Type，再读 body：text/plain 属于 CORS simple request，
      // 攻击页面不用预检就能把 JSON 塞进来，只有这里能拦住。
      // 注意要完整匹配媒体类型：`application/jsonx` 这种前缀相同的不能放过去。
      const contentType = String(req.headers?.['content-type'] ?? '').trim().toLowerCase();
      if (!/^application\/json\s*(?:;|$)/.test(contentType)) {
        send(res, 415, { ok: false, error: 'content-type must be application/json' });
        req.resume();
        return;
      }
      let payload;
      try {
        payload = await jsonBody(req);
      } catch (error) {
        // 非法 JSON 是客户端的问题，不该报 500；也不把内部解析信息回给调用方。
        const tooLarge = String(error && error.message) === 'body too large';
        send(res, tooLarge ? 413 : 400, { ok: false, error: tooLarge ? 'body too large' : 'invalid JSON body' });
        return;
      }
      const action = String(payload.action || '');
      if (action === 'tts') {
        const target = String(payload.endpoint || '').replace(/\/+$/, '');
        const text = String(payload.text || '');
        if (!/^https?:\/\//.test(target) || text === '') {
          send(res, 400, { ok: false, error: 'bad tts request' });
          return;
        }
        // 默认只允许本机地址：否则任何同源页面都能借宿主进程访问内网任意地址。
        if (!isLoopbackTtsTarget(target) && config.allowRemote !== true) {
          send(res, 400, {
            ok: false,
            error: 'remote speech service is disabled; enable "allow remote address" in the speech service settings first',
          });
          return;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 180000);
        try {
          const upstream = await fetch(target + '/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, speed: payload.speed, tone: payload.tone }),
            signal: controller.signal,
          });
          if (!upstream.ok) {
            send(res, 502, { ok: false, error: 'upstream ' + upstream.status });
            return;
          }
          const bytes = Buffer.from(await upstream.arrayBuffer());
          send(res, 200, {
            ok: true,
            contentType: upstream.headers.get('content-type') || 'audio/wav',
            base64: bytes.toString('base64'),
          });
        } catch (error) {
          appendDebug('host tts proxy failed: ' + String(error && error.message ? error.message : error));
          send(res, 502, { ok: false, error: String(error && error.message ? error.message : error) });
        } finally {
          // 失败路径也要清：否则定时器会空转满 180 秒。
          clearTimeout(timer);
        }
        return;
      }
      if (action === 'debug') {
        appendDebug(typeof payload.message === 'string' ? payload.message : JSON.stringify(payload));
        send(res, 200, { ok: true });
        return;
      }
      if (action === 'diagnostics') {
        send(res, 200, { ok: true, text: diagnosticsText() });
        return;
      }
      if (action === 'start') {
        send(res, 200, { ...(await start()), state: state() });
        return;
      }
      if (action === 'stop') {
        const stopped = await stop();
        send(res, 200, { ok: true, stopped, state: state() });
        return;
      }
      if (action === 'save') {
        const saved = saveConfig(payload);
        send(res, saved.ok ? 200 : 400, { ...saved, state: state() });
        return;
      }
      send(res, 400, { ok: false, error: `unknown action: ${action}` });
    } catch (error) {
      send(res, 500, { ok: false, error: String(error && error.message ? error.message : error) });
    }
  };

  ctx.effect(() => {
    const disposeRoute = server.register({ kind: 'exact', path: ROUTE, handler });
    return () => {
      try {
        disposeRoute();
      } catch {
        // 路由已随宿主卸载。
      }
      void stop();
    };
  }, 'dsh-avatar-frame: service route');

  if (config.autostart === true && String(config.command || '').trim() !== '') {
    ctx.logger?.info?.('dsh-avatar-frame: starting the configured TTS service');
    void start();
  }
}
