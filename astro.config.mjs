// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://code-mikle.github.io',
	output: 'static',
	integrations: [
		starlight({
			title: 'Code-Mikle',
			description: '项目、技术文章、计算机基础笔记与个人简历。',
			locales: {
				root: {
					label: '简体中文',
					lang: 'zh-CN',
				},
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/Code-Mikle' },
			],
			customCss: ['./src/styles/starlight.css'],
			components: {
				Header: './src/components/SiteHeader.astro',
				Hero: './src/components/home/HomeHero.astro',
			},
			sidebar: [
				{ label: '首页', link: '/' },
				{ label: '项目', link: '/projects/' },
				{
					label: '技术文章',
					items: [{ autogenerate: { directory: 'articles', collapsed: true } }],
				},
				{
					label: '知识库',
					items: [{ autogenerate: { directory: 'notes', collapsed: true } }],
				},
				{ label: '简历', link: '/resume/' },
			],
		}),
	],
});
