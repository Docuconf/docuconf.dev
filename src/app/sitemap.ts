import type { MetadataRoute } from 'next';
import { DOC_PAGES } from '@/components/site';
import { SDK_ROWS } from '@/lib/sdk-data';
import { absolute } from '@/lib/seo';
import { CURRENT_SPEC, SPEC_PAGES, SPEC_VERSIONS, specPath } from '@/lib/spec-versions';

export const dynamic = 'force-static';

// Canonical URLs only: the current spec version is listed at /spec/..., and every other version at
// /spec/<version>/..., with a lower priority. /spec/<current>/... are copies whose canonical is /spec/...
export default function sitemap(): MetadataRoute.Sitemap {
	const paths = ['/', ...DOC_PAGES.map((p) => p.href), ...SDK_ROWS.map((r) => `/languages/${r.slug}/`)];
	const other = SPEC_VERSIONS.filter((v) => v.version !== CURRENT_SPEC.version).flatMap((v) =>
		SPEC_PAGES.map((p) => specPath(v.version, p.slug)),
	);
	return [
		...paths.map((path) => ({
			url: absolute(path),
			changeFrequency: path.startsWith('/spec/') ? ('weekly' as const) : ('monthly' as const),
			priority: path === '/' ? 1 : path.startsWith('/spec/') || path.startsWith('/languages/') ? 0.9 : 0.7,
		})),
		...other.map((path) => ({ url: absolute(path), changeFrequency: 'weekly' as const, priority: 0.5 })),
	];
}
