'use client';

import { useRef, useState, type ReactNode } from 'react';

/** Copies the text of the code block it wraps. */
export function CopyButton({ target }: { target: React.RefObject<HTMLElement | null> }) {
	const [copied, setCopied] = useState(false);
	return (
		<button
			type="button"
			onClick={async () => {
				const text = target.current?.querySelector('pre')?.innerText ?? '';
				try {
					await navigator.clipboard.writeText(text.replace(/\n$/, ''));
					setCopied(true);
					setTimeout(() => setCopied(false), 1500);
				} catch {
					// Clipboard access can be refused; the code is still selectable.
				}
			}}
			className="rounded-md border border-border bg-bg/90 px-2 py-1 font-sans text-xs text-muted opacity-100 transition-opacity hover:text-fg focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
		>
			{copied ? 'Copied' : 'Copy'}
			<span className="sr-only"> code to clipboard</span>
		</button>
	);
}

/** A highlighted code block (pre-rendered HTML, or children from MDX) with a copy button. */
export function CodeFrame({ html, title, children }: { html?: string; title?: string; children?: ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);
	return (
		<figure className="not-prose group relative my-4 min-w-0">
			{title && <figcaption className="mb-1.5 font-mono text-xs text-muted">{title}</figcaption>}
			<div ref={ref} className="relative">
				{html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : children}
				<div className="absolute right-2 top-2">
					<CopyButton target={ref} />
				</div>
			</div>
		</figure>
	);
}
