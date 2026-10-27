# web — Next.js 版个人网站

v2 版站点：单页滚动，编辑式排版，新增 **Focus** 章节与可交互的 **倒立摆模拟器**。

## 技术栈

- Next.js 16（App Router，`output: "export"` 纯静态导出）
- React 19 + TypeScript（`strict`）
- Tailwind CSS 4（`@theme` 设计令牌，无外部字体）

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
│  ├─ Section.tsx         章节外壳（编号 + 标题 + 导语）
│  ├─ Focus.tsx           三块 Focus 区块 + 模拟器
│  ├─ PendulumSimulator.tsx  客户端组件：画布、PID 增益、状态空间、Routh–Hurwitz
│  ├─ Experience / Projects / Skills / Education / Contact / Footer / ButtonLink
├─ src/lib/pendulum.ts    倒立摆模型、控制器、线性化、稳定性判据（与 UI 解耦，可单测）
├─ src/lib/pendulum.test.ts
├─ src/data/profile.ts    所有文案与 CV 数据（改内容只需动这里）
├─ scripts/capture.mjs    Playwright 截图 / 交互验证脚本
├─ public/                简历 PDF
└─ shots/                 验证截图
```

## 倒立摆模拟器

### 被控对象

小车–摆（cart–pole）非线性模型，状态 `x = [x, ẋ, θ, θ̇]ᵀ`，输入 `u = F [N]`：

```
(M + m sin²θ) ẍ = F + m l θ̇² sinθ − m g sinθ cosθ
l θ̈ = g sinθ − ẍ cosθ
```

参数：`M = 1.0 kg`、`m = 0.20 kg`、`l = 0.50 m`、`g = 9.81 m/s²`，执行器饱和 ±120 N。
用 **RK4** 以 1/240 s 固定步长积分，画面按 60 fps 渲染，摄像机跟随小车。

### 控制器

`u = Kp·θ + Kd·θ̇ + Ki·∫θ`（对角度误差的 PID，积分项带 ±3 限幅）。

三个增益都可以拖动滑杆或用键盘输入：
- 输入框实时校验，超出范围立即被夹到 `Kp ∈ [0,120]`、`Ki ∈ [0,40]`、`Kd ∈ [0,30]`；
- 失去焦点 / 回车时再按步长取整一次，因此不合理数值不会进入控制器；
- **Reset system** 把状态回到初始角 `θ₀ = 0.15 rad`（8.6°）、速度与积分清零。

### 工作点与线性化

- 工作点：`θ = 0, θ̇ = 0, ẋ = 0`，小车位置 `x` 自由（平衡是一个流形）。
- 达到工作点的方式：**初始就放在窗口内**（8.6°），不做摆起；控制器负责把角度收敛到 0。
  这样线性模型从第一步起就是成立的，同时仿真本身跑的仍是非线性对象。
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

页面实时展示 A、B、开环极点 `0, 0, ±4.85 s⁻¹`，以及线性化有效域（|θ| ≲ 0.2 rad ≈ 11°）。

### 稳定性判据

把 PID 代回线性模型并对 ∫θ 求导，得到三阶闭环特征方程：

```
s³ + 2Kd s² + (2Kp − a) s + 2Ki = 0,    a = g(M+m)/(Ml) = 23.544
```

页面按 Routh–Hurwitz 四条条件逐条判定（`2Kd > 0`、`2Kp − a > 0`、`2Ki > 0`、
`(2Kd)(2Kp − a) > 2Ki`），并结合运行状态显示 `STABILISING / UNSTABLE GAINS / LOST BALANCE`。

> 默认 `Kp=40, Ki=2, Kd=6` → `s³ + 12s² + 56.456s + 4`，稳定；
> `Kp=2` 时 `2Kp − a < 0`，不满足条件，摆会发散直到 69° 触发失稳停止。

## 维护

| 想改什么 | 改哪里 |
| --- | --- |
| 文案、经历、项目、技能、教育 | `src/data/profile.ts` |
| 个人链接（GitHub / LinkedIn，当前留空不渲染） | `src/data/profile.ts` 的 `github` / `linkedin` |
| 简历 PDF | 替换 `public/Cheuk_Hin_Li_-_Robotics_Engineer.pdf` |
| 物理参数、初始角、失效角 | `src/lib/pendulum.ts` 的 `PLANT` |
| 增益范围与默认值 | `src/lib/pendulum.ts` 的 `GAIN_LIMITS` |
| 配色 / 字体 / 尺寸 | `src/app/globals.css` 的 `@theme` |

## 校验

```bash
cd web
npm run typecheck     # tsc --noEmit，严格模式无错误
npm test              # 10 条：线性化矩阵、极点、特征多项式、Routh 判据、饱和、收敛、失稳、冻结、范围夹取、数字格式
npm run build         # 静态导出到 out/
```

在浏览器里做的交互验证（`scripts/capture.mjs`，Playwright + 系统 Chrome）：

- 无 console / page error；
- 数值框输入 `9999` → 立即变 `120`（范围被夹住）；
- `Kp=2` → 状态显示 `Unstable gains`，稳定性条件两条 `fail`，角度开始发散；
- `Reset system` → 角度回到 0.4° 左右并重新收敛；
- 移动端 390 px 下布局与菜单正常。

截图产物在 `shots/`。

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

把 `out/` 内容上传到仓库根，并添加空文件 `.nojekyll`；
Pages → Source → Deploy from a branch → `main` / `(root)`。
或者用 `npx gh-pages -d out --dotfiles` 发布到 `gh-pages` 分支。

> 本地开发不需要设置 `NEXT_PUBLIC_BASE_PATH`，`npm run dev` 仍然在 `/` 下。

### 其他平台

Netlify / Vercel / Cloudflare Pages：Build command `npm run build`，输出目录 `out`，
根目录设为 `web`。因为 `output: "export"`，部署后不需要 Node 运行时。
