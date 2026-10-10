// v1beta1 (draft): v1alpha1's data with the beta changes, from SPEC.md on docuconf-go's beta branches
// (PR #27: keySet, deprecated inputs, field tables and the settled open questions; #29: strict parsing and the
// shared conformance suite; #28: docuconf diff, push and pull). Not final until the format freeze.
import { type SpecData, V1ALPHA1 } from '@/lib/spec-data';

const VERSION = 'v1beta1';
const API_VERSION = `docuconf.dev/${VERSION}`;

/** Replaces the rows whose `key` matches, and keeps the rest in order. */
const patch = <T,>(rows: T[], key: keyof T, changes: Partial<T>[]): T[] =>
	rows.map((r) => ({ ...r, ...(changes.find((c) => c[key] === r[key]) ?? {}) }));

const varTypes = patch(V1ALPHA1.varTypes, 'type', [
	{ type: 'int', summary: '64-bit signed integer, base 10 only: 007 is 7, and 0x10, 1_000 or 1e3 are invalid_type. SDKs export narrower host ranges as min/max.' },
	{ type: 'float', summary: 'Finite decimal number with a digit on each side of the point, parsed independently of locale. inf, NaN, .5 and 0,5 are invalid_type.' },
	{ type: 'bool', summary: 'true or false, in any case (TRUE, False). Nothing else: not 1, yes or on.' },
]);
varTypes.splice(varTypes.findIndex((t) => t.type === 'list') + 1, 0, {
	type: 'keySet',
	summary: 'Secret keys that are all valid at once, so one can be rotated without an outage: webhook signatures, inbound API keys. Always secret.',
	constraints: 'encoding, separator (csv), minKeys (default 1), maxKeys (default 2), keyMinLength, keyMaxLength (in characters)',
	platformValue: 'a secret reference only',
	wire: 'as a list of strings: old,new in csv',
});

export const SPEC: SpecData = {
	...V1ALPHA1,
	version: VERSION,
	apiVersion: API_VERSION,
	varTypes,
	varFields: patch(V1ALPHA1.varFields, 'field', [
		{ field: 'type', rule: 'One of the variable types. Beta may add a type; a tool that does not know one reports it instead of guessing.' },
		{ field: 'required', rule: 'Default false. A required variable cannot have a default, and cannot be deprecated. Whether an input is optional is the app’s choice.' },
		{
			field: 'deprecated',
			rule: '{message, replacedBy?}, for staged removal: the platform should stop setting the input. message is not blank and at most 500 characters. A deprecated input that is still set is a warning, never an error, and SDKs warn at boot.',
		},
	]),
	valueSources: patch(V1ALPHA1.valueSources, 'source', [
		{ source: 'secretKeyRef', allowedFor: 'secret variables, including every keySet (one of the two secret sources)' },
		{
			source: 'injected, with a reference',
			allowedFor: 'every type, including secrets, but not a list or key set in the indexed encoding; rendered verbatim as the env value for the injector to resolve',
		},
	]),
	outputs: patch(V1ALPHA1.outputs, 'id', [
		{ id: 'contract-cue', notes: `Plain data that unifies with #Contract: kind ConfigContract, apiVersion ${API_VERSION}. Deterministic, sorted by name.` },
		{
			id: 'oci-artifact',
			artifact: `application/vnd.docuconf.contract.${VERSION}+cue, referring to the image digest`,
			producedBy: 'docuconf push (CI); read back by docuconf pull',
			notes: 'Prevents validating image B against contract A. An OCI 1.1 artifact whose subject is the image, kept under the referrers tag schema on registries without the referrers API. Signable with cosign. docuconf push and pull are built in docuconf-go PR #28, not merged yet.',
		},
		{
			id: 'compat-report',
			artifact: 'each change classified compatible, notable, breaking for the platform, or breaking; text or JSON',
			notes: 'Exits 1 on a breaking change unless an --ack file accepts it. Constraints compare as bounds and JSON Schemas structurally; anything diff cannot classify is breaking. Built in docuconf-go PR #28, not merged yet.',
		},
		{
			id: 'docs-model',
			notes: 'Every fact a renderer shows, already phrased, checked against #DocsModel, including field tables for JSON Schemas and the rotation steps of every key set. Secrets never have a value in it.',
		},
	]),
	sdkMusts: [
		...patch(V1ALPHA1.sdkMusts, 'title', [
			{
				title: 'Export a conforming contract',
				detail: 'Deterministic, sorted by name, canonical durations (1h30m), encodings set to what the host parses, narrow integer ranges exported as min/max, full-match patterns anchored as ^(?:p)$. The shared export fixture, declared in the SDK’s language, must match conformance/export/golden.cue, compared as data by docuconf conformance export.',
			},
			{
				title: 'Report every violation at boot',
				detail: 'All together, each with a stable error code, never printing a secret value; also to /dev/termination-log. Length limits count characters (Unicode code points), and a value outside them, or an empty key in a key set, is out_of_range.',
			},
			{ title: 'Support DOCUCONF_FILE_ROOT', detail: 'A directory prepended to every absolute file path and every overlay path, for local runs and tests.' },
			{
				title: 'Pass the conformance suite',
				detail: 'Every case in docuconf-go’s conformance/cases.json, run through the contract-first mode, including files, profiles, overlays, key sets, deprecated inputs and strict parsing. Only cases tagged int64 or json-schema may be skipped, by a host that lacks that capability.',
			},
		]),
		{
			title: 'Parse exactly',
			detail: 'Accept exactly the strings the spec allows for each type, whatever the host library accepts on its own: values are never trimmed, a bool is only true or false, an int is base 10, a float has no hex, inf or NaN. A pre-check rejects the extra forms with invalid_type.',
		},
		{
			title: 'Support keySet',
			detail: 'Expose a key set’s keys in the order the platform gave them, and check their count and length at boot.',
		},
	],
	sdkShoulds: [
		...V1ALPHA1.sdkShoulds,
		{
			title: 'Warn on deprecated inputs',
			detail: 'Log a warning at boot for each deprecated input that is set, naming the input and its message, never its value. It still loads and is still checked.',
		},
		{
			title: 'Offer key set helpers',
			detail: 'A constant-time contains(candidate), and a helper that tries every key with a check the caller supplies, such as an HMAC comparison.',
		},
	],
	errorCodes: patch(V1ALPHA1.errorCodes, 'code', [
		{ code: 'invalid_type', meaning: 'The value does not parse as its type under the exact parsing rules: values are never trimmed, and forms a host accepts on its own (1 for a bool, 0x10 for an int) are rejected.' },
		{
			code: 'out_of_range',
			meaning: 'Outside min/max or the 64-bit range, a list item outside itemMin/itemMax, a string, url, json value, list item, key or text file outside its length limits (counted in characters), or an empty key in a key set.',
		},
		{ code: 'too_few_items', meaning: 'A list shorter than minItems, or a key set with fewer keys than minKeys.' },
		{ code: 'too_many_items', meaning: 'A list longer than maxItems, or a key set with more keys than maxKeys.' },
		{
			code: 'file_malformed',
			meaning: 'Does not parse in its format; a tls.crt, tls.key or CA bundle with no PEM certificate or key at all; or a CA bundle with too few certificates.',
		},
		{ code: 'certificate_invalid', meaning: 'A PEM certificate that does not parse, expired, not yet valid, a disallowed key algorithm, or a broken chain.' },
	]),
	faq: patch(V1ALPHA1.faq, 'q', [
		{
			q: 'What is a docuconf configuration contract?',
			a: `A ConfigContract (apiVersion ${API_VERSION}) is a document, in CUE (contract.cue) or as JSON, that an application exports from its own config declaration. It lists every environment variable and file input the app reads, with its type, constraints, whether it is required, secret or deprecated, and how the app parses it. The Kubernetes platform validates what it will supply against the contract before deploying, and the SDK validates the real environment again at boot.`,
		},
		{
			q: 'What input types can a docuconf contract describe?',
			a: 'Ten variable types (string, int, float, bool, duration, url, enum, list, keySet, json) and six file types (config files in JSON, YAML or TOML; TLS key pairs; CA bundles; PKCS#12 or JKS keystores; text files; binary files). Variables can be literals or Kubernetes references (secretKeyRef, configMapKeyRef, fieldRef, resourceFieldRef); files can come from inline content, ConfigMaps, Secrets, cert-manager Certificates, the Secrets Store CSI driver or image volumes.',
		},
		{
			q: 'What does docuconf generate from a contract?',
			a: 'The contract in CUE and JSON, a validation report (docuconf vet), the pod’s env, volumes, mounts, ConfigMaps and injector annotations (docuconf render), a Helm values.schema.json plus a library chart, generated docs for developers and AI agents (docuconf docs), and the SDK’s boot-time violation report. Specified, and built in an open pull request: a compatibility report (docuconf diff) and an OCI artifact tied to the image digest (docuconf push and pull). Specified: a Crossplane composition function. Planned: Knative, Kubernetes OpenAPI, admission policy, KCL and .env.example targets.',
		},
		{
			q: 'How do rotated secrets reach the app?',
			a: 'docuconf delivers and checks secrets; Vault, External Secrets, cert-manager and the CSI driver store, issue and rotate them. Environment variables, including injected ones, are read when the process starts, so a rotated value arrives with the next restart or redeploy, which the platform owns. A file secret declares reload: watch (the app rereads it) or reload: restart (the platform rolls the pods). For an API key with an overlap, a verifying app declares a keySet of one or two keys and accepts any of them: add the new key and roll out, switch the sender, then remove the old key and roll out. The generated docs print these steps for every key set.',
		},
	]),
};
