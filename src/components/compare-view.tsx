'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { CopyButton } from './code-frame';

type View = { title: string; html: string };
export type CompareSdk = { slug: string; name: string; views: Record<'declaration' | 'contract' | 'error', View> };

const VIEWS = [
	{ key: 'declaration', label: 'Declaration' },
	{ key: 'contract', label: 'contract.cue' },
	{ key: 'error', label: 'Boot error' },
] as const;

function Pane({ sdk, view }: { sdk: CompareSdk; view: View }) {
	const ref = useRef<HTMLDivElement>(null);
	return (
		<figure className="group relative min-w-0">
			<figcaption className="mb-1.5 font-mono text-xs text-muted">
				{sdk.name} · {view.title}
			</figcaption>
			<div ref={ref} className="relative">
				<div dangerouslySetInnerHTML={{ __html: view.html }} />
				<div className="absolute right-2 top-2">
					<CopyButton target={ref} />
				</div>
			</div>
		</figure>
	);
}

/** Two SDKs side by side, with the same view of the orders example in each. */
export function CompareView({ sdks }: { sdks: CompareSdk[] }) {
	const id = useId();
	const [left, setLeft] = useState('go');
	const [right, setRight] = useState(sdks.find((s) => s.slug !== 'go')!.slug);
	const [view, setView] = useState<(typeof VIEWS)[number]['key']>('declaration');

	// Start from the reader's language (the one the code tabs remember, or ?lang= in the URL).
	useEffect(() => {
		let lang: string | null = new URLSearchParams(window.location.search).get('lang');
		try {
			lang ??= localStorage.getItem('docuconf:tab:lang');
		} catch {
			// No storage: keep the defaults.
		}
		if (lang && lang !== 'go' && sdks.some((s) => s.slug === lang)) setRight(lang);
	}, [sdks]);

	const pick = (label: string, value: string, set: (v: string) => void) => (
		<label className="flex items-center gap-2 text-sm">
			<span className="text-muted">{label}</span>
			<select
				value={value}
				onChange={(e) => set(e.target.value)}
				className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-fg"
			>
				{sdks.map((s) => (
					<option key={s.slug} value={s.slug}>
						{s.name}
					</option>
				))}
			</select>
		</label>
	);

	const byslug = (slug: string) => sdks.find((s) => s.slug === slug)!;
	return (
		<div className="not-prose my-6">
			<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
				{pick('Left', left, setLeft)}
				{pick('Right', right, setRight)}
				<div role="group" aria-labelledby={`${id}-show`} className="flex items-center gap-1 text-sm">
					<span id={`${id}-show`} className="mr-1 text-muted">
						Show
					</span>
					{VIEWS.map((v) => (
						<button
							key={v.key}
							type="button"
							aria-pressed={view === v.key}
							onClick={() => setView(v.key)}
							className={`rounded-full border px-3 py-1 ${
								view === v.key ? 'border-accent bg-accent-soft text-fg' : 'border-border text-muted hover:text-fg'
							}`}
						>
							{v.label}
						</button>
					))}
				</div>
			</div>
			<div className="mt-4 grid gap-4 lg:grid-cols-2">
				<Pane sdk={byslug(left)} view={byslug(left).views[view]} />
				<Pane sdk={byslug(right)} view={byslug(right).views[view]} />
			</div>
		</div>
	);
}
