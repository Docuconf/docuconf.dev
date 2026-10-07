'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { NavPage } from './site';

/** The menu under 1024px: grouped like the docs sidebar, closed on navigation, Escape and outside clicks. */
export function MobileMenu({ groups }: { groups: { title: string; pages: NavPage[] }[] }) {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	const root = useRef<HTMLDivElement>(null);
	const button = useRef<HTMLButtonElement>(null);

	// A new page closes the menu.
	useEffect(() => setOpen(false), [pathname]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setOpen(false);
				button.current?.focus();
			}
		};
		const onClick = (e: MouseEvent) => {
			if (!root.current?.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('keydown', onKey);
		document.addEventListener('mousedown', onClick);
		return () => {
			document.removeEventListener('keydown', onKey);
			document.removeEventListener('mousedown', onClick);
		};
	}, [open]);

	return (
		<div ref={root} className="relative lg:hidden">
			<button
				ref={button}
				type="button"
				aria-expanded={open}
				aria-controls="mobile-menu"
				onClick={() => setOpen((o) => !o)}
				className="flex items-center rounded-md p-1.5 text-muted hover:text-fg"
			>
				<span className="sr-only">{open ? 'Close menu' : 'Menu'}</span>
				<svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
					{open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
				</svg>
			</button>
			{open && (
				<nav
					id="mobile-menu"
					aria-label="Site"
					className="absolute right-0 mt-2 max-h-[calc(100dvh-5rem)] w-72 overflow-y-auto rounded-xl border border-border bg-bg p-3 shadow-xl"
				>
					{groups.map((g) => (
						<div key={g.title} className="mb-2 last:mb-0">
							<p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted">{g.title}</p>
							{g.pages.map((p) => (
								<Link
									key={p.href}
									href={p.href}
									onClick={() => setOpen(false)}
									aria-current={pathname === p.href || pathname === p.href.slice(0, -1) ? 'page' : undefined}
									className="block rounded-lg px-3 py-2 text-sm hover:bg-card aria-[current=page]:bg-accent-soft aria-[current=page]:font-medium"
								>
									{p.label}
								</Link>
							))}
						</div>
					))}
				</nav>
			)}
		</div>
	);
}
