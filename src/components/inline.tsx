import Link from 'next/link';
import type { ReactNode } from 'react';

/** Renders the small markdown subset sdk-data.ts uses in prose: `code` and [links](url). */
export function Inline({ text }: { text: string }) {
	const out: ReactNode[] = [];
	const re = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
	let last = 0;
	for (const m of text.matchAll(re)) {
		if (m.index > last) out.push(text.slice(last, m.index));
		if (m[1] !== undefined) {
			out.push(<code key={m.index}>{m[1]}</code>);
		} else {
			const [label, href] = [m[2], m[3]];
			out.push(
				href.startsWith('/') ? (
					<Link key={m.index} href={href}>
						{label}
					</Link>
				) : (
					<a key={m.index} href={href}>
						{label}
					</a>
				),
			);
		}
		last = m.index + m[0].length;
	}
	out.push(text.slice(last));
	return <>{out}</>;
}
