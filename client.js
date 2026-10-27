window.__ModuleLoader__.load({
  id: 'dsh-avatar-frame',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const Fragment = React.Fragment;

    /** Dictionary namespace owned by this plugin. */
    const NS = 'dsh-avatar-frame';
    /** Local-storage keys of the applied image, ID, and ID text size (this device only). */
    const IMAGE_KEY = 'dsh-avatar-frame/image/v1';
    const ID_KEY = 'dsh-avatar-frame/id/v1';
    const SIZE_KEY = 'dsh-avatar-frame/size/v1';
    const PRESETS_KEY = 'dsh-avatar-frame/presets/v1';
    const SPEECH_KEY = 'dsh-avatar-frame/speech/v1';
    const ENGINE_KEY = 'dsh-avatar-frame/engine/v1';
    const ENDPOINT_KEY = 'dsh-avatar-frame/endpoint/v1';
    const RATE_KEY = 'dsh-avatar-frame/rate/v1';
    const TONE_KEY = 'dsh-avatar-frame/tone/v1';
    const SYSVOICE_KEY = 'dsh-avatar-frame/sysvoice/v1';
    const AUTO_SPEECH_KEY = 'dsh-avatar-frame/autospeech/v1';
    const VOLUME_KEY = 'dsh-avatar-frame/volume/v1';
    const DEFAULT_VOLUME = 0.5;
    /**
     * The plugin ships no model, no reference audio, and no service: it only
     * calls a TTS endpoint the user runs. This is just the default address.
     */
    const DEFAULT_ENDPOINT = 'http://127.0.0.1:8123';
    /** Default pace and voice tone sent with every request. */
    const DEFAULT_RATE = 1.05;
    /** The speed steps offered by the pickers and walked by the control bar. */
    const RATE_OPTIONS = [0.95, 1.0, 1.05, 1.1, 1.15];
    const TONES = ['calm', 'normal', 'lively'];
    /** How many saved image + ID combinations this device keeps. */
    const MAX_PRESETS = 8;
    /** Hard band for the ID text size: the control cannot leave it, whatever is stored. */
    const MIN_SIZE = 10;
    const MAX_SIZE = 20;
    const DEFAULT_SIZE = 13;
    /** Side length of the stored square, in pixels. */
    const OUTPUT = 320;
    /** Side length of the crop stage, in CSS pixels. */
    const STAGE = 224;

    const zh = {
      'avatar.action': '更换头像',
      'id.action': '编辑头像 ID',
      'id.placeholder': '请输入 ID',
      'id.empty': '未命名',
      'process.done': '已完成',
      'process.took': '已完成，用时 ',
      'process.failed': '处理失败',
      'process.stopped': '已停止',
      'unit.hour': '小时',
      'unit.minute': '分',
      'unit.second': '秒',
      'settings.change': '更换',
      'settings.reset': '恢复默认',
      'bundle.title': '头像与 ID',
      'bundle.hint': '在这里设置也会立刻生效；ID 和头像显示在每轮回复左侧，只保存在本机。',
      'size.label': 'ID 字号',
      'size.action': '调整 ID 字号',
      'presets.title': '预设',
      'presets.save': '保存当前',
      'presets.empty': '还没有预设：调好头像和 ID，再点「保存当前」。',
      'presets.full': '最多保存 8 套',
      'presets.remove': '删除这套预设',
      'presets.apply': '应用这套预设',
      'speech.label': '朗读',
      'speech.toggle': '开关朗读按钮',
      'speech.play': '朗读这条回复',
      'speech.stop': '停止朗读',
      'engine.label': '音色',
      'engine.system': '系统语音',
      'engine.clone': '本地服务',
      'engine.hint': '想用本地语音服务请在本机配置（模型和参考音频自备）。',
      'sysvoice.label': '系统语音',
      'sysvoice.auto': '自动选择',
      'sysvoice.test': '试听',
      'sysvoice.refresh': '刷新列表',
      'sysvoice.count': '共 {n} 个音色',
      'endpoint.label': '服务地址',
      'endpoint.placeholder': '例如 http://127.0.0.1:8123',
      'status.checking': '检测中',
      'status.online': '已连接',
      'status.offline': '未连接',
      'status.warming': '正在启动语音服务，已等待 {s} 秒（模型加载通常要 10–30 秒）',
      'status.reasonTimeout': '连接超时：服务 4 秒没有响应',
      'status.reasonUnreachable': '连不上服务：可能还没启动，或地址不对',
      'status.reasonHttp': '服务返回 HTTP {code}',
      'endpoint.offlineHint': '连不上时先确认语音服务已经启动；启动后这里每 2.5 秒自动重试，不用刷新。',
      'tone.label': '语气',
      'tone.calm': '平稳',
      'tone.normal': '自然',
      'tone.lively': '活泼',
      'speech.rate': '语速',
      'auto.label': '自动朗读新回复',
      'volume.label': '音量',
      'audition.label': '试听一句',
      'audition.stopHint': '正在朗读',
      'audition.text': '程序启动，访问人，用户，你好！',
      'bar.label': '朗读控制',
      'bar.pause': '暂停',
      'bar.resume': '继续',
      'bar.prev': '上一句',
      'bar.next': '下一句',
      'bar.stop': '停止朗读',
      'section.title': '角色头像',
      'section.avatar': '头像与标识',
      'lang.label': '界面语言',
      'service.exitHint': '进程已退出，没有捕获到输出。常见原因：端口被系统占用或保留、命令或工作目录写错、依赖缺失。',
      'section.speech': '朗读',
      'section.service': '语音服务',
      'section.diagnostics': '诊断',
      'service.onlyForLocal': '这一段只对「本地服务」生效；进程还在跑，所以留一个停止入口。',
      'service.running': '运行中',
      'service.stopped': '未运行',
      'service.external': '端口上已有服务（非本插件启动）',
      'service.start': '启动服务',
      'service.stop': '停止服务',
      'service.restart': '重启服务',
      'service.autostart': 'DSH 启动时拉起语音服务',
      'service.configure': '启动配置',
      'service.command': '启动命令',
      'service.commandPlaceholder': '例如 "C:\\Python\\python.exe" server.py',
      'service.cwd': '工作目录',
      'service.cwdPlaceholder': '服务所在目录，留空则用用户主目录',
      'service.env': '环境变量（每行 KEY=VALUE）',
      'service.save': '保存配置',
      'service.savedDone': '配置已保存',
      'service.startDone': '已发出启动命令，稍等几秒再看连接状态',
      'service.stopDone': '已停止',
      'service.failed': '操作失败',
      'service.unavailable': '宿主端未加载：重启一次 DSH 后这里才可用。',
      'diag.service': '服务',
      'diag.latency': '上句生成耗时',
      'diag.progress': '播放进度',
      'diag.lastError': '最近错误',
      'diag.none': '无',
      'dialog.title': '设置 AI 头像',
      'dialog.choose': '选择头像图片',
      'dialog.hint': '拖动图片调整位置，滚轮或滑块缩放。',
      'dialog.cancel': '取消',
      'dialog.apply': '用这张',
      'dialog.another': '换一张',
    };

    const en = {
      'avatar.action': 'Change avatar',
      'id.action': 'Edit avatar ID',
      'id.placeholder': 'Enter the ID',
      'id.empty': 'Unnamed',
      'process.done': 'Done',
      'process.took': 'Completed in ',
      'process.failed': 'Failed',
      'process.stopped': 'Stopped',
      'unit.hour': 'h ',
      'unit.minute': 'm ',
      'unit.second': 's',
      'settings.change': 'Change',
      'settings.reset': 'Reset',
      'bundle.title': 'Avatar and ID',
      'bundle.hint': 'These settings apply immediately; the ID and avatar appear beside every reply and stay on this device.',
      'size.label': 'ID text size',
      'size.action': 'Adjust ID text size',
      'presets.title': 'Presets',
      'presets.save': 'Save current',
      'presets.empty': 'No presets yet: set an avatar and ID, then choose "Save current".',
      'presets.full': 'Up to 8 presets',
      'presets.remove': 'Delete this preset',
      'presets.apply': 'Apply this preset',
      'speech.label': 'Read aloud',
      'speech.toggle': 'Show the read-aloud button',
      'speech.play': 'Read this reply aloud',
      'speech.stop': 'Stop reading',
      'engine.label': 'Voice',
      'engine.system': 'System voice',
      'engine.clone': 'Local service',
      'engine.hint': 'To use a local voice, set up your own speech service on this machine (model and reference audio are yours to provide).',
      'sysvoice.label': 'System voice',
      'sysvoice.auto': 'Automatic',
      'sysvoice.test': 'Preview',
      'sysvoice.refresh': 'Refresh list',
      'sysvoice.count': '{n} voices found',
      'endpoint.label': 'Service address',
      'endpoint.placeholder': 'e.g. http://127.0.0.1:8123',
      'status.checking': 'Checking',
      'status.online': 'Connected',
      'status.offline': 'Not connected',
      'status.warming': 'Starting the speech service — {s}s elapsed (model loading usually takes 10–30s)',
      'status.reasonTimeout': 'Timed out: no response within 4s',
      'status.reasonUnreachable': 'Cannot reach the service: not running, or wrong address',
      'status.reasonHttp': 'The service answered HTTP {code}',
      'endpoint.offlineHint': 'Start your TTS service first; this dot retries every 2.5 seconds and reconnects on its own.',
      'tone.label': 'Tone',
      'tone.calm': 'Calm',
      'tone.normal': 'Natural',
      'tone.lively': 'Lively',
      'speech.rate': 'Speed',
      'auto.label': 'Read new replies automatically',
      'volume.label': 'Volume',
      'audition.label': 'Preview',
      'audition.stopHint': 'Reading…',
      'audition.text': 'Program initializing. Accessor: user.',
      'bar.label': 'Read-aloud controls',
      'bar.pause': 'Pause',
      'bar.resume': 'Resume',
      'bar.prev': 'Previous sentence',
      'bar.next': 'Next sentence',
      'bar.stop': 'Stop reading',
      'section.title': 'Character avatar',
      'section.avatar': 'Avatar and ID',
      'lang.label': 'Language',
      'service.exitHint': 'The process exited without producing output. Common causes: the port is taken or reserved by the system, a wrong command or working directory, or a missing dependency.',
      'section.speech': 'Read aloud',
      'section.service': 'Speech service',
      'section.diagnostics': 'Diagnostics',
      'service.onlyForLocal': 'This section applies to the local service only; the process is still running, so the stop button stays here.',
      'service.running': 'Running',
      'service.stopped': 'Stopped',
      'service.external': 'A service is already listening (started outside the plugin)',
      'service.start': 'Start service',
      'service.stop': 'Stop service',
      'service.restart': 'Restart',
      'service.autostart': 'Start the speech service with DSH',
      'service.configure': 'Launch settings',
      'service.command': 'Command',
      'service.commandPlaceholder': 'e.g. "C:\\Python\\python.exe" server.py',
      'service.cwd': 'Working directory',
      'service.cwdPlaceholder': 'Leave empty for the home directory',
      'service.env': 'Environment (KEY=VALUE per line)',
      'service.save': 'Save settings',
      'service.savedDone': 'Settings saved',
      'service.startDone': 'Start requested — check the connection dot in a few seconds',
      'service.stopDone': 'Stopped',
      'service.failed': 'The action failed',
      'service.unavailable': 'Host half not loaded: restart DSH once to enable this.',
      'diag.service': 'Service',
      'diag.latency': 'Last synthesis',
      'diag.progress': 'Progress',
      'diag.lastError': 'Last error',
      'diag.none': 'none',
      'dialog.title': 'Assistant avatar',
      'dialog.choose': 'Choose avatar image',
      'dialog.hint': 'Drag to reposition; scroll or use the slider to zoom.',
      'dialog.cancel': 'Cancel',
      'dialog.apply': 'Use this',
      'dialog.another': 'Choose another',
    };

    /* ---------------------------------------------------------------- state */

    function createStore(initial) {
      let state = initial;
      const listeners = new Set();
      return {
        get: () => state,
        set: (patch) => {
          const next = typeof patch === 'function' ? patch(state) : { ...state, ...patch };
          if (next === state) return;
          state = next;
          for (const listener of [...listeners]) listener();
        },
        subscribe: (listener) => {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
      };
    }

    function readStored(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }

    /** Clamp any stored or requested size into the supported band. */
    function clampSize(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return DEFAULT_SIZE;
      return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(numeric)));
    }

    /** 音量：没设置过就是 50%，显式存 0 才表示静音。 */
    function readStoredVolume() {
      const raw = readStored(VOLUME_KEY);
      if (raw === null || raw === '') return DEFAULT_VOLUME;
      const value = Number(raw);
      if (!Number.isFinite(value)) return DEFAULT_VOLUME;
      return Math.min(1, Math.max(0, value));
    }

    function readStoredSize() {
      const raw = readStored(SIZE_KEY);
      return raw === null ? DEFAULT_SIZE : clampSize(raw);
    }

    const LANG_KEY = 'dsh-avatar-frame/lang/v1';

    /** 插件自己的两套文案；`auto` 之外直接从这里取，不依赖宿主语言。 */
    const DICTS = { zh, en };
    function readStoredLang() {
      const raw = readStored(LANG_KEY);
      return raw === 'zh' || raw === 'en' ? raw : 'auto';
    }

    const avatarStore = createStore({
      src: readStored(IMAGE_KEY),
      id: readStored(ID_KEY) || '',
      size: readStoredSize(),
      speech: readStored(SPEECH_KEY) === '1',
      engine: readStored(ENGINE_KEY) === 'clone' ? 'clone' : 'system',
      endpoint: readStored(ENDPOINT_KEY) || DEFAULT_ENDPOINT,
      rate: Number(readStored(RATE_KEY)) > 0 ? Number(readStored(RATE_KEY)) : DEFAULT_RATE,
      tone: TONES.includes(readStored(TONE_KEY)) ? readStored(TONE_KEY) : 'normal',
      sysVoice: readStored(SYSVOICE_KEY) || '',
      autoSpeech: readStored(AUTO_SPEECH_KEY) === '1',
      volume: readStoredVolume(),
      lang: readStoredLang(),
    });
    let translate = (key) => key;
    const dialogStore = createStore({ open: false, mode: 'idle', draft: null });
    const statsStore = createStore({ lastMs: null });
    /** 计数器：每次 +1 让健康检查重新探一次（启动服务后立刻刷新状态）。 */
    const probeStore = createStore({ tick: 0, startingSince: null });
    const speechStore = createStore({ status: 'idle', sessionId: null, turn: null, index: 0, total: 0, rate: DEFAULT_RATE, error: null, engine: null });

    function persist(key, value) {
      try {
        if (value) window.localStorage.setItem(key, value);
        else window.localStorage.removeItem(key);
      } catch (error) {
        console.warn('[dsh-avatar-frame] could not persist avatar data', error);
      }
    }

    function setImage(src) {
      const next = src || null;
      avatarStore.set({ src: next });
      persist(IMAGE_KEY, next);
    }

    function setLabel(text) {
      const next = text || '';
      avatarStore.set({ id: next });
      persist(ID_KEY, next);
    }

    function setSize(value) {
      const next = clampSize(value);
      avatarStore.set({ size: next });
      persist(SIZE_KEY, String(next));
    }

    /* --------------------------------------------------------------- speech */

    let cachedVoices = [];
    /** 是否已经向浏览器要过一次列表（列表可能是空的，那就别再问了）。 */
    let voicesProbed = false;
    /** 系统语音列表（浏览器异步加载，加载完要让下拉框刷新）。 */
    const voicesStore = createStore({ list: [] });
    /** One active playback: a token guards against stopped or replaced runs. */
    const speechRun = {
      token: 0,
      controller: null,
      ctx: null,
      source: null,
      settle: null,
      chunks: [],
      blobs: [],
      index: 0,
      seek: null,
      rate: DEFAULT_RATE,
      paused: false,
      /** 当前这段朗读是不是走浏览器自带语音。 */
      system: false,
      /** 本地播放的音量节点。 */
      gain: null,
      sessionId: null,
      turn: null,
      error: null,
    };

    function sameVoiceList(a, b) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i += 1) {
        if (a[i].name !== b[i].name || a[i].lang !== b[i].lang) return false;
      }
      return true;
    }

    /** 读取浏览器音色列表。只有内容真的变了才写 store —— 渲染期间调用绝不能触发 set。 */
    function refreshVoices() {
      voicesProbed = true;
      let list = [];
      try {
        list = window.speechSynthesis.getVoices() || [];
      } catch {
        list = [];
      }
      cachedVoices = list;
      const previous = voicesStore.get().list;
      if (!sameVoiceList(previous, list)) voicesStore.set({ list: list.slice() });
    }

    /**
     * 系统语音排序：神经网络音色（Natural / Online / Neural）> 中文 > 女声常见命名，
     * 老的 SAPI 音色（Huihui 等）排最后。用户手动选过就直接用它。
     */
    function scoreVoice(voice) {
      const name = String(voice.name || '');
      const lang = String(voice.lang || '');
      let score = 0;
      if (/natural|neural|online|premium|enhanced/i.test(name)) score += 100;
      if (/^zh/i.test(lang)) score += 20;
      // 成年女声优先（和默认人设一致）；童声、男声略降
      if (/xiaoxiao|xiaoyi|xiaomo|xiaoxuan|xiaohan|xiaorui|huihui|zira|aria|jenny|female|女子|女/i.test(name)) score += 10;
      if (/yaoyao|童|child/i.test(name)) score -= 10;
      if (/kangkang|mark|guy|david|male/i.test(name)) score -= 10;
      if (/google/i.test(name)) score += 15;
      return score;
    }

    /** 判断一段文本该用哪种语言的系统语音：有汉字就是中文，否则英文。 */
    function detectTextLang(text) {
      return /[\u3400-\u9fff]/.test(String(text || '')) ? 'zh' : 'en';
    }

    /**
     * 可选的系统语音。
     * - 传 'zh' / 'en' 时只留该语言（没有就退回全部）；
     * - 不传则全部返回，中文按界面语言排在前面。
     */
    function voiceOptions(lang) {
      if (cachedVoices.length === 0 && !voicesProbed) {
        voicesProbed = true;
        try {
          cachedVoices = window.speechSynthesis.getVoices() || [];
        } catch {
          cachedVoices = [];
        }
      }
      const all = cachedVoices.slice().sort((a, b) => scoreVoice(b) - scoreVoice(a));
      if (lang === 'zh' || lang === 'en') {
        const hit = all.filter((voice) => new RegExp('^' + lang, 'i').test(voice.lang || ''));
        if (hit.length > 0) return hit;
        return all;
      }
      const uiZh = avatarStore.get().lang !== 'en';
      return all.sort((a, b) => {
        const za = /^zh/i.test(a.lang || '') === uiZh ? 0 : 1;
        const zb = /^zh/i.test(b.lang || '') === uiZh ? 0 : 1;
        return za - zb || scoreVoice(b) - scoreVoice(a);
      });
    }

    /**
     * 挑一个声音：用户手动选过就用它；否则按**要读的文本**挑语言——
     * 英文回复配英文音色，中文回复配中文音色，界面是哪种语言都不影响。
     */
    function pickVoice(text) {
      const chosen = avatarStore.get().sysVoice;
      if (chosen !== '') {
        if (cachedVoices.length === 0 && !voicesProbed) {
          voicesProbed = true;
          try {
            cachedVoices = window.speechSynthesis.getVoices() || [];
          } catch {
            cachedVoices = [];
          }
        }
        const hit = cachedVoices.find((voice) => voice.name === chosen);
        if (hit !== undefined) return hit;
      }
      const options = voiceOptions(detectTextLang(text));
      return options[0] || null;
    }

    function interruptPlayback() {
      if (speechRun.source !== null) {
        try {
          speechRun.source.stop();
        } catch {
          // Already stopped.
        }
        speechRun.source = null;
      }
      if (speechRun.settle !== null) {
        const settle = speechRun.settle;
        speechRun.settle = null;
        settle();
      }
    }

    function stopSpeech() {
      speechRun.token += 1;
      speechRun.paused = false;
      if (speechRun.controller !== null) {
        try {
          speechRun.controller.abort();
        } catch {
          // Already finished.
        }
        speechRun.controller = null;
      }
      interruptPlayback();
      speechRun.chunks = [];
      speechRun.blobs = [];
      speechRun.index = 0;
      speechRun.seek = null;
      try {
        window.speechSynthesis.cancel();
      } catch {
        // An absent or failed engine simply leaves nothing playing.
      }
      speechRun.system = false;
      speechRun.paused = false;
      speechRun.sessionId = null;
      speechRun.turn = null;
      speechRun.error = null;
      speechStore.set({ status: 'idle', sessionId: null, turn: null, index: 0, total: 0, rate: speechRun.rate, error: null, engine: null });
    }

    function ensureAudioContext() {
      if (speechRun.ctx === null) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (Ctor === undefined) return null;
        speechRun.ctx = new Ctor();
      }
      if (speechRun.ctx.state === 'suspended' && speechRun.paused !== true) {
        speechRun.ctx.resume().catch(() => {});
      }
      return speechRun.ctx;
    }

    function publishSpeech(status) {
      speechStore.set({
        status,
        sessionId: speechRun.sessionId,
        turn: speechRun.turn,
        index: speechRun.index,
        total: speechRun.chunks.length,
        rate: speechRun.rate,
        error: speechRun.error,
        engine: 'clone',
      });
    }

    function pauseSpeech() {
      if (speechStore.get().status !== 'speaking') return;
      if (speechRun.system) {
        try {
          window.speechSynthesis.pause();
        } catch {
          return;
        }
        speechRun.paused = true;
        publishSystem('paused');
        return;
      }
      if (speechRun.ctx === null) return;
      speechRun.paused = true;
      speechRun.ctx.suspend().catch(() => {});
      publishSpeech('paused');
    }

    function resumeSpeech() {
      if (speechStore.get().status !== 'paused') return;
      speechRun.paused = false;
      if (speechRun.system) {
        try {
          window.speechSynthesis.resume();
        } catch {
          return;
        }
        publishSystem('speaking');
        return;
      }
      if (speechRun.ctx !== null) speechRun.ctx.resume().catch(() => {});
      publishSpeech('speaking');
    }

    /** Step to the next offered speed, wrapping back to the slowest. */
    function nextRate(current) {
      const closest = RATE_OPTIONS.reduce(
        (best, option) => (Math.abs(option - current) < Math.abs(best - current) ? option : best),
        RATE_OPTIONS[0],
      );
      const index = RATE_OPTIONS.indexOf(closest);
      return RATE_OPTIONS[(index + 1) % RATE_OPTIONS.length];
    }

    function chooseRate(value) {
      const next = Math.min(1.3, Math.max(0.7, Math.round(Number(value) * 100) / 100 || 1));
      avatarStore.set({ rate: next });
      persist(RATE_KEY, String(next));
      speechRun.rate = next;
      if (speechRun.source !== null) {
        try {
          speechRun.source.playbackRate.value = next;
        } catch {
          // Older source nodes may be gone already.
        }
      }
      publishSpeech(speechStore.get().status);
    }

    /** Jump to another sentence; the runner picks the new index up. */
    function skipSentence(delta) {
      if (speechRun.chunks.length === 0) return;
      const target = Math.min(speechRun.chunks.length - 1, Math.max(0, speechRun.index + delta));
      if (speechRun.system) {
        speechRun.token += 1;
        speechRun.paused = false;
        try {
          window.speechSynthesis.cancel();
        } catch {
          // 忽略。
        }
        speakSystemFrom(target, speechRun.token);
        return;
      }
      speechRun.seek = target;
      interruptPlayback();
      publishSpeech(speechStore.get().status);
    }

    /** Split a reply into speakable chunks: sentence first, then clause. */
    function splitSpeech(text) {
      const sentences = text
        .replace(/\s+/g, ' ')
        .split(/(?<=[。！？!?；;\n])/u)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence !== '');
      const chunks = [];
      for (const sentence of sentences) {
        if (sentence.length <= 60) {
          chunks.push(sentence);
          continue;
        }
        let rest = sentence;
        while (rest.length > 60) {
          const window = rest.slice(0, 60);
          const cut = Math.max(window.lastIndexOf('，'), window.lastIndexOf('、'), window.lastIndexOf(' '));
          const at = cut >= 20 ? cut + 1 : 60;
          chunks.push(rest.slice(0, at).trim());
          rest = rest.slice(at).trim();
        }
        if (rest !== '') chunks.push(rest);
      }
      // A short first chunk starts the voice sooner.
      if (chunks.length > 0 && chunks[0].length > 22) {
        const head = chunks[0];
        const window = head.slice(0, 22);
        const cut = Math.max(window.lastIndexOf('，'), window.lastIndexOf('、'), window.lastIndexOf(' '));
        const at = cut >= 8 ? cut + 1 : 22;
        chunks.splice(0, 1, head.slice(0, at).trim(), head.slice(at).trim());
      }
      return chunks.filter((chunk) => chunk !== '');
    }

    /** One synthesis request for one chunk. */
    function requestSpeech(chunk, controller) {
      const avatar = avatarStore.get();
      const started = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
      return fetch(resolveEndpoint() + '/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: chunk,
          speed: avatar.rate || DEFAULT_RATE,
          tone: avatar.tone || 'normal',
        }),
        signal: controller.signal,
      }).then((response) => {
        if (!response.ok) throw new Error('tts responded ' + response.status);
        const now = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
        statsStore.set({ lastMs: now - started });
        return response.blob();
      });
    }

    function speechChunkBlob(index) {
      if (speechRun.blobs[index] === undefined) {
        const chunk = speechRun.chunks[index];
        speechRun.blobs[index] = requestSpeech(chunk, speechRun.controller).catch((error) => ({ error }));
      }
      return speechRun.blobs[index];
    }

    function prefetchSpeech(from) {
      const end = Math.min(from + 2, speechRun.chunks.length);
      for (let index = from; index < end; index += 1) speechChunkBlob(index);
    }

    function playSpeechBuffer(buffer) {
      const volume = Math.min(1, Math.max(0, Number(avatarStore.get().volume)));
      return new Promise((resolve) => {
        const ctx = ensureAudioContext();
        if (ctx === null) {
          resolve();
          return;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        try {
          source.playbackRate.value = speechRun.rate;
        } catch {
          // Rate stays at 1 if unsupported.
        }
        // 有 GainNode 才走音量节点；极老的引擎没有就直连，别让播放在这里断掉。
        if (typeof ctx.createGain === 'function') {
          if (speechRun.gain === null) {
            speechRun.gain = ctx.createGain();
            speechRun.gain.connect(ctx.destination);
          }
          speechRun.gain.gain.value = volume;
          source.connect(speechRun.gain);
        } else {
          source.connect(ctx.destination);
        }
        speechRun.source = source;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          if (speechRun.source === source) speechRun.source = null;
          if (speechRun.settle === finish) speechRun.settle = null;
          resolve();
        };
        speechRun.settle = finish;
        source.onended = () => finish();
        source.start();
      });
    }

    /**
     * Speak through the user's own TTS service.
     *
     * Chunks are requested two ahead so the next sentence is already generating
     * while the current one plays; pause, speed and sentence skipping act on the
     * same runner.
     */
    async function speakClone(text, sessionId, turn) {
      stopSpeech();
      // Prime the audio graph inside the click itself; creating it after the
      // first await would land outside the gesture and stay suspended.
      ensureAudioContext();
      const token = speechRun.token;
      const chunks = splitSpeech(text);
      if (chunks.length === 0) return;
      speechRun.chunks = chunks;
      speechRun.blobs = [];
      speechRun.index = 0;
      speechRun.seek = null;
      speechRun.paused = false;
      speechRun.rate = avatarStore.get().rate || 1;
      speechRun.sessionId = sessionId;
      speechRun.turn = turn;
      speechRun.error = null;
      speechRun.controller = new AbortController();
      publishSpeech('speaking');
      prefetchSpeech(0);
      let played = 0;
      try {
        while (speechRun.index < speechRun.chunks.length) {
          if (speechRun.token !== token) return;
          const index = speechRun.index;
          const result = await speechChunkBlob(index);
          if (speechRun.token !== token) return;
          if (result !== undefined && result.error) {
            speechRun.error = String(result.error.message || result.error);
            console.warn('[dsh-avatar-frame] chunk synthesis failed', result.error);
            if (played === 0) throw result.error;
            speechRun.index = index + 1;
            prefetchSpeech(speechRun.index);
            publishSpeech('speaking');
            continue;
          }
          const ctx = ensureAudioContext();
          if (ctx === null) throw new Error('no audio context');
          const data = await result.arrayBuffer();
          if (speechRun.token !== token) return;
          const buffer = await ctx.decodeAudioData(data);
          if (speechRun.token !== token) return;
          await playSpeechBuffer(buffer);
          if (speechRun.token !== token) return;
          if (speechRun.seek !== null) {
            speechRun.index = speechRun.seek;
            speechRun.seek = null;
            prefetchSpeech(speechRun.index);
            publishSpeech(speechStore.get().status);
            continue;
          }
          played += 1;
          speechRun.index = index + 1;
          prefetchSpeech(speechRun.index);
          publishSpeech(speechStore.get().status);
        }
        if (speechRun.token === token) {
          speechStore.set({ status: 'idle', sessionId: null, turn: null, index: 0, total: 0, rate: speechRun.rate, error: speechRun.error, engine: null });
        }
      } catch (error) {
        if (speechRun.token !== token) return;
        speechRun.error = String(error && error.message ? error.message : error);
        console.warn('[dsh-avatar-frame] clone voice playback problem', error);
        // Only fall back when nothing has been heard yet; otherwise the reader
        // would hear the reply twice, once from each engine.
        if (played === 0) startSpeech(text, sessionId, turn);
        // Keep the owning turn so its row can show the failure dot.
        else speechStore.set({ status: 'idle', sessionId: speechRun.sessionId, turn: speechRun.turn, index: 0, total: 0, rate: speechRun.rate, error: speechRun.error, engine: null });
      }
    }

    /** 系统语音的状态广播：和本地服务的 publishSpeech 对齐，界面上控制条才认得。 */
    function publishSystem(status) {
      speechStore.set({
        status,
        sessionId: speechRun.sessionId,
        turn: speechRun.turn,
        index: speechRun.index,
        total: speechRun.chunks.length,
        rate: speechRun.rate,
        error: speechRun.error,
        engine: 'system',
      });
    }

    /** 从第 index 句开始念；token 变了说明这次朗读已被取消。 */
    function speakSystemFrom(index, token) {
      if (token !== speechRun.token) return;
      const synth = window.speechSynthesis;
      if (!synth) return;
      if (index >= speechRun.chunks.length) {
        speechRun.system = false;
        speechStore.set({ status: 'idle', sessionId: null, turn: null, index: 0, total: 0, engine: null, error: null });
        return;
      }
      speechRun.index = index;
      const chunk = speechRun.chunks[index];
      const utterance = new SpeechSynthesisUtterance(chunk);
      const voice = pickVoice(chunk);
      if (voice !== null) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = /[\u3400-\u9fff]/.test(chunk) ? 'zh-CN' : 'en-US';
      }
      // 跟随设置里的语速；系统语音略放慢更自然。
      utterance.rate = Math.min(1.3, Math.max(0.7, Number(avatarStore.get().rate) || 1)) * 0.95;
      utterance.pitch = 1;
      utterance.volume = Math.min(1, Math.max(0, Number(avatarStore.get().volume)));
      utterance.onend = () => {
        if (token !== speechRun.token) return;
        speakSystemFrom(index + 1, token);
      };
      utterance.onerror = () => {
        if (token !== speechRun.token) return;
        speakSystemFrom(index + 1, token);
      };
      publishSystem(speechRun.paused ? 'paused' : 'speaking');
      try {
        synth.speak(utterance);
      } catch {
        speechRun.system = false;
        speechStore.set({ status: 'idle', sessionId: null, turn: null, index: 0, total: 0, engine: null, error: null });
      }
    }

    function startSpeech(text, sessionId, turn) {
      const synth = window.speechSynthesis;
      if (!synth || text === '') return;
      synth.cancel();
      refreshVoices();
      speechRun.token += 1;
      speechRun.system = true;
      speechRun.paused = false;
      speechRun.chunks = splitSpeech(text);
      speechRun.index = 0;
      speechRun.sessionId = sessionId;
      speechRun.turn = turn;
      speechRun.error = null;
      if (speechRun.chunks.length === 0) {
        speechRun.system = false;
        return;
      }
      speakSystemFrom(0, speechRun.token);
    }

    function setSpeech(enabled) {
      avatarStore.set({ speech: enabled });
      persist(SPEECH_KEY, enabled ? '1' : '0');
      if (!enabled) stopSpeech();
    }

    function setEngine(engine) {
      const next = engine === 'clone' ? 'clone' : 'system';
      avatarStore.set({ engine: next });
      persist(ENGINE_KEY, next);
      stopSpeech();
    }

    function setEndpoint(value) {
      avatarStore.set({ endpoint: value });
      persist(ENDPOINT_KEY, value);
    }

    function setAutoSpeech(enabled) {
      avatarStore.set({ autoSpeech: enabled === true });
      persist(AUTO_SPEECH_KEY, enabled === true ? '1' : '0');
    }

    function setVolume(value) {
      const next = Math.min(1, Math.max(0, Math.round(Number(value) * 100) / 100 || 0));
      avatarStore.set({ volume: next });
      persist(VOLUME_KEY, String(next));
      if (speechRun.gain !== null) {
        try {
          speechRun.gain.gain.value = next;
        } catch {
          // 已经销毁的节点忽略。
        }
      }
    }

    function setSysVoice(name) {
      const next = typeof name === 'string' ? name : '';
      avatarStore.set({ sysVoice: next });
      persist(SYSVOICE_KEY, next);
    }

    /** 用系统语音念一句，给「试听」按钮用。 */
    function auditionSystemVoice() {
      if (typeof window.speechSynthesis === 'undefined') return;
      const sample = tRaw('audition.text');
      const utterance = new SpeechSynthesisUtterance(sample);
      const voice = pickVoice(sample);
      if (voice !== null) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
      utterance.rate = Math.min(1.3, Math.max(0.7, Number(avatarStore.get().rate) || 1));
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }

    function chooseTone(value) {
      const next = TONES.includes(value) ? value : 'normal';
      avatarStore.set({ tone: next });
      persist(TONE_KEY, next);
    }

    /** 插件界面语言：'zh' / 'en'，'auto' 表示跟随宿主。 */
    function setLang(value) {
      const next = value === 'zh' || value === 'en' || value === 'auto' ? value : 'auto';
      avatarStore.set({ lang: next });
      persist(LANG_KEY, next === 'auto' ? '' : next);
    }

    /** Normalized address of the user's own TTS service. */
    function resolveEndpoint() {
      const raw = (avatarStore.get().endpoint || '').trim();
      if (raw === '') return DEFAULT_ENDPOINT;
      return raw.replace(/\/+$/, '');
    }

    /**
     * The visible answer of one Turn, in reading order.
     *
     * A Turn can hold several assistant steps: tool-call commentary that stays
     * folded away, and the single answer step that the reader sees. Only the
     * answer step's text blocks are read, so the voice never recites the folded
     * process or the reasoning.
     */
    function readReplyText(snapshot, turn, answerStep, enabled) {
      try {
        if (enabled === false) return '';
        if (snapshot === null || snapshot === undefined || turn === undefined) return '';
        const keys = snapshot.locations.getTurn(turn);
        if (!Array.isArray(keys)) return '';
        const seen = new Set();
        const candidates = [];
        for (const key of keys) {
          const node = snapshot.nodes.get(key);
          if (node === undefined || node.kind !== 'assistant-step') continue;
          if (seen.has(node.key)) continue;
          seen.add(node.key);
          candidates.push(node);
        }
        const blocksOf = (node) => {
          const blocks = node.data && node.data.blocks;
          if (!Array.isArray(blocks)) return [];
          const parts = [];
          for (const block of blocks) {
            if (block && block.kind === 'text' && typeof block.text === 'string') {
              const trimmed = block.text.trim();
              if (trimmed !== '') parts.push(trimmed);
            }
          }
          return parts;
        };
        if (answerStep !== undefined) {
          const answer = candidates.filter((node) => node.data !== undefined && node.data.step === answerStep);
          const picked = answer.length > 0 ? answer : candidates.slice(-1);
          const parts = picked.flatMap(blocksOf);
          if (parts.length > 0) return parts.join('\n');
        }
        for (let index = candidates.length - 1; index >= 0; index -= 1) {
          const parts = blocksOf(candidates[index]);
          if (parts.length > 0) return parts.join('\n');
        }
        return '';
      } catch {
        return '';
      }
    }

    const EMPTY_CHAT_SNAPSHOT = {
      locations: { getTurn: () => [] },
      nodes: { get: () => undefined },
    };

    /* --------------------------------------------------- read-aloud text */

    const CN_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const CN_UNITS = ['', '十', '百', '千'];
    const CN_GROUPS = ['', '万', '亿', '万亿'];

    /** Digits one by one: 2026 -> 二零二六. */
    function readDigits(raw) {
      return [...raw].map((char) => (/[0-9]/.test(char) ? CN_DIGITS[Number(char)] : char)).join('');
    }

    function readGroup(value) {
      const text = String(value);
      let out = '';
      let pendingZero = false;
      for (let index = 0; index < text.length; index += 1) {
        const digit = Number(text[index]);
        if (digit === 0) {
          pendingZero = out !== '';
          continue;
        }
        if (pendingZero) {
          out += '零';
          pendingZero = false;
        }
        out += CN_DIGITS[digit] + CN_UNITS[text.length - index - 1];
      }
      return out;
    }

    function readInteger(value) {
      if (value === 0) return '零';
      const groups = [];
      let rest = value;
      while (rest > 0) {
        groups.push(rest % 10000);
        rest = Math.floor(rest / 10000);
      }
      let out = '';
      for (let index = groups.length - 1; index >= 0; index -= 1) {
        const group = groups[index];
        if (group === 0) {
          if (out !== '' && !out.endsWith('零')) out += '零';
          continue;
        }
        if (out !== '' && group < 1000 && !out.endsWith('零')) out += '零';
        out += readGroup(group) + CN_GROUPS[index];
      }
      return out.replace(/零+$/u, '').replace(/^一十/u, '十');
    }

    /** Read a number the way a Chinese speaker would: 1234 -> 一千二百三十四, 3.14 -> 三点一四. */
    function readNumber(raw) {
      const [integer, fraction] = String(raw).split('.');
      let out = readInteger(Number(integer || '0'));
      if (fraction) out += '点' + readDigits(fraction);
      return out;
    }

    /**
     * Turn digits into Chinese words before synthesis.
     *
     * The clone models read bare digits in English ("2026" becomes "twenty
     * twenty-six"), which breaks the sentence; years, percentages, times, and
     * plain numbers are spelled out in Chinese here.
     */
    /** Speak a unit symbol instead of spelling it out. */
    const CN_UNIT_WORDS = {
      'km/h': '公里每小时',
      km: '公里',
      kg: '公斤',
      cm: '厘米',
      mm: '毫米',
      '℃': '摄氏度',
      '°C': '摄氏度',
    };

    function readUnit(unit) {
      return CN_UNIT_WORDS[unit.toLowerCase()] || CN_UNIT_WORDS[unit] || unit;
    }

    function normalizeForSpeech(text) {
      let out = text;
      // Dates first, so an ISO date is not mistaken for a range.
      out = out.replace(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/g, (match, year, month, day) =>
        readDigits(year) + '年' + readNumber(month) + '月' + readNumber(day) + '日',
      );
      // Fractions: 1/2 -> 二分之一.
      out = out.replace(/(\d+)\/(\d+)/g, (match, numerator, denominator) =>
        readNumber(denominator) + '分之' + readNumber(numerator),
      );
      // Ranges: 2020-2024年 and 3-5个.
      out = out.replace(/(\d{4})\s*[-~～—]\s*(\d{4})(?=\s*年)/g, (match, start, end) =>
        readDigits(start) + '到' + readDigits(end) + '年',
      );
      // A range followed by a unit or a percent keeps that unit: 3-5℃.
      out = out.replace(
        /(\d+(?:\.\d+)?)\s*[-~～—]\s*(\d+(?:\.\d+)?)\s*(km\/h|km|kg|cm|mm|℃|°C)/gi,
        (match, start, end, unit) => readNumber(start) + '到' + readNumber(end) + readUnit(unit),
      );
      out = out.replace(/(\d+(?:\.\d+)?)\s*[-~～—]\s*(\d+(?:\.\d+)?)\s*%/g, (match, start, end) =>
        '百分之' + readNumber(start) + '到' + readNumber(end),
      );
      out = out.replace(/(\d+(?:\.\d+)?)\s*[-~～—]\s*(\d+(?:\.\d+)?)/g, (match, start, end) =>
        readNumber(start) + '到' + readNumber(end),
      );
      // Years are read digit by digit.
      out = out.replace(/(\d{4})\s*(?=年)/g, (match) => readDigits(match));
      // Common units, so "5km" is not spelled out letter by letter.
      out = out.replace(/(\d+(?:\.\d+)?)\s*(km\/h|km|kg|cm|mm|℃|°C)/gi, (match, value, unit) =>
        readNumber(value) + readUnit(unit),
      );
      // Percent, clock time, then everything else.
      out = out.replace(/(\d+(?:\.\d+)?)\s*%/g, (match, value) => '百分之' + readNumber(value));
      out = out.replace(/(\d{1,2}):(\d{2})/g, (match, hours, minutes) =>
        readNumber(hours) + '点' + (minutes === '00' ? '整' : readNumber(minutes) + '分'),
      );
      // Negative numbers keep their sign as a spoken word.
      out = out.replace(/(^|[^\w.\d])-(\d+(?:\.\d+)?)/g, (match, before, value) => before + '负' + readNumber(value));
      out = out.replace(/\d+(?:\.\d+)?/g, (match) => readNumber(match));
      return out;
    }

    /* -------------------------------------------------------------- presets */

    function normalizePreset(item, index) {
      if (item === null || typeof item !== 'object') return null;
      return {
        key: String(item.key || 'p' + index),
        label: String(item.label || ''),
        image: typeof item.image === 'string' && item.image !== '' ? item.image : null,
        size: clampSize(item.size),
      };
    }

    function readPresets() {
      try {
        const raw = window.localStorage.getItem(PRESETS_KEY);
        if (raw === null || raw === '') return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        const items = [];
        for (let index = 0; index < parsed.length && items.length < MAX_PRESETS; index += 1) {
          const preset = normalizePreset(parsed[index], index);
          if (preset !== null) items.push(preset);
        }
        return items;
      } catch {
        return [];
      }
    }

    const presetStore = createStore({ items: readPresets() });

    /**
     * Re-read everything after another window changed the stored settings.
     * Without this, a second window keeps its stale copy and could overwrite
     * the other one's presets on the next save.
     */
    function reloadFromStorage() {
      avatarStore.set({
        src: readStored(IMAGE_KEY),
        id: readStored(ID_KEY) || '',
        size: readStoredSize(),
        speech: readStored(SPEECH_KEY) === '1',
        engine: readStored(ENGINE_KEY) === 'clone' ? 'clone' : 'system',
        endpoint: readStored(ENDPOINT_KEY) || DEFAULT_ENDPOINT,
        rate: Number(readStored(RATE_KEY)) > 0 ? Number(readStored(RATE_KEY)) : DEFAULT_RATE,
        tone: TONES.includes(readStored(TONE_KEY)) ? readStored(TONE_KEY) : 'normal',
        sysVoice: readStored(SYSVOICE_KEY) || '',
        autoSpeech: readStored(AUTO_SPEECH_KEY) === '1',
        volume: readStoredVolume(),
        lang: readStoredLang(),
      });
      presetStore.set({ items: readPresets() });
    }

    function usePresets() {
      return React.useSyncExternalStore(presetStore.subscribe, presetStore.get, presetStore.get).items;
    }

    function writePresets(items) {
      presetStore.set({ items });
      try {
        window.localStorage.setItem(PRESETS_KEY, JSON.stringify(items));
      } catch (error) {
        console.warn('[dsh-avatar-frame] could not persist presets', error);
      }
    }

    /** Re-encode a preset image as a small JPEG so many presets stay cheap. */
    function compressImage(dataUrl, size) {
      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const context = canvas.getContext('2d');
            if (context === null) {
              resolve(dataUrl);
              return;
            }
            const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
            const width = image.naturalWidth * scale;
            const height = image.naturalHeight * scale;
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, size, size);
            context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } catch {
            resolve(dataUrl);
          }
        };
        image.onerror = () => resolve(dataUrl);
        image.src = dataUrl;
      });
    }

    function savePreset() {
      const avatar = avatarStore.get();
      if (avatar.src === null && avatar.id === '') return;
      const items = presetStore.get().items;
      if (items.length >= MAX_PRESETS) return;
      const preset = {
        key: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        label: avatar.id,
        image: avatar.src,
        size: avatar.size,
      };
      if (avatar.src === null) {
        writePresets(items.concat([preset]));
        return;
      }
      compressImage(avatar.src, 240).then((small) => {
        const current = presetStore.get().items;
        if (current.length >= MAX_PRESETS) return;
        writePresets(current.concat([{ ...preset, image: small }]));
      });
    }

    function applyPreset(preset) {
      setImage(preset.image);
      setLabel(preset.label);
      setSize(preset.size);
    }

    function removePreset(key) {
      writePresets(presetStore.get().items.filter((preset) => preset.key !== key));
    }

    function useAvatar() {
      return React.useSyncExternalStore(avatarStore.subscribe, avatarStore.get, avatarStore.get);
    }

    function useDialog() {
      return React.useSyncExternalStore(dialogStore.subscribe, dialogStore.get, dialogStore.get);
    }

    function useSpeech() {
      return React.useSyncExternalStore(speechStore.subscribe, speechStore.get, speechStore.get);
    }

    /**
     * 聊天里每一轮都有一个行组件，它们只需要头像设置里的少数几项。
     * 用字符串快照订阅，打字改 ID、调语速这些都不会牵动所有行。
     */
    function useRowAvatar() {
      React.useSyncExternalStore(
        avatarStore.subscribe,
        () => {
          const a = avatarStore.get();
          return [a.id, a.size, a.speech ? 1 : 0, a.engine, a.autoSpeech ? 1 : 0, a.src === null ? 0 : a.src.length].join('|');
        },
        () => '',
      );
      return avatarStore.get();
    }

    /** 行组件关心的播放状态：进度变化不应该让所有行重渲染。 */
    function useRowSpeech() {
      React.useSyncExternalStore(
        speechStore.subscribe,
        () => {
          const s = speechStore.get();
          return [s.status, s.sessionId, s.turn, s.engine, s.error === null ? '' : 'e' + s.error.length].join('|');
        },
        () => '',
      );
      return speechStore.get();
    }

    function useStats() {
      return React.useSyncExternalStore(statsStore.subscribe, statsStore.get, statsStore.get);
    }

    /**
     * 插件自己的翻译：明确选了 zh/en 就用内置文案，否则交给宿主。
     * 返回普通闭包而不是 useCallback —— 宿主页面按需重渲染，这里不需要稳定引用。
     */
    function useT(hostT) {
      const lang = useAvatar().lang;
      return (key) => {
        if (lang === 'auto') return hostT(key);
        const dict = DICTS[lang];
        const hit = dict === undefined ? undefined : dict[key];
        return hit === undefined ? hostT(key) : hit;
      };
    }

    /** Open the avatar panel: the ID field plus the image picker button. */
    function openPanel() {
      dialogStore.set({ open: true, mode: 'panel', draft: null });
    }

    function closeDialog() {
      dialogStore.set({ open: false, mode: 'idle', draft: null });
    }

    /** Read one picked file and open the crop stage with it. */
    function beginCrop(file) {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          dialogStore.set({
            open: true,
            mode: 'crop',
            draft: {
              el: image,
              src: String(reader.result),
              w: image.naturalWidth || 1,
              h: image.naturalHeight || 1,
              zoom: 1,
              dx: 0,
              dy: 0,
            },
          });
        };
        image.onerror = () => closeDialog();
        image.src = String(reader.result);
      };
      reader.onerror = () => closeDialog();
      reader.readAsDataURL(file);
    }

    /* ------------------------------------------------------------- artwork */

    function Silhouette({ className }) {
      return h(
        'svg',
        { viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true', className },
        h('circle', { cx: 12, cy: 9, r: 3.6, fill: 'currentColor' }),
        h('path', {
          d: 'M4.9 19.6c1.1-3.5 3.7-5.2 7.1-5.2s6 1.7 7.1 5.2',
          stroke: 'currentColor',
          strokeWidth: 2.2,
          strokeLinecap: 'round',
        }),
      );
    }

    function Chevron({ className }) {
      return h(
        'svg',
        { viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true', className },
        h('path', {
          d: 'M4 6.2 8 10l4-3.8',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      );
    }

    function SpeakerIcon({ className }) {
      return h(
        'svg',
        { viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true', className },
        h('path', {
          d: 'M8.1 2.5 5 5.1H2.7v5.8H5l3.1 2.6V2.5Z',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinejoin: 'round',
        }),
        h('path', {
          d: 'M10.5 5.9a3.1 3.1 0 0 1 0 4.2M12.4 4.1a5.6 5.6 0 0 1 0 7.8',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinecap: 'round',
        }),
      );
    }

    /* ------------------------------------------------------------- helpers */

    function formatDuration(ms, t) {
      const total = Math.max(0, Math.floor(ms / 1000));
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor(total / 60) % 60;
      const seconds = total % 60;
      const parts = [];
      if (hours > 0) {
        parts.push({ text: String(hours), numeric: true }, { text: t('unit.hour'), numeric: false });
      }
      if (total >= 60) {
        parts.push({ text: String(minutes), numeric: true }, { text: t('unit.minute'), numeric: false });
      }
      parts.push({ text: String(seconds), numeric: true }, { text: t('unit.second'), numeric: false });
      return parts;
    }

    /** Keep live, stopped, and failed Turns open. Mirrors the shipped disclosure rule. */
    function turnProcessAlwaysOpen(node) {
      const location = node && node.location;
      if (!location || (location.kind !== 'turn' && location.kind !== 'step')) return false;
      const reason = location.turn.end && location.turn.end.data ? location.turn.end.data.reason.kind : undefined;
      return (
        location.turn.status === 'open' ||
        reason === 'aborted' ||
        reason === 'interrupted' ||
        reason === 'error'
      );
    }

    /* ---------------------------------------------------------- chat pieces */

    function AvatarFrame({ t, src, onClick }) {
      return h(
        'button',
        {
          type: 'button',
          className: 'dsav-frame',
          'aria-label': t('avatar.action'),
          title: t('avatar.action'),
          onClick,
          onMouseDown: (event) => event.stopPropagation(),
        },
        src
          ? h('img', { className: 'dsav-frameImg', src, alt: '' })
          : h(Silhouette, { className: 'dsav-frameGlyph' }),
      );
    }

    /** 自动朗读的状态：baseline 是打开界面时已有的最后一轮，之前的不念。 */
    const autoSpeechState = { baseline: null, spoken: null, pending: null, timer: null };

    function scheduleAutoSpeech(turn, text, enabled, sessionId) {
      if (!enabled || text === '' || turn === undefined) return;
      const state = autoSpeechState;
      if (state.baseline === null) {
        state.baseline = turn;
        return;
      }
      if (turn <= state.baseline || turn === state.spoken) return;
      state.pending = { turn, text };
      if (state.timer !== null) window.clearTimeout(state.timer);
      // 等一轮渲染稳定再念，避免同一轮被重复触发。
      state.timer = window.setTimeout(() => {
        state.timer = null;
        const pending = state.pending;
        if (pending === null) return;
        state.pending = null;
        state.spoken = pending.turn;
        startSpeech(pending.text, sessionId, pending.turn);
      }, 700);
    }

    /**
     * Replacement renderer for the settled Turn header row ("已完成，用时 …").
     * It keeps the shipped disclosure behaviour, adds the character avatar in
     * the column gutter, and shows the editable ID above the row.
     */
    const TurnProcessRow = React.memo(function TurnProcessRow(props) {
      const { node, turnProcess, t: hostT, useChat, sessionId } = props;
      // 语言按钮改的是插件自己的文案，这里把宿主的 t 换掉。
      const t = useT(hostT);
      const avatar = useRowAvatar();
      const speech = useRowSpeech();
      const turnNumber = node !== undefined && node.data !== undefined ? node.data.turn : undefined;
      const answerStep =
        turnProcess !== undefined && turnProcess.spec !== undefined ? turnProcess.spec.answerStep : undefined;
      const selectChat = typeof useChat === 'function' ? useChat : (selector) => selector(EMPTY_CHAT_SNAPSHOT);
      const replyText = selectChat((snapshot) => readReplyText(snapshot, turnNumber, answerStep, avatar.speech));
      React.useEffect(() => {
        if (!avatar.speech || !avatar.autoSpeech) return;
        if (speechStore.get().status !== 'idle') return;
        scheduleAutoSpeech(turnNumber, replyText, true, sessionId);
      }, [turnNumber, replyText, avatar.autoSpeech, avatar.speech, sessionId]);
      React.useEffect(() => {
        const current = speechStore.get();
        if (current.status === 'speaking' && current.sessionId !== sessionId) stopSpeech();
      }, [sessionId]);
      if (turnProcess === undefined || node === undefined) return null;
      const location = node.location;
      const turn = location && (location.kind === 'turn' || location.kind === 'step') ? location.turn : undefined;
      if (turn === undefined || turn.status !== 'closed') return null;

      const open = !turnProcess.foldable || turnProcess.open;
      const canCollapse = turnProcess.foldable && turnProcess.hasContent && !turnProcessAlwaysOpen(node);
      const reason = turn.end && turn.end.data ? turn.end.data.reason.kind : undefined;
      const stopped = reason === 'aborted' || reason === 'interrupted';
      const elapsedMs =
        turn.start === undefined || turn.end === undefined ? undefined : Math.max(1000, turn.end.time - turn.start.time);
      const duration = elapsedMs === undefined || stopped || reason === 'error' ? undefined : formatDuration(elapsedMs, t);
      const label = stopped
        ? t('process.stopped')
        : reason === 'error'
          ? t('process.failed')
          : duration === undefined
            ? t('process.done')
            : t('process.took');
      const announcement = stopped ? t('process.stopped') : reason === 'error' ? t('process.failed') : t('process.done');
      const data = node.data || {};
      const active = speech.status === 'speaking' || speech.status === 'paused';
      const speaking = active && speech.turn === data.turn && speech.sessionId === sessionId;
      const failed = !active && speech.error !== null && speech.turn === data.turn && speech.sessionId === sessionId;
      const showSpeaker = avatar.speech && replyText !== '';

      const caption =
        avatar.id === ''
          ? null
          : h(
              'button',
              {
                type: 'button',
                className: 'dsav-caption',
                title: t('id.action'),
                'aria-label': t('id.action'),
                onClick: (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  openPanel();
                },
                onMouseDown: (event) => event.stopPropagation(),
              },
              avatar.id,
            );

      const speaker = showSpeaker
        ? h(
            'button',
            {
              type: 'button',
              className: 'dsav-speak' + (speaking ? ' dsav-speakOn' : ''),
              title: speaking ? t('speech.stop') : t('speech.play'),
              'aria-label': speaking ? t('speech.stop') : t('speech.play'),
              onClick: (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (speaking) {
                  stopSpeech();
                } else {
                  const spoken = normalizeForSpeech(replyText);
                  if (avatar.engine === 'clone') speakClone(spoken, sessionId, data.turn);
                  else startSpeech(spoken, sessionId, data.turn);
                }
              },
              onMouseDown: (event) => event.stopPropagation(),
            },
            h(SpeakerIcon, { className: 'dsav-speakIcon' }),
          )
        : null;

      // 只有小喇叭在场时才提示朗读失败，否则红点会孤零零挂在 ID 后面。
      const failureDot =
        showSpeaker && failed ? h('span', { className: 'dsav-errorDot', title: speech.error, 'aria-label': speech.error }) : null;
      // 朗读时把控制条接在小喇叭右边，紧贴正在读的那一行。
      const inlineControls = speaking && speech.engine !== null ? h(SpeechControls, { t, speech }) : null;

      const captionRow =
        caption === null && speaker === null && failureDot === null
          ? null
          : h('div', { className: 'dsav-captionRow' }, caption, speaker, inlineControls, failureDot);

      return h(
        'div',
        {
          className: 'dsav-row',
          'data-dsh-avatar-frame': '',
          style: { '--dsav-id-size': avatar.size + 'px' },
        },
        h('span', { className: 'dsav-sr', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }, announcement),
        h(AvatarFrame, {
          t,
          src: avatar.src,
          onClick: (event) => {
            event.preventDefault();
            event.stopPropagation();
            openPanel();
          },
        }),
        h('div', { className: 'dsav-body' }, captionRow, h(
            'button',
            {
              type: 'button',
              className: 'dsav-process',
              'data-open': open || undefined,
              'data-turn-process': data.turn,
              'data-turn-process-messages': data.messageCount,
              'data-turn-process-tool-calls': data.toolCallCount,
              'data-turn-process-subagents': data.subagentCount,
              disabled: !canCollapse,
              'aria-expanded': turnProcess.hasContent ? open : undefined,
              onClick: (event) => {
                event.currentTarget.focus();
                turnProcess.setOpen(!open);
              },
            },
            h(
              'span',
              { className: 'dsav-label' },
              label,
              duration
                ? duration.map((part, index) =>
                    h('span', { key: index, className: part.numeric ? 'dsav-num' : undefined }, part.text),
                  )
                : null,
            ),
            canCollapse ? h(Chevron, { className: 'dsav-chevron' }) : null,
          ),
        ),
      );
    });

    /* ------------------------------------------------------- avatar dialog */

    /** Keep Tab inside the open dialog. */
    function trapTab(event) {
      if (event.key !== 'Tab') return;
      const container = event.currentTarget;
      const nodes = container.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])',
      );
      const list = Array.from(nodes).filter((element) => !element.disabled && element.offsetParent !== null);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function IdField({ t, id }) {
      return h('input', {
        className: 'dsav-input',
        type: 'text',
        value: id,
        maxLength: 40,
        spellCheck: false,
        autoFocus: true,
        placeholder: t('id.placeholder'),
        'aria-label': t('id.placeholder'),
        onChange: (event) => setLabel(event.target.value),
        onKeyDown: (event) => {
          if (event.key === 'Enter') closeDialog();
        },
      });
    }

    /** Bounded ID text-size control, shared by the panel and the bundle page. */
    function FontSizeField({ t }) {      const avatar = useAvatar();
      return h(
        'div',
        { className: 'dsav-sizeRow' },
        h('span', { className: 'dsav-sizeLabel' }, t('size.label')),
        h('input', {
          className: 'dsav-sizeRange',
          type: 'range',
          min: MIN_SIZE,
          max: MAX_SIZE,
          step: 1,
          value: avatar.size,
          'aria-label': t('size.action'),
          onChange: (event) => setSize(event.target.value),
        }),
        h('span', { className: 'dsav-sizeValue' }, avatar.size + 'px'),
      );
    }

    /** On/off switch for the read-aloud button, shared by the panel and the bundle page. */
    function SpeechToggle({ t }) {
      const avatar = useAvatar();
      return h(
        'div',
        { className: 'dsav-toggleRow' },
        h('span', { className: 'dsav-toggleLabel' }, t('speech.label')),
        h(
          'button',
          {
            type: 'button',
            role: 'switch',
            'aria-checked': avatar.speech ? 'true' : 'false',
            'aria-label': t('speech.toggle'),
            title: t('speech.toggle'),
            className: 'dsav-switch' + (avatar.speech ? ' dsav-switchOn' : ''),
            onClick: () => setSpeech(!avatar.speech),
          },
          h('span', { className: 'dsav-switchDot' }),
        ),
      );
    }

    /** Live reachability of the user's own service, so a blank voice is explainable. */
    function useCloneStatus(endpoint) {
      const [state, setState] = React.useState({ status: 'checking', model: null });
      const probe = React.useSyncExternalStore(probeStore.subscribe, probeStore.get, probeStore.get);
      const tick = probe.tick;
      const startingSince = probe.startingSince;
      React.useEffect(() => {
        const address = (endpoint || '').trim().replace(/\/+$/, '') || DEFAULT_ENDPOINT;
        let alive = true;
        let retryTimer = null;
        let controller = null;
        // 服务重启时第一次请求可能落在旧连接上，先重试一次再判定离线；
        // 判定离线后每 2.5 秒再探一次（本机 /health 只要 2ms，成本可忽略），
        // 连上后改成每 30 秒一次的静默保活，服务中途挂掉也能自己变红。
        const OFFLINE_RETRY_MS = 2500;
        const ONLINE_KEEPALIVE_MS = 30000;
        const TRANSIENT_RETRY_MS = 700;
        const schedule = (delay, attempt, silent) => {
          retryTimer = window.setTimeout(() => {
            if (!alive) return;
            probe(attempt, silent);
          }, delay);
        };
        const probe = (attempt, silent) => {
          if (!alive) return;
          controller = new AbortController();
          const timer = window.setTimeout(() => controller.abort(), 4000);
          const retryOrOffline = (reason) => {
            if (!alive) return;
            const since = probeStore.get().startingSince;
            const warming = since !== null && Date.now() - since < SERVICE_WARMUP_MS;
            if (warming) {
              // 暖机期：服务大概率还在加载模型，保持「检测中」，别显示「未连接」。
              setState({ status: 'checking', model: null, reason: null });
              schedule(1200, 0, true);
              return;
            }
            if (attempt < 1) schedule(TRANSIENT_RETRY_MS, attempt + 1, silent);
            else setOffline(reason);
          };
          const markOnline = (model) => {
            if (!alive) return;
            if (probeStore.get().startingSince !== null) probeStore.set({ startingSince: null });
            setState({ status: 'online', model, reason: null });
            schedule(ONLINE_KEEPALIVE_MS, 0, true);
          };
          fetch(address + '/health', { signal: controller.signal })
            .then((response) => {
              if (!alive) return;
              if (!response.ok) {
                retryOrOffline('http:' + response.status);
                return;
              }
              return response
                .json()
                .then((payload) => markOnline(payload && payload.model ? String(payload.model) : null))
                .catch(() => markOnline(null));
            })
            .catch((error) => retryOrOffline(error && error.name === 'AbortError' ? 'timeout' : 'unreachable'))
            .finally(() => {
              window.clearTimeout(timer);
            });
        };
        const setOffline = (reason) => {
          setState({ status: 'offline', model: null, reason: typeof reason === 'string' ? reason : 'unreachable' });
          schedule(OFFLINE_RETRY_MS, 0, true);
        };
        // Wait for typing to settle, so the address is not probed per keystroke.
        const debounce = window.setTimeout(() => {
          setState({ status: 'checking', model: null });
          probe(0, false);
        }, 350);
        return () => {
          alive = false;
          window.clearTimeout(debounce);
          if (retryTimer !== null) window.clearTimeout(retryTimer);
          if (controller !== null) controller.abort();
        };
      }, [endpoint, tick, startingSince]);

      // 等待期间每秒重渲染一次，让「已等待 N 秒」走起来。
      const [nowTick, setNowTick] = React.useState(0);
      React.useEffect(() => {
        if (startingSince === null) return undefined;
        const timer = window.setInterval(() => setNowTick((value) => value + 1), 1000);
        return () => window.clearInterval(timer);
      }, [startingSince]);

      const warming = startingSince !== null && Date.now() - startingSince < SERVICE_WARMUP_MS;
      return warming && state.status !== 'online'
        ? { status: 'checking', model: null, waitingSeconds: Math.max(1, Math.round((Date.now() - startingSince) / 1000)) }
        : state;
    }

    /** 让健康检查立刻再探一次。 */
    function recheckService() {
      probeStore.set({ tick: probeStore.get().tick + 1 });
    }

    /**
     * 点了「启动服务」之后调用：进入暖机期。
     * 模型加载要十几秒，这段时间探测必然失败，但不能因此显示「未连接」把人吓走。
     */
    const SERVICE_WARMUP_MS = 25000;
    function beginServiceWarmup() {
      probeStore.set({ tick: probeStore.get().tick + 1, startingSince: Date.now() });
    }

    /** 状态下面那行小字：等待进度或失败原因。原因限制长度，避免撑破界面。 */
    function statusDetail(t, status) {
      if (status.waitingSeconds) {
        return t('status.warming').replace('{s}', String(status.waitingSeconds));
      }
      if (status.status !== 'offline' || !status.reason) return null;
      const reason = String(status.reason);
      const text = reason.startsWith('http:')
        ? t('status.reasonHttp').replace('{code}', reason.slice(5))
        : reason === 'timeout'
          ? t('status.reasonTimeout')
          : t('status.reasonUnreachable');
      return text.length > 70 ? text.slice(0, 70) + '…' : text;
    }

    function EndpointField({ t }) {
      const avatar = useAvatar();
      const status = useCloneStatus(avatar.endpoint);
      return h(
        'div',
        { className: 'dsav-endpoint' },
        h(
          'div',
          { className: 'dsav-endpointRow' },
          h('input', {
            className: 'dsav-input dsav-endpointInput',
            type: 'text',
            value: avatar.endpoint,
            spellCheck: false,
            placeholder: t('endpoint.placeholder'),
            'aria-label': t('endpoint.label'),
            onChange: (event) => setEndpoint(event.target.value),
          }),
          h(
            'span',
            { className: 'dsav-state dsav-state-' + status.status },
            h('span', { className: 'dsav-dot' }),
            t('status.' + status.status),
          ),
        ),
        h('div', { className: 'dsav-endpointHint' }, t('engine.hint')),
        status.status === 'offline' ? h('div', { className: 'dsav-endpointHint' }, t('endpoint.offlineHint')) : null,
      );
    }

    /** Which engine reads the reply: the system voice or a local service the user runs. */
    /** 系统语音选择：浏览器自带的音色有软有硬，交给用户挑，附一个试听。 */
    function SystemVoiceField({ t }) {
      const avatar = useAvatar();
      const voices = React.useSyncExternalStore(voicesStore.subscribe, voicesStore.get, voicesStore.get).list;
      React.useEffect(() => {
        refreshVoices();
        const synth = window.speechSynthesis;
        if (synth && typeof synth.addEventListener === 'function') {
          const onChange = () => refreshVoices();
          synth.addEventListener('voiceschanged', onChange);
          return () => synth.removeEventListener('voiceschanged', onChange);
        }
        return undefined;
      }, []);
      const options = voiceOptions();  // 中英都列，按界面语言排序
      const autoLabel = options.length > 0 ? t('sysvoice.auto') + ' · ' + options[0].name : t('sysvoice.auto');
      return h(
        'div',
        { className: 'dsav-field' },
        h(
          'div',
          { className: 'dsav-fieldHead' },
          h('span', { className: 'dsav-toggleLabel' }, t('sysvoice.label')),
          h(
            'span',
            { className: 'dsav-voiceTools' },
            h('span', { className: 'dsav-endpointHint dsav-voiceCount' }, t('sysvoice.count').replace('{n}', String(options.length))),
            h('button', { type: 'button', className: 'dsav-btn', onClick: () => refreshVoices() }, t('sysvoice.refresh')),
            h('button', { type: 'button', className: 'dsav-btn', onClick: () => auditionSystemVoice() }, t('sysvoice.test')),
          ),
        ),
        h(
          'select',
          {
            className: 'dsav-select dsav-selectFull',
            value: avatar.sysVoice,
            'aria-label': t('sysvoice.label'),
            onChange: (event) => setSysVoice(event.target.value),
          },
          h('option', { value: '' }, autoLabel),
          options.map((voice) => h('option', { key: voice.name, value: voice.name }, voice.name + ' · ' + voice.lang)),
        ),
      );
    }

    function EngineField({ t }) {
      const avatar = useAvatar();
      const options = [
        { value: 'system', label: t('engine.system') },
        { value: 'clone', label: t('engine.clone') },
      ];
      return h(
        Fragment,
        null,
        h(
          'div',
          { className: 'dsav-toggleRow' },
          h('span', { className: 'dsav-toggleLabel' }, t('engine.label')),
          h(
            'div',
            { className: 'dsav-seg', role: 'group', 'aria-label': t('engine.label') },
            options.map((option) =>
              h(
                'button',
                {
                  key: option.value,
                  type: 'button',
                  className: 'dsav-segBtn' + (avatar.engine === option.value ? ' dsav-segOn' : ''),
                  'aria-pressed': avatar.engine === option.value ? 'true' : 'false',
                  onClick: () => setEngine(option.value),
                },
                option.label,
              ),
            ),
          ),
        ),
        avatar.engine === 'clone' ? h(EndpointField, { t }) : null,
      );
    }

    /** Saved avatar + ID combinations, shared by the panel and the bundle page. */
    function PresetBar({ t }) {
      const avatar = useAvatar();
      const presets = usePresets();
      const full = presets.length >= MAX_PRESETS;
      const canSave = (avatar.src !== null || avatar.id !== '') && !full;
      return h(
        'div',
        { className: 'dsav-presets' },
        h(
          'div',
          { className: 'dsav-presetsHead' },
          h('span', { className: 'dsav-presetsTitle' }, t('presets.title')),
          h(
            'button',
            {
              type: 'button',
              className: 'dsav-btn',
              disabled: !canSave,
              title: full ? t('presets.full') : undefined,
              onClick: () => savePreset(),
            },
            t('presets.save'),
          ),
        ),
        presets.length === 0
          ? h('div', { className: 'dsav-presetsEmpty' }, t('presets.empty'))
          : h(
              'div',
              { className: 'dsav-presetsList' },
              presets.map((preset) =>
                h(
                  'div',
                  { className: 'dsav-preset', key: preset.key },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsav-presetMain',
                      title: t('presets.apply'),
                      onClick: () => applyPreset(preset),
                    },
                    h(
                      'span',
                      { className: 'dsav-presetThumb' },
                      preset.image !== null
                        ? h('img', { src: preset.image, alt: '' })
                        : h(Silhouette, { className: 'dsav-frameGlyph' }),
                    ),
                    h('span', { className: 'dsav-presetName' }, preset.label === '' ? t('id.empty') : preset.label),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsav-presetRemove',
                      title: t('presets.remove'),
                      'aria-label': t('presets.remove'),
                      onClick: () => removePreset(preset.key),
                    },
                    '×',
                  ),
                ),
              ),
            ),
      );
    }

    function CropDialog({ t: hostT }) {
      const t = useT(hostT);
      const state = useDialog();
      const avatar = useAvatar();
      const fileRef = React.useRef(null);
      const stageRef = React.useRef(null);
      const dragRef = React.useRef(null);

      const draft = state.draft;
      const base = draft ? STAGE / Math.min(draft.w, draft.h) : 1;
      const displayWidth = draft ? draft.w * base * draft.zoom : STAGE;
      const displayHeight = draft ? draft.h * base * draft.zoom : STAGE;

      const clampDraft = (candidate) => {
        const width = candidate.w * base * candidate.zoom;
        const height = candidate.h * base * candidate.zoom;
        const limitX = Math.max(0, (width - STAGE) / 2);
        const limitY = Math.max(0, (height - STAGE) / 2);
        return {
          ...candidate,
          dx: Math.max(-limitX, Math.min(limitX, candidate.dx)),
          dy: Math.max(-limitY, Math.min(limitY, candidate.dy)),
        };
      };

      React.useEffect(() => {
        if (!state.open) return undefined;
        const onKeyDown = (event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            closeDialog();
          }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
      }, [state.open]);

      React.useEffect(() => {
        const stage = stageRef.current;
        if (!stage || state.mode !== 'crop' || draft === null) return undefined;
        const onWheel = (event) => {
          event.preventDefault();
          const current = dialogStore.get();
          if (current.draft === null) return;
          const zoom = Math.min(3, Math.max(1, current.draft.zoom - event.deltaY * 0.0015));
          dialogStore.set({ draft: clampDraft({ ...current.draft, zoom }) });
        };
        stage.addEventListener('wheel', onWheel, { passive: false });
        return () => stage.removeEventListener('wheel', onWheel);
      }, [state.mode, draft === null ? null : draft.src]);

      const onFile = (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        beginCrop(file);
      };

      const onPointerDown = (event) => {
        if (draft === null) return;
        if (event.currentTarget.setPointerCapture) event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = { x: event.clientX, y: event.clientY, dx: draft.dx, dy: draft.dy };
      };

      const onPointerMove = (event) => {
        const drag = dragRef.current;
        if (drag === null || draft === null) return;
        dialogStore.set({
          draft: clampDraft({
            ...draft,
            dx: drag.dx + (event.clientX - drag.x),
            dy: drag.dy + (event.clientY - drag.y),
          }),
        });
      };

      const onPointerUp = () => {
        dragRef.current = null;
      };

      const applyCrop = () => {
        if (draft === null) return;
        const canvas = document.createElement('canvas');
        canvas.width = OUTPUT;
        canvas.height = OUTPUT;
        const context = canvas.getContext('2d');
        if (context === null) return;
        const scale = OUTPUT / STAGE;
        const width = displayWidth * scale;
        const height = displayHeight * scale;
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, OUTPUT, OUTPUT);
        context.drawImage(
          draft.el,
          (OUTPUT - width) / 2 + draft.dx * scale,
          (OUTPUT - height) / 2 + draft.dy * scale,
          width,
          height,
        );
        setImage(canvas.toDataURL('image/png'));
        closeDialog();
      };

      const input = h('input', {
        key: 'file',
        ref: fileRef,
        type: 'file',
        accept: 'image/*',
        className: 'dsav-file',
        tabIndex: -1,
        'aria-hidden': 'true',
        onChange: onFile,
      });

      const backdrop = (event) => {
        if (event.target === event.currentTarget) closeDialog();
      };

      if (!state.open) return input;

      if (state.mode === 'panel') {
        return h(
          Fragment,
          null,
          input,
          h(
            'div',
            { className: 'dsav-scrim', onMouseDown: backdrop },
            h(
              'div',
              {
                className: 'dsav-dialog dsav-dialogSmall',
                role: 'dialog',
                'aria-modal': 'true',
                'aria-label': t('dialog.title'),
                onKeyDown: trapTab,
              },
              h(
                'div',
                { className: 'dsav-dialogTitleRow' },
                h('div', { className: 'dsav-dialogTitle' }, t('dialog.title')),
                h(LangSwitch, { t }),
              ),
              h(IdField, { t, id: avatar.id }),
              h(FontSizeField, { t }),
              h(SpeechToggle, { t }),
              h(AutoSpeechField, { t }),
              h(VolumeField, { t }),
              h(EngineField, { t }),
              avatar.engine === 'clone' ? null : h(SystemVoiceField, { t }),
              avatar.engine === 'clone' ? h(ToneField, { t }) : null,
              avatar.engine === 'clone' ? h(RateField, { t }) : null,
              h(PresetBar, { t }),
              h(
                'div',
                { className: 'dsav-actions' },
                h('span', { className: 'dsav-spacer' }),
                h('button', { type: 'button', className: 'dsav-btn', onClick: closeDialog }, t('dialog.cancel')),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsav-btn dsav-btnPrimary',
                    onClick: () => {
                      const field = fileRef.current;
                      if (field === null) return;
                      field.value = '';
                      field.click();
                    },
                  },
                  t('dialog.choose'),
                ),
              ),
            ),
          ),
        );
      }

      if (state.mode !== 'crop' || draft === null) return input;

      return h(
        Fragment,
        null,
        input,
        h(
          'div',
          { className: 'dsav-scrim', onMouseDown: backdrop },
          h(
            'div',
            {
              className: 'dsav-dialog',
              role: 'dialog',
              'aria-modal': 'true',
              'aria-label': t('dialog.title'),
              onKeyDown: trapTab,
            },
            h('div', { className: 'dsav-dialogTitle' }, t('dialog.title')),
            h(
              'div',
              {
                className: 'dsav-stage',
                ref: stageRef,
                onPointerDown,
                onPointerMove,
                onPointerUp,
                onPointerCancel: onPointerUp,
              },
              h('img', {
                className: 'dsav-stageImg',
                src: draft.src,
                alt: '',
                draggable: false,
                style: {
                  width: displayWidth + 'px',
                  height: displayHeight + 'px',
                  transform: 'translate(calc(-50% + ' + draft.dx + 'px), calc(-50% + ' + draft.dy + 'px))',
                },
              }),
            ),
            h('div', { className: 'dsav-hint' }, t('dialog.hint')),
            h('input', {
              className: 'dsav-range',
              type: 'range',
              min: 1,
              max: 3,
              step: 0.01,
              value: draft.zoom,
              'aria-label': t('dialog.hint'),
              onChange: (event) => {
                const zoom = Number(event.target.value);
                dialogStore.set({ draft: clampDraft({ ...draft, zoom }) });
              },
            }),
            h(
              'div',
              { className: 'dsav-actions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsav-btn',
                  onClick: () => {
                    const field = fileRef.current;
                    if (field === null) return;
                    field.value = '';
                    field.click();
                  },
                },
                t('dialog.another'),
              ),
              h('span', { className: 'dsav-spacer' }),
              h('button', { type: 'button', className: 'dsav-btn', onClick: closeDialog }, t('dialog.cancel')),
              h('button', { type: 'button', className: 'dsav-btn dsav-btnPrimary', onClick: applyCrop }, t('dialog.apply')),
            ),
          ),
        ),
      );
    }

    /* ------------------------------------------------------------ language */

    /** 中文 / English 切换；三个界面共用同一个组件。 */
    function LangSwitch({ t }) {
      const avatar = useAvatar();
      const options = [
        { value: 'zh', label: '中文' },
        { value: 'en', label: 'English' },
      ];
      return h(
        'div',
        { className: 'dsav-lang', role: 'group', 'aria-label': t('lang.label'), title: t('lang.label') },
        options.map((option) =>
          h(
            'button',
            {
              key: option.value,
              type: 'button',
              className: 'dsav-langBtn' + (avatar.lang === option.value ? ' dsav-langOn' : ''),
              'aria-pressed': avatar.lang === option.value ? 'true' : 'false',
              onClick: () => setLang(option.value),
            },
            option.label,
          ),
        ),
      );
    }

    /* ------------------------------------------------- plugins bundle page */

    /**
     * Editor rendered on this bundle's own page in the plugin manager, so the
     * feature is reachable by opening the plugin instead of only by its avatar.
     */
    function BundlePanel({ t: hostT, view }) {
      const t = useT(hostT);
      const avatar = useAvatar();
      const status = useCloneStatus(avatar.endpoint);
      const fileRef = React.useRef(null);
      if (view !== 'page') return null;
      return h(
        'div',
        { className: 'dsav-bundle', 'data-dsh-avatar-frame': 'bundle' },
        h(
          'div',
          { className: 'dsav-dialogTitleRow' },
          h('div', { className: 'dsav-bundleHead' }, t('bundle.title')),
          h(LangSwitch, { t }),
        ),
        h(
          'div',
          { className: 'dsav-bundleBody' },
          h(
            'span',
            { className: 'dsav-bundlePreview' },
            avatar.src ? h('img', { src: avatar.src, alt: '' }) : h(Silhouette, { className: 'dsav-frameGlyph' }),
          ),
          h('input', {
            className: 'dsav-input dsav-bundleInput',
            type: 'text',
            value: avatar.id,
            maxLength: 40,
            spellCheck: false,
            placeholder: t('id.placeholder'),
            'aria-label': t('id.placeholder'),
            onChange: (event) => setLabel(event.target.value),
          }),
          h(
            'button',
            {
              type: 'button',
              className: 'dsav-btn',
              onClick: () => {
                const field = fileRef.current;
                if (field === null) return;
                field.value = '';
                field.click();
              },
            },
            t('dialog.choose'),
          ),
          h(
            'button',
            { type: 'button', className: 'dsav-btn', disabled: avatar.src === null, onClick: () => setImage(null) },
            t('settings.reset'),
          ),
          h('input', {
            ref: fileRef,
            type: 'file',
            accept: 'image/*',
            className: 'dsav-file',
            tabIndex: -1,
            'aria-hidden': 'true',
            onChange: (event) => {
              const file = event.target.files && event.target.files[0];
              if (file) beginCrop(file);
            },
          }),
        ),
        h(FontSizeField, { t }),
        h(SpeechToggle, { t }),
        h(AutoSpeechField, { t }),
        h(VolumeField, { t }),
        h(EngineField, { t }),
        avatar.engine === 'clone' ? null : h(SystemVoiceField, { t }),
        avatar.engine === 'clone' ? h(ToneField, { t }) : null,
        h(RateField, { t }),
        avatar.engine === 'clone' ? h(AuditionButton, { t }) : null,
        h(PresetBar, { t }),
        h(ServiceControl, { t, online: status.status === 'online', engine: avatar.engine }),
        h('div', { className: 'dsav-bundleHint' }, t('bundle.hint')),
      );
    }

    /* ------------------------------------------------------ settings row */

    /** 情绪档位：映射到服务端的 temperature / top_k。 */
    /** 自动朗读新回复。 */
    function AutoSpeechField({ t }) {
      const avatar = useAvatar();
      const disabled = !avatar.speech;
      return h(
        'div',
        { className: 'dsav-toggleRow' },
        h(
          'span',
          { className: 'dsav-toggleLabel' + (disabled ? ' dsav-muted' : '') },
          t('auto.label'),
        ),
        h(
          'button',
          {
            type: 'button',
            role: 'switch',
            'aria-checked': avatar.autoSpeech ? 'true' : 'false',
            'aria-label': t('auto.label'),
            disabled,
            className: 'dsav-switch' + (avatar.autoSpeech ? ' dsav-switchOn' : ''),
            onClick: () => setAutoSpeech(!avatar.autoSpeech),
          },
          h('span', { className: 'dsav-switchDot' }),
        ),
      );
    }

    /** 音量：两种引擎都生效。 */
    function VolumeField({ t }) {
      const avatar = useAvatar();
      const percent = Math.round(avatar.volume * 100);
      return h(
        'div',
        { className: 'dsav-toggleRow' },
        h('span', { className: 'dsav-toggleLabel' }, t('volume.label')),
        h(
          'span',
          { className: 'dsav-volume' },
          h('input', {
            className: 'dsav-range',
            type: 'range',
            min: 0,
            max: 100,
            step: 5,
            value: percent,
            'aria-label': t('volume.label'),
            onChange: (event) => setVolume(Number(event.target.value) / 100),
          }),
          h('span', { className: 'dsav-volumeValue' }, percent + '%'),
        ),
      );
    }

    function ToneField({ t }) {
      const avatar = useAvatar();
      const options = [
        { value: 'calm', label: t('tone.calm') },
        { value: 'normal', label: t('tone.normal') },
        { value: 'lively', label: t('tone.lively') },
      ];
      return h(
        'div',
        { className: 'dsav-toggleRow' },
        h('span', { className: 'dsav-toggleLabel' }, t('tone.label')),
        h(
          'div',
          { className: 'dsav-seg', role: 'group', 'aria-label': t('tone.label') },
          options.map((option) =>
            h(
              'button',
              {
                key: option.value,
                type: 'button',
                className: 'dsav-segBtn' + (avatar.tone === option.value ? ' dsav-segOn' : ''),
                'aria-pressed': avatar.tone === option.value ? 'true' : 'false',
                onClick: () => chooseTone(option.value),
              },
              option.label,
            ),
          ),
        ),
      );
    }

    /** 语速档位。 */
    function RateField({ t }) {
      const avatar = useAvatar();
      const options = RATE_OPTIONS;
      return h(
        'div',
        { className: 'dsav-toggleRow' },
        h('span', { className: 'dsav-toggleLabel' }, t('speech.rate')),
        h(
          'div',
          { className: 'dsav-seg', role: 'group', 'aria-label': t('speech.rate') },
          options.map((rate) =>
            h(
              'button',
              {
                key: rate,
                type: 'button',
                className: 'dsav-segBtn' + (Math.abs(avatar.rate - rate) < 0.001 ? ' dsav-segOn' : ''),
                'aria-pressed': Math.abs(avatar.rate - rate) < 0.001 ? 'true' : 'false',
                onClick: () => chooseRate(rate),
              },
              rate.toFixed(2) + '×',
            ),
          ),
        ),
      );
    }

    /** 试听按钮：不用去聊天里点小喇叭。 */
    function AuditionButton({ t }) {
      const speech = useSpeech();
      const busy = speech.status === 'speaking' || speech.status === 'paused';
      return h(
        'button',
        {
          type: 'button',
          className: 'dsav-btn dsav-audition',
          disabled: busy,
          onClick: () => speakClone(t('audition.text'), null, null),
        },
        busy ? t('audition.stopHint') : t('audition.label'),
      );
    }

    /** 朗读中的行内控制条：暂停/继续、上一句/下一句、语速、停止。 */
    function SpeechControls({ t, speech }) {
      const paused = speech.status === 'paused';
      const atStart = speech.index <= 0;
      const atEnd = speech.index >= speech.total - 1;
      return h(
        'span',
        { className: 'dsav-inlineBar', role: 'group', 'aria-label': t('bar.label') },
        h(
          'button',
          {
            type: 'button',
            className: 'dsav-barBtn',
            title: t('bar.prev'),
            'aria-label': t('bar.prev'),
            disabled: atStart,
            onClick: () => skipSentence(-1),
          },
          '⏮',
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'dsav-barBtn dsav-barMain',
            title: paused ? t('bar.resume') : t('bar.pause'),
            'aria-label': paused ? t('bar.resume') : t('bar.pause'),
            onClick: () => (paused ? resumeSpeech() : pauseSpeech()),
          },
          paused ? '▶' : '⏸',
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'dsav-barBtn',
            title: t('bar.next'),
            'aria-label': t('bar.next'),
            disabled: atEnd,
            onClick: () => skipSentence(1),
          },
          '⏭',
        ),
        h('span', { className: 'dsav-barInfo' }, speech.index + 1 + ' / ' + speech.total),
        h(
          'button',
          {
            type: 'button',
            className: 'dsav-barBtn dsav-barRate',
            title: t('speech.rate'),
            onClick: () => chooseRate(nextRate(speech.rate)),
          },
          speech.rate.toFixed(2) + '×',
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'dsav-barBtn dsav-barStop',
            title: t('bar.stop'),
            'aria-label': t('bar.stop'),
            onClick: () => stopSpeech(),
          },
          '✕',
        ),
      );
    }

    /* --------------------------------------------------------- service 启动 */

    const SERVICE_ROUTE = '/dsh-avatar-frame/service';

    /** 调用宿主端的服务管理路由；宿主没加载时抛出可读错误。 */
    async function serviceCall(method, payload) {
      const response = await fetch(SERVICE_ROUTE, {
        method,
        headers: payload === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: payload === undefined ? undefined : JSON.stringify(payload),
      });
      const text = await response.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
      if (data === null) throw new Error(`host half not loaded (HTTP ${response.status})`);
      return data;
    }

    const EMPTY_SERVICE_CONFIG = { command: '', cwd: '', env: '', autostart: false };

    /** 语音服务：手动启动/停止、随 DSH 启动、启动命令配置。 */
    function ServiceControl({ t, online, engine }) {
      const [ready, setReady] = React.useState(false);
      const [available, setAvailable] = React.useState(true);
      const [running, setRunning] = React.useState(false);
      const [config, setConfig] = React.useState(EMPTY_SERVICE_CONFIG);
      const [draft, setDraft] = React.useState({ command: '', cwd: '', env: '' });
      const [busy, setBusy] = React.useState('');
      const [message, setMessage] = React.useState(null);
      const [lastExit, setLastExit] = React.useState(null);

      const adopt = (data) => {
        if (data === null || typeof data !== 'object') return;
        // 动作响应是 { ok, state }：只认里面那份状态，别用外层把 running 覆盖成 false。
        if (data.state !== undefined) {
          adopt(data.state);
          return;
        }
        const next = data.config || EMPTY_SERVICE_CONFIG;
        setRunning(data.running === true);
        setLastExit(data.lastExit && typeof data.lastExit === 'object' ? data.lastExit : null);
        setConfig({
          command: typeof next.command === 'string' ? next.command : '',
          cwd: typeof next.cwd === 'string' ? next.cwd : '',
          env: typeof next.env === 'string' ? next.env : '',
          autostart: next.autostart === true,
        });
      };

      const load = () => {
        serviceCall('GET')
          .then((data) => {
            setAvailable(true);
            adopt(data);
            setDraft({
              command: typeof data.config?.command === 'string' ? data.config.command : '',
              cwd: typeof data.config?.cwd === 'string' ? data.config.cwd : '',
              env: typeof data.config?.env === 'string' ? data.config.env : '',
            });
            setMessage(null);
          })
          .catch((error) => {
            setAvailable(false);
            setMessage(String(error && error.message ? error.message : error));
          })
          .finally(() => setReady(true));
      };

      React.useEffect(load, []);

      const act = (action, payload) => {
        const restart = action === 'restart';
        setBusy(restart ? 'restart' : action);
        if (restart) {
          serviceCall('POST', { action: 'stop' })
            .then((data) => {
              adopt(data);
              return new Promise((resolve) => window.setTimeout(resolve, 600));
            })
            .then(() => serviceCall('POST', { action: 'start' }))
            .then((data) => {
              adopt(data);
              setMessage(data.ok === false ? data.error || t('service.failed') : t('service.startDone'));
              beginServiceWarmup();
              window.setTimeout(load, 3000);
            })
            .catch((error) => {
              setAvailable(false);
              setMessage(String(error && error.message ? error.message : error));
            })
            .finally(() => setBusy(''));
          return;
        }
        serviceCall('POST', { action, ...(payload || {}) })
          .then((data) => {
            setAvailable(true);
            adopt(data);
            if (data.ok === false) {
              setMessage(data.error || t('service.failed'));
            } else {
              setMessage(t('service.' + action + 'Done'));
            }
            if (action === 'start') {
              beginServiceWarmup();
              // 进程若几秒内就退出，把它的输出取回来给用户看。
              window.setTimeout(load, 3000);
            }
            if (action === 'stop') window.setTimeout(recheckService, 300);
          })
          .catch((error) => {
            setAvailable(false);
            setMessage(String(error && error.message ? error.message : error));
          })
          .finally(() => setBusy(''));
      };

      // 先拿到宿主端状态再决定显示什么：音色是「系统语音」时这块默认整段隐藏，
      // 但进程还在跑、或者开着「随 DSH 启动」时仍要露出来，否则用户没有收尾的入口。
      if (!ready) return null;
      if (engine !== 'clone' && !running && !config.autostart) return null;
      if (!available) {
        return h(
          'div',
          { className: 'dsav-service' },
          h('div', { className: 'dsav-sectionTitle' }, t('section.service')),
          h('div', { className: 'dsav-endpointHint' }, t('service.unavailable')),
        );
      }

      return h(
        'div',
        { className: 'dsav-service' },
        h('div', { className: 'dsav-sectionTitle' }, t('section.service')),
        engine === 'clone' ? null : h('div', { className: 'dsav-endpointHint' }, t('service.onlyForLocal')),
        h(
          'div',
          { className: 'dsav-serviceRow' },
          h(
            'span',
            { className: 'dsav-state ' + (running || online ? 'dsav-state-online' : 'dsav-state-offline') },
            h('span', { className: 'dsav-dot' }),
            running ? t('service.running') : online ? t('service.external') : t('service.stopped'),
          ),
          engine === 'clone'
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'dsav-btn',
                  disabled: busy !== '' || running || online,
                  onClick: () => act('start'),
                },
                t('service.start'),
              )
            : null,
          h(
            'button',
            {
              type: 'button',
              className: 'dsav-btn',
              disabled: busy !== '' || !running,
              onClick: () => act('stop'),
            },
            t('service.stop'),
          ),
          engine === 'clone'
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'dsav-btn',
                  disabled: busy !== '' || !running,
                  onClick: () => act('restart'),
                },
                t('service.restart'),
              )
            : null,
        ),
        h(
          'div',
          { className: 'dsav-toggleRow' },
          h('span', { className: 'dsav-toggleLabel' }, t('service.autostart')),
          h(
            'button',
            {
              type: 'button',
              role: 'switch',
              'aria-checked': config.autostart ? 'true' : 'false',
              'aria-label': t('service.autostart'),
              className: 'dsav-switch' + (config.autostart ? ' dsav-switchOn' : ''),
              onClick: () => act('save', { autostart: !config.autostart }),
            },
            h('span', { className: 'dsav-switchDot' }),
          ),
        ),
        h(
          'details',
          { className: 'dsav-serviceConfig' },
          h('summary', null, t('service.configure')),
          h(
            'div',
            { className: 'dsav-serviceField' },
            h('span', { className: 'dsav-toggleLabel' }, t('service.command')),
            h('input', {
              className: 'dsav-input',
              type: 'text',
              spellCheck: false,
              value: draft.command,
              placeholder: t('service.commandPlaceholder'),
              onChange: (event) => setDraft({ ...draft, command: event.target.value }),
            }),
          ),
          h(
            'div',
            { className: 'dsav-serviceField' },
            h('span', { className: 'dsav-toggleLabel' }, t('service.cwd')),
            h('input', {
              className: 'dsav-input',
              type: 'text',
              spellCheck: false,
              value: draft.cwd,
              placeholder: t('service.cwdPlaceholder'),
              onChange: (event) => setDraft({ ...draft, cwd: event.target.value }),
            }),
          ),
          h(
            'div',
            { className: 'dsav-serviceField' },
            h('span', { className: 'dsav-toggleLabel' }, t('service.env')),
            h('textarea', {
              className: 'dsav-input dsav-serviceEnv',
              spellCheck: false,
              rows: 3,
              value: draft.env,
              placeholder: 'KEY=VALUE',
              onChange: (event) => setDraft({ ...draft, env: event.target.value }),
            }),
          ),
          h(
            'div',
            { className: 'dsav-serviceRow' },
            h(
              'button',
              { type: 'button', className: 'dsav-btn dsav-btnPrimary', disabled: busy !== '', onClick: () => act('save', draft) },
              t('service.save'),
            ),
          ),
        ),
        message === null ? null : h('div', { className: 'dsav-endpointHint' }, message),
        !running && lastExit !== null
          ? h(
              'pre',
              { className: 'dsav-serviceLog' },
              lastExit.output
                ? lastExit.output
                : lastExit.exitCode === null || lastExit.exitCode === 0
                  ? ''
                  : t('service.exitHint') + ' (exit code ' + lastExit.exitCode + ')',
            )
          : null,
      );
    }

    /** 设置页：把分散的入口集中到一页。 */
    function SettingsSection({ t: hostT }) {
      const t = useT(hostT);
      const avatar = useAvatar();
      const speech = useSpeech();
      const status = useCloneStatus(avatar.endpoint);
      const stats = useStats();
      return h(
        'div',
        { className: 'dsav-section' },
        h(
          'div',
          { className: 'dsav-dialogTitleRow' },
          h('div', { className: 'dsav-sectionTitle' }, t('section.avatar')),
          h(LangSwitch, { t }),
        ),
        h(
          'div',
          { className: 'dsav-sectionRow' },
          h(
            'span',
            { className: 'dsav-setPreview dsav-sectionPreview' },
            avatar.src ? h('img', { src: avatar.src, alt: '' }) : h(Silhouette, { className: 'dsav-frameGlyph' }),
          ),
          h(
            'div',
            { className: 'dsav-sectionField' },
            h('input', {
              className: 'dsav-input',
              type: 'text',
              value: avatar.id,
              maxLength: 40,
              spellCheck: false,
              placeholder: t('id.placeholder'),
              'aria-label': t('id.placeholder'),
              onChange: (event) => setLabel(event.target.value),
            }),
          ),
          h('button', { type: 'button', className: 'dsav-btn', onClick: () => openPanel() }, t('settings.change')),
          h(
            'button',
            { type: 'button', className: 'dsav-btn', disabled: avatar.src === null, onClick: () => setImage(null) },
            t('settings.reset'),
          ),
        ),
        h(FontSizeField, { t }),
        h(PresetBar, { t }),
        h('div', { className: 'dsav-sectionTitle' }, t('section.speech')),
        h(SpeechToggle, { t }),
        h(AutoSpeechField, { t }),
        h(VolumeField, { t }),
        h(EngineField, { t }),
        avatar.engine === 'clone' ? null : h(SystemVoiceField, { t }),
        avatar.engine === 'clone' ? h(ToneField, { t }) : null,
        h(RateField, { t }),
        avatar.engine === 'clone'
          ? h(
              'div',
              { className: 'dsav-sectionRow' },
              h(AuditionButton, { t }),
              h(
                'span',
                { className: 'dsav-statusLine' },
                h(
                  'span',
                  { className: 'dsav-state dsav-state-' + status.status },
                  h('span', { className: 'dsav-dot' }),
                  t('status.' + status.status) + (status.model ? ' · ' + status.model : ''),
                ),
                statusDetail(t, status) === null
                  ? null
                  : h('span', { className: 'dsav-endpointHint dsav-warming' }, statusDetail(t, status)),
              ),
            )
          : null,
        h(ServiceControl, { t, online: status.status === 'online', engine: avatar.engine }),
        h('div', { className: 'dsav-sectionTitle' }, t('section.diagnostics')),
        h(
          'div',
          { className: 'dsav-diagnostics' },
          avatar.engine === 'clone' ? h('div', null, t('diag.service') + ': ' + t('status.' + status.status)) : null,
          avatar.engine !== 'clone' || stats.lastMs === null ? null : h('div', null, t('diag.latency') + ': ' + Math.round(stats.lastMs) + ' ms'),
          speech.status === 'idle' ? null : h('div', null, t('diag.progress') + ': ' + (speech.index + 1) + ' / ' + speech.total),
          h(
            'div',
            { className: speech.error ? 'dsav-diagError' : undefined },
            t('diag.lastError') + ': ' + (speech.error || t('diag.none')),
          ),
        ),
      );
    }

    /* -------------------------------------------------------------- styles */

    const CSS = `
.dsav-row{position:relative;display:flex;align-items:center;min-width:0}
.dsav-body{flex:1;min-width:0}
.dsav-frame{position:absolute;left:-58px;top:50%;transform:translateY(-50%);box-sizing:border-box;width:48px;height:48px;padding:0;border-radius:50%;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-tertiary);cursor:pointer;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:1;transition:border-color .12s ease,color .12s ease}
.dsav-frame:hover{border-color:var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));color:var(--dsw-alias-label-secondary)}
.dsav-frame:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsav-frameImg{width:100%;height:100%;object-fit:cover;display:block}
.dsav-frameGlyph{width:22px;height:22px;display:block}
.dsav-captionRow{display:flex;align-items:center;gap:6px;margin:0 0 2px;min-width:0;min-height:20px}
.dsav-caption{display:block;max-width:100%;margin:0;padding:0;border:none;background:0 0;font:inherit;font-size:var(--dsav-id-size,13px);line-height:calc(var(--dsav-id-size,13px) + 5px);font-weight:500;color:var(--dsw-alias-label-tertiary);text-align:left;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;cursor:pointer}
.dsav-caption:hover{color:var(--dsw-alias-label-secondary)}
.dsav-caption:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;border-radius:3px}
.dsav-process{box-sizing:border-box;width:100%;min-width:0;height:calc(33px + var(--dsh-content-font-delta,0px));border:none;border-bottom:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);font:inherit;font-size:var(--dsh-content-font-size,14px);text-align:left;background:0 0;display:flex;align-items:center;padding:0 0 8px;cursor:pointer;transition:color .1s ease}
.dsav-process:disabled{cursor:default}
.dsav-process:hover:not(:disabled){color:var(--dsw-alias-label-secondary)}
.dsav-label{min-width:0;font-size:inherit;line-height:calc(24px + var(--dsh-content-font-delta,0px));text-overflow:ellipsis;white-space:nowrap;overflow:hidden}
.dsav-num{font-family:var(--ds-font-family-code);font-variant-numeric:tabular-nums}
.dsav-chevron{width:14px;height:14px;flex:none;margin-left:4px;color:inherit;transition:transform .1s ease}
.dsav-process[data-open] .dsav-chevron{transform:rotate(180deg)}
.dsav-sr{clip:rect(0 0 0 0);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}
.dsav-file{display:none}
@container (max-width: 1149px){.dsav-frame{position:static;transform:none;flex:none;margin-right:10px}}
.dsav-scrim{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:24px;pointer-events:auto;background:var(--dsw-alias-bg-mask-1,rgba(0,0,0,.38))}
.dsav-dialog{box-sizing:border-box;width:min(320px,100%);padding:18px 18px 14px;border-radius:var(--dsw-radius-panel,14px);border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 24px 48px -16px rgba(0,0,0,.45);font-size:13px;line-height:20px}
.dsav-dialogTitle{font-size:14px;line-height:20px;font-weight:500;margin-bottom:14px}
.dsav-dialogTitleRow{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.dsav-dialogTitleRow .dsav-dialogTitle,.dsav-dialogTitleRow .dsav-bundleHead,.dsav-dialogTitleRow .dsav-sectionTitle{margin:0}
.dsav-lang{display:inline-flex;flex:none;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;overflow:hidden}
.dsav-langBtn{height:22px;padding:0 10px;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:11px;line-height:1;cursor:pointer}
.dsav-langBtn:hover{color:var(--dsw-alias-label-primary)}
.dsav-langOn{background:var(--dsw-alias-bg-l2);color:var(--dsw-alias-label-primary);font-weight:600}
.dsav-field{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.dsav-fieldHead{display:flex;align-items:center;justify-content:space-between;gap:12px}
.dsav-selectFull{width:100%;max-width:none}
.dsav-voiceTools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsav-voiceCount{white-space:nowrap}
.dsav-warming{font-variant-numeric:tabular-nums;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsav-muted{opacity:.5}
.dsav-volume{display:flex;align-items:center;gap:8px;min-width:160px}
.dsav-volume .dsav-range{margin:0;flex:1}
.dsav-volumeValue{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;min-width:36px;text-align:right}
.dsav-select{box-sizing:border-box;height:28px;padding:0 8px;border-radius:var(--dsw-radius-sm,6px);border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:1}
.dsav-select:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsav-dialogSmall{width:min(420px,100%)}
.dsav-input{box-sizing:border-box;width:100%;height:32px;padding:0 10px;border-radius:var(--dsw-radius-sm,6px);border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px}
.dsav-input::placeholder{color:var(--dsw-alias-label-tertiary)}
.dsav-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsav-stage{position:relative;width:${STAGE}px;height:${STAGE}px;max-width:100%;margin:0 auto;border-radius:50%;overflow:hidden;background:var(--dsw-alias-bg-layer-2);cursor:grab;touch-action:none;user-select:none}
.dsav-stage:active{cursor:grabbing}
.dsav-stageImg{position:absolute;left:50%;top:50%;max-width:none;object-fit:fill;pointer-events:none;-webkit-user-drag:none}
.dsav-hint{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin-top:12px;text-align:center}
.dsav-range{width:100%;margin:10px 0 0;accent-color:var(--dsw-alias-brand-primary)}
.dsav-actions{display:flex;align-items:center;gap:8px;margin-top:14px}
.dsav-spacer{flex:1}
.dsav-btn{box-sizing:border-box;height:28px;padding:0 10px;border-radius:var(--dsw-radius-sm,6px);border:1px solid var(--dsw-alias-border-l2);background:0 0;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap}
.dsav-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dsav-btn:disabled{opacity:.45;cursor:default}
.dsav-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsav-btnPrimary{background:var(--dsw-alias-button-primary-fill);border-color:transparent;color:var(--dsw-alias-label-primary-inverted)}
.dsav-btnPrimary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}
.dsav-setPreview{box-sizing:border-box;width:32px;height:32px;border-radius:50%;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-tertiary);display:inline-flex;align-items:center;justify-content:center;overflow:hidden}
.dsav-setPreview img{width:100%;height:100%;object-fit:cover;display:block}
.dsav-setPreview svg{width:17px;height:17px;display:block}
.dsav-bundle{margin:10px 0 22px;padding:16px 18px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-1))}
.dsav-bundleHead{font-size:14px;line-height:20px;font-weight:500;margin-bottom:12px}
.dsav-bundleBody{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsav-bundlePreview{box-sizing:border-box;width:48px;height:48px;border-radius:50%;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);display:inline-flex;align-items:center;justify-content:center;overflow:hidden;flex:none}
.dsav-bundlePreview img{width:100%;height:100%;object-fit:cover;display:block}
.dsav-bundlePreview svg{width:22px;height:22px;display:block}
.dsav-bundleInput{flex:1;min-width:160px;max-width:320px}
.dsav-bundleHint{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin-top:10px}
.dsav-sizeRow{display:flex;align-items:center;gap:10px;margin-top:12px}
.dsav-sizeLabel{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;white-space:nowrap}
.dsav-sizeRange{flex:1;min-width:80px;accent-color:var(--dsw-alias-brand-primary)}
.dsav-sizeValue{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;font-variant-numeric:tabular-nums;min-width:36px;text-align:right}
.dsav-presets{margin-top:14px}
.dsav-presetsHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.dsav-presetsTitle{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.dsav-presetsEmpty{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.dsav-presetsList{display:flex;flex-wrap:wrap;gap:8px}
.dsav-preset{position:relative;display:flex;align-items:center;max-width:100%}
.dsav-presetMain{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;max-width:100%;height:32px;padding:0 8px 0 4px;border-radius:16px;border:1px solid var(--dsw-alias-border-l2);background:0 0;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;cursor:pointer}
.dsav-presetMain:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsav-presetMain:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsav-presetThumb{box-sizing:border-box;width:24px;height:24px;border-radius:50%;overflow:hidden;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);display:inline-flex;align-items:center;justify-content:center;flex:none}
.dsav-presetThumb img{width:100%;height:100%;object-fit:cover;display:block}
.dsav-presetThumb svg{width:13px;height:13px;display:block}
.dsav-presetName{max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsav-presetRemove{position:absolute;top:-6px;right:-6px;width:16px;height:16px;padding:0;border-radius:50%;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:11px;cursor:pointer;display:none;align-items:center;justify-content:center}
.dsav-preset:hover .dsav-presetRemove,.dsav-preset:focus-within .dsav-presetRemove{display:inline-flex}
.dsav-presetRemove:hover{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}
.dsav-speak{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:none;border-radius:4px;background:0 0;color:var(--dsw-alias-label-tertiary);cursor:pointer;flex:none}
.dsav-speak:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dsav-speak:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dsav-speakIcon{width:13px;height:13px;display:block}
.dsav-speakOn{color:var(--dsw-alias-brand-primary)}
.dsav-speakOn .dsav-speakIcon{animation:dsav-pulse 1.4s ease-in-out infinite}
@keyframes dsav-pulse{0%,100%{opacity:1}50%{opacity:.45}}
.dsav-toggleRow{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;flex-wrap:wrap}
.dsav-toggleLabel{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:nowrap;flex:none}
.dsav-switch{position:relative;box-sizing:border-box;width:34px;height:20px;padding:0;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);cursor:pointer;flex:none;transition:background .15s ease,border-color .15s ease}
.dsav-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsav-switchOn{background:var(--dsw-alias-brand-primary);border-color:transparent}
.dsav-switchDot{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-label-primary);transition:transform .15s ease}
.dsav-switchOn .dsav-switchDot{transform:translateX(14px);background:var(--dsw-alias-bg-base)}
.dsav-seg{display:flex;gap:4px;padding:2px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);flex-wrap:wrap}
.dsav-segBtn{box-sizing:border-box;height:24px;padding:0 8px;border:none;border-radius:6px;background:0 0;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;cursor:pointer;white-space:nowrap}
.dsav-segBtn:hover{color:var(--dsw-alias-label-primary)}
.dsav-segOn,.dsav-segOn:hover{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.12)}
.dsav-segBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dsav-endpoint{margin-top:8px}
.dsav-endpointRow{display:flex;align-items:center;gap:8px}
.dsav-endpointInput{flex:1;min-width:0;height:28px;font-size:12px}
.dsav-state{display:inline-flex;align-items:center;gap:4px;font-size:12px;line-height:18px;white-space:nowrap;flex:none}
.dsav-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
.dsav-state-online{color:var(--dsw-alias-state-success-primary)}
.dsav-state-offline{color:var(--dsw-alias-label-tertiary)}
.dsav-state-checking{color:var(--dsw-alias-label-tertiary);opacity:.7}
.dsav-endpointHint{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin-top:6px}
.dsav-errorDot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-error-primary);flex:none;margin-left:2px}
.dsav-inlineBar{display:inline-flex;align-items:center;gap:0;margin-left:6px;padding:0 2px;border-radius:999px;border:1px solid var(--dsw-alias-line-border);background:var(--dsw-alias-bg-l1);vertical-align:middle;font-size:11px;line-height:1}
.dsav-barBtn{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 4px;border:0;border-radius:999px;background:transparent;color:inherit;font:inherit;font-size:12px;line-height:1;cursor:pointer}
.dsav-barBtn:hover:not(:disabled){background:var(--dsw-alias-bg-l2);color:var(--dsw-alias-label-primary)}
.dsav-barBtn:disabled{opacity:.35;cursor:default}
.dsav-barMain{font-size:12px}
.dsav-barInfo{padding:0 4px;font-size:11px;line-height:1;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.dsav-barRate{font-size:11px;font-variant-numeric:tabular-nums;min-width:40px}
.dsav-barStop{color:var(--dsw-alias-label-tertiary)}
.dsav-barStop:hover{color:var(--dsw-alias-state-error-primary)}
.dsav-section{display:flex;flex-direction:column;gap:10px;padding:4px 0 8px}
.dsav-sectionTitle{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary);margin-top:6px}
.dsav-sectionRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsav-statusLine{display:inline-flex;align-items:center;gap:8px;min-width:0;flex:1}
.dsav-statusLine .dsav-endpointHint{margin-top:0;flex:0 1 auto;min-width:0}
.dsav-sectionPreview{width:44px;height:44px;border-radius:50%;overflow:hidden;flex:none;background:var(--dsw-alias-bg-l2);display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary)}
.dsav-sectionPreview img{width:100%;height:100%;object-fit:cover}
.dsav-sectionField{flex:1;min-width:180px}
.dsav-audition{white-space:nowrap}
.dsav-diagnostics{display:flex;flex-direction:column;gap:2px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.dsav-diagError{color:var(--dsw-alias-state-error-primary)}
.dsav-service{display:flex;flex-direction:column;gap:8px}
.dsav-serviceRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsav-serviceConfig{display:flex;flex-direction:column;gap:8px;font-size:12px}
.dsav-serviceConfig summary{cursor:pointer;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsav-serviceField{display:flex;flex-direction:column;gap:4px;margin-top:4px}
.dsav-serviceEnv{min-height:64px;padding:8px 10px;resize:vertical;font-family:inherit;line-height:18px}
.dsav-serviceLog{margin:0;padding:8px 10px;max-height:140px;overflow:auto;border-radius:6px;background:var(--dsw-alias-bg-l2);color:var(--dsw-alias-state-error-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:16px;white-space:pre-wrap;word-break:break-word}
@media (prefers-reduced-motion: reduce){.dsav-frame,.dsav-process,.dsav-chevron{transition:none}}
`;

    /** 不依赖 React 的版本，给注册时用的 label thunk 之类。 */
    function tRaw(key) {
      const lang = avatarStore.get().lang;
      if (lang === 'auto') return translate(key);
      const dict = DICTS[lang];
      const hit = dict === undefined ? undefined : dict[key];
      return hit === undefined ? translate(key) : hit;
    }

    /* --------------------------------------------------------------- apply */

    function apply(ctx) {
      translate = typeof ctx.locale.bind === 'function' ? ctx.locale.bind(NS) : (key) => key;
      // 第一次运行时按宿主语言定一个初值，之后以插件自己的选择为准。
      try {
        if (readStoredLang() === 'auto') {
          let id = '';
          if (typeof ctx.locale.getLocale === 'function') {
            const snapshot = ctx.locale.getLocale();
            id = snapshot === undefined || snapshot === null ? '' : String(snapshot.id || snapshot.locale || '');
          }
          if (id === '') {
            const rootLang = document.documentElement ? document.documentElement.lang : '';
            id = typeof rootLang === 'string' ? rootLang : '';
          }
          if (id === '' && typeof navigator !== 'undefined' && typeof navigator.language === 'string') {
            id = navigator.language;
          }
          if (id !== '') setLang(id.toLowerCase().startsWith('zh') ? 'zh' : 'en');
          else setLang('zh');
        }
      } catch {
        // 拿不到就退回中文，界面上的按钮仍可随时改。
        setLang('zh');
      }
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-avatar-frame: dictionaries');
      ctx.effect(() => {
        const tag = document.createElement('style');
        tag.dataset.plugin = 'dsh-avatar-frame';
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return () => {
          tag.remove();
        };
      }, 'dsh-avatar-frame: styles');
      // Do not keep talking after the plugin itself is unloaded.
      ctx.effect(() => () => stopSpeech(), 'dsh-avatar-frame: stop audio on unload');
      // A second window keeps its own copy of the stores; reload on its writes.
      ctx.effect(() => {
        const onStorage = (message) => {
          const name = message.key;
          if (name === null || String(name).startsWith('dsh-avatar-frame/')) reloadFromStorage();
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
      }, 'dsh-avatar-frame: storage sync');

      ctx.slots.inject('conversation.chat.node', () =>
        ctx.slots.register({ name: 'conversation.chat.node', key: 'turn-process', locale: NS }, TurnProcessRow),
      );
      ctx.slots.inject('shell.overlay', () =>
        ctx.slots.register({ name: 'shell.overlay', id: 'dsh-avatar-frame.dialog', order: 40, locale: NS }, CropDialog),
      );
      ctx.slots.inject('plugins.bundle.config', () =>
        ctx.slots.register({ name: 'plugins.bundle.config', key: 'dsh-avatar-frame', locale: NS }, BundlePanel),
      );
      ctx.slots.inject('settings.section', () =>
        ctx.slots.register(
          {
            name: 'settings.section',
            id: 'dsh-avatar-frame',
            order: 50,
            label: () => tRaw('section.title'),
            locale: NS,
          },
          SettingsSection,
        ),
      );
    }

    return { inject: ['slots', 'locale'], apply };
  },
});
