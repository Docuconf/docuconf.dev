# docuconf.dev

The website for [docuconf](https://github.com/docuconf): typed environment contracts for every language, validated by your Kubernetes platform before anything deploys.

Built with Next.js (App Router, static export), Tailwind CSS and MDX.

```sh
npm ci
npm run dev     # http://localhost:3000
npm run build   # static site in out/
```

- The landing page is `src/app/page.tsx`.
- Each project page is an MDX file in `src/app/(docs)/<slug>/page.mdx`. To add one, create the file and list it in `DOC_PAGES` in `src/components/site.tsx`.
- Code is highlighted at build time with Shiki, in light and dark themes that follow the reader's OS setting.

`.github/workflows/deploy.yml` checks types and builds every pull request, and deploys `main` to GitHub Pages. In the repository settings, set Pages → Source to "GitHub Actions".
