# Cheuk Hin Li · 个人网站

一个**零依赖、可离线运行**的静态单页个人网站，内容按 `Cheuk_Hin_Li_-_Robotics_Engineer.pdf` 逐条整理，面向 2026 冬季嵌入式 / 机器人软件实习申请。

---

## 打开方式

**方式一（最简单）**：直接双击 `site/index.html`，用浏览器打开即可。全部资源都在本地，无网络也能正常显示。

**方式二（本地服务器）**：在 `site` 目录下运行

```powershell
python -m http.server 8765
```

然后访问 <http://127.0.0.1:8765>。

> 本次会话中服务器已启动在 `http://127.0.0.1:8765`（端口占用时可自行换一个）。

---

## 文件结构

```
site/
├─ index.html                                    单页结构（含双语内容）
├─ assets/
│  ├─ css/style.css                              全部样式（明/暗主题、响应式、打印）
│  ├─ js/main.js                                 主题、语言、导航、动画、复制邮箱
│  └─ Cheuk_Hin_Li_-_Robotics_Engineer.pdf       原始简历，供「下载简历」按钮使用
└─ README.md（本文件）
```

无框架、无构建步骤、无外部字体与追踪脚本，整个站点可直接拷贝或上传。

---

## 已实现的功能

| 功能 | 说明 |
|---|---|
| 中英双语 | 导航右上角「中文 / EN」切换，选择记入 `localStorage`；正文内容成对维护，不依赖网络翻译 |
| 明暗主题 | 右上角太阳 / 月亮按钮切换，首次进入前内联脚本读取偏好，避免闪烁 |
| 滚动动画 | `IntersectionObserver` 逐块淡入，同组元素自动错峰；遵循 `prefers-reduced-motion` |
| 导航高亮 | 滚动时自动标记当前章节，移动端收起为汉堡菜单（Esc 可关闭） |
| 复制邮箱 | 联系区一键复制 `marcoli434ovo@gmail.com`，带 Toast 反馈 |
| 下载简历 | 顶部导航、Hero、页脚均有 PDF 下载入口 |
| 打印排版 | 页脚「打印」按钮调用浏览器打印，打印样式自动隐藏交互元素、改为白底黑字，可直接另存为 PDF |
| 无障碍 | 跳转链接、`aria` 标签、可见焦点环、语义化标题层级、图片均带替代说明 |
| 响应式 | 1440 / 1024 / 860 / 560 px 四档断点，手机单列、平板双列、桌面交错布局 |
| 无 JS 降级 | `<noscript>` 保证内容可见，纯 CSS 仍可阅读 |

页面结构：Hero（简介 + 关键数据 + 名片卡）→ 关于 → 工作经历（时间线）→ 项目（War Dragon 主卡 + 两个副卡）→ 技术能力 → 教育背景 → 联系方式。

---

## 需要你补充的两处

1. **GitHub / LinkedIn 链接**：打开 `site/assets/js/main.js`，修改顶部的 `PROFILES`：

   ```js
   var PROFILES = {
     github: 'https://github.com/你的账号',
     linkedin: 'https://www.linkedin.com/in/你的账号'
   };
   ```

   未填写时点击图标会提示「请填写链接」，不会跳到无效地址。

2. **头像**：当前是 `CHL` 字母块（`index.html` 中 `.avatar`）。如需照片，把图片放进 `site/assets/` 后用 `<img>` 替换该 `<div>` 即可。

其余文字都在 `index.html` 里，中英文各一份（`<span data-lang="en">` / `<span data-lang="zh">`），改一处即可同步。

---

## 部署

纯静态文件，任选其一：

- **GitHub Pages**：把 `site/` 内容推到仓库根目录，仓库 Settings → Pages 选择分支即可
- **Netlify / Vercel**：直接拖拽 `site` 文件夹上传
- **自有服务器**：拷到任意静态目录

---

## 内容来源映射

| 网站区块 | 简历原文 |
|---|---|
| Hero 概要、关键数据 | PROFESSIONAL SUMMARY；121% 爬升速度、20,000+ 行数据、15+ CAN 节点 / 1 Mbps、0.4–1.1% 定位误差 |
| 工作经历 · Hong Kong Broadband | Software Engineer Intern, Jun 2026 — Aug 2026 |
| 工作经历 · HKUST Robotics Team | Embedded Software Developer, Sept 2025 — Jun 2026，四条 bullet |
| 工作经历 · Mevita Robotics Lab | SUMMARY 中「currently researching magnetic tactile sensors」 |
| 项目 · War Dragon | PROJECTS 全部五条 bullet（2025 — 2026） |
| 技术能力 | TECHNICAL PROFICIENCIES 四组 |
| 教育背景 | BEng CS + Extended major in AI、Sept 2024 — Jun 2028、相关课程与荣誉 |

未添加简历之外的成绩或数字，描述仅做了措辞整理。

---

## 验证情况

- HTML 结构解析通过；19 个 `id` 无重复；页内锚点全部可跳转
- 76 组双语文本成对齐全（无缺译）
- 所有本地资源（CSS / JS / PDF / favicon）存在且可访问；PDF 文件头校验为 `%PDF-`
- CSS 括号配平，打印与动效偏好规则存在；JS 通过 `node --check` 语法检查

> 说明：本次环境中的无头浏览器无法启动（Chrome 的 crashpad 子进程在受限令牌下被拒绝），因此没有生成页面截图，改用上述结构与语法校验代替。若你打开后发现任何版式细节问题，告诉我具体位置即可修。
