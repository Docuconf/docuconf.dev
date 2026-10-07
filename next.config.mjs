import createMDX from '@next/mdx';

const basePath = process.env.BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Fully static site: `next build` writes plain HTML to out/.
	output: 'export',
	trailingSlash: true,
	// Set by the deploy workflow for GitHub Pages project sites.
	basePath,
	// For client code that loads files by URL (the Pagefind search index).
	env: { NEXT_PUBLIC_BASE_PATH: basePath },
	images: { unoptimized: true },
	pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
};

const withMDX = createMDX({
	options: {
		remarkPlugins: ['remark-gfm'],
		rehypePlugins: [
			// Heading ids, for the "On this page" list and links to a section.
			'rehype-slug',
			['@shikijs/rehype', { themes: { light: 'github-light-default', dark: 'github-dark-default' }, defaultLanguage: 'text' }],
		],
	},
});

export default withMDX(nextConfig);
