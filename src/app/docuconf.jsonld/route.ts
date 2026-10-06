// /docuconf.jsonld: the whole site's structured data in one document —
// organization, specification, every SDK, and every input type and output
// target as schema.org DefinedTerms.
import { siteGraph } from '@/lib/seo';

export const dynamic = 'force-static';

export function GET() {
	return new Response(JSON.stringify(siteGraph(), null, 2), {
		headers: { 'Content-Type': 'application/ld+json; charset=utf-8' },
	});
}
