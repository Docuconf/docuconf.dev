'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Pagefind (https://pagefind.app) indexes the built site after `next build` (see package.json), so search works
// on the static export with no server. Its script is loaded from /pagefind/ the first time the dialog opens.
type PagefindResult = { url: string; excerpt: string; meta: { title?: string } };
type Pagefind = {
	options(o: { baseUrl: string }): Promise<void>;
	debouncedSearch(q: string): Promise<{ results: { data(): Promise<PagefindResult> }[] } | null>;
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
// A plain dynamic import the bundler leaves alone: the file only exists in the built site.
const load = new Function('u', 'return import(u)') as (u: string) => Promise<Pagefind>;

export function Search() {
	const dialog = useRef<HTMLDialogElement>(null);
	const input = useRef<HTMLInputElement>(null);
	const pagefind = useRef<Pagefind | null>(null);
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<PagefindResult[]>([]);
	const [status, setStatus] = useState('');

	const open = useCallback(async () => {
		dialog.current?.showModal();
		input.current?.focus();
		if (pagefind.current) return;
		try {
			const pf = await load(`${BASE}/pagefind/pagefind.js`);
			await pf.options({ baseUrl: `${BASE}/` });
			pagefind.current = pf;
		} catch {
			setStatus('Search works on the built site (npm run build), not in next dev.');
		}
	}, []);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
			if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
				e.preventDefault();
				open();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [open]);

	useEffect(() => {
		let stale = false;
		(async () => {
			if (!pagefind.current || !query.trim()) {
				setResults([]);
				return;
			}
			const search = await pagefind.current.debouncedSearch(query);
			if (!search || stale) return;
			const data = await Promise.all(search.results.slice(0, 8).map((r) => r.data()));
			if (stale) return;
			setResults(data);
			setStatus(data.length ? `${search.results.length} results` : 'No results');
		})();
		return () => {
			stale = true;
		};
	}, [query]);

	return (
		<>
			<button
				type="button"
				onClick={open}
				className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg"
			>
				<svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
					<circle cx="11" cy="11" r="7" />
					<path d="m20 20-3.5-3.5" strokeLinecap="round" />
				</svg>
				<span>Search</span>
				<kbd className="hidden rounded border border-border px-1 font-sans text-[0.7rem] md:inline">⌘K</kbd>
			</button>
			<dialog
				ref={dialog}
				aria-label="Search the site"
				onClick={(e) => e.target === dialog.current && dialog.current?.close()}
				className="mx-auto mt-[10vh] w-[min(40rem,calc(100vw-2rem))] rounded-2xl border border-border bg-bg p-0 text-fg shadow-2xl backdrop:bg-black/50"
			>
				<div role="search" className="p-4">
					<label htmlFor="site-search" className="sr-only">
						Search docuconf.dev
					</label>
					<input
						ref={input}
						id="site-search"
						type="search"
						autoComplete="off"
						placeholder="Search the docs, e.g. secretKeyRef, pydantic, out_of_range"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full rounded-lg border border-border bg-card px-3 py-2 text-base outline-none focus:border-accent"
					/>
					<p aria-live="polite" className="mt-2 text-xs text-muted">
						{query.trim() ? status : status.startsWith('Search works') ? status : 'Press Esc to close.'}
					</p>
					<ul className="mt-2 max-h-[60vh] space-y-1 overflow-y-auto">
						{results.map((r) => (
							<li key={r.url}>
								<a
									href={r.url}
									onClick={() => dialog.current?.close()}
									className="block rounded-lg px-3 py-2 hover:bg-card focus:bg-card"
								>
									<span className="block font-medium">{r.meta.title?.replace(/ · docuconf$/, '') ?? r.url}</span>
									<span
										className="mt-0.5 block text-sm text-muted [&_mark]:bg-accent-soft [&_mark]:text-fg"
										// Pagefind's excerpt is escaped text with <mark> around the matches.
										dangerouslySetInnerHTML={{ __html: r.excerpt }}
									/>
								</a>
							</li>
						))}
					</ul>
				</div>
			</dialog>
		</>
	);
}
