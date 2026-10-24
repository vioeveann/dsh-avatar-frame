"""Minimal TTS service for the dsh-avatar-frame plugin.

安装与运行：

    pip install edge-tts
    python examples/simple_tts.py          # 监听 127.0.0.1:8123

它实现了 docs/tts-contract.md 里的接口，用微软 Edge 的在线语音合成，
目的是让你在没有本地模型时也能把整条链路跑通。

想换成自己的音色，只改 synthesize() 一个函数即可：给定文本、语速和语气，
返回音频字节（wav / mp3 都行）。
"""

from __future__ import annotations

import asyncio
import json
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

try:
    import edge_tts
except ImportError:  # pragma: no cover - 只是给出可执行的提示
    sys.exit("缺少依赖，请先运行：pip install edge-tts")

HOST = "127.0.0.1"
PORT = 8123
VOICE = "zh-CN-XiaoxiaoNeural"
MAX_CHARS = 300

# 语气档位：在客户端语速之上再叠一个百分比
TONE_RATE = {"calm": -8, "normal": 0, "lively": 8}


def synthesize(text: str, speed: float, tone: str) -> bytes:
    """Return audio bytes for one sentence."""
    rate = int(round((speed - 1.0) * 100)) + TONE_RATE.get(tone, 0)
    rate = max(-50, min(50, rate))
    communicate = edge_tts.Communicate(text, VOICE, rate=f"{rate:+d}%")
    chunks: list[bytes] = []

    async def run() -> None:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                chunks.append(chunk["data"])

    asyncio.run(run())
    return b"".join(chunks)


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")

    def _json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:  # noqa: N802 - stdlib 命名
        self.send_response(204)
        self._cors()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        if self.path.split("?")[0] in ("/health", "/"):
            self._json(200, {"ok": True, "model": "edge-tts"})
            return
        self._json(404, {"error": "not found"})

    def do_POST(self) -> None:  # noqa: N802
        if self.path.split("?")[0] != "/tts":
            self._json(404, {"error": "not found"})
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
            payload = json.loads(self.rfile.read(length) or b"{}")
            text = str(payload.get("text") or "").strip()
            speed = float(payload.get("speed") or 1.05)
            tone = str(payload.get("tone") or "normal")
        except Exception as error:  # noqa: BLE001
            self._json(400, {"error": f"bad request: {error}"})
            return

        if not text:
            self._json(400, {"error": "empty text"})
            return
        if len(text) > MAX_CHARS:
            self._json(413, {"error": f"text too long (>{MAX_CHARS})"})
            return

        try:
            audio = synthesize(text, min(1.3, max(0.7, speed)), tone)
        except Exception as error:  # noqa: BLE001
            self._json(500, {"error": str(error)})
            return
        if not audio:
            self._json(500, {"error": "no audio produced"})
            return

        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(audio)))
        self.end_headers()
        self.wfile.write(audio)

    def log_message(self, format: str, *args) -> None:  # noqa: A002
        sys.stderr.write("[simple-tts] " + format % args + "\n")


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"listening on http://{HOST}:{PORT}  (voice: {VOICE})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
