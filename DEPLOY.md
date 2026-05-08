# Deploy

## Vercel project setup

1. `vercel link` (or import the GitHub repo via the Vercel dashboard).
2. Framework preset: Next.js (auto-detected).
3. Node version: 24 (honored from `.nvmrc`).
4. Environment variables (Production + Preview):
   - `RESEND_API_KEY` — from resend.com dashboard.
   - `CONTACT_TO_EMAIL` — `alex.arrico@gmail.com`.
   - `CONTACT_FROM_EMAIL` — must be a verified Resend sender on the `arrico.me` domain.

## Custom domain

1. Add `arrico.me` as a domain in the Vercel project.
2. In GoDaddy DNS, replace the existing records with:
   - `A` record `@` → `76.76.21.21`
   - `CNAME` record `www` → `cname.vercel-dns.com`
3. Wait for Vercel to provision the cert. Set `arrico.me` as the production domain (the `www` host should redirect to apex).

## Resend setup

1. Add the `arrico.me` domain in Resend, follow the DKIM/SPF DNS guidance.
2. Create an API key, paste into Vercel env vars.

## Repo rename

`aarrico.github.io` → `portfolio` (or `arrico.me`). Disable GitHub Pages first.
GitHub auto-redirects the old URL.

## Resume PDF

`public/resume.pdf` is currently a stub. Replace it with the ATS-friendly hand-maintained PDF before launch (the file `Alexander_Arrico_Resume.pdf` at repo root is the user's source — copy it to `public/resume.pdf`).
