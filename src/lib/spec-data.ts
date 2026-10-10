// The core specification as data. The /spec pages render their tables from
// this module, and the JSON-LD (per page and /docuconf.jsonld) is built from
// it too, so what answer engines read is exactly what people read.
//
// Source of truth: SPEC.md in docuconf/docuconf-go (v1alpha1). Keep in sync.
// This module is v1alpha1's data. Other versions build theirs from it in src/content/spec/<version>/data.ts
// (see src/lib/spec-versions.ts), and the table components take a version's data as their `spec` prop.

import { LANGUAGES } from './sdk-data';

export const SPEC_VERSION = 'v1alpha1';
export const API_VERSION = 'docuconf.dev/v1alpha1';
export const KIND = 'ConfigContract';

/** implemented: works today. specified: in the spec, not built yet. planned: on the roadmap, not yet specified. */
export type Status = 'implemented' | 'specified' | 'planned';

export const STATUS_LABEL: Record<Status, string> = {
	implemented: 'Implemented',
	specified: 'Specified, not built',
	planned: 'Planned',
};

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export type VarType = {
	type: string;
	summary: string;
	constraints: string;
	platformValue: string;
	wire: string;
};

export const VAR_TYPES: VarType[] = [
	{
		type: 'string',
		summary: 'Free text.',
		constraints: 'minLength, maxLength (in characters), pattern (RE2, matches anywhere unless anchored)',
		platformValue: 'string',
		wire: 'as is',
	},
	{
		type: 'int',
		summary: '64-bit signed integer. SDKs export narrower host ranges as min/max.',
		constraints: 'min, max',
		platformValue: 'int',
		wire: 'base-10, no leading + or zeros: 8080',
	},
	{
		type: 'float',
		summary: 'Finite decimal number, parsed independently of locale.',
		constraints: 'min, max',
		platformValue: 'number',
		wire: 'shortest round-trip decimal: 0.5',
	},
	{
		type: 'bool',
		summary: 'true or false, case-insensitive.',
		constraints: '—',
		platformValue: 'bool',
		wire: 'true / false',
	},
	{
		type: 'duration',
		summary: 'A length of time, written in Go syntax on the platform side.',
		constraints: 'min, max (durations), encoding',
		platformValue: 'Go-syntax duration: 1m30s',
		wire: 'per encoding: go, iso8601, seconds or timespan',
	},
	{
		type: 'url',
		summary: 'An absolute URL with a scheme.',
		constraints: 'schemes, maxLength (the URL as it is)',
		platformValue: 'string with scheme://',
		wire: 'as is',
	},
	{
		type: 'enum',
		summary: 'One of a fixed set of strings.',
		constraints: 'values (non-empty)',
		platformValue: 'one of values',
		wire: 'as is',
	},
	{
		type: 'list',
		summary: 'A list of strings or integers.',
		constraints: 'items (string | int), encoding, separator, minItems, maxItems, itemMin and itemMax (int items), itemMinLength and itemMaxLength (string items, after splitting)',
		platformValue: 'list',
		wire: 'per encoding: csv, json or indexed',
	},
	{
		type: 'json',
		summary: 'A structured value, checked against a JSON Schema generated from the app’s own type.',
		constraints: 'schema (JSON Schema), maxLength (the wire string)',
		platformValue: 'any JSON value',
		wire: 'compact JSON',
	},
];

export const VAR_FIELDS: { field: string; rule: string }[] = [
	{ field: 'type', rule: 'One of the variable types. The set is closed in v1alpha1.' },
	{ field: 'description', rule: 'Required. Plain text, at least 5 characters: what the input is, in one phrase. Rendered into generated docs.' },
	{ field: 'details', rule: 'Optional. CommonMark: why the input exists and when to change it. Not blank, at most 4000 characters. Used only in generated docs, never at runtime.' },
	{ field: 'required', rule: 'Default false. A required variable cannot have a default.' },
	{ field: 'default', rule: 'Must satisfy the variable’s own constraints (checked at declaration time).' },
	{ field: 'secret', rule: 'The value must come from a secretKeyRef. No default, no examples, never printed.' },
	{ field: 'group', rule: 'Free-form grouping for docs.' },
	{ field: 'examples', rule: 'Example values, as strings, for docs.' },
	{ field: 'deprecated', rule: '{message, replacedBy?}. SDKs warn at boot when it is set.' },
	{ field: 'configKey', rule: 'The app’s own config key (Orders:Timeout, orders.timeout), for docs.' },
];

export type ValueSource = { source: string; example: string; allowedFor: string; checked: string; status?: Status };

export const VALUE_SOURCES: ValueSource[] = [
	{ source: 'literal', example: 'PORT: 9090', allowedFor: 'every non-secret type', checked: 'before deploy' },
	{
		source: 'configMapKeyRef',
		example: '{configMapKeyRef: {name: "limits", key: "rate"}}',
		allowedFor: 'every non-secret type except list',
		checked: 'at boot',
	},
	{
		source: 'fieldRef (Downward API)',
		example: '{fieldRef: {fieldPath: "metadata.namespace"}}',
		allowedFor: 'string',
		checked: 'always valid',
	},
	{
		source: 'resourceFieldRef',
		example: '{resourceFieldRef: {resource: "limits.memory"}}',
		allowedFor: 'int',
		checked: 'always valid',
	},
	{
		source: 'secretKeyRef',
		example: '{secretKeyRef: {name: "db", key: "url"}}',
		allowedFor: 'secret variables (one of the two secret sources)',
		checked: 'at boot',
	},
	{
		source: 'injected, with a reference',
		example: '{injected: {provider: "bank-vaults", ref: "vault:secret/data/db#url"}}',
		allowedFor: 'every type, including secrets; rendered verbatim as the env value for the injector to resolve',
		checked: 'reference shape before deploy; the value at boot',
	},
	{
		source: 'injected, without a reference',
		example: '{injected: {provider: "otel-operator"}}',
		allowedFor: 'every type, including secrets; not rendered: a webhook, init process or operator sets it',
		checked: 'at boot',
	},
];

/** Tools that put configuration into a process at runtime. All of them end in the process environment or a file. */
export const INJECTORS: { name: string; how: string; docuconf: string }[] = [
	{
		name: 'Bank-Vaults (vault-env webhook)',
		how: 'Env values like vault:secret/data/db#url are resolved by vault-env, which then execs the app with real values.',
		docuconf: 'injected value source with ref; the SDK sees and validates the resolved value.',
	},
	{
		name: 'Vault Agent injector',
		how: 'Writes secrets as files under /vault/secrets, rendered from templates.',
		docuconf: 'injected file source, with the pod annotations that make the agent write the file at its declared path; the SDK checks the file at boot like any other.',
	},
	{
		name: 'External Secrets Operator',
		how: 'Syncs a cloud secret manager into a Kubernetes Secret.',
		docuconf: 'secretKeyRef or secret file source, as usual; nothing special.',
	},
	{
		name: 'Secrets Store CSI driver',
		how: 'Mounts secrets from Vault, AWS, Azure or GCP as files.',
		docuconf: 'csi file source.',
	},
	{
		name: '1Password, Doppler, Infisical and similar wrappers',
		how: 'A wrapper process (op run, doppler run) resolves references and execs the app.',
		docuconf: 'injected value source, with the wrapper’s reference format as ref.',
	},
	{
		name: 'Operators and webhooks (OpenTelemetry, service meshes)',
		how: 'Add variables such as OTEL_EXPORTER_OTLP_ENDPOINT to the pod.',
		docuconf: 'injected value source without ref, so the platform knows who supplies it, with the pod annotation or label that switches the injector on.',
	},
];

// ---------------------------------------------------------------------------
// Config-file overlays
// ---------------------------------------------------------------------------

export const OVERLAY_HOSTS: { host: string; base: string; overlay: string; reload: string }[] = [
	{
		host: '.NET (Microsoft.Extensions.Configuration)',
		base: 'appsettings.json, appsettings.{Environment}.json',
		overlay: 'AddJsonFile("/app/config/appsettings.Production.json", optional: true, reloadOnChange: true)',
		reload: 'IOptionsMonitor<T> sees changes; IOptions<T> needs a restart',
	},
	{
		host: 'Spring Boot',
		base: 'application.yml, application-{profile}.yml',
		overlay: 'spring.config.additional-location=file:/app/config/',
		reload: 'restart, or Spring Cloud refresh',
	},
	{
		host: 'Rails (anyway_config)',
		base: 'config/<name>.yml',
		overlay: 'an extra YAML file read before env',
		reload: 'restart',
	},
	{
		host: 'Rust (figment)',
		base: 'Config.toml with profiles',
		overlay: 'Toml::file("/app/config/Config.toml") merged before Env',
		reload: 'restart',
	},
	{
		host: 'Kotlin (Hoplite)',
		base: 'application.conf / .yaml',
		overlay: 'an extra property source ahead of the defaults',
		reload: 'restart, or Hoplite reloadable config',
	},
];

export type FileType = { type: string; content: string; constraints: string; secret: string };

export const FILE_TYPES: FileType[] = [
	{
		type: 'config',
		content: 'A structured config file in format json, yaml or toml.',
		constraints: 'format, schema (JSON Schema generated from the type the app binds the file to)',
		secret: 'optional',
	},
	{
		type: 'tls',
		content: 'A key pair in the kubernetes.io/tls layout: tls.crt, tls.key, and ca.crt when requireCA is set.',
		constraints: 'dnsNames, keyAlgorithms (RSA, ECDSA, Ed25519), minRemaining, requireCA',
		secret: 'always',
	},
	{
		type: 'caBundle',
		content: 'One or more PEM CA certificates.',
		constraints: 'minCertificates (default 1)',
		secret: 'optional',
	},
	{
		type: 'keystore',
		content: 'A PKCS#12 or JKS keystore.',
		constraints: 'format, passwordVar (a declared secret variable)',
		secret: 'always',
	},
	{
		type: 'text',
		content: 'A text file, such as a licence key.',
		constraints: 'pattern (RE2), minLength, maxLength',
		secret: 'optional',
	},
	{ type: 'binary', content: 'Opaque bytes, such as a GeoIP database.', constraints: 'maxSize only', secret: 'optional' },
];

export const FILE_FIELDS: { field: string; rule: string }[] = [
	{ field: 'type', rule: 'One of the file types.' },
	{ field: 'description, details, required, group, deprecated', rule: 'As for variables.' },
	{ field: 'secret', rule: 'Content must come from a secret store. Forced true for tls and keystore.' },
	{ field: 'path', rule: 'Where the app reads it: a directory for tls, a file otherwise. Absolute.' },
	{ field: 'pathEnv', rule: 'A variable the platform sets to path (SSL_CERT_FILE). Not also declared in vars.' },
	{ field: 'reload', rule: 'restart (default): a changed source rolls the pods. watch: the app reloads it.' },
	{ field: 'maxSize', rule: 'Upper bound in bytes.' },
];

export type FileSource = { source: string; forTypes: string; checkedBeforeDeploy: string; status?: Status };

export const FILE_SOURCES: FileSource[] = [
	{
		source: 'inline',
		forTypes: 'non-secret files',
		checkedBeforeDeploy:
			'Everything: format, schema, pattern, size, certificate count. Rendered as an immutable, content-hashed ConfigMap. Config files may be given as structured data.',
	},
	{ source: 'configMap', forTypes: 'non-secret files', checkedBeforeDeploy: 'That a key is given for single files.' },
	{
		source: 'secret',
		forTypes: 'any',
		checkedBeforeDeploy:
			'Key presence; with resolved metadata, the Secret’s type (kubernetes.io/tls) and its keys.',
	},
	{
		source: 'certificate (cert-manager)',
		forTypes: 'tls',
		checkedBeforeDeploy:
			'From the Certificate spec: covers dnsNames, uses an allowed key algorithm, renewBefore ≥ minRemaining.',
	},
	{ source: 'csi (Secrets Store CSI driver)', forTypes: 'any', checkedBeforeDeploy: 'Nothing; checked at boot.' },
	{
		source: 'image (image volume)',
		forTypes: 'non-secret files',
		checkedBeforeDeploy: 'Nothing; for data above the 1 MiB ConfigMap limit.',
	},
	{
		source: 'injected (Vault Agent and similar)',
		forTypes: 'any',
		checkedBeforeDeploy: 'That the injector is named, and its pod annotations and labels; no volume is rendered, the injector writes the file at path. Checked at boot.',
	},
];

export const LIST_ENCODINGS = [
	{ encoding: 'csv (default)', wire: 'a,b joined by separator', nativeTo: 'caarlos0/env, Spring Boot, anyway_config' },
	{ encoding: 'json', wire: '["a","b"]', nativeTo: 'pydantic-settings' },
	{ encoding: 'indexed', wire: 'NAME__0=a, NAME__1=b', nativeTo: 'Microsoft.Extensions.Configuration' },
];

export const DURATION_ENCODINGS = [
	{ encoding: 'go (default)', wire: '1m30s', nativeTo: 'Go time.ParseDuration' },
	{ encoding: 'iso8601', wire: 'PT1M30S', nativeTo: 'pydantic timedelta, ActiveSupport::Duration, java.time.Duration (Spring)' },
	{ encoding: 'seconds', wire: '90', nativeTo: 'anything that takes a number' },
	{ encoding: 'timespan', wire: '00:01:30', nativeTo: '.NET TimeSpan.Parse' },
];

// ---------------------------------------------------------------------------
// Outputs (generation targets)
// ---------------------------------------------------------------------------

export type Output = {
	id: string;
	name: string;
	artifact: string;
	producedBy: string;
	consumedBy: string;
	status: Status;
	notes: string;
};

export const OUTPUTS: Output[] = [
	{
		id: 'contract-cue',
		name: 'Contract (CUE)',
		artifact: 'contract.cue',
		producedBy: 'Every language SDK’s export',
		consumedBy: 'The platform: docuconf CLI, CUE, Crossplane, Helm',
		status: 'implemented',
		notes: `Plain data that unifies with #Contract: kind ${KIND}, apiVersion ${API_VERSION}. Deterministic, sorted by name.`,
	},
	{
		id: 'contract-json',
		name: 'Contract (JSON)',
		artifact: 'contract.json',
		producedBy: 'cue export, docuconf helm',
		consumedBy: 'Tools without CUE; the Helm library chart (files/docuconf/contract.json)',
		status: 'implemented',
		notes: 'A lossless JSON form of the same contract.',
	},
	{
		id: 'validation-report',
		name: 'Validation report',
		artifact: 'one line per problem; exit code 1',
		producedBy: 'docuconf vet, #Validate',
		consumedBy: 'CI before merge; the Crossplane function at composition',
		status: 'implemented',
		notes: 'Checks values, file sources and platform policy together. Secret values are never printed.',
	},
	{
		id: 'pod-render',
		name: 'Pod configuration',
		artifact: 'env, volumes, volumeMounts, configMaps, restartTriggers, podAnnotations, podLabels',
		producedBy: 'docuconf render, #Render',
		consumedBy: 'Deployments and other pod templates',
		status: 'implemented',
		notes: 'Values in each app’s wire encoding, $ escaped, files projected with items (never subPath), inline content as content-hashed ConfigMaps, and the pod-template annotations and labels injectors need.',
	},
	{
		id: 'helm-values-schema',
		name: 'Helm values schema',
		artifact: 'values.schema.json + files/docuconf/contract.json',
		producedBy: 'docuconf helm, #HelmValuesSchema',
		consumedBy: 'Helm 3 and 4 on lint, template, install and upgrade',
		status: 'implemented',
		notes: 'JSON Schema draft-07: types, ranges, enums, required inputs, unknown names, secrets only as references, config-file content.',
	},
	{
		id: 'helm-library',
		name: 'Helm library chart',
		artifact: 'docuconf.env, .volumes, .volumeMounts, .configMaps, .reloaderAnnotations, .podAnnotations, .podLabels',
		producedBy: 'helm/docuconf chart',
		consumedBy: 'App charts',
		status: 'implemented',
		notes: 'Renders the same env, volumes and mounts as #Render; tested for parity on Helm 3 and 4.',
	},
	{
		id: 'boot-report',
		name: 'Boot-time violation report',
		artifact: 'all violations with stable error codes; /dev/termination-log',
		producedBy: 'Each language SDK at startup',
		consumedBy: 'Operators, kubectl describe pod',
		status: 'implemented',
		notes: 'Covers what the platform cannot see: secret contents, certificate expiry and key match, file contents.',
	},
	{
		id: 'config-overlay',
		name: 'Config-file overlay',
		artifact: 'a host-format file (appsettings.Production.json, application.yml, Config.toml) in a ConfigMap',
		producedBy: 'docuconf render and the Helm library chart, for variables the platform routes to an overlay',
		consumedBy: 'Hosts that layer config files: .NET, Spring, Rails, figment, Hoplite',
		status: 'implemented',
		notes: 'Values are placed at each variable’s configKey in native types, mounted at the overlay’s path; reload: watch maps to the host’s reload-on-change.',
	},
	{
		id: 'oci-artifact',
		name: 'OCI contract artifact',
		artifact: 'application/vnd.docuconf.contract.v1alpha1+cue, referring to the image digest',
		producedBy: 'docuconf push (CI)',
		consumedBy: 'The platform, which validates the contract of the exact image it deploys',
		status: 'specified',
		notes: 'Prevents validating image B against contract A. Signable with cosign.',
	},
	{
		id: 'compat-report',
		name: 'Compatibility report',
		artifact: 'each change classified compatible, breaking or notable',
		producedBy: 'docuconf diff old.cue new.cue',
		consumedBy: 'CI merge gates',
		status: 'specified',
		notes: 'Blocks unacknowledged breaking changes, such as a new required variable.',
	},
	{
		id: 'crossplane-function',
		name: 'Crossplane composition function',
		artifact: 'ContractValid condition and patched env/volumes',
		producedBy: 'function-docuconf',
		consumedBy: 'Crossplane v2 composition pipelines',
		status: 'specified',
		notes: 'Validates at composition time and injects the rendered configuration into the composed workload.',
	},
	{
		id: 'markdown-docs',
		name: 'Configuration docs',
		artifact: 'CONFIG.md for developers, CONFIG.agents.md for coding and ops agents',
		producedBy: 'docuconf docs',
		consumedBy: 'Developers, AI agents, an AGENTS.md or llms.txt',
		status: 'implemented',
		notes: 'Rendered from the docs model, which is built from the contract, so docs cannot drift from code. Each input’s description and details come from its doc comment in the app.',
	},
	{
		id: 'docs-model',
		name: 'Docs model',
		artifact: 'docs.json (kind ConfigDocs, apiVersion docs.docuconf.dev/v1alpha1)',
		producedBy: 'docuconf docs --format model',
		consumedBy: 'Renderers: the CLI, a website, an MCP server, a Backstage plugin',
		status: 'implemented',
		notes: 'Every fact a renderer shows, already phrased, checked against #DocsModel. Secrets never have a value in it.',
	},
	{
		id: 'json-schema',
		name: 'Standalone values JSON Schema',
		artifact: 'values.schema.json for any values file',
		producedBy: 'docuconf schema',
		consumedBy: 'Argo CD, Kustomize users, IDEs',
		status: 'planned',
		notes: 'The Helm schema without the chart wrapper.',
	},
	{
		id: 'knative',
		name: 'Knative Service template',
		artifact: 'ksvc spec.template env and volumes',
		producedBy: 'docuconf render --target knative',
		consumedBy: 'Knative Serving, Cloud Run',
		status: 'planned',
		notes: 'Respects Knative’s reserved variables (PORT, K_SERVICE…) and reserved mount paths.',
	},
	{
		id: 'kube-openapi',
		name: 'Kubernetes OpenAPI v3 schema',
		artifact: 'XRD / CRD openAPIV3Schema',
		producedBy: 'docuconf xrd',
		consumedBy: 'The Kubernetes API server',
		status: 'planned',
		notes: 'Rejects a bad claim at kubectl apply.',
	},
	{
		id: 'admission-policy',
		name: 'Admission policy',
		artifact: 'CEL ValidatingAdmissionPolicy, or a cosign attestation for Kyverno',
		producedBy: 'docuconf policy',
		consumedBy: 'The Kubernetes admission chain',
		status: 'planned',
		notes: 'Catches edits that bypass CI, such as kubectl set env.',
	},
	{
		id: 'kcl',
		name: 'KCL schema',
		artifact: 'KCL schema module',
		producedBy: 'docuconf kcl',
		consumedBy: 'function-kcl, KCL-based platforms',
		status: 'planned',
		notes: 'For platforms that chose KCL over CUE.',
	},
	{
		id: 'env-example',
		name: '.env.example',
		artifact: '.env.example with descriptions',
		producedBy: 'docuconf dotenv',
		consumedBy: 'Local development',
		status: 'planned',
		notes: 'Secrets appear as placeholders, never values.',
	},
];

// ---------------------------------------------------------------------------
// SDK requirements
// ---------------------------------------------------------------------------

export const SDK_MUSTS: { title: string; detail: string }[] = [
	{
		title: 'Idiomatic declaration',
		detail: 'Cover every variable type, file type and field, in the host library’s own style.',
	},
	{
		title: 'Validate the declaration',
		detail:
			'At definition time: name format, description length, details not blank and at most 4000 characters, default against constraints, no default on required, RE2-only patterns, no watch where reload is unsupported.',
	},
	{
		title: 'Export a conforming contract',
		detail:
			'Deterministic, sorted by name, canonical durations (1h30m), encodings set to what the host parses, narrow integer ranges exported as min/max, full-match patterns anchored as ^(?:p)$.',
	},
	{
		title: 'Load from the process environment, at process start',
		detail:
			'Read the real environment when the process starts, after any injection (Bank-Vaults, Vault Agent, wrappers such as op run), and validate injected values exactly like any other. Never resolve secret references itself, and never read configuration at build time. A .env file is opt-in for development, and real variables override it.',
	},
	{
		title: 'Support config-file overlays (hosts that layer files)',
		detail:
			'Declare overlay files in the contract, load them in the documented order (base file < profile file < platform overlay < environment variables), and reload them when declared watch. Applies to .NET, Spring, Rails, figment and Hoplite; other hosts reject overlays at declaration time.',
	},
	{
		title: 'Report every violation at boot',
		detail: 'All together, each with a stable error code, never printing a secret value; also to /dev/termination-log. Length limits count characters (Unicode code points), and a value outside them is out_of_range.',
	},
	{ title: 'Expose typed values', detail: 'A struct, class or inferred type — never a string map.' },
	{
		title: 'Check every file input at boot',
		detail:
			'Existence, readability and size; config files parse and bind; TLS key match, validity window, minRemaining, DNS names, key algorithm and chain; CA bundle count; keystore opens; text constraints.',
	},
	{
		title: 'Honour reload: watch',
		detail: 'Reload watched files (Kubernetes swaps a symlink), or reject watch at declaration time.',
	},
	{
		title: 'Ignore undeclared variables',
		detail: 'HOSTNAME, KUBERNETES_* and the like. The unknown-name check applies only to platform values.',
	},
	{ title: 'Support DOCUCONF_FILE_ROOT', detail: 'A directory prepended to every absolute file path, for local runs and tests.' },
	{
		title: 'Offer a contract-first mode',
		detail: 'Validate an environment against a contract.json with no in-language declaration, parsing every list and duration encoding. The conformance runner uses it.',
	},
	{
		title: 'Pass the conformance suite',
		detail: 'Every case in docuconf-go’s conformance/cases.json, run through the contract-first mode: the same typed values or the same error codes in every language.',
	},
];

export const SDK_SHOULDS: { title: string; detail: string }[] = [
	{
		title: 'Export details',
		detail: 'From the language’s natural doc location, beside the description. docuconf docs generates the documentation from the contract; an SDK needs no generator of its own.',
	},
	{
		title: 'Framework integration',
		detail: 'A Railtie, ValidateOnStart in .NET, a Next.js or NestJS adapter, a Spring auto-configuration.',
	},
	{ title: 'Warn on feature-flag names', detail: 'Variables matching ^(FF|FEATURE|FEATURE_FLAG|ENABLE)_ are probably flags.' },
	{
		title: 'Detect unresolved injection references',
		detail: 'Fail with invalid_type when a secret still holds an injector reference (vault:, op://, ref+) because the injector did not run.',
	},
	{ title: 'Warn on Unicode regex classes', detail: 'Where the host’s \\d, \\w, \\s, \\b are Unicode-aware but RE2’s are ASCII.' },
];

export const ERROR_CODES: { code: string; meaning: string }[] = [
	{ code: 'missing_required', meaning: 'A required variable or file input has no value.' },
	{ code: 'invalid_type', meaning: 'The value does not parse as its type.' },
	{ code: 'out_of_range', meaning: 'Outside min/max or the 64-bit range, a list item outside itemMin/itemMax, or a string, url, json value, list item or text file outside its length limits (counted in characters).' },
	{ code: 'pattern_mismatch', meaning: 'A string or text file does not match its pattern.' },
	{ code: 'not_in_enum', meaning: 'Not one of the enum’s values.' },
	{ code: 'invalid_scheme', meaning: 'A URL with a scheme not in schemes.' },
	{ code: 'too_few_items', meaning: 'A list shorter than minItems.' },
	{ code: 'too_many_items', meaning: 'A list longer than maxItems.' },
	{ code: 'file_missing', meaning: 'A file input’s path does not exist.' },
	{ code: 'file_unreadable', meaning: 'The path exists but cannot be read.' },
	{ code: 'file_too_large', meaning: 'Larger than maxSize.' },
	{ code: 'file_malformed', meaning: 'Does not parse in its format, or a CA bundle with too few certificates.' },
	{ code: 'schema_mismatch', meaning: 'A config file or json value does not match its schema.' },
	{ code: 'certificate_invalid', meaning: 'Unparseable, expired, not yet valid, disallowed key algorithm, or a broken chain.' },
	{ code: 'certificate_expiring', meaning: 'Valid, but with less than minRemaining left.' },
	{ code: 'certificate_name_mismatch', meaning: 'Does not cover every name in dnsNames.' },
	{ code: 'key_mismatch', meaning: 'The private key does not match the certificate.' },
	{ code: 'keystore_unreadable', meaning: 'The keystore does not open with its password.' },
];

// ---------------------------------------------------------------------------
// FAQ (rendered on /spec/ and emitted as FAQPage JSON-LD)
// ---------------------------------------------------------------------------

export const SPEC_FAQ: { q: string; a: string }[] = [
	{
		q: 'What is a docuconf configuration contract?',
		a: `A ${KIND} (apiVersion ${API_VERSION}) is a document, in CUE (contract.cue) or as JSON, that an application exports from its own config declaration. It lists every environment variable and file input the app reads, with its type, constraints, whether it is required or secret, and how the app parses it. The Kubernetes platform validates what it will supply against the contract before deploying, and the SDK validates the real environment again at boot.`,
	},
	{
		q: 'What input types can a docuconf contract describe?',
		a: 'Nine variable types (string, int, float, bool, duration, url, enum, list, json) and six file types (config files in JSON, YAML or TOML; TLS key pairs; CA bundles; PKCS#12 or JKS keystores; text files; binary files). Variables can be literals or Kubernetes references (secretKeyRef, configMapKeyRef, fieldRef, resourceFieldRef); files can come from inline content, ConfigMaps, Secrets, cert-manager Certificates, the Secrets Store CSI driver or image volumes.',
	},
	{
		q: 'What does docuconf generate from a contract?',
		a: 'Today: the contract in CUE and JSON, a validation report (docuconf vet), the pod’s env, volumes, mounts, ConfigMaps and injector annotations (docuconf render), a Helm values.schema.json plus a library chart, generated docs for developers and AI agents (docuconf docs), and the SDK’s boot-time violation report. Specified next: an OCI artifact tied to the image digest, a compatibility report (docuconf diff) and a Crossplane composition function. Planned: Knative, Kubernetes OpenAPI, admission policy, KCL and .env.example targets.',
	},
	{
		q: 'What must a docuconf language SDK support?',
		a: 'It must extend the language’s leading config library rather than replace it, cover every type and field, validate the declaration itself, export a deterministic contract with the encodings its host parses, load from the process environment, report every violation at boot with stable error codes without printing secrets, check every file input (including TLS key match and expiry), honour reload: watch or reject it, support DOCUCONF_FILE_ROOT and pass the shared conformance suite.',
	},
	{
		q: 'Which languages have docuconf SDKs?',
		a: `${LANGUAGES.map((l) => l.language).join(', ').replace(/, ([^,]*)$/, ' and $1')}. Each builds on that ecosystem’s leading library, for example caarlos0/env in Go, T3 Env in TypeScript, the Options pattern in .NET, pydantic-settings in Python, Spring Boot configuration properties in Java, CLI11 in C++, and Laravel or Symfony configuration in PHP. In COBOL the declaration is an annotated copybook.`,
	},
	{
		q: 'How does docuconf handle secrets?',
		a: 'A secret variable must be supplied as a secretKeyRef and a secret file from a Secret, cert-manager Certificate or CSI volume — never a literal or ConfigMap. The platform checks the reference; the SDK checks the content at boot. No tool ever prints a secret value.',
	},
	{
		q: 'How do rotated secrets reach the app?',
		a: 'docuconf delivers and checks secrets; Vault, External Secrets, cert-manager and the CSI driver store, issue and rotate them. Environment variables, including injected ones, are read when the process starts, so a rotated value arrives with the next restart or redeploy, which the platform owns. A file secret declares reload: watch (the app rereads it) or reload: restart (the platform rolls the pods), and is projected with items, never subPath, so updates reach it. Leased Vault credentials belong in a file written by Vault Agent or the CSI driver, with reload: watch. For an API key with an overlap, a verifying app declares a secret list of one or two keys (csv, minItems 1, maxItems 2, with item length limits) and accepts any of them: add the new key and roll out, switch the callers, then remove the old key and roll out. See Secret rotation on the Inputs page.',
	},
	{
		q: 'Does docuconf work with Bank-Vaults, Vault Agent or other secret injectors?',
		a: 'Yes. SDKs validate the process environment when the app starts, after any injector has run, so a value from Bank-Vaults, a wrapper such as op run, or a mounted secret is checked like any other. On the platform side a variable can be declared as injected, with the injector’s reference (such as vault:secret/data/db#url), so validation accepts the reference instead of demanding a Kubernetes secretKeyRef.',
	},
	{
		q: 'Can the platform mount an appsettings.Production.json instead of setting environment variables?',
		a: 'Yes, as an overlay. The contract declares the overlay’s path and format; the platform writes the values at each variable’s config key into that file, in a ConfigMap, and the app layers it between its baked-in appsettings files and environment variables. Overlays apply to hosts that layer config files: .NET, Spring Boot, Rails, figment and Hoplite.',
	},
	{
		q: 'Is docuconf a feature-flag system?',
		a: 'No. docuconf covers configuration that changes only with a rollout. Flags that change at runtime per user or request belong in OpenFeature; only the flag provider’s bootstrap settings belong in the contract.',
	},
];

// ---------------------------------------------------------------------------
// One version's data, as the table components, llms-full.txt and the JSON-LD read it
// ---------------------------------------------------------------------------

export type SpecData = {
	version: string;
	apiVersion: string;
	varTypes: VarType[];
	varFields: { field: string; rule: string }[];
	valueSources: ValueSource[];
	injectors: typeof INJECTORS;
	overlayHosts: typeof OVERLAY_HOSTS;
	fileTypes: FileType[];
	fileFields: { field: string; rule: string }[];
	fileSources: FileSource[];
	listEncodings: typeof LIST_ENCODINGS;
	durationEncodings: typeof DURATION_ENCODINGS;
	outputs: Output[];
	sdkMusts: { title: string; detail: string }[];
	sdkShoulds: { title: string; detail: string }[];
	errorCodes: { code: string; meaning: string }[];
	faq: { q: string; a: string }[];
};

export const V1ALPHA1: SpecData = {
	version: SPEC_VERSION,
	apiVersion: API_VERSION,
	varTypes: VAR_TYPES,
	varFields: VAR_FIELDS,
	valueSources: VALUE_SOURCES,
	injectors: INJECTORS,
	overlayHosts: OVERLAY_HOSTS,
	fileTypes: FILE_TYPES,
	fileFields: FILE_FIELDS,
	fileSources: FILE_SOURCES,
	listEncodings: LIST_ENCODINGS,
	durationEncodings: DURATION_ENCODINGS,
	outputs: OUTPUTS,
	sdkMusts: SDK_MUSTS,
	sdkShoulds: SDK_SHOULDS,
	errorCodes: ERROR_CODES,
	faq: SPEC_FAQ,
};
