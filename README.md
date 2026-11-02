# Matthew Freeman — Engineering Portfolio

A React + TypeScript portfolio with a custom responsive visual design, real project links, AI-assisted engineering narrative, accessible navigation, and a GitHub Pages deployment workflow.

## Requirements

- Node.js 22 or later
- npm

## Develop locally

```bash
npm install
npm run dev
```

Visit the local URL reported by Vite (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Deploy for free with GitHub Pages

1. Create a **public** repository named `matthewfreeman821.github.io` under your GitHub account.
2. Upload the contents of this folder, including `.github/workflows/deploy.yml`, to the repository's `main` branch. GitHub's web upload may omit hidden folders on some platforms; ensure `.github/workflows/deploy.yml` exists.
3. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
4. Push/commit changes to `main`. Check the **Actions** tab for the deployment result.
5. Once successful, visit `https://matthewfreeman821.github.io/`.

Using the special `username.github.io` repository name keeps the Vite `base: '/'` configuration correct. Other repository names require setting `base` to `/<repo-name>/` in `vite.config.ts`.

GitHub Pages and standard public-repository Actions use are generally available without a separate hosting subscription, subject to your GitHub plan and usage limits. Do not activate any paid plan, domain, service, or add-on. Review GitHub's current account billing settings before any optional upgrade.

## Content and attribution

- BenchFlow and Shelf Sense screenshots are loaded from the owner's public GitHub repositories.
- Author's Board is explicitly labeled in development; no product screenshot, released source, or public demo is falsely claimed.
- The abstract systems graphic is custom CSS/React decoration, not a representation of any specific production architecture.
- No private corporate source code or screenshots are included.
- AI-assisted development is described openly.

## Next iteration ideas

Add an actual contact email only after confirming it is intended for public publication; replace the abstract Author's Board panel with a reviewed public screenshot when available; add a working demo link after deployment is verified.
