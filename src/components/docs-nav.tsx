'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import type { NavPage } from './site';

const isCurrent = (pathname: string, href: string) => pathname === href || pathname === href.slice(0, -1);

/** The docs sidebar: every page by group, and on Get started pages, every SDK. */
export function DocsNav({ groups, sdks }: { groups: { title: string; pages: NavPage[] }[]; sdks: NavPage[] }) {
	const pathname = usePathname();
	const link = (p: NavPage, nested = false) => (
		<li key={p.href}>
			<Link
				href={p.href}
				aria-current={isCurrent(pathname, p.href) ? 'page' : undefined}
				className={`block rounded-lg py-1.5 transition-colors ${nested ? 'pl-6 pr-3' : 'px-3'} ${
					isCurrent(pathname, p.href) ? 'bg-accent-soft font-medium text-fg' : 'text-muted hover:text-fg'
				}`}
			>
				{p.label}
			</Link>
		</li>
	);
	return (
		<nav aria-label="Docs">
			{groups.map((g) => (
				<div key={g.title} className="mb-5">
					<p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">{g.title}</p>
					<ul className="space-y-0.5 text-sm">
						{g.pages.map((p) => (
							<Fragment key={p.href}>
								{link(p)}
								{p.href === '/languages/' && pathname.startsWith('/languages') && sdks.map((s) => link(s, true))}
							</Fragment>
						))}
					</ul>
				</div>
			))}
		</nav>
	);
}
