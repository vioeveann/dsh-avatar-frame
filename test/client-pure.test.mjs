/**
 * 客户端纯函数的回归测试。
 *
 * client.js 是浏览器模块包装（`window.__ModuleLoader__.load({ factory })`），
 * 纯函数都在工厂闭包里，不能用 import 拿到。这里用 node:vm 造一个最小的浏览器环境、
 * 把工厂跑起来，再通过测试开关（globalThis.__DSH_AVATAR_FRAME_TEST__）拿函数。
 */
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../client.js', import.meta.url), 'utf8');

function createStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => {
      data.set(key, String(value));
    },
    removeItem: (key) => {
      data.delete(key);
    },
    clear: () => data.clear(),
  };
}

const storage = createStorage();
const reactStub = {
  createElement: (...args) => args,
  Fragment: Symbol('react.fragment'),
  memo: (component) => component,
  forwardRef: (component) => component,
  createContext: () => ({ Provider: null, Consumer: null }),
  useState: () => [undefined, () => {}],
  useEffect: () => {},
  useLayoutEffect: () => {},
  useMemo: (fn) => fn(),
  useRef: () => ({ current: null }),
  useReducer: () => [0, () => {}],
  useSyncExternalStore: () => undefined,
  useCallback: (fn) => fn,
  useContext: () => undefined,
};

const definitionRef = { value: null };
const sandbox = {
  console,
  window: {
    __ModuleLoader__: {
      load: (definition) => {
        definitionRef.value = definition;
      },
    },
    localStorage: storage,
    navigator: { language: 'zh-CN' },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    addEventListener() {},
    removeEventListener() {},
  },
  document: {
    documentElement: { lang: 'zh-CN' },
    createElement: () => ({
      style: {},
      dataset: {},
      setAttribute() {},
      appendChild() {},
      remove() {},
      select() {},
      click() {},
    }),
    head: { appendChild() {} },
    body: { appendChild() {}, removeChild() {} },
    addEventListener() {},
    removeEventListener() {},
  },
  navigator: { language: 'zh-CN' },
  performance,
  Blob,
  URL,
  TextDecoder,
  TextEncoder,
  Uint8Array,
  ArrayBuffer,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  __DSH_AVATAR_FRAME_TEST__: true,
  require: (name) => {
    if (name === 'react') return reactStub;
    throw new Error('unexpected require: ' + name);
  },
};

vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: 'client.js' });

assert.ok(definitionRef.value !== null, 'the module should register itself with the loader');
const moduleExports = definitionRef.value.factory(sandbox.require);
assert.equal(typeof moduleExports.apply, 'function', 'the factory should expose apply');
const pure = sandbox.__dshAvatarFramePure;
assert.ok(pure !== undefined, 'test hooks should be published when the switch is on');

after(() => {
  storage.clear();
});

const t = (key) => ({ 'unit.hour': '小时', 'unit.minute': '分', 'unit.second': '秒' })[key] || key;

test('clampSize 把字号夹进 10–20 并取整', () => {
  assert.equal(pure.clampSize(8), 10);
  assert.equal(pure.clampSize(99), 20);
  assert.equal(pure.clampSize(13.4), 13);
  assert.equal(pure.clampSize('15.6'), 16);
  assert.equal(pure.clampSize('abc'), 13, 'non-numeric falls back to the default');
  assert.equal(pure.clampSize(undefined), 13);
});

test('readStoredVolume：没设置过是 50%，显式 0 才是静音', () => {
  storage.removeItem('dsh-avatar-frame/volume/v1');
  assert.equal(pure.readStoredVolume(), 0.5);
  storage.setItem('dsh-avatar-frame/volume/v1', '');
  assert.equal(pure.readStoredVolume(), 0.5);
  storage.setItem('dsh-avatar-frame/volume/v1', '0');
  assert.equal(pure.readStoredVolume(), 0);
  storage.setItem('dsh-avatar-frame/volume/v1', '2');
  assert.equal(pure.readStoredVolume(), 1);
  storage.setItem('dsh-avatar-frame/volume/v1', 'oops');
  assert.equal(pure.readStoredVolume(), 0.5);
  storage.clear();
});

test('readStoredSize：缺省 13，存坏值也落回合法区间', () => {
  storage.removeItem('dsh-avatar-frame/size/v1');
  assert.equal(pure.readStoredSize(), 13);
  storage.setItem('dsh-avatar-frame/size/v1', '99');
  assert.equal(pure.readStoredSize(), 20);
  storage.setItem('dsh-avatar-frame/size/v1', '12');
  assert.equal(pure.readStoredSize(), 12);
  storage.clear();
});

test('readStoredLang：只认 zh / en，其它回到 auto', () => {
  storage.removeItem('dsh-avatar-frame/lang/v1');
  assert.equal(pure.readStoredLang(), 'auto');
  storage.setItem('dsh-avatar-frame/lang/v1', 'zh');
  assert.equal(pure.readStoredLang(), 'zh');
  storage.setItem('dsh-avatar-frame/lang/v1', 'de');
  assert.equal(pure.readStoredLang(), 'auto');
  storage.clear();
});

test('normalizeEndpoint：去空白、去尾斜杠，空值回落默认地址', () => {
  assert.equal(pure.normalizeEndpoint(''), 'http://127.0.0.1:8123');
  assert.equal(pure.normalizeEndpoint('   '), 'http://127.0.0.1:8123');
  assert.equal(pure.normalizeEndpoint('  http://127.0.0.1:18124///  '), 'http://127.0.0.1:18124');
  assert.equal(pure.normalizeEndpoint('http://localhost:9000'), 'http://localhost:9000');
});

test('splitSpeech：按句号 / 叹号 / 分号切句并保留标点', () => {
  // 函数在 vm 里跑，返回的是另一个 realm 的数组；展开一次再比较，免得栽在原型链上。
  assert.deepEqual([...pure.splitSpeech('第一句。第二句！')], ['第一句。', '第二句！']);
  assert.deepEqual([...pure.splitSpeech('甲；乙')], ['甲；', '乙']);
  assert.deepEqual([...pure.splitSpeech('')], []);
});

test('splitSpeech：压缩空白、丢掉空段', () => {
  assert.deepEqual([...pure.splitSpeech('  a   \n  b  ')], ['a b']);
});

test('splitSpeech：长句切成 60 字以内，且一个字都不丢', () => {
  const long = '一'.repeat(80) + '，' + '二'.repeat(40);
  const chunks = pure.splitSpeech(long);
  assert.ok(chunks.length > 1);
  for (const chunk of chunks) assert.ok(chunk.length <= 60, chunk.length + ' > 60');
  assert.equal(chunks.join(''), long);
});

test('splitSpeech：第一句过长时先切一个短头段（≤ 23 字）', () => {
  const text = '这是一个非常长的开头，后面还有更多的内容要继续念下去';
  const chunks = pure.splitSpeech(text);
  assert.ok(chunks[0].length <= 23, chunks[0]);
  assert.equal(chunks.join(''), text);
});

test('formatDuration 把毫秒排成时 / 分 / 秒', () => {
  const join = (parts) => parts.map((part) => part.text).join('');
  assert.equal(join(pure.formatDuration(0, t)), '0秒');
  assert.equal(join(pure.formatDuration(65_000, t)), '1分5秒');
  assert.equal(join(pure.formatDuration(3_723_000, t)), '1小时2分3秒');
});
