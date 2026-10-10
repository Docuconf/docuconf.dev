// SDK tiers, from src/lib/sdk-tiers.ts: a badge per SDK, and the "SDK tiers" section of /languages/.
import Link from 'next/link';
import { SDK_ROWS } from '@/lib/sdk-data';
import { SDK_TIERS, SDK_TIERS_DATE, type Tier, TIER_LABEL, TIERS } from '@/lib/sdk-tiers';

const STYLE: Record<Tier, string> = {
	tier1: 'border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400',
	tier2: 'border-sky-600/30 bg-sky-500/10 text-sky-800 dark:text-sky-300',
	experimental: 'border-amber-600/40 bg-amber-500/10 text-amber-800 dark:text-amber-300',
};

export function TierBadge({ tier }: { tier: Tier }) {
	return (
		<span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${STYLE[tier]}`}>
			{TIER_LABEL[tier]}
		</span>
	);
}

/** The tier of one SDK, for its Get started page. */
export function SdkTier({ slug }: { slug: string }) {
	const t = SDK_TIERS[slug];
	if (!t) return null;
	return (
		<>
			<TierBadge tier={t.tier} />{' '}
			{t.gaps.length > 0 && <span className="text-muted">{t.gaps.join(' ')} </span>}
			<Link href="/languages/#tiers" className="text-accent underline">
				What tiers mean
			</Link>
		</>
	);
}

/** The criteria, then every SDK with its tier, its gap and the evidence. */
export function SdkTiers() {
	return (
		<>
			<ul className="not-prose my-6 grid gap-3 md:grid-cols-3">
				{TIERS.map((t) => (
					<li key={t.tier} className="rounded-xl border border-border bg-card p-4">
						<TierBadge tier={t.tier} />
						<ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-muted marker:text-border">
							{t.criteria.map((c) => (
								<li key={c}>{c}</li>
							))}
						</ul>
					</li>
				))}
			</ul>
			<div
				role="region"
				aria-label="The tier of each SDK (scrolls sideways)"
				tabIndex={0}
				className="not-prose my-6 overflow-x-auto rounded-xl border border-border"
			>
				<table className="w-full border-collapse text-left text-sm">
					<caption className="caption-bottom px-3 py-2 text-left text-xs text-muted">
						From each SDK repository&apos;s main branch: its README, CI and release workflows and its example, checked{' '}
						{SDK_TIERS_DATE}.
					</caption>
					<thead className="bg-card">
						<tr>
							{['SDK', 'Tier', 'Gap and evidence'].map((h) => (
								<th key={h} scope="col" className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold">
									{h}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{SDK_ROWS.map((r) => {
							const t = SDK_TIERS[r.slug];
							return (
								<tr key={r.slug} className="align-top [&:not(:last-child)>*]:border-b [&>*]:border-border">
									<th scope="row" className="whitespace-nowrap px-3 py-2 font-semibold">
										<Link href={`/languages/${r.slug}/`} className="text-accent hover:underline">
											{r.name}
										</Link>
									</th>
									<td className="px-3 py-2">{t && <TierBadge tier={t.tier} />}</td>
									<td className="min-w-64 px-3 py-2 leading-relaxed">
										{t?.gaps.length ? <p className="mb-1">{t.gaps.join(' ')}</p> : null}
										<p className="text-muted">{t?.evidence}</p>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</>
	);
}
