// Checks every code snippet the site shows against an SDK repository.
//
//   node scripts/snippets.ts matrix                      # JSON for the CI matrix
//   node scripts/snippets.ts check <slug> --sdk <dir>    # run the checks in a checkout (CI)
//   node scripts/snippets.ts check <slug> --git <repo> [--ref origin/main]
//                                                        # same, on a copy of a local clone at a ref
//   ... --update                                         # refresh the site's copies and expected output
//   ... --image <image>                                  # run the commands in a container (CI)
//
// For SDK <slug>, the files under snippets/<slug>/:
//   sdk/...      copies of files in the SDK repo, at the same paths. They must be identical.
//   overlay/...  files the site adds (tests, extra modules), copied into the checkout first.
//   install/...  a project that installs the SDK the way the Get started page says.
//   out/<id>.txt the output a check must print. A line that is just "..." matches any lines, and "…" in a
//                line matches any text (timestamps, process ids, paths).
// The commands come from SDK_ROWS[].checks in src/lib/sdk-data.ts; the pages show the same strings.
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SDK_ROWS, type Check, type SdkRow } from '../src/lib/sdk-data.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SNIPPETS = join(ROOT, 'snippets');

function fail(msg: string): never {
	console.error(`snippets: ${msg}`);
	process.exit(1);
}

function arg(name: string): string | undefined {
	const i = process.argv.indexOf(name);
	return i > 0 ? process.argv[i + 1] : undefined;
}

function walk(dir: string): string[] {
	if (!existsSync(dir)) return [];
	return readdirSync(dir).flatMap((name) => {
		const p = join(dir, name);
		return statSync(p).isDirectory() ? walk(p) : [p];
	});
}

/** Output with ANSI colours, trailing spaces and blank edges removed. */
function normalize(text: string): string[] {
	// eslint-disable-next-line no-control-regex
	const lines = text.replace(/\x1b\[[0-9;]*m/g, '').replace(/\r/g, '').split('\n').map((l) => l.trimEnd())
		// The JVM announces the machine's own options; they are not the program's output.
		.filter((l) => !l.startsWith('Picked up JAVA_TOOL_OPTIONS') && !l.startsWith('Picked up _JAVA_OPTIONS'));
	while (lines.length && !lines[0]) lines.shift();
	while (lines.length && !lines[lines.length - 1]) lines.pop();
	return lines;
}

const lineMatches = (want: string, got: string) =>
	want.includes('…')
		? new RegExp(`^${want.split('…').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`).test(got)
		: want === got;

/** Whether `actual` contains each "..."-separated block of `expected`, in order. */
function matches(expected: string[], actual: string[]): boolean {
	const blocks: string[][] = [[]];
	for (const l of expected) (l === '...' ? blocks.push([]) : blocks[blocks.length - 1].push(l));
	let from = 0;
	for (const [n, block] of blocks.entries()) {
		if (!block.length) continue;
		let found = -1;
		for (let i = from; i + block.length <= actual.length; i++) {
			if (block.every((l, j) => lineMatches(l, actual[i + j]))) {
				found = i;
				break;
			}
			// Without a leading "...", the first block must start the output.
			if (n === 0) break;
		}
		if (found < 0) return false;
		from = found + block.length;
		// Without a trailing "...", the last block must end the output.
		if (n === blocks.length - 1 && from !== actual.length) return false;
	}
	return true;
}

type Runner = { run(check: Check, cwd: string): { code: number; output: string }; stop(): void };

function hostRunner(sdk: string): Runner {
	// The caller's environment without the example's own variables, so a DATABASE_URL in the caller's shell
	// cannot hide a missing_required error.
	const env: Record<string, string> = {};
	for (const [k, v] of Object.entries(process.env)) {
		if (v !== undefined && !/^(ORDERS_|PORT$|LOG_LEVEL$|DATABASE_URL$|ALLOWED_ORIGINS$|REQUEST_TIMEOUT$|WORKER_COUNT$|DOCUCONF_)/.test(k)) env[k] = v;
	}
	const shell = process.env.SNIPPETS_SHELL; // e.g. a wrapper that runs commands in a chroot
	return {
		run(check, cwd) {
			const dir = join(sdk, cwd);
			const run = `PATH="${sdk}/.bin:$PATH"; ${check.run}`;
			const argv = shell ? [shell, dir, run] : ['sh', '-c', run];
			const r = spawnSync(argv[0], argv.slice(1), { cwd: dir, env: { ...env, ...check.env } as NodeJS.ProcessEnv, encoding: 'utf8', maxBuffer: 64 << 20 });
			return { code: r.status ?? 1, output: `${r.stdout}${r.stderr}` };
		},
		stop() {},
	};
}

function dockerRunner(sdk: string, image: string): Runner {
	const name = `snippets-${process.pid}`;
	// Mounted under its own name (docuconf-swift, not /sdk): SwiftPM takes a package's identity from its directory.
	const mount = `/w/${basename(sdk)}`;
	execFileSync('docker', ['run', '-d', '--rm', '--name', name, '-v', `${sdk}:${mount}`, '--entrypoint', 'sleep', image, 'infinity'], { stdio: 'inherit' });
	return {
		run(check, cwd) {
			const env = Object.entries(check.env ?? {}).flatMap(([k, v]) => ['-e', `${k}=${v}`]);
			const r = spawnSync('docker', ['exec', ...env, '-w', join(mount, cwd), name, 'sh', '-c', `PATH="${mount}/.bin:$PATH"; ${check.run}`], { encoding: 'utf8', maxBuffer: 64 << 20 });
			return { code: r.status ?? 1, output: `${r.stdout}${r.stderr}` };
		},
		stop() {
			spawnSync('docker', ['rm', '-f', name]);
		},
	};
}

function check(row: SdkRow) {
	const update = process.argv.includes('--update');
	const dir = join(SNIPPETS, row.slug);
	let sdk = arg('--sdk');
	const git = arg('--git');
	if (git) {
		// A copy of the clone at a ref, so a working tree with other changes is never touched.
		// Named after the repository: some tools (SwiftPM) take a package's identity from its directory.
		sdk = join(mkdtempSync(join(tmpdir(), `snippets-${row.slug}-`)), row.repo);
		mkdirSync(sdk);
		execFileSync('sh', ['-c', `git -C "$0" archive "$1" | tar -x -C "$2"`, git, arg('--ref') ?? 'origin/main', sdk]);
	}
	if (!sdk) fail('pass --sdk <checkout> or --git <clone>');
	sdk = resolve(sdk);
	const image = arg('--image');
	const runner = image ? dockerRunner(sdk, image) : hostRunner(sdk);
	const problems: string[] = [];
	if (image && row.ci.setup) {
		const r = runner.run({ id: 'setup', cwd: '.', run: row.ci.setup }, '.');
		if (r.code !== 0) fail(`${row.slug}: ci.setup failed:\n${r.output}`);
	}
	if (image) {
		// The checkout belongs to the runner's user, not the container's root, so git (and tools that ask it,
		// such as Go's VCS stamping) would refuse it as "dubious ownership".
		runner.run({ id: 'safe-directory', cwd: '.', run: "command -v git >/dev/null && git config --global --add safe.directory '*' || true" }, '.');
	}

	// 1. The site's copies of SDK files are the SDK's files.
	const copies = walk(join(dir, 'sdk'));
	const compareCopies = (stage: string) => {
		for (const copy of copies) {
			const path = relative(join(dir, 'sdk'), copy);
			const real = join(sdk!, path);
			if (!existsSync(real)) {
				problems.push(`${path}: not in the SDK repository (${stage})`);
			} else if (readFileSync(real, 'utf8') !== readFileSync(copy, 'utf8')) {
				if (update) writeFileSync(copy, readFileSync(real, 'utf8'));
				else problems.push(`${path}: the site's copy differs from the SDK's (${stage}); run with --update`);
			}
		}
	};
	compareCopies('before the checks');

	// 2. The site's own files go into the checkout.
	const overlay = join(dir, 'overlay');
	if (existsSync(overlay)) cpSync(overlay, sdk, { recursive: true });

	// 3. The commands the pages show.
	try {
		for (const c of row.checks) {
			const cwd = c.cwd === '@install' ? installDir(dir, sdk) : c.cwd;
			process.stdout.write(`--- ${row.slug}/${c.id}: (${cwd}) ${c.run}\n`);
			const r = runner.run(c, cwd);
			const out = normalize(r.output);
			if (r.code !== (c.exit ?? 0)) {
				problems.push(`${c.id}: exit ${r.code}, want ${c.exit ?? 0}\n${out.slice(-40).join('\n')}`);
				continue;
			}
			if (c.expect) {
				const file = join(dir, 'out', `${c.id}.txt`);
				const want = existsSync(file) ? normalize(readFileSync(file, 'utf8')) : [];
				if (update) {
					// Keep a hand-trimmed file ("..." lines) while it still matches.
					if (!want.length || !matches(want, out)) {
						mkdirSync(dirname(file), { recursive: true });
						writeFileSync(file, `${out.join('\n')}\n`);
						console.log(`    updated out/${c.id}.txt`);
					}
				} else if (!matches(want, out)) {
					problems.push(`${c.id}: output differs from out/${c.id}.txt; run with --update.\n--- got:\n${out.join('\n')}`);
				}
			}
		}
	} finally {
		runner.stop();
	}

	// 4. Files the commands regenerate (contract.cue) still match the copies.
	compareCopies('after the checks');
	if (git && !process.argv.includes('--keep')) rmSync(dirname(sdk), { recursive: true, force: true });
	if (problems.length) fail(`${row.slug}: ${problems.length} problem(s):\n\n${problems.join('\n\n')}`);
	console.log(`snippets: ${row.slug}: ${row.checks.length} checks passed${update ? ' (updated)' : ''}`);
}

/** Copies snippets/<slug>/install into the checkout, once, and returns its path there. */
function installDir(dir: string, sdk: string): string {
	const target = join(sdk, '.site-install');
	if (!existsSync(target)) cpSync(join(dir, 'install'), target, { recursive: true });
	return '.site-install';
}

const cmd = process.argv[2];
if (cmd === 'matrix') {
	console.log(JSON.stringify({ include: SDK_ROWS.map((r) => ({ slug: r.slug, repo: r.repo, image: r.ci.image })) }));
} else if (cmd === 'check') {
	const slug = process.argv[3];
	const row = SDK_ROWS.find((r) => r.slug === slug) ?? fail(`no SDK "${slug}" in sdk-data.ts`);
	check(row);
} else {
	fail('usage: snippets.ts matrix | check <slug> (--sdk <dir> | --git <clone> [--ref <ref>]) [--image <image>] [--update]');
}
