import { DocsNav } from '@/components/docs-nav';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="mx-auto flex max-w-6xl gap-12 px-4 pt-10 sm:px-6 lg:pt-14">
			<aside className="hidden w-52 shrink-0 lg:block">
				<div className="sticky top-24">
					<DocsNav />
				</div>
			</aside>
			<article className="prose min-w-0 flex-1 prose-headings:tracking-tight prose-h1:text-4xl prose-h1:font-bold">
				{children}
			</article>
		</div>
	);
}
