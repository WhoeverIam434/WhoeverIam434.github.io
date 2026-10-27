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

## 发布到 GitHub Pages

仓库里已经放好 `.github/workflows/deploy.yml`，推荐用 Actions 自动构建：

1. 确认 `.github/workflows/deploy.yml` 已上传（仓库根目录下的 `.github/`）。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。
3. 推送到 `main`（或 `master`），Actions 会自动 `npm ci` + `npm run build`，把
   `web/out/` 发布到 Pages。几分钟后在 Actions 的 deploy 步骤里能看到站点 URL。

工作流会按仓库名自动决定 `basePath`：

| 仓库名 | 站点地址 | basePath |
| --- | --- | --- |
| `name.github.io`（用户页） | `https://name.github.io/` | 空 |
| 其他名字（项目页） | `https://name.github.io/<repo>/` | `/<repo>` |

如果用**自定义域名**，站点在根路径，需要在工作流的 build 步骤把
`NEXT_PUBLIC_BASE_PATH` 改成空字符串。

### 不想用 Actions：本地构建后手动上传

```powershell
cd web
npm ci
$env:NEXT_PUBLIC_BASE_PATH="/你的仓库名"   # 用户页 <name>.github.io 请留空
npm run build
```

把 `web/out/` 里的**全部内容**（含 `_next/` 目录）上传到站点仓库根目录，
并新建一个空的 `.nojekyll` 文件；然后 Settings → Pages → Source 选
**Deploy from a branch** → `main` / `(root)`。
也可以 `npx gh-pages -d out --dotfiles` 推到 `gh-pages` 分支再选该分支。

### 常见问题

- **白屏 / 没有样式**：`_next/` 被 Jekyll 忽略 → 仓库根加 `.nojekyll`；或
  项目页少设了 `basePath`。
- **`/_next/...` 404**：项目页必须在构建时设 `NEXT_PUBLIC_BASE_PATH=/<repo>`。
- **`/out` 别提交**：`out/`、`.next/`、`node_modules/` 已在 `.gitignore` 里，
  用 Actions 时不需要上传构建产物。
- **简历下载 404**：站点内 PDF 链接是相对路径，子路径部署也能打开。



## 说明

- v1 是完全自包含的静态页（中英双语、明暗主题、打印样式），不依赖 Node，双击
  `site/index.html` 即可打开。
- v2 按新架构重建：单页滚动、编辑式排版（去掉右侧信息卡）、新增 Focus 章节与
  可交互的倒立摆模拟器。详见 `web/README.md`。
