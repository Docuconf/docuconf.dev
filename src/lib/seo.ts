// Absolute URLs and JSON-LD for search and answer engines.
//
// SITE_URL is the public origin including any base path. The deploy workflow
// sets it from GitHub Pages (custom domain or docuconf.github.io/docuconf.dev).
import {
	API_VERSION,
	DURATION_ENCODINGS,
	FILE_SOURCES,
	FILE_TYPES,
	KIND,
	LIST_ENCODINGS,
	OUTPUTS,
	SPEC_VERSION,
	STATUS_LABEL,
	VALUE_SOURCES,
	VAR_TYPES,
} from './spec-data';
import { SDK_ROWS } from './sdk-data';

export const SITE_URL = (process.env.SITE_URL || 'https://docuconf.dev').replace(/\/$/, '');
export const SITE_NAME = 'docuconf';
export const GITHUB_ORG_URL = 'https://github.com/docuconf';
export const SPEC_SOURCE_URL = 'https://github.com/docuconf/docuconf-go/blob/main/spec/SPEC.md';
export const LICENSE_URL = 'https://opensource.org/license/mit';

/** An absolute URL for a site path such as "/spec/". */
export const absolute = (path: string) => `${SITE_URL}${path}`;

const ORG_ID = absolute('/#organization');
const SITE_ID = absolute('/#website');
const SPEC_ID = absolute('/spec/#specification');

/** The SDKs, as listed in sdk-data.ts. */
export const SDKS = SDK_ROWS.map((r) => ({ language: r.language, repo: r.repo, host: r.host, package: r.package }));

export function organization() {
	return {
		'@type': 'Organization',
		'@id': ORG_ID,
		name: SITE_NAME,
		url: absolute('/'),
		logo: absolute('/favicon.svg'),
		sameAs: [GITHUB_ORG_URL],
		description:
			'An open-source project for typed configuration contracts between applications and the Kubernetes platforms that run them.',
	};
}

export function website() {
	return {
		'@type': 'WebSite',
		'@id': SITE_ID,
		name: SITE_NAME,
		url: absolute('/'),
		publisher: { '@id': ORG_ID },
		inLanguage: 'en',
	};
}

export function sdkSourceCode() {
	return SDKS.map((s) => ({
		'@type': 'SoftwareSourceCode',
		'@id': `${GITHUB_ORG_URL}/${s.repo}#code`,
		name: `docuconf for ${s.language}`,
		codeRepository: `${GITHUB_ORG_URL}/${s.repo}`,
		programmingLanguage: s.language === '.NET' ? 'C#' : s.language,
		description: `docuconf SDK for ${s.language}, built on ${s.host}. Package: ${s.package}.`,
		isBasedOn: { '@id': SPEC_ID },
		publisher: { '@id': ORG_ID },
		license: LICENSE_URL,
	}));
}

/** The input types and output targets as schema.org DefinedTermSets. */
export function termSets() {
	const set = (id: string, name: string, description: string, terms: { name: string; description: string }[]) => ({
		'@type': 'DefinedTermSet',
		'@id': absolute(id),
		name,
		description,
		hasDefinedTerm: terms.map((t) => ({
			'@type': 'DefinedTerm',
			name: t.name,
			description: t.description,
			inDefinedTermSet: absolute(id),
		})),
	});
	return [
		set(
			'/spec/inputs/#variable-types',
			'docuconf variable types',
			`The closed set of environment variable types in ${API_VERSION}.`,
			VAR_TYPES.map((t) => ({
				name: t.type,
				description: `${t.summary} Constraints: ${t.constraints}. Wire form: ${t.wire}.`,
			})),
		),
		set(
			'/spec/inputs/#value-sources',
			'docuconf value sources',
			'Where a variable’s value may come from.',
			VALUE_SOURCES.map((s) => ({ name: s.source, description: `Allowed for ${s.allowedFor}; checked ${s.checked}.` })),
		),
		set(
			'/spec/inputs/#file-types',
			'docuconf file input types',
			'Files an application reads, described in the contract.',
			FILE_TYPES.map((t) => ({ name: t.type, description: `${t.content} Constraints: ${t.constraints}.` })),
		),
		set(
			'/spec/inputs/#file-sources',
			'docuconf file sources',
			'Where the platform gets each file input.',
			FILE_SOURCES.map((s) => ({ name: s.source, description: `For ${s.forTypes}. ${s.checkedBeforeDeploy}` })),
		),
		set(
			'/spec/inputs/#encodings',
			'docuconf wire encodings',
			'How list and duration values are written into environment variables.',
			[...LIST_ENCODINGS, ...DURATION_ENCODINGS].map((e) => ({
				name: e.encoding,
				description: `Wire form ${e.wire}; native to ${e.nativeTo}.`,
			})),
		),
		set(
			'/spec/outputs/#targets',
			'docuconf generation targets',
			'Everything generated from a contract, with its status.',
			OUTPUTS.map((o) => ({
				name: o.name,
				description: `${STATUS_LABEL[o.status]}. ${o.artifact}. Produced by ${o.producedBy}; consumed by ${o.consumedBy}. ${o.notes}`,
			})),
		),
	];
}

export function specification() {
	return {
		'@type': 'TechArticle',
		'@id': SPEC_ID,
		headline: `docuconf core specification (${SPEC_VERSION})`,
		name: 'docuconf configuration contract specification',
		url: absolute('/spec/'),
		about: `${KIND} documents, ${API_VERSION}`,
		version: SPEC_VERSION,
		isBasedOn: SPEC_SOURCE_URL,
		license: LICENSE_URL,
		publisher: { '@id': ORG_ID },
		isPartOf: { '@id': SITE_ID },
		hasPart: ['/spec/inputs/', '/spec/outputs/', '/spec/sdk-requirements/'].map((p) => ({ '@id': absolute(`${p}#article`) })),
	};
}

/** JSON-LD for one documentation page: the article and its breadcrumb. */
export function pageGraph(opts: { path: string; title: string; description: string; extra?: object[] }) {
	const crumbs = [{ name: 'docuconf', path: '/' }];
	if (opts.path.startsWith('/spec/') && opts.path !== '/spec/') crumbs.push({ name: 'Specification', path: '/spec/' });
	crumbs.push({ name: opts.title, path: opts.path });
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'TechArticle',
				'@id': absolute(`${opts.path}#article`),
				headline: opts.title,
				description: opts.description,
				url: absolute(opts.path),
				inLanguage: 'en',
				publisher: { '@id': ORG_ID },
				isPartOf: { '@id': SITE_ID },
				...(opts.path.startsWith('/spec/') && opts.path !== '/spec/' ? { isPartOf: { '@id': SPEC_ID } } : {}),
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: crumbs.map((c, i) => ({
					'@type': 'ListItem',
					position: i + 1,
					name: c.name,
					item: absolute(c.path),
				})),
			},
			...(opts.extra ?? []),
		],
	};
}

/** Everything, in one document: served as /docuconf.jsonld and embedded on the home page. */
export function siteGraph() {
	return {
		'@context': 'https://schema.org',
		'@graph': [organization(), website(), specification(), ...sdkSourceCode(), ...termSets()],
	};
}
