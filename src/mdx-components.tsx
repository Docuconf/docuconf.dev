import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

const components: MDXComponents = {
	// Internal links go through next/link so they pick up the base path.
	a: ({ href = '', ...props }) =>
		href.startsWith('/') ? <Link href={href} {...props} /> : <a href={href} {...props} />,
};

export function useMDXComponents(): MDXComponents {
	return components;
}
