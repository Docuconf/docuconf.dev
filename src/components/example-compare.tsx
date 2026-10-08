// The orders example in every SDK, side by side, on /examples/. The code comes from snippets/<slug>/, which CI
// keeps identical to each SDK repository's examples and runs against its main branch.
import { codeToHtml } from 'shiki';
import { SHIKI_THEMES, trimLines } from './code';
import { CompareView, type CompareSdk } from './compare-view';
import { SDK_ROWS, type SdkRow } from '@/lib/sdk-data';
import { snippetText, transcript } from '@/lib/snippets';

const html = (code: string, lang: string) => codeToHtml(trimLines(code), { lang, themes: SHIKI_THEMES });

const contractFile = (r: SdkRow) => r.guide.export.files!.find((f) => f.lang === 'cue')!;

/** The variable names a contract declares, in order. */
export function contractVars(r: SdkRow): string[] {
	return [...snippetText(r.slug, contractFile(r)).matchAll(/^\t\t([A-Z][A-Z0-9_]*): \{/gm)].map((m) => m[1]);
}

export async function ExampleCompare() {
	const sdks: CompareSdk[] = await Promise.all(
		SDK_ROWS.map(async (r) => {
			const decl = r.guide.declare.files![0];
			return {
				slug: r.slug,
				name: r.name,
				views: {
					declaration: { title: decl.title ?? '', html: await html(snippetText(r.slug, decl), decl.lang) },
					contract: { title: 'contract.cue', html: await html(snippetText(r.slug, contractFile(r)), 'cue') },
					error: {
						title: 'With PORT=0 and no DATABASE_URL',
						html: await html(transcript(r, r.guide.error.check!), 'shellsession'),
					},
				},
			};
		}),
	);
	return <CompareView sdks={sdks} />;
}

/** "the .NET and Java (Spring Boot) examples read ORDERS__PORT and ORDERS_PORT", from the contracts. */
export function PrefixedNames() {
	const odd = SDK_ROWS.map((r) => ({ r, port: contractVars(r).find((v) => v.endsWith('PORT')) })).filter((x) => x.port !== 'PORT');
	if (!odd.length) return null;
	return (
		<>
			{odd.map(({ r, port }, i) => (
				<span key={r.slug}>
					{i > 0 && (i === odd.length - 1 ? ' and ' : ', ')}
					{r.name} reads <code>{port}</code>
				</span>
			))}
		</>
	);
}
