// Reads the code the site shows from snippets/<slug>/ at build time. CI runs the same files and commands
// against each SDK's main branch (scripts/snippets.ts), so what a page shows is what was checked.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Check, SdkRow, Snippet } from './sdk-data';

const ROOT = join(process.cwd(), 'snippets');

/** A marker matches a line that contains it; "^x" matches a line starting with x, and "^x$" only the line x. */
function lineMatches(line: string, marker: string): boolean {
	if (marker.startsWith('^') && marker.endsWith('$')) return line === marker.slice(1, -1);
	if (marker.startsWith('^')) return line.startsWith(marker.slice(1));
	return line.includes(marker);
}

function dedent(lines: string[]): string {
	const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)![0].length);
	const cut = indents.length ? Math.min(...indents) : 0;
	return lines.map((l) => l.slice(cut)).join('\n');
}

/** The text of a snippet: the whole file, or the lines from `from` to `to`, dedented unless `keepIndent`. */
export function snippetText(slug: string, s: Snippet): string {
	const text = readFileSync(join(ROOT, slug, s.file), 'utf8').replace(/\s+$/, '');
	if (!s.from) return text;
	const lines = text.split('\n');
	const start = lines.findIndex((l) => lineMatches(l, s.from!));
	if (start < 0) throw new Error(`snippets/${slug}/${s.file}: no line matches "${s.from}"`);
	let end = lines.length - 1;
	if (s.to) {
		// `to` may match the `from` line itself, for a one-line snippet.
		end = lines.findIndex((l, i) => i >= start && lineMatches(l, s.to!));
		if (end < 0) throw new Error(`snippets/${slug}/${s.file}: no line after "${s.from}" matches "${s.to}"`);
	}
	const picked = lines.slice(start, end + 1);
	return s.keepIndent ? picked.join('\n') : dedent(picked);
}

export function check(row: SdkRow, id: string): Check {
	const c = row.checks.find((c) => c.id === id);
	if (!c) throw new Error(`sdk-data.ts: ${row.slug} has no check "${id}"`);
	return c;
}

/** The command a page shows for a check. */
export const command = (row: SdkRow, id: string) => {
	const c = check(row, id);
	return c.show ?? c.run;
};

/** The output a check must print, as the page shows it ("..." marks lines left out). */
export function output(row: SdkRow, id: string): string {
	return readFileSync(join(ROOT, row.slug, 'out', `${id}.txt`), 'utf8').replace(/\s+$/, '').replaceAll('…', '...');
}

/** A terminal transcript: the command, then its output. */
export function transcript(row: SdkRow, id: string): string {
	const lines = command(row, id).split('\n').map((l) => `$ ${l}`);
	return `${lines.join('\n')}\n${output(row, id)}`;
}
