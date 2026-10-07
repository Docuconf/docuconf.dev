import { codeToHtml } from 'shiki';
import { CodeFrame } from './code-frame';

export const SHIKI_THEMES = { light: 'github-light-default', dark: 'github-dark-default' } as const;

/** Code highlighted at build time, in both themes, with a copy button and an optional file name. */
export async function Code({ code, lang, title }: { code: string; lang: string; title?: string }) {
	const html = await codeToHtml(code.trim(), { lang, themes: SHIKI_THEMES });
	return <CodeFrame html={html} title={title} />;
}
