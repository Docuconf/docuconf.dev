import Link from 'next/link';

export const GITHUB_ORG = 'https://github.com/docuconf';
export const REPO = 'https://github.com/docuconf/docuconf-go';
export const SPEC_URL = `${REPO}/blob/main/spec/SPEC.md`;
export const PLAN_URL = `${REPO}/blob/main/docs/PLAN.md`;
export const EDGE_CASES_URL = `${REPO}/blob/main/docs/EDGE_CASES.md`;

export const DOC_PAGES = [
	{ href: '/vision/', label: 'Vision' },
	{ href: '/how-it-works/', label: 'How it works' },
	{ href: '/spec/', label: 'Specification' },
	{ href: '/spec/inputs/', label: 'Spec: inputs' },
	{ href: '/spec/outputs/', label: 'Spec: outputs' },
	{ href: '/spec/sdk-requirements/', label: 'Spec: SDK requirements' },
	{ href: '/languages/', label: 'Languages' },
	{ href: '/examples/', label: 'Example apps' },
	{ href: '/feature-flags/', label: 'Config is not feature flags' },
	{ href: '/roadmap/', label: 'Roadmap' },
	{ href: '/community/', label: 'Get involved' },
];

export function Logo({ className = 'size-7' }: { className?: string }) {
	return (
		<svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
			<rect x="3" y="3" width="26" height="26" rx="6" stroke="currentColor" strokeWidth="2.5" />
			<path d="M9 11h8M9 16h12M9 21h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
			<path
				d="M19 21l2.2 2.2L25.5 18.5"
				stroke="var(--accent)"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function GitHubIcon({ className = 'size-5' }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
			<path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
		</svg>
	);
}

export function SiteHeader() {
	const nav = DOC_PAGES.filter((p) => ['/vision/', '/how-it-works/', '/spec/', '/languages/', '/examples/', '/roadmap/'].includes(p.href));
	return (
		<header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
				<Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
					<Logo />
					<span className="text-lg">docuconf</span>
				</Link>
				<nav aria-label="Main" className="ml-auto hidden items-center gap-6 text-sm text-muted md:flex">
					{nav.map((p) => (
						<Link key={p.href} href={p.href} className="transition-colors hover:text-fg">
							{p.label}
						</Link>
					))}
				</nav>
				<a
					href={GITHUB_ORG}
					className="ml-auto flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg md:ml-0"
				>
					<GitHubIcon className="size-4" />
					<span>GitHub</span>
				</a>
				<details className="relative md:hidden">
					<summary className="flex cursor-pointer list-none items-center rounded-md p-1.5 text-muted hover:text-fg [&::-webkit-details-marker]:hidden">
						<span className="sr-only">Menu</span>
						<svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
							<path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
						</svg>
					</summary>
					<nav
						aria-label="Mobile"
						className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-bg p-2 shadow-xl"
					>
						{DOC_PAGES.map((p) => (
							<Link key={p.href} href={p.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-card">
								{p.label}
							</Link>
						))}
					</nav>
				</details>
			</div>
		</header>
	);
}

export function SiteFooter() {
	return (
		<footer className="mt-24 border-t border-border">
			<div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
				<div className="flex items-center gap-2.5 text-fg">
					<Logo className="size-5" />
					<span className="font-semibold">docuconf</span>
					<span className="text-muted">· an open-source project</span>
				</div>
				<div className="flex flex-wrap gap-x-6 gap-y-2">
					<Link href="/spec/" className="hover:text-fg">Specification</Link>
					<a href={SPEC_URL} className="hover:text-fg">SPEC.md</a>
					<a href={`${process.env.BASE_PATH ?? ''}/llms.txt`} className="hover:text-fg">llms.txt</a>
					<a href={PLAN_URL} className="hover:text-fg">Plan</a>
					<a href={EDGE_CASES_URL} className="hover:text-fg">Edge cases</a>
					<a href={GITHUB_ORG} className="hover:text-fg">GitHub</a>
				</div>
			</div>
		</footer>
	);
}
