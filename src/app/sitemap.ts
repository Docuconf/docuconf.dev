import type { MetadataRoute } from 'next';
import { DOC_PAGES } from '@/components/site';
import { absolute } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
	const paths = ['/', ...DOC_PAGES.map((p) => p.href)];
	return paths.map((path) => ({
		url: absolute(path),
		changeFrequency: path.startsWith('/spec/') ? 'weekly' : 'monthly',
		priority: path === '/' ? 1 : path.startsWith('/spec/') ? 0.9 : 0.7,
	}));
}
