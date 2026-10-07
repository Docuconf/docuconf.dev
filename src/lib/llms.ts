// llms.txt and llms-full.txt (https://llmstxt.org), generated from the same
// data as the /spec pages.
import { EXAMPLE_CONFIG, repoPath, SDK_ROWS } from './sdk-data';
import { absolute, SDKS, SPEC_SOURCE_URL } from './seo';
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

const SUMMARY = `docuconf is an open-source project for typed configuration contracts between an application and the Kubernetes platform that runs it. Each language SDK extends that language's leading config library and exports a ${KIND} (apiVersion ${API_VERSION}) in CUE. The platform validates the values, files and secrets it will supply against the contract before deploying (docuconf CLI, CUE/Crossplane, or a Helm values schema), and the SDK validates the real environment again at boot.`;

export function llmsTxt(): string {
	return `# docuconf

> ${SUMMARY}

docuconf covers environment variables (9 types), file inputs (config files, TLS key pairs, CA bundles, keystores, text, binary), Kubernetes value and file sources, runtime secret injection (Bank-Vaults, Vault Agent) and config-file overlays (.NET appsettings, Spring, Rails). It is not a feature-flag system; flags belong in OpenFeature.

## Specification

- [Core specification](${absolute('/spec/')}): overview, the three checks, FAQ
- [Inputs](${absolute('/spec/inputs/')}): variable types, value sources, injection, file types and sources, overlays, wire encodings, profiles
- [Outputs](${absolute('/spec/outputs/')}): every generation target and its status
- [SDK requirements](${absolute('/spec/sdk-requirements/')}): what every language SDK must support, error codes, SDK status
- [Full specification as plain text](${absolute('/llms-full.txt')})
- [Normative SPEC.md](${SPEC_SOURCE_URL})

## Project

- [Vision](${absolute('/vision/')})
- [How it works](${absolute('/how-it-works/')})
- [Languages](${absolute('/languages/')})
- [Config is not feature flags](${absolute('/feature-flags/')})
- [Roadmap](${absolute('/roadmap/')})

## SDKs

${SDKS.map((s) => `- [docuconf for ${s.language}](https://github.com/docuconf/${s.repo}): on ${s.host}`).join('\n')}

## Optional

- [Structured data (JSON-LD)](${absolute('/docuconf.jsonld')})
`;
}

const table = (head: string[], rows: string[][]) =>
	[`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');

export function llmsFullTxt(): string {
	return `# docuconf core specification (${API_VERSION})

> ${SUMMARY}

Source: ${absolute('/spec/')} — normative text: ${SPEC_SOURCE_URL}
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

## SDK requirements

A conforming SDK extends its language's leading config library (it never replaces it) and must:

${SDK_MUSTS.map((m, i) => `${i + 1}. ${m.title}. ${m.detail}`).join('\n')}

It should:

${SDK_SHOULDS.map((m) => `- ${m.title}. ${m.detail}`).join('\n')}

### Boot-time error codes

${table(['Code', 'Meaning'], ERROR_CODES.map((e) => [e.code, e.meaning]))}

### SDKs

${table(
	['Language', 'Package', 'Host library', 'Lists', 'Durations', 'Profiles', 'reload: watch', 'Conformance'],
	SDK_ROWS.map((r) => [r.language, r.package, r.host, r.lists, r.durations, r.profiles, r.watch, r.conformance]),
)}

### Example apps

Every SDK repository has the same runnable example, an "orders" service (${EXAMPLE_CONFIG.map((v) => v.name).join(', ')}), with its exported contract.cue checked in CI:

${SDK_ROWS.flatMap((r) => r.examples.map((e) => `- ${r.language} (${e.label}): ${repoPath(r.repo, e.path)}`)).join('\n')}

## FAQ

${SPEC_FAQ.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}
`;
}
