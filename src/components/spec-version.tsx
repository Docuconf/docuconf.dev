// The spec version picker and the banner at the top of every /spec page, from src/lib/spec-versions.ts.
import Link from 'next/link';
import {
	apiVersionOf,
	CURRENT_SPEC,
	prUrl,
	SPEC_VERSIONS,
	type SpecStatus,
	specPath,
	specSourceUrl,
	specVersion,
	STATUS_TEXT,
} from '@/lib/spec-versions';

const CHIP: Record<SpecStatus, string> = {
	current: 'border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400',
	draft: 'border-amber-600/40 bg-amber-500/10 text-amber-800 dark:text-amber-300',
	superseded: 'border-border bg-card text-muted',
};

export function SpecStatusChip({ status }: { status: SpecStatus }) {
	return (
		<span className={`inline-block whitespace-nowrap rounded-full border px-1.5 py-px text-[0.6875rem] font-medium leading-4 ${CHIP[status]}`}>
			{STATUS_TEXT[status]}
		</span>
	);
}

/** One link per version, to `hrefFor(version)`. Used in the docs sidebar and in the banner. */
export function VersionSwitch({ active, hrefFor, className = '' }: { active: string; hrefFor: (version: string) => string; className?: string }) {
	return (
		<ul className={`flex flex-wrap gap-1.5 ${className}`}>
			{SPEC_VERSIONS.map((v) => {
				const on = v.version === active;
				return (
					<li key={v.version}>
						<Link
							href={hrefFor(v.version)}
							aria-current={on ? 'page' : undefined}
							title={v.summary}
							className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-xs transition-colors ${
								on ? 'border-accent bg-accent-soft text-fg' : 'border-border text-muted hover:border-accent hover:text-fg'
							}`}
						>
							{v.version}
							<SpecStatusChip status={v.status} />
						</Link>
					</li>
				);
			})}
		</ul>
	);
}

/** Which version this page describes, a switch to the others, and for a draft, that it is not final. */
export function SpecVersionBanner({ version, slug }: { version: string; slug: string }) {
	const v = specVersion(version)!;
	return (
		<div className="not-prose mb-8 space-y-3" data-pagefind-ignore>
			<nav aria-label="Spec version" className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
				<span className="text-muted">
					Describes <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em] text-fg">apiVersion: {apiVersionOf(v.version)}</code>
				</span>
				<VersionSwitch active={v.version} hrefFor={(other) => specPath(other, slug)} />
			</nav>
			{v.status === 'draft' && (
				<div role="note" className="rounded-xl border border-amber-600/40 bg-amber-500/10 px-5 py-4 text-sm leading-relaxed [&_a]:underline">
					<p className="mb-1 font-semibold">Draft, not final</p>
					<p>
						<code>{v.version}</code> does not exist yet. These pages describe the changes proposed for it
						{v.prs?.length ? (
							<>
								{' '}
								in docuconf-go pull requests{' '}
								{v.prs.map((n, i) => (
									<span key={n}>
										{i > 0 && (i === v.prs!.length - 1 ? ' and ' : ', ')}
										<a href={prUrl(n)}>#{n}</a>
									</span>
								))}
								, which are not merged
							</>
						) : null}
						. Anything here can still change. Keep contracts on{' '}
						<Link href={specPath(CURRENT_SPEC.version, slug)}>
							<code>{CURRENT_SPEC.version}</code>
						</Link>{' '}
						until the format freeze lands. See the <Link href="/versioning/">versioning policy</Link> and the{' '}
						<a href={specSourceUrl(v.version)}>draft SPEC.md</a>.
					</p>
				</div>
			)}
			{v.status === 'superseded' && (
				<div role="note" className="rounded-xl border border-border bg-card px-5 py-4 text-sm leading-relaxed [&_a]:text-accent [&_a]:underline">
					<p className="mb-1 font-semibold">Superseded</p>
					<p>
						<code>{v.version}</code> is no longer current. The current version is{' '}
						<Link href={specPath(CURRENT_SPEC.version, slug)}>{CURRENT_SPEC.version}</Link>; see the{' '}
						<Link href="/versioning/">versioning policy</Link> for how long {v.version} contracts stay valid.
					</p>
				</div>
			)}
		</div>
	);
}

/** A link to a section of a version's SPEC.md, at the ref spec-versions.ts gives it. */
export function SpecMd({ version, anchor = '', children }: { version: string; anchor?: string; children: React.ReactNode }) {
	return <a href={`${specSourceUrl(version)}${anchor}`}>{children}</a>;
}

/** Every version the site documents, with its status, for /versioning/. */
export function SpecVersionsTable() {
	return (
		<div role="region" aria-label="Spec versions (scrolls sideways)" tabIndex={0} className="not-prose my-6 overflow-x-auto rounded-xl border border-border">
			<table className="w-full border-collapse text-left text-sm">
				<thead className="bg-card">
					<tr>
						{['Version', 'Status', 'Pages', 'Source'].map((h) => (
							<th key={h} scope="col" className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold">
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{SPEC_VERSIONS.map((v) => (
						<tr key={v.version} className="align-top [&:not(:last-child)>td]:border-b [&>td]:border-border">
							<td className="whitespace-nowrap px-3 py-2 font-mono text-xs leading-6">{apiVersionOf(v.version)}</td>
							<td className="px-3 py-2 leading-relaxed">
								<SpecStatusChip status={v.status} /> <span className="text-muted">{v.summary}</span>
							</td>
							<td className="whitespace-nowrap px-3 py-2">
								<Link href={specPath(v.version)} className="text-accent hover:underline">
									{specPath(v.version)}
								</Link>
							</td>
							<td className="whitespace-nowrap px-3 py-2">
								<a href={specSourceUrl(v.version)} className="text-accent hover:underline">
									SPEC.md
								</a>
								{v.prs?.length ? (
									<span className="text-muted">
										{' '}
										({v.prs.map((n, i) => (
											<span key={n}>
												{i > 0 && ', '}
												<a href={prUrl(n)} className="text-accent hover:underline">
													#{n}
												</a>
											</span>
										))}
										)
									</span>
								) : null}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
