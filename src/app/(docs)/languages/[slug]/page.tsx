// /languages/<slug>/: one Get started page per SDK, generated from src/lib/sdk-data.ts. Every snippet comes from
// snippets/<slug>/, which CI compiles and runs against the SDK's main branch.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Callout } from '@/components/callout';
import { Code } from '@/components/code';
import { Inline } from '@/components/inline';
import { JsonLd } from '@/components/spec-tables';
import { GITHUB_ORG, repoPath, SDK_DATA_DATE, SDK_ROWS, sdkStatus, type SdkRow, type Step } from '@/lib/sdk-data';
import { pageGraph } from '@/lib/seo';
import { command, snippetText, transcript } from '@/lib/snippets';
import { plain } from '@/lib/text';

export const dynamicParams = false;

export function generateStaticParams() {
	return SDK_ROWS.map((r) => ({ slug: r.slug }));
}

type Props = { params: Promise<{ slug: string }> };

async function find(params: Props['params']) {
	const { slug } = await params;
	return SDK_ROWS.find((r) => r.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const row = await find(params);
	if (!row) return {};
	return {
		title: `Get started with docuconf for ${row.name}`,
		description: `Install docuconf for ${row.name}, declare your configuration with ${row.host}, see a boot error, test it and export the contract. ${plain(row.summary)}`,
		alternates: { canonical: `/languages/${row.slug}/` },
	};
}

function Files({ row, step }: { row: SdkRow; step: Step }) {
	return (
		<>
			{step.files?.map((f) => (
				<Code key={`${f.file}#${f.from ?? ''}`} lang={f.lang} title={f.title} code={snippetText(row.slug, f)} />
			))}
		</>
	);
}

function Section({ id, n, title, children }: { id: string; n?: number; title: string; children: React.ReactNode }) {
	return (
		<section aria-labelledby={id}>
			<h2 id={id}>
				{n !== undefined && <span className="mr-2 text-muted">{n}.</span>}
				{title}
			</h2>
			{children}
		</section>
	);
}

export default async function GetStarted({ params }: Props) {
	const row = await find(params);
	if (!row) notFound();
	const g = row.guide;
	const repo = `${GITHUB_ORG}/${row.repo}`;
	const path = `/languages/${row.slug}/`;

	return (
		<>
			<JsonLd data={pageGraph({ path, title: `Get started: ${row.name}`, description: plain(row.summary) })} />
			<p className="not-prose text-sm font-semibold text-accent">
				<Link href="/languages/">Get started</Link> / {row.name}
			</p>
			<h1>docuconf for {row.name}</h1>
			<p className="lead">
				<Inline text={row.summary} />
			</p>

			<dl className="not-prose grid gap-x-6 gap-y-2 rounded-xl border border-border bg-card p-4 text-sm sm:grid-cols-[auto_1fr]">
				<dt className="font-semibold">Builds on</dt>
				<dd>
					<a href={row.hostUrl} className="text-accent underline">
						{row.host}
					</a>
				</dd>
				<dt className="font-semibold">Package</dt>
				<dd className="font-mono text-xs leading-5">{row.package}</dd>
				<dt className="font-semibold">Requires</dt>
				<dd>{row.runtime}</dd>
				<dt className="font-semibold">Status</dt>
				<dd>{sdkStatus(row)}</dd>
				<dt className="font-semibold">Source</dt>
				<dd>
					<a href={repo} className="text-accent underline">
						{row.repo}
					</a>{' '}
					·{' '}
					<a href={repoPath(row.repo, row.example.path)} className="text-accent underline">
						the orders example
					</a>
				</dd>
			</dl>

			<Callout title="Not published yet">
				Every docuconf SDK is a v0.1 alpha and none is on a package registry yet, so step 1 installs from the{' '}
				<code>main</code> branch. After the first release it will be <code>{g.install.registry}</code>.
			</Callout>

			<p>
				The code below is the <strong>orders</strong> service, the example every SDK ships: six variables, one of them a
				secret, checked the same way in every language. <Link href="/examples/">Compare it across languages.</Link>
			</p>

			<Section id="install" n={1} title="Install">
				<p>
					<Inline text={g.install.text} />
				</p>
				{g.install.check && <Code lang="sh" code={command(row, g.install.check)} />}
				<Files row={row} step={g.install} />
			</Section>

			<Section id="declare" n={2} title="Declare your configuration">
				<p>
					<Inline text={g.declare.text} />
				</p>
				<Files row={row} step={g.declare} />
			</Section>

			<Section id="load" n={3} title="Load it at boot">
				<p>
					<Inline text={g.load.text} />
				</p>
				<Files row={row} step={g.load} />
			</Section>

			<Section id="run" n={4} title="Run it, and see an error">
				<p>Run the example with a valid environment:</p>
				<Code lang="sh" code={g.run} />
				<p>
					<Inline text={g.error.text} />
				</p>
				{g.error.check && <Code lang="shellsession" title="Terminal" code={transcript(row, g.error.check)} />}
			</Section>

			<Section id="test" n={5} title="Test your configuration">
				<p>
					<Inline text={g.test.text} />
				</p>
				<Files row={row} step={g.test} />
				{g.test.check && <Code lang="sh" code={command(row, g.test.check)} />}
			</Section>

			<Section id="export" n={6} title="Export the contract">
				<p>
					<Inline text={g.export.text} />
				</p>
				{g.export.check && <Code lang="sh" code={command(row, g.export.check)} />}
				<Files row={row} step={g.export} />
				<p>
					The platform then checks each environment&apos;s values against <code>contract.cue</code> before it deploys,
					with <code>docuconf vet</code>, the Helm chart or CUE. See <Link href="/how-it-works/">How it works</Link>.
				</p>
			</Section>

			<Section id="framework" n={7} title={g.framework.name}>
				<p>
					<Inline text={g.framework.text} />
				</p>
				<Files row={row} step={g.framework} />
				{g.framework.check && (
					<Code lang="shellsession" title="Terminal" code={transcript(row, g.framework.check)} />
				)}
			</Section>

			<Section id="next" title="Next">
				<ul>
					<li>
						<a href={`${repo}#readme`}>The {row.repo} README</a>: every type, file input and option.
					</li>
					<li>
						<a href={repoPath(row.repo, row.example.path)}>The orders example</a>, with its smoke test.
					</li>
					<li>
						<Link href="/examples/">The same service in every language</Link>, side by side.
					</li>
					<li>
						<Link href="/spec/sdk-requirements/">What every SDK supports</Link>, and this one&apos;s known gaps:{' '}
						{row.caveats.join(' ')}
					</li>
				</ul>
			</Section>

			<p className="text-sm text-muted">
				Every snippet on this page is compiled or run against {row.repo}&apos;s <code>main</code> branch in CI. Facts
				checked {SDK_DATA_DATE}.
			</p>
		</>
	);
}
