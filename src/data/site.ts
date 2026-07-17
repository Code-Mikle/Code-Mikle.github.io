export const projects = [
	{
		index: '01',
		title: '个人技术档案馆',
		description: '以 Astro 与 Starlight 重建个人主页，把项目、文章、知识库和简历收进同一个静态站点。',
		status: '正在构建',
		stack: ['Astro', 'Starlight', 'GitHub Pages'],
		href: 'https://github.com/Code-Mikle/Code-Mikle.github.io',
		external: true,
	},
	{
		index: '02',
		title: '计算机基础知识库',
		description: '面向复习与面试检索的 Markdown 笔记，按主题组织，并提供全文搜索与移动端目录。',
		status: '持续整理',
		stack: ['Markdown', 'Pagefind', 'Starlight'],
		href: '/notes/',
		external: false,
	},
	{
		index: '03',
		title: '旧站技术文章归档',
		description: '逐步迁移过去记录的 C/C++、数据结构与汇编语言文章，并重新校对内容。',
		status: '迁移中',
		stack: ['C/C++', 'Data Structures', 'Writing'],
		href: '/articles/',
		external: false,
	},
] as const;

export const articles = [
	{
		date: '2026-07-17',
		title: '从 Hexo 到 Astro + Starlight：重建个人主页',
		description: '记录技术选型、内容分区，以及为什么把文档能力和个人主页放进同一个静态站点。',
		topic: 'Site Building',
		href: '/articles/astro-starlight-migration/',
	},
	{
		date: '2023-05-29',
		title: 'C++ const 与指针：从左向右读声明',
		description: '梳理指向常量的指针、常指针，以及二者组合时最容易混淆的边界。',
		topic: 'C++',
		href: '/articles/const-and-pointer/',
	},
	{
		date: '2023-05-29',
		title: '多态与虚函数：运行时绑定的基本模型',
		description: '从基类指针、虚函数表和析构函数出发，理解 C++ 运行时多态。',
		topic: 'C++',
		href: '/articles/polymorphism-and-virtual-functions/',
	},
] as const;

export const knowledgeAreas = [
	{ index: '01', title: 'C / C++', description: '语言基础、对象模型、内存与 STL。', href: '/notes/cpp/' },
	{ index: '02', title: '数据结构', description: '树、图、链表与常见算法模型。', href: '/notes/data-structures/' },
	{ index: '03', title: '计算机网络', description: 'TCP/IP、HTTP 与网络排错。', href: '/notes/computer-network/' },
	{ index: '04', title: '操作系统', description: '进程、线程、内存与文件系统。', href: '/notes/operating-system/' },
	{ index: '05', title: '数据库', description: '索引、事务、锁与查询优化。', href: '/notes/database/' },
	{ index: '06', title: '系统设计', description: '缓存、消息、可用性与扩展性。', href: '/notes/system-design/' },
] as const;
