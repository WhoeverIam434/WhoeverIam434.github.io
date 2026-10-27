# web — Next.js 版个人网站

v2 版站点：单页滚动、编辑式排版。第二个章节 **Focus** 会「锁住」滚动（充能条满才放行），
三张关注方向卡片可点击进入各自的全屏小游戏；Control Systems 的小游戏是倒立摆。

## 技术栈

- Next.js 16（App Router，`output: "export"` 纯静态导出）
- React 19 + TypeScript（`strict`）
- Tailwind CSS 4（`@theme` 设计令牌，无外部字体）

## 视觉方向（Arknights 式工业 UI，第一版）

深色、硬边、技术感，避免上一版的纸感极简：

| 元素 | 取值 |
| --- | --- |
| 背景 | `#0a0c0d`，面板 `#121719`，细线 `#232a2d` / `#3b464b` |
| 强调色 | 酸性荧光绿 `#c9ff3f`（只用一个高饱和色） |
| 警示色 | 橙红 `#ff5a3c`，仅用于失稳 / TODO / 危险 |
| 字体 | 标题 Bahnschrift（DIN 风压缩体，系统自带）+ 全大写；正文 Segoe UI；标签等宽 |
| 图形语言 | 切角面板（`cut-corner`）、HUD 角标（`hud`）、危险条纹（`hazard`）、条形码、细网格、CRT 扫描线 + 暗角（`.page-fx`） |
| 组件细节 | 导航顶部荧光渐变线、章节编号方框、卡片水印大字（hover 转荧光描边）、按钮切角、进度/滑杆统一荧光色 |

调参位置：色板与字体在 `src/app/globals.css` 的 `@theme`；切角/条纹/角标/扫描线在同文件的 `@layer components`。

已知取舍：不引外部字体（离线可用），扫描线刻意压得很轻，保证正文对比度。

## 目录结构

```
web/
├─ src/app/
│  ├─ layout.tsx          元数据、字体、根布局
│  ├─ page.tsx            单页组装：Hero → Focus → Experience → Projects → Skills → Education → Contact
│  └─ globals.css         Tailwind 引入 + 设计令牌 + 少量原语（矩阵括号、滑杆、网格纸）
├─ src/components/
│  ├─ SiteNav.tsx         固定导航、滚动高亮、移动端全屏菜单
│  ├─ Hero.tsx            简介（无右侧卡片）
│  ├─ Section.tsx         普通章节外壳（编号 + 标题 + 导语）
│  ├─ FocusSection.tsx    Focus：粘性锁定、充能条、可点击卡片、小游戏挂载
│  ├─ minigames/
│  │  ├─ InvertedPendulum.tsx   Control Systems 小游戏：背景仿真 + 左侧增益 + 右上状态空间
│  │  └─ TodoMinigame.tsx       Robotics / Embedded 的占位小游戏
│  ├─ Experience / Projects / Skills / Education / Contact / Footer / ButtonLink
├─ src/lib/
│  ├─ pendulum.ts         倒立摆模型、控制器、线性化、稳定性判据（与 UI 解耦，可单测）
│  ├─ focusCharge.ts      滚动充能进度（纯函数）
│  └─ *.test.ts
├─ src/data/profile.ts    所有文案与 CV 数据（改内容只需动这里）
├─ scripts/               Playwright 截图 / 交互验证脚本
├─ public/                简历 PDF、.nojekyll
└─ shots/                 验证截图
```

## Focus 章节：锁定与充能

- 章节高度 = `100svh + 70vh`，内部面板 `sticky top-0 h-[100svh]`，所以进入后画面**钉住不动**；
- 多出来的 70vh 就是「充能距离」：滚动把它走完，底部进度条从 0% 走到 100%；
- 进度条满之前标签显示 `Locked — keep scrolling to continue`，满 100% 变成
  `Unlocked — keep scrolling` 并转为强调色，页面随后放行进入 Experience；
- 进度由 `computeCharge()` 纯函数根据 `getBoundingClientRect()` 计算，`scroll` 事件用
  `requestAnimationFrame` 节流；
- 实现上没有 `preventDefault` 拦截滚轮，因此触控板、键盘、移动端惯性滚动都不会失效，
  但视觉上确实是被「锁」在本章节（这也是为了不破坏可访问性做的取舍）。

三张卡片（Robotics / Embedded / Control Systems）：

- 悬停时放大到 `scale(1.035)` 并浮到相邻卡片之上，右上角出现 `OPEN` / `TODO`；
- 点击打开全屏小游戏；小游戏打开时锁 `body` 滚动，`Esc` 或 **Close** 退出。

| 卡片 | 小游戏 |
| --- | --- |
| Robotics | 占位页（`TODO`） |
| Embedded | 占位页（`TODO`） |
| Control Systems | 倒立摆（背景仿真 + 增益调节） |

## 倒立摆小游戏

按需求做了简化，屏幕只有三块内容：

```
┌──────────────────────────────────────────────┐
│ Focus — Control Systems            Linearized state space model
│ Inverted Pendulum                  ẋ = A x + B u
│                                    A = [ … ]   B = [ … ]
│ Kp ────────●────────
│ Ki ─●───────────────
│ Kd ────●────────────
│ [ Reset ]                              Close ×
│                                  （摆就在背景里）
└──────────────────────────────────────────────┘
```

- **背景**：全屏 canvas 画小车–摆（含直立参考线与 ±11° 线性化窗口虚线），摄像机跟随小车；
- **左侧**：`Focus — Control Systems`、标题、Kp / Ki / Kd 三根滑杆（无边框、无卡片，直接压在背景上，
  数值可直接键入，超出范围立即夹到允许区间）、Reset；
- **右上**：`Linearized state space model` + A、B 矩阵；
- 仅此而已：不再显示遥测、Routh–Hurwitz 判定、说明卡片。
- 摆失稳倒下时杆与小车变为强调色，Reset 按钮同步高亮；点 Reset 回到初始角。

### 被控对象

小车–摆（cart–pole）非线性模型，状态 `x = [x, ẋ, θ, θ̇]ᵀ`，输入 `u = F [N]`：

```
(M + m sin²θ) ẍ = F + m l θ̇² sinθ − m g sinθ cosθ
l θ̈ = g sinθ − ẍ cosθ
```

参数：`M = 1.0 kg`、`m = 0.20 kg`、`l = 0.50 m`、`g = 9.81 m/s²`，执行器饱和 ±120 N。
用 **RK4** 以 1/240 s 固定步长积分，画面按 60 fps 渲染。

### 控制器

`u = Kp·θ + Kd·θ̇ + Ki·∫θ`（对角度误差的 PID，积分项带 ±3 限幅）。

- 范围：`Kp ∈ [0,120]`、`Ki ∈ [0,40]`、`Kd ∈ [0,30]`；
- 输入框实时夹取，失焦 / 回车时按步长取整，不合理数值不会进入控制器；
- **Reset** 把状态回到初始角 `θ₀ = 0.15 rad`（8.6°）、速度与积分清零。

### 工作点与线性化

- 工作点：`θ = 0, θ̇ = 0, ẋ = 0`，小车位置 `x` 自由（平衡是一个流形）。
- 达到工作点的方式：**初始就放在窗口内**（8.6°），不做摆起；控制器负责把角度收敛到 0。
  线性模型从第一步起成立，而仿真本身跑的仍是非线性对象。
- 线性化（`sinθ ≈ θ`、`cosθ ≈ 1`、`θ̇² ≈ 0`）得到状态空间模型：

```
A = [ 0    1        0     0 ]        B = [  0    ]
    [ 0    0     −mg/M     0 ]            [ 1/M   ]
    [ 0    0        0     1 ]            [  0    ]
    [ 0    0  g(M+m)/(Ml)  0 ]            [−1/(Ml)]

数值（当前参数）：
A = [[0, 1, 0, 0], [0, 0, −1.962, 0], [0, 0, 0, 1], [0, 0, 23.544, 0]]
B = [0, 1, 0, −2]ᵀ
```

`src/lib/pendulum.ts` 里保留了 Routh–Hurwitz 判据与开环极点计算（有单测覆盖），
只是新的小游戏界面不再展示它们，后续要加回来可以直接复用。

## 维护

| 想改什么 | 改哪里 |
| --- | --- |
| 文案、经历、项目、技能、教育 | `src/data/profile.ts` |
| 个人链接（GitHub / LinkedIn，当前留空不渲染） | `src/data/profile.ts` 的 `github` / `linkedin` |
| 简历 PDF | 替换 `public/Cheuk_Hin_Li_-_Robotics_Engineer.pdf` |
| Focus 的充能距离（现在 70vh） | `FocusSection.tsx` 里的 `height: "calc(100svh + 70vh)"` |
| 小游戏布局 / 文案 | `src/components/minigames/*` |
| 物理参数、初始角、失效角 | `src/lib/pendulum.ts` 的 `PLANT` |
| 增益范围与默认值 | `src/lib/pendulum.ts` 的 `GAIN_LIMITS` |
| 配色 / 字体 / 尺寸 | `src/app/globals.css` 的 `@theme` |

## 校验

```bash
cd web
npm run typecheck     # tsc --noEmit，严格模式无错误
npm test              # 16 条：物理 10 条 + Focus 充能 6 条
npm run build         # 静态导出到 out/
```

浏览器里的交互验证（Playwright 驱动系统 Chrome）：

- `#focus` 钉住期间 sticky 面板 `top` 始终为 `0`，进度条 18% → 75% → 100%；
- 点击 Control Systems 打开全屏小游戏，无 console / page error；
- 增益输入 `9999` → 立即变 `120`（范围夹取）；
- `Esc` 关闭小游戏后回到锁定中的 Focus；
- 移动端 390px：卡片、充能条、小游戏布局正常（背景摆以 40% 透明度避免文字干扰）。

截图见 `shots/`（整页与各章节）和 `shots/focus/`（锁定、充能、悬停、小游戏、移动端）。

## 部署

纯静态导出，`npm run build` 产出 `out/`，放到任意静态服务器即可。

### GitHub Pages（Actions，推荐）

仓库根目录的 `.github/workflows/deploy.yml` 已配置好，流程见根目录 README。
要点：

- Pages 的 Source 选 **GitHub Actions**；
- 工作流按仓库名自动设置 `NEXT_PUBLIC_BASE_PATH`：
  - `name.github.io` → 空（站点在域名根）
  - 其他仓库 → `/<repo>`（站点在 `https://name.github.io/<repo>/`）
- 构建后补 `.nojekyll`，避免 Jekyll 吞掉 `_next/` 目录；
- 若使用自定义域名，把工作流里的 `NEXT_PUBLIC_BASE_PATH` 改为空字符串。

### 手动构建并上传

```powershell
cd web
npm ci
$env:NEXT_PUBLIC_BASE_PATH="/你的仓库名"   # 用户页 name.github.io 留空
npm run build
```

把 `out/` 内容上传到仓库根（`.nojekyll` 已随产物生成，无需手动添加）；
Pages → Source → Deploy from a branch → `main` / `(root)`。
或者用 `npx gh-pages -d out --dotfiles` 发布到 `gh-pages` 分支。

> 本地开发不需要设置 `NEXT_PUBLIC_BASE_PATH`，`npm run dev` 仍然在 `/` 下。

### 其他平台

Netlify / Vercel / Cloudflare Pages：Build command `npm run build`，输出目录 `out`，
根目录设为 `web`。因为 `output: "export"`，部署后不需要 Node 运行时。
