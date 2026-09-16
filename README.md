# arrico.me

Repo for my personal portfolio. Built with Next.js 16, deployed on Vercel.

## Local development

Use Node.js 24 (`.nvmrc`) and the pnpm version in `package.json`.

```fish
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. Contact uses a visible email address and `mailto:`
link from `data/resume.json`; no email service or environment variables are needed.

## Verification

```fish
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm format:check
```

The build fetches Google fonts. Playwright builds and starts the site locally;
CI builds once and starts that build. Stop any existing server on port 3000 to
ensure local browser tests exercise the current production build.

Format only changed files with `pnpm exec prettier --write <paths>`.

## Content and deployment

Project metadata lives in `data/projects.json`, with matching bodies in
`content/projects/`. About sections live in `content/about/`. Resume data lives in
`data/resume.json`; the downloadable PDF in `public/` must be updated separately.
The PDF source and regeneration command are not recorded yet.

Vercel hosts the site. The project/team, production branch, preview workflow, and
deployment protections still need documentation from the owner.

## Simulation references

`lib/advection-diffusion/adv-diff.js` is generated WASM output. The solver source
revision, Emscripten version, and build command are not recorded yet; do not edit
the generated module manually.

`scripts/build-fortran-reference.mjs` reads output files from
`~/repos/advection-diffusion` and overwrites the numerical fixture. The existing
windy reference contains 50 null samples, which the strict parity test rejects.
Recover and inspect the original Fortran output before repairing the fixture;
do not substitute the WASM output as its own oracle.

`scripts/capture-starly-traces.mjs` requires the separate Starly checkout,
Docker Compose, and a running API. Read the script before invoking it: it talks
to local services and replaces recorded traces. Reference generation is not part
of ordinary setup or testing.
