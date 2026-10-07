import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { CodeFrame } from '@/components/code-frame';

const components: MDXComponents = {
	// Internal links go through next/link so they pick up the base path.
	a: ({ href = '', ...props }) =>
		href.startsWith('/') ? <Link href={href} {...props} /> : <a href={href} {...props} />,
	// Every code block gets a copy button.
	pre: (props) => (
		<CodeFrame>
			<pre {...props} />
		</CodeFrame>
	),
	// Wide tables scroll inside a focusable region, so keyboard users can scroll them too.
	table: (props) => (
		<div role="region" aria-label="Table (scrolls sideways)" tabIndex={0} className="table-scroll">
			<table {...props} />
		</div>
	),
	// GFM task lists: a status mark and its words, not an unlabelled, disabled checkbox.
	input: ({ type, checked, ...props }) =>
		type === 'checkbox' ? (
			<span className="task-mark">
				<span aria-hidden="true">{checked ? '✓' : '○'}</span>
				<span className="sr-only">{checked ? 'Done: ' : 'To do: '}</span>
			</span>
		) : (
			<input type={type} checked={checked} {...props} />
		),
};

export function useMDXComponents(): MDXComponents {
	return components;
}
