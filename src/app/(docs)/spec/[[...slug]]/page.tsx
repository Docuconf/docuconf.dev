// Every /spec page of every version, from src/lib/spec-versions.ts and the MDX in src/content/spec/<version>/.
// /spec/<page>/ is the current version's page; /spec/<version>/<page>/ is any version's, the current one included.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ComponentProps } from 'react';
import { faqJsonLd, JsonLd } from '@/components/spec-tables';
import { SpecVersionBanner } from '@/components/spec-version';
import { SPEC_CONTENT } from '@/content/spec';
import { pageGraph, sdkSourceCode, specification, termSets } from '@/lib/seo';
import { CURRENT_SPEC, SPEC_PAGES, SPEC_VERSIONS, specPath, specVersion, STATUS_TEXT } from '@/lib/spec-versions';

export const dynamicParams = false;

export function generateStaticParams() {
	const params: { slug: string[] }[] = SPEC_PAGES.map((p) => ({ slug: p.slug.split('/').filter(Boolean) }));
	for (const v of SPEC_VERSIONS) {
		for (const p of SPEC_PAGES) params.push({ slug: [v.version, ...p.slug.split('/').filter(Boolean)] });
	}
	return params;
}

type Props = { params: Promise<{ slug?: string[] }> };

async function resolve(params: Props['params']) {
	const parts = (await params).slug ?? [];
	const explicit = parts.length > 0 && !!specVersion(parts[0]);
	const version = explicit ? parts[0] : CURRENT_SPEC.version;
	const slug = (explicit ? parts.slice(1) : parts).map((s) => `${s}/`).join('');
	const page = SPEC_PAGES.find((p) => p.slug === slug);
	const load = page && SPEC_CONTENT[version]?.pages[page.file];
	if (!page || !load) return undefined;
	const v = specVersion(version)!;
	return {
		v,
		page,
		mod: await load(),
		// Where search engines should send the reader: the current version's pages live at /spec/<page>/.
		canonical: specPath(version, slug),
		base: explicit ? `/spec/${version}/` : '/spec/',
		// /spec/<current>/<page>/ repeats /spec/<page>/, so search indexes only the latter.
		copy: explicit && version === CURRENT_SPEC.version,
	};
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const r = await resolve(params);
	if (!r) return {};
	const { title, description } = r.mod.metadata;
	const label = r.v.status === 'current' ? '' : ` (${r.v.version}, ${STATUS_TEXT[r.v.status]})`;
	return {
		title: `${title}${label}`,
		description: r.v.status === 'current' ? description : `${STATUS_TEXT[r.v.status][0].toUpperCase()}${STATUS_TEXT[r.v.status].slice(1)} spec ${r.v.version}. ${description}`,
		alternates: { canonical: r.canonical },
	};
}

/** Links between spec pages stay in the version being read: /spec/inputs/ becomes /spec/v1beta1/inputs/. */
function versionedLink(base: string) {
	return function SpecLink({ href = '', ...props }: ComponentProps<'a'>) {
		const m = href.match(/^\/spec\/(.*)$/);
		if (m && !specVersion(m[1].split(/[/#]/)[0])) return <Link href={`${base}${m[1]}`} {...props} />;
		return href.startsWith('/') ? <Link href={href} {...props} /> : <a href={href} {...props} />;
	};
}

export default async function SpecPage({ params }: Props) {
	const r = await resolve(params);
	if (!r) notFound();
	const { v, page, mod } = r;
	const data = SPEC_CONTENT[v.version].data;
	const Content = mod.default;
	const extra: object[] = {
		overview: [specification(v.version), faqJsonLd(data)],
		inputs: termSets(v.version).filter((t) => t['@id'].includes('/inputs/')),
		outputs: termSets(v.version).filter((t) => t['@id'].includes('/outputs/')),
		'sdk-requirements': sdkSourceCode(),
	}[page.file] ?? [];
	return (
		<>
			<JsonLd
				data={pageGraph({
					path: r.canonical,
					title: page.slug ? `${page.label}: docuconf specification ${v.version}` : `docuconf core specification (${v.version})`,
					description: mod.metadata.description,
					extra,
				})}
			/>
			<SpecVersionBanner version={v.version} slug={page.slug} />
			<div
				data-pagefind-ignore={r.copy ? 'all' : undefined}
				data-pagefind-meta={v.status === 'current' ? undefined : `title:${page.label} (${v.version}, ${STATUS_TEXT[v.status]})`}
			>
				<Content components={{ a: versionedLink(r.base) }} />
			</div>
		</>
	);
}
