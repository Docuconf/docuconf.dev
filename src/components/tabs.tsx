'use client';

import { Children, isValidElement, useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactElement, type ReactNode } from 'react';

type TabProps = { label: string; value?: string; children: ReactNode };

export function Tab({ children }: TabProps) {
	return <>{children}</>;
}

const EVENT = 'docuconf:tab';
const storageKey = (group: string) => `docuconf:tab:${group}`;

function remembered(group: string): string | null {
	try {
		return localStorage.getItem(storageKey(group));
	} catch {
		return null;
	}
}

/**
 * Tabs that remember the reader's choice. Every Tabs with the same `group` switches together, the choice is kept
 * in localStorage, and with `linkable` it is also in the URL (`?lang=ruby`), so a link can open a given tab.
 * Arrow keys, Home and End move between tabs, as the ARIA tabs pattern describes.
 */
export function Tabs({
	children,
	group,
	linkable = false,
	label,
}: {
	children: ReactNode;
	group?: string;
	linkable?: boolean;
	label?: string;
}) {
	const tabs = Children.toArray(children).filter(isValidElement) as ReactElement<TabProps>[];
	const values = tabs.map((t) => t.props.value ?? t.props.label);
	const [active, setActive] = useState(0);
	const id = useId();
	const buttons = useRef<(HTMLButtonElement | null)[]>([]);

	const show = useCallback(
		(value: string | null) => {
			const i = value ? values.indexOf(value) : -1;
			if (i >= 0) setActive(i);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[values.join('\u0000')],
	);

	// After hydration: the URL wins, then the remembered choice.
	useEffect(() => {
		if (!group) return;
		const fromUrl = linkable ? new URLSearchParams(window.location.search).get(group) : null;
		show(fromUrl && values.includes(fromUrl) ? fromUrl : remembered(group));
		const onChange = (e: Event) => {
			const d = (e as CustomEvent<{ group: string; value: string }>).detail;
			if (d.group === group) show(d.value);
		};
		window.addEventListener(EVENT, onChange);
		return () => window.removeEventListener(EVENT, onChange);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [group, linkable, show]);

	const select = (i: number, focus = false) => {
		setActive(i);
		if (focus) buttons.current[i]?.focus();
		if (!group) return;
		const value = values[i];
		try {
			localStorage.setItem(storageKey(group), value);
		} catch {
			// Storage can be unavailable (private windows); the choice still applies to this page.
		}
		if (linkable) {
			const url = new URL(window.location.href);
			url.searchParams.set(group, value);
			window.history.replaceState(window.history.state, '', url);
		}
		window.dispatchEvent(new CustomEvent(EVENT, { detail: { group, value } }));
	};

	const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
		const last = tabs.length - 1;
		const next = { ArrowRight: active === last ? 0 : active + 1, ArrowLeft: active === 0 ? last : active - 1, Home: 0, End: last }[
			e.key
		];
		if (next === undefined) return;
		e.preventDefault();
		select(next, true);
	};

	return (
		<div className="my-6">
			<div role="tablist" aria-label={label} className="not-prose flex gap-1 overflow-x-auto border-b border-border">
				{tabs.map((tab, i) => (
					<button
						key={values[i]}
						ref={(el) => {
							buttons.current[i] = el;
						}}
						type="button"
						role="tab"
						id={`${id}-tab-${i}`}
						aria-selected={i === active}
						aria-controls={`${id}-panel-${i}`}
						tabIndex={i === active ? 0 : -1}
						onClick={() => select(i)}
						onKeyDown={onKeyDown}
						className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
							i === active ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'
						}`}
					>
						{tab.props.label}
					</button>
				))}
			</div>
			{tabs.map((tab, i) => (
				<div
					key={values[i]}
					role="tabpanel"
					id={`${id}-panel-${i}`}
					aria-labelledby={`${id}-tab-${i}`}
					hidden={i !== active}
					className="pt-4"
				>
					{tab.props.children}
				</div>
			))}
		</div>
	);
}
