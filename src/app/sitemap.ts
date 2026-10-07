import type { MetadataRoute } from 'next';
import { DOC_PAGES } from '@/components/site';
import { SDK_ROWS } from '@/lib/sdk-data';
import { absolute } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
	const paths = ['/', ...DOC_PAGES.map((p) => p.href), ...SDK_ROWS.map((r) => `/languages/${r.slug}/`)];
	return paths.map((path) => ({
		url: absolute(path),
		changeFrequency: path.startsWith('/spec/') ? 'weekly' : 'monthly',
		priority: path === '/' ? 1 : path.startsWith('/spec/') || path.startsWith('/languages/') ? 0.9 : 0.7,
	}));
}
