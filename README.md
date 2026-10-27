# Cheuk Hin Li — personal site

Single Next.js app for the portfolio + three Markdown-backed archives
(Academic / Project / Personal Stuffs).

| 目录 | 技术栈 | 状态 |
| --- | --- | --- |
| `web/` | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 | 当前版本 |

> 早期纯静态版本（v1）已从工作区移除，仅保留在 git tag `v1-static` 里，
> 需要时可 `git worktree add ../v1 v1-static` 取回。

## 快速开始

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

## 博客分区

三个分区对应 `web/content/<section>/` 下的 Markdown 文件：

| 路由 | 标题 | 目录 |
| --- | --- | --- |
| `/academic/` | Academic Stuffs | `web/content/academic/` |
| `/project/` | Project Stuffs | `web/content/project/` |
| `/personal/` | Personal Stuffs | `web/content/personal/` |

文件名即 URL slug；可选 frontmatter：

```markdown
---
title: State Space Control — Reading Notes
date: 2026-08-04
summary: Notes from working through the course.
---
```

日期优先取 frontmatter 的 `date:`，其次取该文件的 **git 提交时间**（即上传时间），
最后回退到文件 mtime。列表显示为 `Sep 2026 - Title`，按日期倒序。

内容为空时构建仍然成功（会生成占位路由，列表显示 `No entries yet`），
放进任意 `.md` 后占位自动消失。

## 版本控制与回滚

```bash
git log --oneline --decorate   # 历史
git tag                        # v1-static / v2-next
```

常见操作：

```bash
# 取回 v1 静态站（tag 里仍然有 site/）
git worktree add ../v1 v1-static

# 把某个文件回到 v1
git checkout v1-static -- site/index.html

# 整体回退到 v1（保留工作区改动）
git reset --soft v1-static

# 彻底回到 v1
git reset --hard v1-static
```

## 内容来源

所有经历、项目、技能与教育信息来自 `Cheuk_Hin_Li_-_Robotics_Engineer.pdf`
（副本在 `web/public/`）。

## 截图

`web/shots/` 是用 Playwright 驱动真实 Chrome 渲染出的验证截图：
桌面整页、各章节、小游戏、博客列表与正文、移动端页面等。

## 发布到 GitHub Pages

仓库里已经放好 `.github/workflows/deploy.yml`，用 Actions 自动构建：

1. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。
2. 推送到 `main`，Actions 会自动 `npm ci` + `npm run build`，把 `web/out/`
   发布到 Pages；deploy 步骤里能看到站点 URL。

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

把 `web/out/` 里的**全部内容**（含 `_next/`、`.nojekyll`）上传到站点仓库根目录，
然后 Settings → Pages → Source 选 **Deploy from a branch** → `main` / `(root)`。

### 常见问题

- **白屏 / 没有样式**：`_next/` 被 Jekyll 忽略 → 仓库根加 `.nojekyll`；或
  项目页少设了 `basePath`。
- **`/_next/...` 404**：项目页必须在构建时设 `NEXT_PUBLIC_BASE_PATH=/<repo>`。
- **`out/`、`.next/`、`node_modules/` 别提交**：已在 `.gitignore` 里。
- **`generateStaticParams() returned an empty array`**：所有分区都没有 `.md` 且
  代码是旧版；新版已用占位路由兜底，更新代码即可。
