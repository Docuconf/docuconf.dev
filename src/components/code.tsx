import { codeToHtml } from 'shiki';
import { CodeFrame } from './code-frame';

/** Blank lines around the code removed; the first line keeps its indentation (COBOL's columns). */
export const trimLines = (code: string) => code.replace(/^\s*\n/, '').trimEnd();

export const SHIKI_THEMES = { light: 'github-light-default', dark: 'github-dark-default' } as const;

/** Code highlighted at build time, in both themes, with a copy button and an optional file name. */
export async function Code({ code, lang, title }: { code: string; lang: string; title?: string }) {
	const html = await codeToHtml(trimLines(code), { lang, themes: SHIKI_THEMES });
	return <CodeFrame html={html} title={title} />;
}
