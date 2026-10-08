// What one contract produces: the homepage's output viewer, for docuconf-go's orders example. Every file comes
// from snippets/go/, which CI checks against docuconf-go's main branch (scripts/snippets.ts): the committed docs
// are sdk/ copies, and render, helm and vet are checks whose output is stored in out/.
import { GITHUB_ORG, repoPath, SDK_ROWS, type Snippet } from './sdk-data';
import { command, output, snippetText } from './snippets';

const GO = SDK_ROWS.find((r) => r.slug === 'go')!;
const EXAMPLE = 'examples/orders';
/** This site's repository. */
const SITE_REPO = `${GITHUB_ORG}/docuconf.dev`;
const blob = (path: string) => repoPath(GO.repo, `${EXAMPLE}/${path}`).replace('/tree/', '/blob/');

export type OutputTab = {
	/** The tab's label. */
	label: string;
	/** The file name shown above the code. */
	title: string;
	lang: string;
	/** Who reads it, and when. */
	caption: string;
	/** The command that makes it, when the code does not show it. */
	command?: string;
	code: string;
	/** Set when the code is an excerpt: the full file on GitHub. */
	full?: string;
};

const indentOf = (s: string) => s.match(/^[ \t]*/)![0];

/** Pieces of one file, with a "…" line where lines are left out, indented like the code that follows it. */
function excerpt(file: string, pieces: Omit<Snippet, 'file' | 'lang'>[], trailing = true): string {
	const texts = pieces.map((p) => snippetText('go', { file, lang: '', keepIndent: true, ...p }));
	const out: string[] = [];
	texts.forEach((t, i) => {
		if (i > 0) out.push(`${indentOf(t)}…`);
		out.push(t);
	});
	if (trailing) out.push(`${indentOf(texts[texts.length - 1].split('\n').pop()!)}…`);
	return out.join('\n');
}

const values = snippetText('go', { file: 'overlay/examples/orders/values.yaml', lang: 'yaml' })
	.split('\n')
	.filter((l) => !l.startsWith('#'))
	.join('\n');

export const OUTPUT_TABS: OutputTab[] = [
	{
		label: 'contract.cue',
		title: 'contract.cue',
		lang: 'cue',
		caption: 'What the SDK exports from your declaration. The platform team, CUE and every tool below read it.',
		command: command(GO, 'export'),
		code: snippetText('go', { file: 'sdk/examples/orders/contract.cue', lang: 'cue' }),
	},
	{
		label: 'contract.json',
		title: 'chart/files/docuconf/contract.json',
		lang: 'json',
		caption: 'The same contract as JSON, with defaults filled in, for tools without CUE (`cue export` gives the same data). The Helm library chart reads it.',
		command: command(GO, 'helm-contract-json'),
		code: snippetText('go', { file: 'out/helm-contract-json.txt', lang: 'json' }),
	},
	{
		label: 'values.schema.json',
		title: 'chart/values.schema.json',
		lang: 'json',
		caption: 'Helm checks the chart’s values against it on every lint, template, install and upgrade.',
		command: command(GO, 'helm-schema'),
		code: excerpt('out/helm-schema.txt', [
			{ from: '^{', to: 'Environment variables, as typed values' },
			{ from: '"DATABASE_URL": {', to: '^                },$' },
			{ from: '"PORT": {', to: '"type": "integer"' },
		]),
		// Not committed in the example: the full file is the output CI stores here.
		full: `${SITE_REPO}/blob/main/snippets/go/out/helm-schema.txt`,
	},
	{
		label: 'Pod config',
		title: 'render.yaml',
		lang: 'yaml',
		caption:
			'The pod’s env, volumes, mounts, ConfigMaps, restart triggers and injector annotations, rendered from valid values at deploy time.',
		command: command(GO, 'render'),
		code: snippetText('go', { file: 'out/render.txt', lang: 'yaml' }),
	},
	{
		label: 'CONFIG.md',
		title: 'CONFIG.md',
		lang: 'md',
		caption: 'Docs for the developers who run and change the app, committed next to the contract.',
		command: 'docuconf docs contract.cue -o CONFIG.md',
		code: excerpt('sdk/examples/orders/CONFIG.md', [{ from: '^# orders-api configuration', to: '| Boot errors | `missing_required`' }]),
		full: blob('CONFIG.md'),
	},
	{
		label: 'CONFIG.agents.md',
		title: 'CONFIG.agents.md',
		lang: 'md',
		caption: 'Rules for coding and ops agents that change the app or set its deployment values.',
		command: 'docuconf docs contract.cue --format agents -o CONFIG.agents.md',
		code: excerpt('sdk/examples/orders/CONFIG.agents.md', [{ from: '^# orders-api configuration', to: '^5. Set every required' }]),
		full: blob('CONFIG.agents.md'),
	},
	{
		label: 'docs.json',
		title: 'docs.json',
		lang: 'json',
		caption: 'The docs model both renderers read; a portal, a Backstage plugin or an MCP server can render from it too.',
		command: 'docuconf docs contract.cue --format model -o docs.json',
		code: excerpt('sdk/examples/orders/docs.json', [{ from: '^{', to: '"text": "at least 1 item"' }]),
		full: blob('docs.json'),
	},
	{
		label: 'docuconf vet',
		title: 'A failed check, in CI',
		lang: 'console',
		caption: 'What CI prints when proposed values break the contract: every problem, exit 1, and never the secret value itself.',
		code: ['$ cat values.yaml', ...values.split('\n'), `$ ${command(GO, 'vet')}`, ...output(GO, 'vet').split('\n')].join('\n'),
	},
];
