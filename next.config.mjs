import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Fully static site: `next build` writes plain HTML to out/.
	output: 'export',
	trailingSlash: true,
	// Set by the deploy workflow for GitHub Pages project sites.
	basePath: process.env.BASE_PATH || '',
	images: { unoptimized: true },
	pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
};

const withMDX = createMDX({
	options: {
		remarkPlugins: ['remark-gfm'],
		rehypePlugins: [
			['@shikijs/rehype', { themes: { light: 'github-light', dark: 'github-dark' }, defaultLanguage: 'text' }],
		],
	},
});

export default withMDX(nextConfig);
