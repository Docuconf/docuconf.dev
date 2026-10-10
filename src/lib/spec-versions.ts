// The versions of the specification the site documents. This is the one place that knows them: the /spec
// pages, the version picker and banner, the sitemap, llms.txt, llms-full.txt and the JSON-LD all read it.
//
// Adding a version is one entry here plus its pages: a folder src/content/spec/<version>/ with one MDX file per
// page in SPEC_PAGES and a data.ts, registered in src/content/spec/index.ts. `npm run check:content` fails when a
// version here has no pages, or a page is missing.
//
// When a version becomes current, set the old one to 'superseded'. The current version is served at /spec/...,
// and every version is also served at /spec/<version>/...
//
// No imports: scripts/check-content.ts loads this file with plain Node.

export type SpecStatus = 'draft' | 'current' | 'superseded';

export type SpecVersion = {
	/** The version part of the contract's apiVersion, such as "v1alpha1". */
	version: string;
	/** The docuconf-go branch, tag or commit whose spec/SPEC.md these pages describe. */
	ref: string;
	status: SpecStatus;
	/** One line for the version picker and llms.txt. */
	summary: string;
	/** docuconf-go pull requests that hold a draft's changes, until they merge. */
	prs?: number[];
};

export const SPEC_VERSIONS: SpecVersion[] = [
	{
		version: 'v1alpha1',
		ref: 'main',
		status: 'current',
		summary: 'The published spec. As an alpha, its fields, types and rules may still change in any release.',
	},
	{
		version: 'v1beta1',
		ref: 'claude/beta-conformance',
		status: 'draft',
		summary:
			'Being prepared for the format freeze: keySet, deprecated inputs, strict parsing, the shared conformance suite and docuconf diff, push and pull. Additive only once it is out.',
		prs: [27, 28, 29, 30],
	},
];

/** The pages every version has, in navigation order. `slug` is the path under /spec/ ('' is the overview). */
export const SPEC_PAGES: { slug: string; file: string; label: string }[] = [
	{ slug: '', file: 'overview', label: 'Overview' },
	{ slug: 'inputs/', file: 'inputs', label: 'Inputs' },
	{ slug: 'outputs/', file: 'outputs', label: 'Outputs' },
	{ slug: 'generated-docs/', file: 'generated-docs', label: 'Generated docs' },
	{ slug: 'sdk-requirements/', file: 'sdk-requirements', label: 'SDK requirements' },
];

export const DOCUCONF_GO_URL = 'https://github.com/Docuconf/docuconf-go';

export const STATUS_TEXT: Record<SpecStatus, string> = {
	current: 'current',
	draft: 'draft',
	superseded: 'superseded',
};

const current = SPEC_VERSIONS.filter((v) => v.status === 'current');
if (current.length !== 1) throw new Error(`spec-versions.ts: exactly one version must be current, found ${current.length}`);

/** The version /spec/... serves. */
export const CURRENT_SPEC: SpecVersion = current[0];

export const specVersion = (version: string) => SPEC_VERSIONS.find((v) => v.version === version);

/** The contract's apiVersion for a version: "docuconf.dev/v1alpha1". */
export const apiVersionOf = (version: string) => `docuconf.dev/${version}`;

/** The path a version's pages live under: "/spec/" for the current version, "/spec/<version>/" for the others. */
export const specBase = (version: string) => (version === CURRENT_SPEC.version ? '/spec/' : `/spec/${version}/`);

/** A page of a version at its canonical path. */
export const specPath = (version: string, slug = '') => `${specBase(version)}${slug}`;

/** The normative SPEC.md for a version, at its ref. */
export const specSourceUrl = (version: string) =>
	`${DOCUCONF_GO_URL}/blob/${specVersion(version)?.ref ?? 'main'}/spec/SPEC.md`;

export const prUrl = (n: number) => `${DOCUCONF_GO_URL}/pull/${n}`;

/**
 * Which version and page a pathname shows. "/spec/inputs/" is the current version's Inputs page, and
 * "/spec/v1beta1/inputs/" is v1beta1's. `explicit` is true when the path names the version.
 */
export function parseSpecPath(pathname: string): { version: string; slug: string; explicit: boolean } | undefined {
	const m = pathname.match(/^\/spec(?:\/(.*))?$/);
	if (!m) return undefined;
	let rest = (m[1] ?? '').replace(/^\/+/, '');
	if (rest && !rest.endsWith('/')) rest += '/';
	const first = rest.split('/')[0];
	if (first && specVersion(first)) return { version: first, slug: rest.slice(first.length + 1), explicit: true };
	return { version: CURRENT_SPEC.version, slug: rest, explicit: false };
}

/** The same page in another version, or that version's overview when it has no such page. */
export function switchVersionPath(pathname: string, version: string): string {
	const at = parseSpecPath(pathname);
	const slug = at && SPEC_PAGES.some((p) => p.slug === at.slug) ? at.slug : '';
	return specPath(version, slug);
}
