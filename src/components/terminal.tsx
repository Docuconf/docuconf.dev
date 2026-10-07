'use client';

import { useId, useState, type KeyboardEvent } from 'react';

type Tab = { label: string; caption: string; lines: string[] };

/** The homepage terminal: real CLI and boot output, one tab per moment docuconf checks. */
export function TerminalTabs({ tabs }: { tabs: Tab[] }) {
	const [active, setActive] = useState(0);
	const id = useId();
	const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
		const next = { ArrowRight: (active + 1) % tabs.length, ArrowLeft: (active + tabs.length - 1) % tabs.length }[e.key];
		if (next === undefined) return;
		e.preventDefault();
		setActive(next);
		document.getElementById(`${id}-tab-${next}`)?.focus();
	};
	return (
		<div className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[var(--terminal-bg)] font-mono text-[0.78rem] leading-relaxed text-[var(--terminal-fg)] shadow-2xl shadow-black/30">
			<div role="tablist" aria-label="When docuconf checks" className="flex gap-1 border-b border-white/10 px-3 pt-2">
				{tabs.map((t, i) => (
					<button
						key={t.label}
						id={`${id}-tab-${i}`}
						type="button"
						role="tab"
						aria-selected={i === active}
						aria-controls={`${id}-panel-${i}`}
						tabIndex={i === active ? 0 : -1}
						onClick={() => setActive(i)}
						onKeyDown={onKeyDown}
						className={`-mb-px border-b-2 px-3 py-2 font-sans text-xs font-medium ${
							i === active ? 'border-[var(--terminal-ok)] text-white' : 'border-transparent text-[var(--terminal-muted)] hover:text-white'
						}`}
					>
						{t.label}
					</button>
				))}
			</div>
			{tabs.map((t, i) => (
				<div key={t.label} role="tabpanel" id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} hidden={i !== active}>
					<p className="px-5 pt-3 font-sans text-xs text-[var(--terminal-muted)]">{t.caption}</p>
					<pre tabIndex={0} className="overflow-x-auto px-5 py-3">
						{t.lines.map((line, j) => (
							<span
								key={j}
								className={
									line.startsWith('$ ')
										? 'text-white'
										: /^exit status|^\.\.\.$/.test(line)
											? 'text-[var(--terminal-muted)]'
											: undefined
								}
							>
								{line}
								{'\n'}
							</span>
						))}
					</pre>
				</div>
			))}
		</div>
	);
}
