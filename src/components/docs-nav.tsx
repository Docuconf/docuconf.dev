'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOC_PAGES } from './site';

export function DocsNav() {
	const pathname = usePathname();
	return (
		<nav aria-label="Project pages">
			<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Project</p>
			<ul className="space-y-1 text-sm">
				{DOC_PAGES.map((p) => {
					const active = pathname === p.href || pathname === p.href.slice(0, -1);
					return (
						<li key={p.href}>
							<Link
								href={p.href}
								aria-current={active ? 'page' : undefined}
								className={`block rounded-lg px-3 py-1.5 transition-colors ${
									active ? 'bg-accent-soft font-medium text-fg' : 'text-muted hover:text-fg'
								}`}
							>
								{p.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
