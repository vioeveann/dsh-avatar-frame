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

const EMPTY_CONFIG = { command: '', cwd: '', env: '', autostart: false };

function readConfig() {
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    return {
      command: typeof parsed.command === 'string' ? parsed.command : '',
      cwd: typeof parsed.cwd === 'string' ? parsed.cwd : '',
      env: typeof parsed.env === 'string' ? parsed.env : '',
      autostart: parsed.autostart === true,
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

function jsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 256 * 1024) {
        reject(new Error('body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
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

/** 只接受本机来源的请求：这条路由能启动进程，不能对任意页面开放。 */
function loopbackOrigin(req) {
  const origin = req.headers?.origin;
  if (origin === undefined) return true;
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';
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

  const state = () => ({
    ok: true,
    running: handle !== null,
    startedAt,
    lastExit,
    config,
    storePath: STORE_FILE,
  });

  const stop = async () => {
    if (handle === null) return false;
    const current = handle;
    handle = null;
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
    startedAt = null;
    return true;
  };

  const start = async () => {
    if (handle !== null) return { ok: false, error: 'service already running' };
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

    const collectedText = (stream) => {
      try {
        const read = stream.readFrom(0);
        return typeof read?.text === 'string' ? read.text : '';
      } catch {
        return '';
      }
    };
    const finish = (spawned, exitCode, signal) => {
      const output = (collectedText(spawned.stderr) + collectedText(spawned.stdout)).trim().slice(-1600);
      handle = null;
      startedAt = null;
      lastExit = { exitCode, signal, at: Date.now(), output };
      if (scriptFile !== null) {
        try {
          fs.rmSync(scriptFile, { force: true });
        } catch {
          // 临时文件由系统清理。
        }
      }
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
          finish(spawned, outcome.exitCode, outcome.signal);
        },
        () => {
          if (handle !== spawned) return;
          finish(spawned, null, null);
        },
      );
      return { ok: true };
    } catch (error) {
      if (scriptFile !== null) {
        try {
          fs.rmSync(scriptFile, { force: true });
        } catch {
          // 忽略。
        }
      }
      return { ok: false, error: String(error && error.message ? error.message : error) };
    }
  };

  const saveConfig = (patch) => {
    const next = {
      command: typeof patch.command === 'string' ? patch.command : config.command,
      cwd: typeof patch.cwd === 'string' ? patch.cwd : config.cwd,
      env: typeof patch.env === 'string' ? patch.env : config.env,
      autostart: typeof patch.autostart === 'boolean' ? patch.autostart : config.autostart,
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
    if (!loopbackOrigin(req)) {
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
      const payload = await jsonBody(req);
      const action = String(payload.action || '');
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
