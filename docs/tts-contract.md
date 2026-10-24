# TTS 接口契约

插件通过三个请求与你的语音服务对话。任何能返回音频的 HTTP 服务都可以，语言、模型、实现方式不限。

## 1. 健康检查

```
GET /health
```

响应：

```json
{ "ok": true, "model": "gpt-sovits-v2-finetuned" }
```

- `ok`：插件用它判断「已连接 / 未连接」。返回 200 即可，字段本身可选。
- `model`：可选，会显示在设置页的诊断里。

插件在打开设置页时调用一次（输入地址后延迟 350ms 去抖），4 秒超时。

## 2. 合成

```
POST /tts
Content-Type: application/json

{ "text": "博士，今天也辛苦了。", "speed": 1.05, "tone": "normal" }
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `text` | string | 一句文本，通常不超过 60 字；插件已做数字、日期、百分比的读法转换 |
| `speed` | number | 语速，0.7–1.3，默认 1.05 |
| `tone` | string | `calm` / `normal` / `lively`，建议值，不认识就忽略 |

响应：

```
200 OK
Content-Type: audio/wav   （audio/mpeg、audio/ogg 都可以，浏览器能解码即可）
```

body 直接是音频数据。插件用 Web Audio 的 `decodeAudioData` 解码，所以 wav / mp3 / ogg 都行；**不要**返回 JSON。

错误约定（插件会显示红点并记录原因）：

- `400`：请求体不合法、文本为空；
- `413`：文本过长；
- `500`：合成失败。

错误 body 建议返回 `{"error": "原因"}`，插件会把状态码写进诊断。

## 3. 跨域预检

插件运行在网页里，请求的是另一个端口，因此：

- 每个响应都要带 `Access-Control-Allow-Origin: *`；
- 需要处理 `OPTIONS` 预检（因为请求带 `Content-Type: application/json`）：

```
OPTIONS /tts
  -> 204
     Access-Control-Allow-Origin: *
     Access-Control-Allow-Headers: Content-Type
     Access-Control-Allow-Methods: POST, GET, OPTIONS
```

## 参考实现

- 最小示例（在线语音，验证链路用）：[`examples/simple_tts.py`](../examples/simple_tts.py)
- 本地克隆音色（不在本仓库内）：GPT-SoVITS、F5-TTS 等，用一段 5–10 秒参考音 + 文字稿即可，通常不需要训练

## 常见坑

- **返回了 JSON 而不是音频**：插件会解码失败，表现为这一句被跳过；
- **没有处理 OPTIONS**：浏览器直接拒绝请求，表现为一直「未连接」；
- **端口被占用 / 服务没起来**：插件自动退回系统语音；
- **文本里有英文，服务端报 `cmudict not found`**：那是 GPT-SoVITS 一侧缺少 NLTK 数据，与本插件无关，装好 `cmudict` 与 `averaged_perceptron_tagger` 即可。
