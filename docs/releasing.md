# 发布步骤

给维护者自己看的流程：改完代码之后，怎样把新版本发出去。第一次发布（v0.10.6）就是这么走完的。

## 0. 版本号

语义化版本，目前都在 `0.x`：

| 改动性质 | 版本 |
| --- | --- |
| 修 bug、改文案、调样式 | `0.10.6 → 0.10.7` |
| 新功能（向后兼容） | `0.10.6 → 0.11.0` |
| 破坏性改动（配置格式、接口契约） | `0.10.6 → 1.0.0` |

## 1. 改代码

- **界面**：`client.js`，改完刷新界面（Ctrl+R）即可看到效果；
- **宿主端**：`index.js`（语音服务的启动/停止），**必须重启 DSH** 才会加载；
- 改完先在本地跑一遍自查：

```bash
node --check client.js
node --check index.js
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"
python -c "import ast,sys; ast.parse(open('examples/simple_tts.py',encoding='utf-8').read())"
```

## 2. 更新版本号与更新记录

1. `package.json` 的 `version`；
2. `CHANGELOG.md` 顶部加一节（日期用当天，"新增 / 变更 / 修复 / 清理" 分类）；
3. 如果改了功能，同步 `README.md` 的功能列表；接口有变就同步 `docs/tts-contract.md`。

## 3. 截图（可选，但建议）

界面有可见变化时更新 `docs/images/` 里的对应截图，并在 README 里确认引用没坏。

> 注意：插件管理页显示的版本号是**安装时的快照**，不重装不会变。要截"插件详情页"的图，先重启 DSH 或重装插件。

## 4. 提交并打标签

```bash
git add -A
git commit -m "feat: 一句话说清改了什么"
git tag -a v0.10.7 -m "v0.10.7"
```

标签用**附注标签**（`-a`），GitHub Release 会用它。

提交信息沿用现在的风格：`feat:` / `fix:` / `docs:` / `chore:` / `style:` + 中文说明，正文可以写动机。

## 5. 推送

```bash
git push
git push --tags
```

## 6. 发 Release

1. 打开 https://github.com/vioeveann/dsh-avatar-frame/releases/new
2. Tag 选刚才推上去的那个
3. 标题：`vX.Y.Z · 一句话主题`
4. 正文：从 CHANGELOG 那一节改写，保持"功能 / 安装 / 说明"的结构
5. **Publish release**（不要留在 draft）

发布后仓库首页的 Releases 区块会自动更新。

## 7. 发布到 npm

插件同时也发布在 npm 上，装的人可以直接填包名。

```bash
npm login            # 或者用开了 Bypass 2FA 的 granular token
npm publish
```

- 版本号必须与 `package.json` 一致，且**不能重复发布**同一个版本；
- 账号如果没开 2FA，npm 只接受**勾了「Bypass two-factor authentication (2FA)」的 granular token**（tokens 页面 → Generate New Token）；普通 granular token 会报 403；
- 发布后验证：

```bash
npm view dsh-avatar-frame version
npm install dsh-avatar-frame --cache /tmp/empty-cache   # 用空缓存验证，避免读到本地旧缓存
```

- 中国用户走 `registry.npmmirror.com` 镜像，通常几分钟内同步。

> 已知残留：首次发布时 npm 在 `versions` 里留下过一个 `0.0.0-stage` 占位版本（staged publishing 机制产生）。它不参与 `latest` 标签，不影响安装；要清掉需要能通过 2FA 的会话。

## 8. 收尾检查

- [ ] 仓库首页的 README 图片正常显示
- [ ] Releases 里能看到新版本
- [ ] `npm view dsh-avatar-frame version` 是新版本
- [ ] 话题、描述没被误改
- [ ] `git status` 干净，`main` 与 `origin/main` 同步

---

## 这次发布踩过的坑

**网络**

- 这台机器上 `github.com:443` 时通时不通（`api.github.com` 一直正常）。`git push` 走的是 `github.com`，卡住时先确认：

```bash
curl -s -o /dev/null -w '%{http_code}\n' --max-time 8 https://github.com
```

- 返回 `000` 就是不通，重试或开代理；`401` 说明网络通了、只差凭据。
- 建仓库、发 Release 这类网页操作走浏览器，不受这个影响。

**凭据**

- 本机用 Git Credential Manager（`git config --local credential.helper manager`）。
- 第一次 push 如果弹出 "Credential Helper Selector"，选 `manager` 即可；之前选过一次之后就不再问了。

**GitHub 网页的自动化限制**

- 有些输入框（比如仓库 About 里的 **Topics**）只接受真实键盘事件，程序写入的值会被丢弃；
- 不要用脚本往弹窗里盲打文字：焦点可能停在别的字段上，把 **Description** 覆盖掉（这次就发生过一次，描述被写成了 `gpt-sovitsdeepseek`，后来手工改回）。
- 结论：话题、社交预览图这类东西，**手动点比自动化稳**。

**Social preview**

- 图在 仓库 → Settings → General → 最下面 → Social preview；
- 传上去之后那行按钮会变成 **Edit**，不是"没传成功"；
- 尺寸 1280×640 最佳。
