// Fails when a page names SDKs by hand, so every language mention stays generated from src/lib/sdk-data.ts,
// and when sdk-data.ts points at a snippet, check or output file that does not exist.
//   node scripts/check-content.ts
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SDK_ROWS } from '../src/lib/sdk-data.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const problems: string[] = [];

const walk = (dir: string): string[] =>
	readdirSync(dir).flatMap((n) => {
		const p = join(dir, n);
		return statSync(p).isDirectory() ? walk(p) : [p];
	});

// 1. Pages: no hand-written lists of languages, and no status words next to a language name.
const names = [...new Set(SDK_ROWS.flatMap((r) => [r.language, r.name]))].map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const nameRe = new RegExp(`(?<![\\w/@.-])(${names.join('|')})(?![\\w-])`, 'g');
const statusRe = /\b(Planned|Next|In progress|Coming soon)\b/;
for (const file of walk(join(ROOT, 'src/app')).filter((f) => /\.(mdx|tsx)$/.test(f))) {
	const lines = readFileSync(file, 'utf8').split('\n');
	lines.forEach((line, i) => {
		if (/^\s*(import|\/\/|\*)/.test(line) || line.includes('content-check: ignore')) return;
		// Code samples and URLs name languages legitimately.
		const prose = line.replace(/`[^`]*`/g, '').replace(/\]\([^)]*\)/g, ']').replace(/https?:\/\/\S+/g, '');
		const found = new Set([...prose.matchAll(nameRe)].map((m) => m[1]));
		const where = `${relative(ROOT, file)}:${i + 1}`;
		if (found.size >= 3) problems.push(`${where}: names ${[...found].join(', ')} by hand; generate the list from SDK_ROWS`);
		if (found.size && statusRe.test(prose)) problems.push(`${where}: gives a language a status by hand; use sdkStatus() from sdk-data.ts`);
	});
}

// 2. sdk-data.ts: every file and check it names exists.
for (const r of SDK_ROWS) {
	const dir = join(ROOT, 'snippets', r.slug);
	if (!existsSync(dir)) problems.push(`snippets/${r.slug}/ is missing`);
	const ids = new Set(r.checks.map((c) => c.id));
	for (const [name, step] of Object.entries(r.guide)) {
		if (typeof step !== 'object') continue;
		for (const f of step.files ?? []) {
			if (!existsSync(join(dir, f.file))) problems.push(`${r.slug}.guide.${name}: snippets/${r.slug}/${f.file} does not exist`);
		}
		if (step.check && !ids.has(step.check)) problems.push(`${r.slug}.guide.${name}: no check "${step.check}"`);
	}
	for (const c of r.checks) {
		if (c.expect && !existsSync(join(dir, 'out', `${c.id}.txt`))) problems.push(`${r.slug}: check "${c.id}" has no snippets/${r.slug}/out/${c.id}.txt`);
		if (c.cwd === '@install' && !existsSync(join(dir, 'install'))) problems.push(`${r.slug}: check "${c.id}" needs snippets/${r.slug}/install/`);
	}
	if (!r.guide.error.check || !r.checks.find((c) => c.id === r.guide.error.check)?.expect) problems.push(`${r.slug}: guide.error must name a check with expect`);
	if (!r.guide.export.files?.some((f) => f.lang === 'cue')) problems.push(`${r.slug}: guide.export must show the contract.cue`);
	if (!r.guide.declare.files?.length) problems.push(`${r.slug}: guide.declare needs a file`);
}
if (new Set(SDK_ROWS.map((r) => r.slug)).size !== SDK_ROWS.length) problems.push('sdk-data.ts: duplicate slugs');

if (problems.length) {
	console.error(`check-content: ${problems.length} problem(s):\n${problems.map((p) => `  ${p}`).join('\n')}`);
	process.exit(1);
}
console.log(`check-content: ${SDK_ROWS.length} SDKs, pages generated from sdk-data.ts`);
