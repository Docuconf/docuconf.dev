// SDK tiers: how far each SDK meets the bar, from objective criteria. This is the only place a tier is set:
// /languages/, each /languages/<slug>/ page, llms.txt and llms-full.txt read it. To change a tier, change its row.
// `npm run check:content` fails when an SDK in sdk-data.ts has no row, or a Tier 2 or Experimental row names no gap.

/** When the evidence below was last checked against each SDK repository's main branch. */
export const SDK_TIERS_DATE = '2026-10-10';

export type Tier = 'tier1' | 'tier2' | 'experimental';

export const TIERS: { tier: Tier; label: string; criteria: string[] }[] = [
	{
		tier: 'tier1',
		label: 'Tier 1',
		criteria: [
			'Every case of the shared conformance suite passes, with none skipped',
			'The shared export check is clean: the export fixture matches the golden contract with no difference',
			'CI runs on at least two versions of the runtime or toolchain',
			'An example app with a smoke test in CI',
			'reload: watch for file inputs',
			'A contract-first mode',
			'A release workflow',
		],
	},
	{
		tier: 'tier2',
		label: 'Tier 2',
		criteria: [
			'Every conformance case passes, with none skipped',
			'But the export check has accepted differences, or an optional feature is missing; the page names the gap',
		],
	},
	{
		tier: 'experimental',
		label: 'Experimental',
		criteria: ['A proof of concept, or a niche runtime', 'Supported on a best-effort basis'],
	},
];

export const TIER_LABEL: Record<Tier, string> = { tier1: 'Tier 1', tier2: 'Tier 2', experimental: 'Experimental' };

export type SdkTier = {
	tier: Tier;
	/** What keeps it from the tier above, in a sentence each. Required below Tier 1. */
	gaps: string[];
	/** What the tier rests on, from the SDK repository's main branch. */
	evidence: string;
};

const beta = 'All 316 cases of the beta conformance suite, none skipped, and the shared export check matches the golden contract';

/** By the slug in sdk-data.ts. */
export const SDK_TIERS: Record<string, SdkTier> = {
	go: {
		tier: 'tier1',
		gaps: [],
		evidence:
			'The reference SDK. main runs the 134-case v1alpha1 suite, none skipped; the 316-case beta suite and the shared export check pass on docuconf-go PR #29. CI on Go 1.24 and 1.25, orders smoke test, reload: watch on every file type, LoadContract, release workflow.',
	},
	typescript: {
		tier: 'tier1',
		gaps: [],
		evidence: `${beta} (packages/t3). CI on Node 22 and 24, smoke tests for each orders example and the Next.js example, reload: "watch", loadContract, release workflow.`,
	},
	nestjs: {
		tier: 'tier1',
		gaps: [],
		evidence: `${beta}, through the shared core of docuconf-js. CI on Node 22 and 24, orders-nestjs smoke test, reload: "watch", loadContract, release workflow.`,
	},
	dotnet: {
		tier: 'tier1',
		gaps: [],
		evidence: `${beta}. CI on .NET 8 and 10, orders smoke test, Reload.Watch, contract-first mode, release workflow with NuGet trusted publishing.`,
	},
	python: {
		tier: 'tier1',
		gaps: [],
		evidence: `${beta}. CI on Python 3.10 to 3.13 and the minimum dependencies, orders smoke test, reload="watch", contract-first mode, release workflow.`,
	},
	ruby: {
		tier: 'tier1',
		gaps: [],
		evidence: `${beta}. CI on Ruby 3.2, 3.3 and 3.4, orders smoke test, reload: :watch, contract-first mode, release workflow.`,
	},
	java: {
		tier: 'tier1',
		gaps: [],
		evidence: `${beta}. CI on Java 17 and 21 with Spring Boot 3.5 and 4.1, orders smoke test, reload = WATCH, contract-first mode, release workflow.`,
	},
	kotlin: {
		tier: 'tier1',
		gaps: [],
		evidence: `${beta}. CI on Java 17 and 21, orders smoke test, Watched<...> file inputs, contract-first mode, release workflow.`,
	},
	rust: {
		tier: 'tier1',
		gaps: [],
		evidence: `${beta}. CI on Rust stable and 1.89, orders smoke test, Watched<T> file inputs, contract-first mode, release workflow.`,
	},
	swift: {
		tier: 'tier1',
		gaps: [],
		evidence: `${beta} (with the TLS trait). CI on Swift 6.2 and 6.3, orders smoke test, .reload(.watch), contract-first mode, release workflow.`,
	},
	elixir: {
		tier: 'tier1',
		gaps: [],
		evidence: `${beta}. CI on Elixir 1.18 and 1.19 with OTP 25, 27 and 28, orders smoke test, reload: :watch with Docuconf.Watcher, contract-first mode, release workflow.`,
	},
	cpp: {
		tier: 'tier1',
		gaps: [],
		evidence: `${beta}. CI with gcc and clang, plus bare-machine builds, orders smoke test, Watched<T> file inputs, contract-first mode, release workflow.`,
	},
	laravel: {
		tier: 'tier1',
		gaps: [],
		evidence: `${beta} (docuconf-php). CI on PHP 8.2, 8.3 and 8.4, orders smoke test, reload('watch') on file inputs, contract-first mode, release workflow.`,
	},
	symfony: {
		tier: 'tier1',
		gaps: [],
		evidence: `${beta} (docuconf-php). CI on PHP 8.2 to 8.4 with Symfony 6.4, 7.4 and 8.0, orders-symfony smoke test, reload('watch') on file inputs, contract-first mode, release workflow.`,
	},
	gleam: {
		tier: 'tier2',
		gaps: [
			'On the JavaScript target, the export check has one accepted difference: an int with no bounds exports min and max of ±(2^53 − 1), the integers that target holds.',
			'Contract-first mode rejects reload: watch (a declaration offers it).',
		],
		evidence:
			'All 316 cases of the beta suite on both the Erlang and JavaScript targets, none skipped. The export matches exactly on Erlang. CI on both targets, orders smoke test, contract-first mode, release workflow.',
	},
	cobol: {
		tier: 'experimental',
		gaps: [
			'A niche runtime, supported on a best-effort basis.',
			'The export check has six accepted differences: PIC sizes give OLD_PORT a min and max, PARTNER_PASSWORD a maxLength and SHARDS a maxItems, and the two reload: watch file inputs export restart.',
			'No reload: watch: the loader reads a path once.',
			'No contract-first mode of its own: docuconf exec runs the checks, then starts the program.',
			'CI runs one GnuCOBOL toolchain.',
		],
		evidence:
			'All 316 cases of the beta suite pass under docuconf exec, none skipped, and the generated loader alone passes every case it can check. Orders smoke test and release workflow.',
	},
};
