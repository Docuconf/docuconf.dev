'use client';

import { Children, isValidElement, useId, useState, type ReactElement, type ReactNode } from 'react';

type TabProps = { label: string; children: ReactNode };

export function Tab({ children }: TabProps) {
	return <>{children}</>;
}

export function Tabs({ children }: { children: ReactNode }) {
	const tabs = Children.toArray(children).filter(isValidElement) as ReactElement<TabProps>[];
	const [active, setActive] = useState(0);
	const id = useId();

	return (
		<div className="my-6">
			<div role="tablist" className="not-prose flex gap-1 overflow-x-auto border-b border-border">
				{tabs.map((tab, i) => (
					<button
						key={tab.props.label}
						role="tab"
						id={`${id}-tab-${i}`}
						aria-selected={i === active}
						aria-controls={`${id}-panel-${i}`}
						onClick={() => setActive(i)}
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
					key={tab.props.label}
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
