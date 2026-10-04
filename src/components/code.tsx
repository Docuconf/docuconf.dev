import { codeToHtml } from 'shiki';

// Highlighted at build time; ships as static HTML with both themes.
export async function Code({ code, lang }: { code: string; lang: string }) {
	const html = await codeToHtml(code.trim(), {
		lang,
		themes: { light: 'github-light', dark: 'github-dark' },
	});
	return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
