# Code-Mikle.github.io

Code-Mikle 的个人技术档案馆，使用 Astro、Starlight 与 GitHub Pages 构建。

## 本地开发

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## 内容目录

- `src/content/docs/articles/`：技术文章
- `src/content/docs/notes/`：计算机基础知识库
- `src/content/docs/projects/`：项目页
- `src/content/docs/resume/`：公开简历
- `src/data/site.ts`：首页项目、文章与知识分类数据
- `src/styles/starlight.css`：浅色/深色主题及全站样式

站点推送到 `master` 后，由 GitHub Actions 自动构建并部署到 GitHub Pages。
