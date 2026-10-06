import type { MetadataRoute } from 'next';
import { absolute } from '@/lib/seo';

export const dynamic = 'force-static';

// Everything is public documentation. AI crawlers are named explicitly so the
// intent is unambiguous for answer engines that check for their own agent.
const AI_CRAWLERS = [
	'GPTBot',
	'OAI-SearchBot',
	'ChatGPT-User',
	'ClaudeBot',
	'Claude-SearchBot',
	'Claude-User',
	'PerplexityBot',
	'Perplexity-User',
	'Google-Extended',
	'Applebot-Extended',
	'CCBot',
];

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [{ userAgent: '*', allow: '/' }, ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' }))],
		sitemap: absolute('/sitemap.xml'),
	};
}
