# docuconf.dev

The website for [docuconf](https://github.com/Docuconf): typed environment contracts for every language, validated by your Kubernetes platform before anything deploys.

Built with Next.js (App Router, static export), Tailwind CSS and MDX, with [Pagefind](https://pagefind.app) search.

```sh
npm ci
npm run dev            # http://localhost:3000 (search works only in the built site)
npm run build          # static site in out/, then the search index in out/pagefind/
npm run check:content  # pages name SDKs only through sdk-data.ts
```

- The landing page is `src/app/page.tsx`.
- Each project page is an MDX file in `src/app/(docs)/<slug>/page.mdx`. To add one, create the file and list it in `NAV_GROUPS` in `src/components/site.tsx`.
- Code is highlighted at build time with Shiki, in light and dark themes that follow the reader's OS setting. Every code block has a copy button; language tabs remember the reader's choice and link with `?lang=`.

## SDKs and their snippets

[`src/lib/sdk-data.ts`](src/lib/sdk-data.ts) is the only place that knows about the SDKs. The homepage, the
`/languages/<slug>/` Get started pages, `/examples/`, the SDK requirements matrix, the roadmap, `llms.txt` and the
JSON-LD all read it, and `npm run check:content` fails if a page lists languages by hand.

Every code snippet those pages show lives in `snippets/<slug>/`:

| Path | What it is |
|---|---|
| `sdk/...` | Copies of files from the SDK repository (the orders example), at the same paths. CI fails if they differ. |
| `overlay/...` | Files the site adds to the SDK checkout: the tests the Test step shows, a values file for `docuconf vet`. |
| `install/` | A small project that installs the SDK exactly as the Install step says. |
| `out/<check>.txt` | The output a check must print, which the page shows. `...` skips lines; `…` matches any text. |

The commands come from each row's `checks`, and the pages show the same strings.
[`scripts/snippets.ts`](scripts/snippets.ts) runs them, and the `snippets` workflow runs it for every SDK against
that repository's `main` branch, in the SDK's own toolchain image, on every push and daily.

```sh
# Check one SDK against a local clone's origin/main (a copy; the clone is not touched):
node scripts/snippets.ts check python --git ../docuconf-python --ref origin/main
# After an SDK changes: refresh the copies and expected output, then review the diff.
node scripts/snippets.ts check python --git ../docuconf-python --ref origin/main --update
```

`--git` copies the clone with `git archive`, which leaves out paths marked `export-ignore`: docuconf-php's examples are, so check `laravel` and `symfony` with `--sdk` on a worktree of that clone instead (`--sdk` runs in place). Locally, the commands use the toolchains on your `PATH`; `SNIPPETS_SHELL` can name a wrapper that runs them
elsewhere (it is called with the directory and the command).

### Adding a language

1. Add a row to `SDK_ROWS` in `src/lib/sdk-data.ts`: the matrix facts, the Get started prose (`guide`), the toolchain
   image (`ci`) and the commands (`checks`).
2. Create `snippets/<slug>/`: copy the example's declaration and `contract.cue` into `sdk/`, write the test in
   `overlay/` and the install project in `install/`.
3. Run `node scripts/snippets.ts check <slug> --git <clone> --update` to record the outputs, then `npm run build`.

No page or component changes: the new language appears everywhere, and CI starts checking it.

## Deploy

`.github/workflows/deploy.yml` checks types and content and builds every pull request, and deploys `main` to GitHub Pages. In the repository settings, set Pages → Source to "GitHub Actions".
