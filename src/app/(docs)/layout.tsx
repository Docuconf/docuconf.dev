import { DocsNav } from '@/components/docs-nav';
import { MobileDocsNav } from '@/components/mobile-docs-nav';
import { NAV_GROUPS } from '@/components/site';
import { Toc } from '@/components/toc';
import { SDK_ROWS } from '@/lib/sdk-data';

const SDK_PAGES = SDK_ROWS.map((r) => ({ href: `/languages/${r.slug}/`, label: r.name }));

export default function DocsLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="mx-auto flex max-w-7xl gap-10 px-4 pt-6 sm:px-6 lg:pt-14">
			<aside className="hidden w-56 shrink-0 lg:block" data-pagefind-ignore>
				<div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-8">
					<DocsNav groups={NAV_GROUPS} sdks={SDK_PAGES} />
				</div>
			</aside>
			<div className="min-w-0 flex-1">
				<div className="lg:hidden" data-pagefind-ignore>
					<MobileDocsNav>
						<DocsNav groups={NAV_GROUPS} sdks={SDK_PAGES} />
					</MobileDocsNav>
				</div>
				<div data-pagefind-ignore>
					<Toc variant="inline" />
				</div>
				<article className="prose min-w-0 prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-h1:text-4xl prose-h1:font-bold">
					{children}
				</article>
			</div>
			<aside className="hidden w-52 shrink-0 xl:block" data-pagefind-ignore>
				<div className="sticky top-24">
					<Toc variant="side" />
				</div>
			</aside>
		</div>
	);
}
