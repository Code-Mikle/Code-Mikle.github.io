---
title: 从 Hexo 到 Astro + Starlight：重建个人主页
description: 为什么选择 Astro、Starlight 与 GitHub Pages，以及内容如何重新分区。
sidebar:
  order: 2
---

旧站采用 Hexo 生成静态页面，NexT.Mist 负责主题。它足够稳定，但仓库里只剩下构建后的 HTML，原始 Markdown、主题配置和依赖清单已经不在了。

这次重建的目标不只是恢复博客，而是把它扩展成一个长期维护的个人技术档案馆。

## 为什么选择 Astro

Astro 默认生成静态 HTML，只有真正需要交互的部分才发送 JavaScript。对于项目展示、技术文章和简历，这种输出模型足够轻，也很适合 GitHub Pages。

## 为什么保留 Starlight

八股文和学习笔记更接近文档，而不是时间线博客。Starlight 已经提供了：

- 分组侧边栏；
- 页内目录；
- 代码高亮；
- Pagefind 全文搜索；
- 浅色、深色和跟随系统三种主题；
- 移动端折叠菜单。

这些能力如果在纯 Astro 项目里重新实现，代码量并不大，但长期维护成本会落到自己身上。

## 内容如何分区

```text
/projects/   正在维护的项目
/articles/   带时间属性的技术文章
/notes/      按主题组织的知识库
/resume/     可打印的在线简历
```

首页只负责建立导航和展示最近内容，不承担所有信息。知识库则保留完整的文档导航，让手机上查找某个概念时不需要来回翻页。

## 部署方式

源码和 Markdown 保存在主分支，由 GitHub Actions 执行 `astro build`，再将 `dist/` 作为 Pages artifact 发布。仓库不再手动提交生成后的 HTML。
