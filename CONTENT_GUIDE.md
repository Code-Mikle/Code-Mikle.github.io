# Code-Mikle.github.io 内容维护手册

本文档说明如何为当前 Astro + Starlight 站点增加和维护内容，包括技术文章、知识库笔记、项目、简历、图片以及首页数据。

## 1. 内容从哪里维护

站点的主要目录如下：

```text
src/
├─ content/docs/
│  ├─ index.mdx                  # 首页正文
│  ├─ articles/                  # 技术文章
│  ├─ notes/                     # 知识库、八股文笔记
│  ├─ projects/index.mdx         # 项目列表页
│  └─ resume/index.mdx           # 简历页
├─ data/site.ts                  # 首页项目、文章和知识分类数据
├─ components/                   # 页面组件
└─ styles/starlight.css          # 全局主题样式

public/
└─ images/                       # 建议存放文章图片
```

大多数日常更新只需要修改：

- `src/content/docs/` 中的 Markdown 或 MDX；
- `src/data/site.ts` 中的首页展示数据；
- `public/images/` 中的图片。

不要直接修改 `dist/`。它是构建产物，每次运行构建都会重新生成，也不需要提交到 Git。

## 2. Frontmatter 基本规则

`src/content/docs/` 下的每个 Markdown 和 MDX 页面都必须在文件最顶部提供 YAML frontmatter。

最简写法：

```md
---
title: Spring 八股文
---

这里开始写正文。
```

推荐写法：

```md
---
title: Spring 八股文
description: Spring 核心原理、依赖注入和常见面试问题整理。
sidebar:
  order: 2
---

这里开始写正文。
```

字段说明：

| 字段 | 是否必填 | 作用 |
| --- | --- | --- |
| `title` | 是 | 页面标题，同时作为默认侧边栏名称 |
| `description` | 否，推荐 | 页面摘要和搜索引擎描述 |
| `sidebar.order` | 否 | 控制同级页面在自动侧边栏中的顺序，数字越小越靠前 |
| `sidebar.label` | 否 | 使用比页面标题更短的侧边栏名称 |
| `sidebar.hidden` | 否 | 设置为 `true` 时不出现在自动侧边栏中，页面仍可直接访问 |
| `template` | 否 | 默认为 `doc`；特殊落地页可使用 `splash` |
| `pagefind` | 否 | 设置为 `false` 可排除全文搜索索引 |
| `draft` | 否 | 设置为 `true` 后仅开发环境可见，生产构建不会发布 |
| `prev` / `next` | 否 | 设置为 `false` 可关闭上一页或下一页导航 |

例如：

```md
---
title: JVM 类加载机制
description: 类加载的阶段、双亲委派模型和常见破坏方式。
sidebar:
  label: 类加载机制
  order: 3
pagefind: true
draft: false
---
```

注意事项：

1. 文件必须直接以 `---` 开头，前面不要放标题、注释或代码。
2. 开头和结尾都必须是独立一行的 `---`。
3. YAML 缩进只能使用空格，不要使用 Tab。
4. 当标题中包含英文冒号加空格、`#` 等 YAML 特殊字符时，使用引号：

   ```yaml
   title: "Spring MVC: 请求处理流程"
   ```

5. Starlight 会根据 `title` 自动渲染页面的一级标题，因此正文通常从 `##` 开始，不要重复写一个相同的 `# 标题`。

## 3. 新增一篇知识库或八股文笔记

假设要增加一篇 Spring Bean 生命周期笔记。

### 3.1 选择分类目录

在对应分类下创建文件：

```text
src/content/docs/notes/spring/spring-bean-lifecycle.md
```

推荐使用小写英文和连字符作为文件名。这样生成的 URL 更稳定、更容易输入：

```text
/notes/spring/spring-bean-lifecycle/
```

中文文件名和空格可以工作，但发布后不建议频繁改名，因为文件路径就是公开 URL。

### 3.2 使用笔记模板

```md
---
title: Spring Bean 生命周期
description: Spring Bean 从实例化、属性注入到销毁的完整生命周期。
sidebar:
  order: 2
---

先用一段话给出核心结论。

## 生命周期阶段

1. 实例化；
2. 属性注入；
3. 执行 Aware 回调；
4. 执行 BeanPostProcessor；
5. 初始化；
6. 销毁。

## 常见面试追问

### BeanPostProcessor 在什么时候执行？

在初始化方法前后分别执行对应的处理方法。

## 小结

- 结论一；
- 结论二。
```

保存后，Starlight 会自动：

- 根据路径生成页面 URL；
- 将页面加入知识库侧边栏；
- 将正文加入 Pagefind 全文搜索；
- 为二级、三级标题生成页内目录。

一般不需要修改 `astro.config.mjs`。

### 3.3 推荐的八股文结构

为了方便手机快速阅读，建议每篇笔记保持以下节奏：

```md
## 问题是什么

先给出简短结论。

## 原理或过程

分步骤说明。

## 为什么这样设计

解释原因和取舍。

## 常见追问

### 追问一

回答。

## 易错点

- 易错点一；
- 易错点二。

## 一句话总结

用于面试时快速组织答案。
```

不要把几十个互不相关的问题长期堆在一个超大文件中。文件过长时，手机端定位和维护都会变差，建议按主题拆分。

## 4. 新增一个知识分类

假设要新增 Java / Spring 分类。

### 4.1 创建分类首页

创建：

```text
src/content/docs/notes/spring/index.md
```

内容示例：

```md
---
title: Spring
description: Spring 核心容器、Web MVC、事务和常见面试问题。
sidebar:
  order: 7
---

这里整理 Spring 相关的原理和面试知识。

## 当前内容

- [Spring Bean 生命周期](/notes/spring/spring-bean-lifecycle/)
- [Spring 依赖注入](/notes/spring/dependency-injection/)
```

分类目录中的 `index.md` 对应分类根地址：

```text
/notes/spring/
```

### 4.2 同步知识库入口

自动侧边栏能够发现新分类，但首页知识卡片不会自动出现。需要按需求同步以下位置：

1. 在 `src/data/site.ts` 的 `knowledgeAreas` 中加入分类，显示在站点首页；
2. 在 `src/content/docs/notes/index.mdx` 中加入卡片，显示在知识库首页。

`src/data/site.ts` 示例：

```ts
{
  index: '07',
  title: 'Java / Spring',
  description: 'Java 基础、Spring 容器、Web 与事务。',
  href: '/notes/spring/',
},
```

知识库首页卡片示例：

```mdx
<Card title="Java / Spring" icon="code">
  Java 基础、Spring 容器、Web 与事务。[进入分类 →](/notes/spring/)
</Card>
```

如果使用新的 Starlight 图标名称，构建前应确认该图标有效；图标无效会导致构建失败。

## 5. 新增一篇技术文章

技术文章存放在：

```text
src/content/docs/articles/
```

创建文件，例如：

```text
src/content/docs/articles/spring-transaction-guide.md
```

文章模板：

```md
---
title: Spring 事务失效场景整理
description: 分析自调用、异常处理和代理方式导致 Spring 事务失效的原因。
sidebar:
  order: 5
---

文章引言。

## 问题背景

说明为什么要研究这个问题。

## 原理分析

解释运行机制。

## 示例与验证

提供可以独立理解的代码或实验。

## 结论

总结适用条件和注意事项。
```

### 5.1 将文章显示在首页和文章索引

当前首页的“最近文章”和 `/articles/` 页面都读取 `src/data/site.ts` 中的 `articles` 数组，不会自动扫描 Markdown。

因此，文章文件创建后，还要在 `articles` 数组中加入：

```ts
{
  date: '2026-07-17',
  title: 'Spring 事务失效场景整理',
  description: '分析自调用、异常处理和代理方式导致事务失效的原因。',
  topic: 'Spring',
  href: '/articles/spring-transaction-guide/',
},
```

建议把最新文章放在数组前面。首页目前只显示前三篇，文章索引会显示完整数组。

如果只创建 Markdown、不更新 `site.ts`：

- 页面仍然可以访问；
- 页面仍会出现在侧边栏和搜索结果中；
- 但不会出现在首页“最近文章”和自定义文章列表中。

## 6. 新增或修改项目

项目卡片来自 `src/data/site.ts` 的 `projects` 数组，不需要为每个项目创建 Markdown。

内部项目页面示例：

```ts
{
  index: '04',
  title: '项目名称',
  description: '项目解决的问题和主要价值。',
  status: '持续维护',
  stack: ['Java', 'Spring Boot', 'MySQL'],
  href: '/projects/project-name/',
  external: false,
},
```

外部 GitHub 仓库示例：

```ts
{
  index: '04',
  title: '项目名称',
  description: '项目解决的问题和主要价值。',
  status: '已发布',
  stack: ['Java', 'Spring Boot'],
  href: 'https://github.com/Code-Mikle/repository-name',
  external: true,
},
```

如果项目需要完整介绍，可以额外创建：

```text
src/content/docs/projects/project-name.md
```

然后让项目卡片的 `href` 指向 `/projects/project-name/`。

## 7. 修改简历

简历入口页面位于：

```text
src/content/docs/resume/index.mdx
```

具体展示组件位于：

```text
src/components/ResumeSnapshot.astro
```

简历中可以维护：

- 个人简介；
- 技术方向；
- 项目经历；
- 工作经历；
- 教育经历；
- 联系方式。

注意公开仓库和 GitHub Pages 中的信息任何人都可以访问。提交手机号、私人邮箱、住址和证件信息前应谨慎确认。需要投递的完整简历可以单独保留，不一定全部公开在网页中。

## 8. 图片、链接和代码块

### 8.1 图片

建议将图片放在：

```text
public/images/<分类>/图片文件.webp
```

Markdown 中使用站点根路径引用：

```md
![Spring Bean 生命周期示意图](/images/spring/bean-lifecycle.webp)
```

建议：

- 优先使用 WebP、AVIF 或经过压缩的 PNG；
- 文件名使用小写英文和连字符；
- 为每张图片提供有意义的替代文本；
- 手机端图片尽量控制宽度和文件大小；
- 不要引用本机的 `D:\...` 路径。

### 8.2 内部链接

推荐使用站点绝对路径：

```md
[查看 TCP 三次握手](/notes/computer-network/tcp-three-way-handshake/)
```

目录地址保留结尾 `/`，与站点生成的 URL 保持一致。

修改已发布文件名或目录名会改变 URL。改名前要搜索并更新所有旧链接，避免产生 404。

### 8.3 代码块

为代码块标明语言，以启用语法高亮：

````md
```java
public class Example {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
```
````

代码示例应尽量保持最小、完整，并说明它验证了什么，不要只粘贴大段代码而缺少上下文。

### 8.4 提示块

Starlight 支持提示块：

```md
:::note[补充说明]
这里放背景信息。
:::

:::tip[面试回答]
这里放适合快速记忆的回答结构。
:::

:::caution[注意]
这里说明容易出错的边界条件。
:::

:::danger[风险]
这里说明可能造成严重后果的操作。
:::
```

## 9. 文件和标题命名规范

推荐：

```text
spring-bean-lifecycle.md
tcp-three-way-handshake.md
mysql-index-optimization.md
```

不太推荐：

```text
Spring Bean生命周期最终版 2.md
新建文本文档.md
问题整理最新版.md
```

基本原则：

- 目录名和文件名使用小写英文；
- 单词之间使用 `-`；
- 文件名描述稳定主题，不写“最终版”“最新版”；
- 页面展示的中文名称写在 `title` 中；
- 同一分类下的 `sidebar.order` 尽量留出调整空间，例如 `10`、`20`、`30`。

## 10. 本地预览与检查

首次拉取仓库或依赖发生变化时：

```bash
npm install
```

启动本地开发服务器：

```bash
npm run dev
```

浏览器访问终端提示的本地地址，通常为：

```text
http://localhost:4321/
```

发布前必须执行生产构建：

```bash
npm run build
```

构建成功后可检查生产输出：

```bash
npm run preview
```

建议每次发布前至少检查：

- 新页面是否可以打开；
- 浅色和深色主题是否正常；
- 手机宽度下标题、表格和代码块是否溢出；
- 侧边栏顺序是否合理；
- 页内目录是否过长；
- 内部链接是否正确；
- 图片是否能加载；
- 搜索是否能找到新增内容；
- `npm run build` 是否成功。

## 11. 发布到 GitHub Pages

当前部署流程监听 `master` 分支。正常流程为：

```bash
git status
git add .
git commit -m "docs: add Spring interview notes"
git push origin master
```

推送后，`.github/workflows/deploy.yml` 会自动：

1. 拉取仓库；
2. 安装依赖并执行 Astro 构建；
3. 上传静态文件；
4. 部署到 GitHub Pages。

可以在 GitHub 仓库的 **Actions** 页面查看构建状态。首次部署时，仓库的 **Settings → Pages → Build and deployment** 应选择 **GitHub Actions**。

不要手动提交 `dist/`，也不要把 `node_modules/` 提交到仓库。

## 12. 常见错误

### `title: Required`

原因：文件缺少 frontmatter，或者 frontmatter 格式没有被识别。

检查文件是否以以下内容开头：

```md
---
title: 页面标题
---
```

### YAML 解析失败

常见原因：

- 少写了结尾 `---`；
- 使用 Tab 缩进；
- 英文冒号后带空格但标题没有加引号；
- `sidebar.order` 写成了无法解析的文本。

### 页面存在但首页没有入口

原因：Markdown 页面和首页卡片是两套数据来源。

- 技术文章：更新 `src/data/site.ts` 的 `articles`；
- 项目：更新 `src/data/site.ts` 的 `projects`；
- 知识分类：更新 `knowledgeAreas` 和 `notes/index.mdx`。

### 页面没有出现在侧边栏

检查：

- 文件是否位于 `articles/` 或 `notes/`；
- 是否设置了 `sidebar.hidden: true`；
- 是否设置了 `draft: true`；
- frontmatter 是否通过校验；
- `astro.config.mjs` 是否仍使用对应目录的 `autogenerate` 配置。

### 修改文件名后出现 404

文件路径就是页面 URL。重命名后需要更新：

- 其他 Markdown 中的内部链接；
- `src/data/site.ts` 中的 `href`；
- `notes/index.mdx` 中的分类入口；
- 任何外部已经分享过的链接。

## 13. 发布前快速清单

新增内容后，可以逐项确认：

- [ ] 文件放在正确目录；
- [ ] frontmatter 位于文件第一行；
- [ ] 已填写 `title`；
- [ ] 已填写清晰的 `description`；
- [ ] 正文从 `##` 开始，没有重复一级标题；
- [ ] 文件名和 URL 简洁稳定；
- [ ] 内部链接使用正确路径；
- [ ] 图片已放入 `public/images/`；
- [ ] 需要首页展示时已同步 `src/data/site.ts`；
- [ ] 新知识分类已同步知识库首页；
- [ ] 已检查手机端和明暗主题；
- [ ] `npm run build` 执行成功；
- [ ] 没有提交私人信息、`node_modules/` 或 `dist/`。
