# Cheuk Hin Li — personal site

Two generations of the same personal site, both in this repo, so either can be
restored at any time.

| 目录 | 版本 | 技术栈 | 状态 |
| --- | --- | --- | --- |
| `site/` | v1 | 纯 HTML / CSS / 原生 JS（无构建） | 保留，作为回滚基线 |
| `web/` | v2 | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 | **当前版本** |

## v2 — 快速开始

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

生产构建（静态导出，输出到 `web/out/`）：

```bash
cd web
npm run build
npx serve out      # 或任意静态服务器 / python -m http.server
```

## 版本控制与回滚

仓库按里程碑打了 tag：

```bash
git log --oneline --decorate   # 历史
git tag                        # v1-static / v2-next
```

常见操作：

```bash
# 只想看看 v1 的页面
git worktree add ../v1 v1-static

# 把某个文件回到 v1
git checkout v1-static -- site/index.html

# 整体回退（保留工作区改动）
git reset --soft v1-static

# 彻底回到 v1
git reset --hard v1-static
```

改坏了想回来：`git reset --hard v2-next` 即可回到当前版本。

## 内容来源

所有经历、项目、技能与教育信息来自 `Cheuk_Hin_Li_-_Robotics_Engineer.pdf`
（两版站点各持有一份副本：`site/assets/`、`web/public/`）。

## 截图

`web/shots/` 是用 Playwright 驱动真实 Chrome 渲染出的验证截图：
桌面整页、各章节、模拟器在稳定 / 失稳状态下的画面，以及移动端页面和菜单。

## 说明

- v1 是完全自包含的静态页（中英双语、明暗主题、打印样式），不依赖 Node，双击
  `site/index.html` 即可打开。
- v2 按新架构重建：单页滚动、编辑式排版（去掉右侧信息卡）、新增 Focus 章节与
  可交互的倒立摆模拟器。详见 `web/README.md`。
