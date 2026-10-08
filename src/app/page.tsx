import Link from 'next/link';
import { Code } from '@/components/code';
import { LanguagePicker } from '@/components/language-picker';
import { OutputViewer } from '@/components/output-viewer';
import { Tab, Tabs } from '@/components/tabs';
import { TerminalTabs } from '@/components/terminal';
import { GITHUB_ORG } from '@/components/site';
import { JsonLd } from '@/components/spec-tables';
import { CONFORMANCE_CASES, conformanceShort, SDK_ROWS } from '@/lib/sdk-data';
import { OUTPUT_TABS } from '@/lib/outputs';
import { siteGraph } from '@/lib/seo';
import { command, output, snippetText } from '@/lib/snippets';

export const metadata = { alternates: { canonical: '/' } };

const GO = SDK_ROWS.find((r) => r.slug === 'go')!;

// The hero's two terminals, from snippets CI runs against docuconf-go's main branch.
const values = snippetText('go', { file: 'overlay/examples/orders/values.yaml', lang: 'yaml' })
	.split('\n')
	.filter((l) => !l.startsWith('#'))
	.join('\n');
const HERO = [
	{
		label: 'CI, before merge',
		caption: 'docuconf vet checks the values a platform proposes against the app\'s contract.',
		lines: ['$ cat values.yaml', ...values.split('\n'), `$ ${command(GO, 'vet')}`, ...output(GO, 'vet').split('\n')],
	},
	{
		label: 'At boot',
		caption: 'The Go SDK checks the real environment when the app starts.',
		lines: [`$ ${command(GO, 'boot-error')}`, ...output(GO, 'boot-error').split('\n')],
	},
];

/** "caarlos0/env, T3 Env, ... and 6 more", from sdk-data.ts. */
const HOSTS = SDK_ROWS.slice(0, 6).map((r) => r.hostShort);
const HOSTS_TEXT = `${HOSTS.join(', ')} and ${SDK_ROWS.length - HOSTS.length} more`;

const steps = [
	{
		title: 'Declare',
		body: 'Describe your variables in the env library you already use. docuconf adds descriptions, secrets and constraints.',
	},
	{
		title: 'Export',
		body: 'The SDK exports a contract (contract.cue, or JSON) from the same declaration. From it, docuconf generates the Helm values schema, the pod config and the docs.',
	},
	{
		title: 'Validate',
		body: 'docuconf vet, the Helm chart or CUE in your pipeline checks the values for each environment, plus platform policy, before anything renders.',
	},
	{
		title: 'Boot',
		body: 'At startup the SDK checks the real environment, including secret contents, and hands your code typed values.',
	},
];

const principles = [
	{
		title: 'Your library, not ours',
		body: 'docuconf extends the leading env library in each language. Adopting it means adding a package and some metadata, not rewriting your config.',
	},
	{
		title: 'One contract, any language',
		body: `A Rails app and a .NET service produce the same kind of contract, so the platform validates both the same way. ${SDK_ROWS.length} SDKs pass one shared conformance suite.`,
	},
	{
		title: 'Fail before deploy',
		body: 'Missing, mistyped and out-of-range values are caught at composition time, not at 2 a.m. by a crash loop.',
	},
	{
		title: 'Secrets stay secret',
		body: 'Contracts never hold secret values. The platform supplies secrets only as references, and errors never print them.',
	},
	{
		title: 'Policy stays with the platform',
		body: 'The app says what it accepts; the platform says what each environment allows. Neither edits the other.',
	},
	{
		title: 'Open by design',
		body: 'A specification first, with a conformance suite so independently built SDKs provably agree.',
	},
];

function Section({
	eyebrow,
	title,
	children,
	id,
}: {
	eyebrow: string;
	title: string;
	children: React.ReactNode;
	id?: string;
}) {
	return (
		<section id={id} className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
			<p className="text-sm font-semibold text-accent">{eyebrow}</p>
			<h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
			<div className="mt-10">{children}</div>
		</section>
	);
}

export default function Home() {
	return (
		<>
			<JsonLd data={siteGraph()} />
			{/* Hero */}
			<section className="relative overflow-hidden border-b border-border">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_80%_-10%,var(--accent-soft),transparent_70%)]"
				/>
				<div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-28">
					<div>
						<p className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3 py-1 text-xs font-medium text-muted">
							<span className="size-1.5 rounded-full bg-accent" />
							Open source · spec draft v1alpha1
						</p>
						<h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
							Your environment variables are an API. Give them a contract.
						</h1>
						<p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
							docuconf turns the config your app already declares, with the library you already use ({HOSTS_TEXT}),
							into a contract (<code className="font-mono text-fg">contract.cue</code>, or JSON) that your Kubernetes
							platform checks before anything deploys. From it, docuconf generates the Helm values schema, the pod config
							and the docs.
						</p>
						<div className="mt-9 flex flex-wrap items-center gap-3">
							<Link
								href="/languages/"
								className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
							>
								Get started →
							</Link>
							<Link
								href="/how-it-works/"
								className="rounded-full border border-border bg-bg px-6 py-3 text-sm font-semibold transition-colors hover:border-fg/40"
							>
								How it works
							</Link>
						</div>
						<div className="mt-8">
							<p className="mb-2 text-sm text-muted">{SDK_ROWS.length} SDKs, each a v0.1 alpha:</p>
							<LanguagePicker compact />
						</div>
					</div>
					<TerminalTabs tabs={HERO} />
				</div>
			</section>

			{/* Problem */}
			<Section eyebrow="The problem" title="Config is the API nobody wrote down.">
				<div className="grid gap-4 md:grid-cols-2">
					<div className="rounded-2xl border border-border p-7">
						<h3 className="font-semibold">Today</h3>
						<ul className="mt-4 space-y-3 text-muted">
							<li>Environment variables are undocumented, untyped strings.</li>
							<li>
								A typo in <code className="font-mono text-fg">DATABSE_URL</code> is found by a crash loop, often in
								production.
							</li>
							<li>Every service invents its own validation, in every language.</li>
							<li>The platform team guesses what each app needs from READMEs and Slack threads.</li>
						</ul>
					</div>
					<div className="rounded-2xl border border-accent/40 bg-accent-soft/50 p-7">
						<h3 className="font-semibold">With docuconf</h3>
						<ul className="mt-4 space-y-3 text-muted">
							<li>Every variable has a type, constraints and a description, declared in code.</li>
							<li>
								A bad value is rejected <strong className="text-fg">before a pod starts</strong>, with a precise reason.
							</li>
							<li>One contract format, whatever the app is written in.</li>
							<li>Platform policy is layered on top, without editing the app.</li>
						</ul>
					</div>
				</div>
			</Section>

			{/* How it works */}
			<Section eyebrow="How it works" title="Declared once. Checked before deploy, and again at boot.">
				<ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{steps.map((s, i) => (
						<li key={s.title} className="rounded-2xl border border-border bg-card p-6">
							<span className="flex size-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-fg">
								{i + 1}
							</span>
							<h3 className="mt-4 font-semibold">{s.title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
						</li>
					))}
				</ol>
			</Section>

			{/* Code */}
			<Section eyebrow="From your code to the platform" title="Keep your library. Get a contract.">
				<p className="max-w-3xl text-muted">
					The same service, <strong className="text-fg">orders</strong>, declared with each SDK, the contract it
					exports, and what docuconf generates from that contract. Pick your language; every snippet is checked
					against that SDK&apos;s main branch in CI.
				</p>
				<Tabs group="lang" linkable label="Language">
					{SDK_ROWS.map((r) => (
						<Tab key={r.slug} value={r.slug} label={r.name}>
							<div className="grid gap-6 lg:grid-cols-2">
								<div className="min-w-0">
									<p className="mb-1 text-sm font-medium text-muted">1 · Your declaration, as you write it today</p>
									<Code
										lang={r.guide.declare.files![0].lang}
										title={r.guide.declare.files![0].title}
										code={snippetText(r.slug, r.guide.declare.files![0])}
									/>
								</div>
								<div className="min-w-0">
									<p className="mb-1 text-sm font-medium text-muted">2 · The contract it exports</p>
									<Code
										lang="cue"
										title="contract.cue"
										code={snippetText(r.slug, r.guide.export.files!.find((f) => f.lang === 'cue')!)}
									/>
								</div>
							</div>
							<p className="mt-2 text-sm">
								<Link href={`/languages/${r.slug}/`} className="font-semibold text-accent underline">
									Get started with {r.name} →
								</Link>
							</p>
						</Tab>
					))}
				</Tabs>
				<h3 id="outputs" className="mt-12 scroll-mt-24 text-sm font-medium text-muted">3 · What docuconf generates from the contract (the Go example)</h3>
				<OutputViewer tabs={OUTPUT_TABS} />
			</Section>

			{/* Principles */}
			<Section eyebrow="Principles" title="What docuconf believes.">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{principles.map((p) => (
						<div key={p.title} className="rounded-2xl border border-border p-6">
							<h3 className="font-semibold">{p.title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
						</div>
					))}
				</div>
			</Section>

			{/* Languages */}
			<Section eyebrow="Languages" title="Built for platform teams running many languages.">
				<div
					role="region"
					aria-label="SDKs (scrolls sideways)"
					tabIndex={0}
					className="overflow-x-auto rounded-2xl border border-border"
				>
					<table className="w-full text-left text-sm">
						<caption className="sr-only">Every docuconf SDK, the library it builds on, and its status</caption>
						<thead className="bg-card text-muted">
							<tr>
								<th scope="col" className="px-5 py-3 font-medium">
									SDK
								</th>
								<th scope="col" className="px-5 py-3 font-medium">
									Builds on
								</th>
								<th scope="col" className="px-5 py-3 font-medium">
									Status
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{SDK_ROWS.map((r) => (
								<tr key={r.slug}>
									<th scope="row" className="px-5 py-3 font-medium">
										<Link href={`/languages/${r.slug}/`} className="text-accent hover:underline">
											{r.name}
										</Link>
									</th>
									<td className="px-5 py-3 text-muted">{r.host}</td>
									<td className="whitespace-nowrap px-5 py-3">
										<span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
											v0.1 alpha · conformance {conformanceShort(r)}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<p className="mt-4 text-sm text-muted">
					None is on a package registry yet; each Get started page installs from git. Conformance is the shared
					suite of {CONFORMANCE_CASES} cases every SDK runs.{' '}
					<Link href="/spec/sdk-requirements/" className="text-accent underline">
						Compare what each SDK supports.
					</Link>
				</p>
			</Section>

			{/* Flags + CTA */}
			<section className="mx-auto grid max-w-6xl gap-4 px-4 pt-24 sm:px-6 md:grid-cols-2">
				<div className="rounded-2xl border border-border p-8">
					<p className="text-sm font-semibold text-accent">A deliberate boundary</p>
					<h2 className="mt-2 text-2xl font-bold tracking-tight">Config is not feature flags.</h2>
					<p className="mt-3 text-muted">
						A variable belongs in a contract if, and only if, changing it needs a rollout. Runtime toggles belong in a
						flag system such as OpenFeature.
					</p>
					<Link href="/feature-flags/" className="mt-5 inline-block text-sm font-semibold text-accent">
						Why the line matters →
					</Link>
				</div>
				<div className="rounded-2xl border border-accent/40 bg-accent-soft/60 p-8">
					<p className="text-sm font-semibold text-accent">Early days</p>
					<h2 className="mt-2 text-2xl font-bold tracking-tight">Help shape the spec.</h2>
					<p className="mt-3 text-muted">
						The contract specification is a draft and every SDK is a v0.1 alpha. One good comment can still change the
						design.
					</p>
					<div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
						<Link href="/spec/" className="rounded-full bg-accent px-5 py-2.5 text-accent-fg">
							Read the spec
						</Link>
						<a href={GITHUB_ORG} className="rounded-full border border-border bg-bg px-5 py-2.5">
							GitHub
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
