import Link from 'next/link';
import { GITHUB_ORG } from '@/lib/sdk-data';
import { MobileMenu } from './mobile-menu';
import { Search } from './search';

export { GITHUB_ORG };
export const REPO = `${GITHUB_ORG}/docuconf-go`;
export const SPEC_URL = `${REPO}/blob/main/spec/SPEC.md`;
export const PLAN_URL = `${REPO}/blob/main/docs/PLAN.md`;
export const EDGE_CASES_URL = `${REPO}/blob/main/docs/EDGE_CASES.md`;

export type NavPage = { href: string; label: string };

/** The site's pages, grouped as the menus show them. The sitemap lists them too. */
export const NAV_GROUPS: { title: string; pages: NavPage[] }[] = [
	{
		title: 'Get started',
		pages: [
			{ href: '/languages/', label: 'Pick a language' },
			{ href: '/examples/', label: 'Example apps' },
		],
	},
	{
		title: 'Specification',
		pages: [
			{ href: '/spec/', label: 'Overview' },
			{ href: '/spec/inputs/', label: 'Inputs' },
			{ href: '/spec/outputs/', label: 'Outputs' },
			{ href: '/spec/sdk-requirements/', label: 'SDK requirements' },
		],
	},
	{
		title: 'Project',
		pages: [
			{ href: '/vision/', label: 'Vision' },
			{ href: '/how-it-works/', label: 'How it works' },
			{ href: '/feature-flags/', label: 'Config is not feature flags' },
			{ href: '/roadmap/', label: 'Roadmap' },
			{ href: '/community/', label: 'Get involved' },
		],
	},
];

export const DOC_PAGES: NavPage[] = NAV_GROUPS.flatMap((g) => g.pages);

const HEADER_NAV: NavPage[] = [
	{ href: '/languages/', label: 'Get started' },
	{ href: '/how-it-works/', label: 'How it works' },
	{ href: '/spec/', label: 'Specification' },
	{ href: '/examples/', label: 'Examples' },
	{ href: '/roadmap/', label: 'Roadmap' },
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
	return (
		<header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur" data-pagefind-ignore>
			<div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:gap-6">
				<Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
					<Logo />
					<span className="text-lg">docuconf</span>
				</Link>
				<nav aria-label="Main" className="ml-auto hidden items-center gap-5 text-sm text-muted lg:flex">
					{HEADER_NAV.map((p) => (
						<Link key={p.href} href={p.href} className="transition-colors hover:text-fg">
							{p.label}
						</Link>
					))}
				</nav>
				<div className="ml-auto flex items-center gap-2 lg:ml-0">
					<Search />
					<a
						href={GITHUB_ORG}
						className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg"
					>
						<GitHubIcon className="size-4" />
						<span className="hidden sm:inline">GitHub</span>
						<span className="sr-only sm:hidden">docuconf on GitHub</span>
					</a>
					<MobileMenu groups={NAV_GROUPS} />
				</div>
			</div>
		</header>
	);
}

export function SiteFooter() {
	return (
		<footer className="mt-24 border-t border-border" data-pagefind-ignore>
			<div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
				<div className="flex items-center gap-2.5 text-fg">
					<Logo className="size-5" />
					<span className="font-semibold">docuconf</span>
					<span className="text-muted">· an open-source project</span>
				</div>
				<div className="flex flex-wrap gap-x-6 gap-y-2">
					<Link href="/languages/" className="hover:text-fg">Get started</Link>
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
