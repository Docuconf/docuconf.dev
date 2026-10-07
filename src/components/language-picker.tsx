// A card per SDK, linking to its Get started page. Used on /languages/ and the homepage.
import Link from 'next/link';
import { conformanceShort, SDK_ROWS } from '@/lib/sdk-data';

export function LanguagePicker({ compact = false }: { compact?: boolean }) {
	if (compact) {
		return (
			<ul aria-label="SDKs" className="flex flex-wrap gap-2">
				{SDK_ROWS.map((r) => (
					<li key={r.slug}>
						<Link
							href={`/languages/${r.slug}/`}
							className="inline-block rounded-full border border-border bg-bg px-3 py-1 text-sm transition-colors hover:border-accent hover:text-accent"
						>
							{r.name}
						</Link>
					</li>
				))}
			</ul>
		);
	}
	return (
		<ul className="not-prose my-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{SDK_ROWS.map((r) => (
				<li key={r.slug}>
					<Link
						href={`/languages/${r.slug}/`}
						className="block h-full rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-accent"
					>
						<span className="font-semibold">{r.name}</span>
						<span className="mt-0.5 block text-sm text-muted">on {r.host}</span>
						<span className="mt-1 block text-xs text-muted">conformance {conformanceShort(r)}</span>
					</Link>
				</li>
			))}
		</ul>
	);
}
