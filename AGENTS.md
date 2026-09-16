# Repository instructions

## Scope and communication

- This repository contains the arrico.me personal portfolio. Keep changes appropriate to a small portfolio site.
- Communicate as a peer software engineer: direct, concise, objective. Explain tradeoffs and limitations without hype.
- For review findings, use: `-[Location] Flaw: <description> | Impact: <consequence> | Action: <fix>`.
- For architectural proposals, present 2–3 options with explicit failure modes. End with: "The biggest assumption we are making here that might be wrong is [X]."
- Change only what the task requires. Mention unrelated defects or dead code instead of fixing them unprompted.
- Keep comments focused on why the code exists. Avoid speculative abstractions and unused flexibility.

## Git and workspace boundaries

- Never run `git commit`, `git push`, or `git rebase`. The user handles commits and remote changes. Inspection and staging are permitted.
- Inspect `git status` before editing. Preserve existing user changes; do not revert unrelated work.
- Use portable Fish-compatible terminal commands. Do not assume Bash-specific syntax.
- Never commit credentials, local environment files, or generated build/test output.

## Setup and commands

- Use Node.js 24 as specified in `.nvmrc`; `package.json` permits Node.js >=24.
- Use pnpm. The `packageManager` field in `package.json` specifies the intended version; `pnpm-lock.yaml` is the dependency lockfile.
- Install dependencies with `pnpm install --frozen-lockfile` unless the task explicitly changes dependencies.

| Command                              | Purpose                              |
| ------------------------------------ | ------------------------------------ |
| `pnpm dev`                           | Start the development server         |
| `pnpm build`                         | Build the production application     |
| `pnpm start`                         | Serve an existing production build   |
| `pnpm typecheck`                     | Run TypeScript without emitting code |
| `pnpm lint`                          | Run ESLint                           |
| `pnpm test`                          | Run Vitest tests                     |
| `pnpm test:watch`                    | Run Vitest in watch mode             |
| `pnpm test:e2e`                      | Run Playwright browser tests         |
| `pnpm format:check`                  | Check formatting                     |
| `pnpm exec prettier --write <paths>` | Format only changed files            |

- `pnpm format` rewrites the repository; prefer formatting explicit paths for scoped changes.
- Browser tests require Chromium: `pnpm exec playwright install chromium`.
- Playwright targets `http://localhost:3000`, builds and starts the app automatically, and may reuse an existing server outside CI. Verify that a reused server runs the intended code.
- `next/font/google` fetches fonts during the production build. Builds may require network access.

## Architecture and ownership

- Stack: Next.js App Router, React, TypeScript, Tailwind CSS, and local MDX. Cache Components is enabled in `next.config.ts`.
- `app/` owns routes, layouts, and metadata. `app/(with-nav)/` groups pages with shared navigation.
- `components/` owns UI. Keep components server-rendered unless browser APIs, state, effects, or event handlers require a client component.
- `data/projects.json` and `data/resume.json` contain structured portfolio data. `lib/projects.ts` and `lib/resume.ts` validate them with Zod.
- `content/projects/` and `content/about/` contain local MDX. `mdx-components.tsx` defines shared MDX components. Keep executable MDX repository-controlled.
- `lib/starly/` contains the pipeline simulation and recorded reference data; `components/starly/` renders it.
- `lib/advection-diffusion/` contains the WASM wrapper, generated module, presets, and numerical reference data; `components/advection-diffusion/` renders it.
- `public/` contains images and the downloadable resume PDF. Check whether resume edits also require updating the PDF.
- Use the `@/*` import alias. Preserve strict TypeScript checks, including unchecked-index access checking.
- Keep simulation behavior separate from rendering. Dispose WASM allocations and cancel animation callbacks/listeners on cleanup.
- Preserve light/dark themes, keyboard access, accessible names, and reduced-motion behavior when changing UI.

## Contact

- Contact uses the visible email address and `mailto:` link from `data/resume.json`.
- There is no contact Server Action or email provider integration. No email environment variables are required.
- Do not send real emails during automated verification.

## Verification

- Run checks appropriate to the change. For application-code changes, run `pnpm typecheck`, `pnpm lint`, and relevant Vitest tests. Run a production build for routing, MDX, dependency, or build-configuration changes.
- Run relevant browser tests for navigation and interactive UI changes when the environment supports them.
- Add regression tests for changed behavior and fixed defects; avoid tests that merely repeat implementation details.
- Vitest uses jsdom and colocated `*.test.ts`/`*.test.tsx` files. Playwright tests live in `tests/e2e/` and currently target desktop Chromium.
- Reference fixtures are test oracles. Do not regenerate them merely to make failing tests pass. Explain any intentional changes to expected behavior.
- Report commands run, results, and any environment limitations. Do not describe a blocked check as passing.
- CI is defined in `.github/workflows/ci.yml`. Consult it before modifying verification commands.

## Generated artifacts and external prerequisites

- Treat `lib/advection-diffusion/adv-diff.js` as generated output; do not hand-edit the compiled module.
- `scripts/build-fortran-reference.mjs` reads Fortran output from `~/repos/advection-diffusion` and writes the numerical reference fixture.
- `scripts/capture-starly-traces.mjs` requires a separate running Starly checkout and Docker Compose. It defaults to `../event-processing-platform` and `http://localhost:8000`.
- Inspect fixture-generation scripts before running them; they interact with external local services and overwrite fixtures.

## Details for the owner to fill in

- Deployment: README states Vercel. TODO: project/team name, preview workflow, production branch, and deployment approval rules.
- Production protections: TODO: firewall rules and monitoring configured outside this repository.
- WASM regeneration: TODO: source repository/revision, C++ source location, Emscripten version, and exact build command.
- Resume PDF: TODO: source document and regeneration command.
- Browser support: TODO: required browsers, mobile viewports, and accessibility target.
- Content conventions: TODO: project publication checklist and ownership of resume/about updates.
