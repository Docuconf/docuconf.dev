import type { ReactNode } from 'react';

export function Callout({ title, children }: { title?: string; children: ReactNode }) {
	return (
		<div className="not-prose my-6 rounded-xl border border-accent/30 bg-accent-soft px-5 py-4 text-sm leading-relaxed [&_a]:text-accent [&_a]:underline [&_code]:rounded [&_code]:bg-bg/60 [&_code]:px-1">
			{title && <p className="mb-1 font-semibold">{title}</p>}
			<div>{children}</div>
		</div>
	);
}
