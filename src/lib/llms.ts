// llms.txt and llms-full.txt (https://llmstxt.org), generated from the same
// data as the /spec pages.
import { EXAMPLE_CONFIG, readmeRaw, repoPath, SDK_ROWS, type SdkRow } from './sdk-data';
import { plain } from './text';
import { absolute, SPEC_SOURCE_URL } from './seo';
import { SDK_TIERS, TIER_LABEL, TIERS } from './sdk-tiers';
import { apiVersionOf, CURRENT_SPEC, prUrl, SPEC_PAGES, SPEC_VERSIONS, specPath, specSourceUrl } from './spec-versions';
import {
	API_VERSION,
	DURATION_ENCODINGS,
	ERROR_CODES,
	FILE_FIELDS,
	FILE_SOURCES,
	FILE_TYPES,
	INJECTORS,
	KIND,
	LIST_ENCODINGS,
	OUTPUTS,
	OVERLAY_HOSTS,
	SDK_MUSTS,
	SDK_SHOULDS,
	SPEC_FAQ,
	STATUS_LABEL,
	VALUE_SOURCES,
	VAR_FIELDS,
	VAR_TYPES,
} from './spec-data';

const SUMMARY = `docuconf is an open-source project for typed configuration contracts between an application and the Kubernetes platform that runs it. Each language SDK extends that language's leading config library and exports a ${KIND} (apiVersion ${API_VERSION}) as contract.cue, or the same as JSON. From it docuconf generates a Helm values schema, the pod's env, volumes and ConfigMaps, and docs for developers and agents (${absolute('/spec/outputs/')}). The platform validates the values, files and secrets it will supply against the contract before deploying (docuconf CLI, CUE/Crossplane, or a Helm values schema), and the SDK validates the real environment again at boot.`;

/** The install command a Get started page shows, on one line. */
export function installCommand(row: SdkRow): string {
	const c = row.checks.find((c) => c.id === row.guide.install.check);
	const lines = (c?.show ?? c?.run ?? '').split('\n').filter(Boolean);
	return lines.join(' && ');
}

/** "Tier 1", or "Tier 2 (gap: ...)". */
const tierText = (r: SdkRow) => {
	const t = SDK_TIERS[r.slug];
	return t ? `${TIER_LABEL[t.tier]}${t.gaps.length ? ` (gap: ${t.gaps.join(' ')})` : ''}` : '';
};

/** Every spec version, one line each: which is current, which is a draft. */
const versionLines = () =>
	SPEC_VERSIONS.map(
		(v) =>
			`- ${v.version} (apiVersion ${apiVersionOf(v.version)}), ${v.status.toUpperCase()}: ${absolute(specPath(v.version))}. ${v.summary}${
				v.prs?.length ? ` Not final: from docuconf-go pull requests ${v.prs.map((n) => `#${n}`).join(', ')}, not merged.` : ''
			} Source: ${specSourceUrl(v.version)}`,
	).join('\n');

const sdkLine = (r: SdkRow) => {
	const install = installCommand(r);
	const files = r.guide.install.files?.length ? ` plus the ${r.guide.install.files.map((f) => f.title).join(' and ')} lines on the page` : '';
	return `- [docuconf for ${r.name}](${absolute(`/languages/${r.slug}/`)}): ${tierText(r)}, on ${r.host}. Install: \`${install}\`${files}. [README](${readmeRaw(r)}), [orders example](${repoPath(r.repo, r.example.path)}). ${plain(r.summary)}`;
};

export function llmsTxt(): string {
	return `# docuconf

> ${SUMMARY}

docuconf covers environment variables (9 types), file inputs (config files, TLS key pairs, CA bundles, keystores, text, binary), Kubernetes value and file sources, runtime secret injection (Bank-Vaults, Vault Agent) and config-file overlays (.NET appsettings, Spring, Rails). It is not a feature-flag system; flags belong in OpenFeature.

## Specification

The current version is ${CURRENT_SPEC.version}: write contracts with apiVersion ${apiVersionOf(CURRENT_SPEC.version)}. /spec/ always serves the current version; /spec/<version>/ serves any version.

${versionLines()}

- [Core specification](${absolute('/spec/')}): overview, the three checks, FAQ
- [Inputs](${absolute('/spec/inputs/')}): variable types, value sources, injection, file types and sources, secret rotation, overlays, wire encodings, profiles
- [Outputs](${absolute('/spec/outputs/')}): every generation target and its status
- [Generated docs](${absolute('/spec/generated-docs/')}): description and details, the docs model, \`docuconf docs\`, CONFIG.md for developers and CONFIG.agents.md for agents, and where each SDK takes the text from
- [SDK requirements](${absolute('/spec/sdk-requirements/')}): what every language SDK must support, error codes, SDK status
- [Versioning and deprecation](${absolute('/versioning/')}): what alpha, beta and stable promise, release versions, how fields and APIs are deprecated, the move to v1beta1
- [Full specification as plain text](${absolute('/llms-full.txt')}): the current version, ${CURRENT_SPEC.version}
- [Normative SPEC.md](${SPEC_SOURCE_URL})

## Get started

- [Get started: pick a language](${absolute('/languages/')}), with the SDK tiers and their criteria (${absolute('/languages/#tiers')})
- [Example apps](${absolute('/examples/')}): the same "orders" service in every SDK, side by side

No SDK is on a package registry yet (all are v0.1 alphas), so each installs from its main branch. Each line: the Get started page (install, declare, boot error, test, export), the install command, the raw README and the example's declaration.

${SDK_ROWS.map(sdkLine).join('\n')}

## Project

- [Vision](${absolute('/vision/')})
- [How it works](${absolute('/how-it-works/')})
- [Config is not feature flags](${absolute('/feature-flags/')})
- [Roadmap](${absolute('/roadmap/')})
- [Get involved](${absolute('/community/')})
- [Security](${absolute('/security/')}): report vulnerabilities through GitHub private vulnerability reporting

## Optional

- [Structured data (JSON-LD)](${absolute('/docuconf.jsonld')})
`;
}

const table = (head: string[], rows: string[][]) =>
	[`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');

export function llmsFullTxt(): string {
	return `# docuconf core specification (${API_VERSION})

> ${SUMMARY}

Version: ${CURRENT_SPEC.version}, the current version. This file describes it; the draft below is not final.
Source: ${absolute('/spec/')} — normative text: ${SPEC_SOURCE_URL}
Versions:
${versionLines()}
Versioning and deprecation policy: ${absolute('/versioning/')}
Status labels: Implemented (works today), Specified, not built (in the spec), Planned (roadmap).

## Inputs

### Variable types

${table(
	['Type', 'Meaning', 'Constraint fields', 'Platform value', 'Wire form'],
	VAR_TYPES.map((t) => [t.type, t.summary, t.constraints, t.platformValue, t.wire]),
)}

### Variable fields

${table(['Field', 'Rule'], VAR_FIELDS.map((f) => [f.field, f.rule]))}

### Value sources

${table(
	['Source', 'Example', 'Allowed for', 'Checked', 'Status'],
	VALUE_SOURCES.map((s) => [s.source, s.example, s.allowedFor, s.checked, STATUS_LABEL[s.status ?? 'implemented']]),
)}

### Cloud-native injection

SDKs read the process environment when the process starts, after any injector has run, and validate injected values like any other. The platform declares injected inputs as \`injected\` with the provider and, when the injector reads it from the env value, the reference.

${table(['Injector', 'What it does', 'How the contract describes it'], INJECTORS.map((i) => [i.name, i.how, i.docuconf]))}

### File types

${table(['Type', 'Content', 'Constraint fields', 'Secret'], FILE_TYPES.map((t) => [t.type, t.content, t.constraints, t.secret]))}

### File fields

${table(['Field', 'Rule'], FILE_FIELDS.map((f) => [f.field, f.rule]))}

### File sources

${table(
	['Source', 'For', 'Checked before deploy', 'Status'],
	FILE_SOURCES.map((s) => [s.source, s.forTypes, s.checkedBeforeDeploy, STATUS_LABEL[s.status ?? 'implemented']]),
)}

### Config-file overlays

Hosts that layer config files load a platform-mounted overlay between their baked-in files and environment variables: base file < profile file < platform overlay < environment variables. The contract declares the overlay's format, path and reload; the platform writes values at each variable's configKey in native types, in a ConfigMap. Overlays add to the baked-in files and never replace them. Secrets never go in an overlay.

${table(['Host', 'Baked-in files', 'Platform overlay', 'Reload'], OVERLAY_HOSTS.map((h) => [h.host, h.base, h.overlay, h.reload]))}

### Wire encodings

${table(['List encoding', 'Wire form', 'Native to'], LIST_ENCODINGS.map((e) => [e.encoding, e.wire, e.nativeTo]))}

${table(['Duration encoding', 'Wire form for 90s', 'Native to'], DURATION_ENCODINGS.map((e) => [e.encoding, e.wire, e.nativeTo]))}

## Outputs

${table(
	['Output', 'Artifact', 'Produced by', 'Consumed by', 'Status', 'Notes'],
	OUTPUTS.map((o) => [o.name, o.artifact, o.producedBy, o.consumedBy, STATUS_LABEL[o.status], o.notes]),
)}

## Generated docs

Every input has a description (required, plain text, at least 5 characters) and may have details (optional CommonMark, at most 4000 Unicode code points, never read at runtime). SDKs export both from the app's doc comments into the contract. \`docuconf docs <contract.cue | contract.json | docs.json> [--format model|markdown|agents] [-o file | --check file]\` builds a docs model (docs.json, kind ConfigDocs, apiVersion docs.docuconf.dev/v1alpha1) from the contract and renders it: CONFIG.md for developers (\`--format markdown\`, the default) and CONFIG.agents.md for coding and ops agents (\`--format agents\`). \`--check\` exits 1 with a diff when a committed file is out of date. Details: ${absolute('/spec/generated-docs/')}

${table(['SDK', 'description', 'details'], SDK_ROWS.map((r) => [r.name, plain(r.docs.description), plain(r.docs.details)]))}

## SDK requirements

A conforming SDK extends its language's leading config library (it never replaces it) and must:

${SDK_MUSTS.map((m, i) => `${i + 1}. ${m.title}. ${m.detail}`).join('\n')}

It should:

${SDK_SHOULDS.map((m) => `- ${m.title}. ${m.detail}`).join('\n')}

### Boot-time error codes

${table(['Code', 'Meaning'], ERROR_CODES.map((e) => [e.code, e.meaning]))}

### SDKs

${table(
	['SDK', 'Package', 'Host library', 'Lists', 'Durations', 'Profiles', 'reload: watch', 'Conformance'],
	SDK_ROWS.map((r) => [r.name, r.package, r.host, r.lists, r.durations, r.profiles, r.watch, r.conformance]),
)}

### Example apps

Every SDK repository has the same runnable example, an "orders" service (${EXAMPLE_CONFIG.map((v) => v.name).join(', ')}), with its exported contract.cue checked in CI:

${SDK_ROWS.map((r) => `- ${r.name} (${r.example.label}): ${repoPath(r.repo, r.example.path)}`).join('\n')}

### Install (until the first release)

${SDK_ROWS.map((r) => `- ${r.name}: \`${installCommand(r)}\`; after the first release: \`${r.guide.install.registry}\`. Guide: ${absolute(`/languages/${r.slug}/`)}`).join('\n')}

### SDK tiers

${TIERS.map((t) => `- ${t.label}: ${t.criteria.join('; ')}.`).join('\n')}

${table(['SDK', 'Tier', 'Gap', 'Evidence'], SDK_ROWS.map((r) => {
	const t = SDK_TIERS[r.slug];
	return [r.name, t ? TIER_LABEL[t.tier] : '', t?.gaps.join(' ') || '—', t?.evidence ?? ''];
}))}

## Draft: v1beta1 (not final)

${draftSection()}

## FAQ

${SPEC_FAQ.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}
`;
}

/** What the draft versions change, for llms-full.txt. */
function draftSection(): string {
	return SPEC_VERSIONS.filter((v) => v.status === 'draft')
		.map(
			(v) => `${v.version} (apiVersion ${apiVersionOf(v.version)}) is a draft: it does not exist yet, and contracts stay on ${CURRENT_SPEC.version} until the format freeze. Pages: ${SPEC_PAGES.map((p) => absolute(specPath(v.version, p.slug))).join(', ')}. Pull requests: ${(v.prs ?? []).map(prUrl).join(', ')}.

Planned changes from ${CURRENT_SPEC.version}:
- keySet: a secret variable type for keys that are valid at once (minKeys, maxKeys, keyMinLength, keyMaxLength), for rotating a webhook or API key without an outage.
- deprecated inputs: {message, replacedBy?} on a variable or file; the platform gets a warning (deprecatedSet), never an error, and SDKs warn at boot. A required input cannot be deprecated.
- Exact parsing: one rule per type, whatever the host accepts. Values are never trimmed; bool is true or false in any case; int is base 10; floats reject inf, NaN, hex and .5.
- Field tables: the docs model turns a JSON Schema into a table of fields; every key set gets the rotation steps.
- The conformance suite covers files, profiles, overlays, key sets, deprecated inputs and strict parsing, and checks every SDK's export against one golden contract. Only int64 and json-schema may be skipped.
- docuconf diff classifies contract changes (compatible, notable, breaking-platform, breaking); docuconf push and pull ship a contract as an OCI artifact referring to the image digest.
- Migration: for a ${CURRENT_SPEC.version} contract, only apiVersion changes. Once out, ${v.version} is additive only.`,
		)
		.join('\n\n');
}
