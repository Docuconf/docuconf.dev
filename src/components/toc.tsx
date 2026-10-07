'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type Heading = { id: string; text: string; level: number };

/** "On this page": the article's h2 and h3 headings, read after render. */
export function Toc({ variant }: { variant: 'side' | 'inline' }) {
	const pathname = usePathname();
	const [headings, setHeadings] = useState<Heading[]>([]);

	useEffect(() => {
		const found = [...document.querySelectorAll<HTMLElement>('article h2[id], article h3[id]')].map((h) => ({
			id: h.id,
			text: h.textContent ?? '',
			level: h.tagName === 'H2' ? 2 : 3,
		}));
		setHeadings(found);
	}, [pathname]);

	if (headings.length < 3) return null;
	const list = (
		<ul className="space-y-1 text-sm">
			{headings.map((h) => (
				<li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
					<a href={`#${h.id}`} className="block py-0.5 text-muted hover:text-fg">
						{h.text}
					</a>
				</li>
			))}
		</ul>
	);
	if (variant === 'side') {
		return (
			<nav aria-label="On this page">
				<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">On this page</p>
				{list}
			</nav>
		);
	}
	return (
		<details className="not-prose mb-6 rounded-xl border border-border px-4 py-2 xl:hidden">
			<summary className="cursor-pointer text-sm font-medium">On this page</summary>
			<nav aria-label="On this page" className="pb-2 pt-2">
				{list}
			</nav>
		</details>
	);
}
