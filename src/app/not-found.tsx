import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="mx-auto max-w-xl px-6 py-32 text-center">
			<p className="font-mono text-sm text-danger">PAGE: field not allowed</p>
			<h1 className="mt-3 text-3xl font-bold tracking-tight">This page is not in the contract.</h1>
			<p className="mt-4 text-muted">The page you asked for does not exist.</p>
			<Link href="/" className="mt-8 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg">
				Back home
			</Link>
		</div>
	);
}
