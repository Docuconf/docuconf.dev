import Link from 'next/link';
import { Code } from '@/components/code';
import { Tab, Tabs } from '@/components/tabs';
import { GITHUB_ORG } from '@/components/site';
import { JsonLd } from '@/components/spec-tables';
import { siteGraph } from '@/lib/seo';

export const metadata = { alternates: { canonical: '/' } };

const declarations = {
	go: `type Config struct {
    // Primary Postgres connection string.
    DatabaseURL string \`env:"DATABASE_URL,required" secret:"true"\`

    // HTTP listen port.
    Port int \`env:"PORT" envDefault:"8080" min:"1" max:"65535"\`
}`,
	ts: `export const env = createEnv({
  server: {
    DATABASE_URL: secret(z.url().describe("Primary Postgres connection string")),
    PORT: z.coerce.number().int().min(1).max(65535).default(8080).describe("HTTP listen port"),
  },
  runtimeEnv: process.env,
});`,
	ruby: `class BillingConfig < Anyway::Config
  include Docuconf::Anyway
  attr_config :database_url, port: 8080
  required :database_url
  describe database_url: "Primary Postgres connection string", port: "HTTP listen port"
  secret :database_url
  constrain port: {min: 1, max: 65535}
end`,
	dotnet: `public sealed class BillingOptions
{
    [Required, Secret, Description("Primary Postgres connection string")]
    public string DatabaseUrl { get; set; } = "";

    [Range(1, 65535), Description("HTTP listen port")]
    public int Port { get; set; } = 8080;
}`,
};

const contract = `PORT: {
	type:        "int"
	description: "HTTP listen port"
	default:     8080
	min:         1
	max:         65535
}
DATABASE_URL: {
	type:        "url"
	description: "Primary Postgres connection string"
	required:    true
	secret:      true
}`;

const steps = [
	{
		title: 'Declare',
		body: 'Describe your variables in the env library you already use. docuconf adds descriptions, secrets and constraints.',
	},
	{
		title: 'Export',
		body: 'The SDK writes contract.cue at build time and publishes it with your image, tied to its digest.',
	},
	{
		title: 'Validate',
		body: 'Crossplane and CUE check the values for each environment, plus platform policy, before anything renders.',
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
		body: 'A Rails app and a .NET service produce the same kind of contract, so the platform validates both the same way.',
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

const languages = [
	{ name: 'Go', host: 'caarlos0/env', status: 'In progress' },
	{ name: 'TypeScript', host: 'T3 Env + Zod, Valibot or ArkType', status: 'Next' },
	{ name: 'Ruby on Rails', host: 'anyway_config', status: 'Next' },
	{ name: '.NET', host: 'Options pattern + appsettings', status: 'Next' },
	{ name: 'Python', host: 'pydantic-settings', status: 'Planned' },
	{ name: 'Java', host: 'Spring Boot configuration properties', status: 'Planned' },
];

function Terminal() {
	return (
		<div
			role="img"
			aria-label="A deploy rejected by docuconf: PORT is above its maximum, a required variable is missing, and a secret was given as plain text."
			className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[var(--terminal-bg)] font-mono text-[0.78rem] leading-relaxed text-[var(--terminal-fg)] shadow-2xl shadow-black/30"
		>
			<div className="flex gap-1.5 border-b border-white/10 px-4 py-3">
				<span className="size-2.5 rounded-full bg-white/15" />
				<span className="size-2.5 rounded-full bg-white/15" />
				<span className="size-2.5 rounded-full bg-white/15" />
			</div>
			<pre className="overflow-x-auto px-5 py-4">
				<span className="text-white">$ kubectl get app billing-api</span>
				{'\n'}
				<span className="text-[var(--terminal-muted)]">CONDITION      STATUS</span>
				{'\n'}ContractValid  <span className="text-[var(--terminal-danger)]">False</span>
				{'\n\n'}
				<span className="text-[var(--terminal-danger)]">✗</span> PORT: 70000 is above max 65535
				{'\n'}
				<span className="text-[var(--terminal-danger)]">✗</span> ALLOWED_ORIGINS: required
				{'\n'}
				<span className="text-[var(--terminal-danger)]">✗</span> DATABASE_URL: plain-text secret
				{'\n  '}
				<span className="text-[var(--terminal-muted)]">(value redacted)</span>
				{'\n\n'}
				<span className="text-[var(--terminal-ok)]">Nothing was deployed.</span>
			</pre>
		</div>
	);
}

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
							docuconf turns the config your app already declares, in Go, TypeScript, Ruby or .NET, into a CUE
							contract that your Kubernetes platform checks before anything deploys.
						</p>
						<div className="mt-9 flex flex-wrap items-center gap-3">
							<Link
								href="/vision/"
								className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
							>
								Read the vision →
							</Link>
							<Link
								href="/how-it-works/"
								className="rounded-full border border-border bg-bg px-6 py-3 text-sm font-semibold transition-colors hover:border-fg/40"
							>
								How it works
							</Link>
						</div>
					</div>
					<Terminal />
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
				<div className="grid gap-6 lg:grid-cols-2">
					<div className="min-w-0">
						<p className="mb-1 text-sm font-medium text-muted">1 · Your declaration, as you write it today</p>
						<Tabs>
							<Tab label="Go">
								<Code lang="go" code={declarations.go} />
							</Tab>
							<Tab label="TypeScript">
								<Code lang="ts" code={declarations.ts} />
							</Tab>
							<Tab label="Ruby">
								<Code lang="ruby" code={declarations.ruby} />
							</Tab>
							<Tab label=".NET">
								<Code lang="csharp" code={declarations.dotnet} />
							</Tab>
						</Tabs>
					</div>
					<div className="min-w-0">
						<p className="mb-1 text-sm font-medium text-muted">2 · The contract your platform checks</p>
						<div className="my-6">
							<div className="flex border-b border-border">
								<span className="-mb-px border-b-2 border-accent px-3 py-2 font-mono text-sm font-medium">
									contract.cue
								</span>
							</div>
							<div className="pt-4">
								<Code lang="cue" code={contract} />
							</div>
						</div>
					</div>
				</div>
				<p className="mt-6 text-sm text-muted">
					The SDK APIs shown are planned and may change while the specification is a draft.{' '}
					<Link href="/languages/" className="text-accent underline">
						See each language in full.
					</Link>
				</p>
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
				<div className="overflow-hidden rounded-2xl border border-border">
					<table className="w-full text-left text-sm">
						<thead className="bg-card text-muted">
							<tr>
								<th className="px-5 py-3 font-medium">Language</th>
								<th className="px-5 py-3 font-medium">Builds on</th>
								<th className="px-5 py-3 font-medium">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{languages.map((l) => (
								<tr key={l.name}>
									<td className="px-5 py-3 font-medium">{l.name}</td>
									<td className="px-5 py-3 text-muted">{l.host}</td>
									<td className="px-5 py-3">
										<span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">{l.status}</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
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
						The contract specification is a draft and the SDKs are being built now. One good comment can still change
						the design.
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
