/**
 * 字典回归：界面上不该出现原始 key（例如 service.saveDone）。
 *
 * 扫 client.js 里 `t('literal')` / `tRaw('literal')` 的用法，逐个对照中英字典；
 * 代码里动态拼出来的 key 单独列出来检查。缺翻译或两边键不一致，测试直接失败。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../client.js', import.meta.url), 'utf8');

function dictionaryKeys(name) {
  const start = source.indexOf('const ' + name + ' = {');
  assert.notEqual(start, -1, name + ' dictionary not found');
  const end = source.indexOf('\n    };', start);
  assert.notEqual(end, -1, name + ' dictionary is not closed');
  return new Set([...source.slice(start, end).matchAll(/^\s*'([^']+)':/gm)].map((match) => match[1]));
}

const zh = dictionaryKeys('zh');
const en = dictionaryKeys('en');

/** 代码里用字符串拼出来的 key：加新分支时别忘了在这里登记。 */
const DYNAMIC_KEYS = [
  'status.checking',
  'status.online',
  'status.offline',
  'service.startDone',
  'service.stopDone',
  'service.saveDone',
];

function referencedKeys() {
  const keys = new Set(DYNAMIC_KEYS);
  // 只认字面量 t('...') / tRaw('...')；带变量的调用在 DYNAMIC_KEYS 里单独列。
  for (const pattern of [/\bt\('([^']+)'\)/g, /\btRaw\('([^']+)'\)/g]) {
    for (const match of source.matchAll(pattern)) keys.add(match[1]);
  }
  return keys;
}

test('中英字典的 key 集合完全一致', () => {
  assert.deepEqual([...zh].sort(), [...en].sort());
});

test('代码里用到的每个文案 key 在中英字典里都存在', () => {
  const missing = [...referencedKeys()].filter((key) => !zh.has(key) || !en.has(key)).sort();
  assert.deepEqual(missing, [], 'missing keys: ' + missing.join(', '));
});
