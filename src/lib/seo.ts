// Absolute URLs and JSON-LD for search and answer engines.
//
// SITE_URL is the public origin including any base path. The deploy workflow
// sets it from GitHub Pages (custom domain or docuconf.github.io/docuconf.dev).
import { KIND, STATUS_LABEL } from './spec-data';
import { specData } from '@/content/spec';
import { GITHUB_ORG, SDK_ROWS } from './sdk-data';
import { apiVersionOf, CURRENT_SPEC, parseSpecPath, SPEC_PAGES, SPEC_VERSIONS, specPath, specSourceUrl, specVersion } from './spec-versions';

export const SITE_URL = (process.env.SITE_URL || 'https://docuconf.dev').replace(/\/$/, '');
export const SITE_NAME = 'docuconf';
export const GITHUB_ORG_URL = GITHUB_ORG;
export const SPEC_SOURCE_URL = specSourceUrl(CURRENT_SPEC.version);
export const LICENSE_URL = 'https://opensource.org/license/mit';

/** An absolute URL for a site path such as "/spec/". */
export const absolute = (path: string) => `${SITE_URL}${path}`;

const ORG_ID = absolute('/#organization');
const SITE_ID = absolute('/#website');
/** The JSON-LD id of a version's specification: /spec/#specification for the current one. */
export const specId = (version: string) => absolute(`${specPath(version)}#specification`);

/** The SDKs, as listed in sdk-data.ts. */
export const SDKS = SDK_ROWS.map((r) => ({ slug: r.slug, name: r.name, language: r.language, repo: r.repo, host: r.host, package: r.package }));

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
		// One repository with several SDKs (docuconf-js, docuconf-php) gets one id per SDK.
		'@id': `${GITHUB_ORG_URL}/${s.repo}#code${SDKS.filter((x) => x.repo === s.repo).length > 1 ? `-${s.slug}` : ''}`,
		name: `docuconf for ${s.name}`,
		codeRepository: `${GITHUB_ORG_URL}/${s.repo}`,
		programmingLanguage: s.language === '.NET' ? 'C#' : s.language,
		description: `docuconf SDK for ${s.name}, built on ${s.host}. Package: ${s.package}.`,
		url: absolute(`/languages/${s.slug}/`),
		isBasedOn: { '@id': specId(CURRENT_SPEC.version) },
		publisher: { '@id': ORG_ID },
		license: LICENSE_URL,
	}));
}

/** A version's input types and output targets as schema.org DefinedTermSets. */
export function termSets(version: string = CURRENT_SPEC.version) {
	const d = specData(version);
	const base = specPath(version);
	const API_VERSION = apiVersionOf(version);
	const set = (id: string, name: string, description: string, terms: { name: string; description: string }[]) => ({
		'@type': 'DefinedTermSet',
		'@id': absolute(id),
		version,
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
			`${base}inputs/#variable-types`,
			'docuconf variable types',
			`The environment variable types in ${API_VERSION}.`,
			d.varTypes.map((t) => ({
				name: t.type,
				description: `${t.summary} Constraints: ${t.constraints}. Wire form: ${t.wire}.`,
			})),
		),
		set(
			`${base}inputs/#value-sources`,
			'docuconf value sources',
			'Where a variable’s value may come from.',
			d.valueSources.map((s) => ({ name: s.source, description: `Allowed for ${s.allowedFor}; checked ${s.checked}.` })),
		),
		set(
			`${base}inputs/#file-types`,
			'docuconf file input types',
			'Files an application reads, described in the contract.',
			d.fileTypes.map((t) => ({ name: t.type, description: `${t.content} Constraints: ${t.constraints}.` })),
		),
		set(
			`${base}inputs/#file-sources`,
			'docuconf file sources',
			'Where the platform gets each file input.',
			d.fileSources.map((s) => ({ name: s.source, description: `For ${s.forTypes}. ${s.checkedBeforeDeploy}` })),
		),
		set(
			`${base}inputs/#encodings`,
			'docuconf wire encodings',
			'How list and duration values are written into environment variables.',
			[...d.listEncodings, ...d.durationEncodings].map((e) => ({
				name: e.encoding,
				description: `Wire form ${e.wire}; native to ${e.nativeTo}.`,
			})),
		),
		set(
			`${base}outputs/#targets`,
			'docuconf generation targets',
			'Everything generated from a contract, with its status.',
			d.outputs.map((o) => ({
				name: o.name,
				description: `${STATUS_LABEL[o.status]}. ${o.artifact}. Produced by ${o.producedBy}; consumed by ${o.consumedBy}. ${o.notes}`,
			})),
		),
	];
}

const WORK_STATUS = { current: 'Published', draft: 'Draft', superseded: 'Obsolete' } as const;

/** One version of the specification, with its status: Published (current), Draft or Obsolete (superseded). */
export function specification(version: string = CURRENT_SPEC.version) {
	const v = specVersion(version)!;
	return {
		'@type': 'TechArticle',
		'@id': specId(version),
		headline: `docuconf core specification (${version}${v.status === 'current' ? '' : `, ${v.status}`})`,
		name: 'docuconf configuration contract specification',
		url: absolute(specPath(version)),
		about: `${KIND} documents, ${apiVersionOf(version)}`,
		version,
		creativeWorkStatus: WORK_STATUS[v.status],
		description: v.summary,
		isBasedOn: specSourceUrl(version),
		license: LICENSE_URL,
		publisher: { '@id': ORG_ID },
		isPartOf: { '@id': SITE_ID },
		hasPart: SPEC_PAGES.filter((p) => p.slug).map((p) => ({ '@id': absolute(`${specPath(version, p.slug)}#article`) })),
		// Every version points at the others, so a reader of a draft can find the current one.
		...(v.status === 'current' ? {} : { isVariantOf: { '@id': specId(CURRENT_SPEC.version) } }),
	};
}

/** JSON-LD for one documentation page: the article and its breadcrumb. */
export function pageGraph(opts: { path: string; title: string; description: string; extra?: object[] }) {
	const crumbs = [{ name: 'docuconf', path: '/' }];
	const spec = parseSpecPath(opts.path.replace(/\/$/, ''));
	if (spec) {
		const base = specPath(spec.version);
		if (spec.version !== CURRENT_SPEC.version) {
			crumbs.push({ name: 'Specification', path: '/spec/' });
			if (spec.slug) crumbs.push({ name: `${spec.version} (${specVersion(spec.version)!.status})`, path: base });
		} else if (spec.slug) crumbs.push({ name: 'Specification', path: '/spec/' });
	}
	if (opts.path.startsWith('/languages/') && opts.path !== '/languages/') crumbs.push({ name: 'Get started', path: '/languages/' });
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
				...(spec && spec.slug ? { isPartOf: { '@id': specId(spec.version) } } : {}),
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
		'@graph': [organization(), website(), ...SPEC_VERSIONS.map((v) => specification(v.version)), ...sdkSourceCode(), ...termSets()],
	};
}
