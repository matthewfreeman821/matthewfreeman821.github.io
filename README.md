# Matthew Freeman — Engineering Portfolio

React 18, TypeScript, and Vite. An engineering portfolio with repository-backed case studies,  a browser-local review workbench.

## Local development

Use Node.js 22 or newer and the pinned package manager (`corepack enable` if your Node installation includes Corepack, otherwise install the packageManager version listed in package.json).

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm test:e2e
```

Browser checks use installed Microsoft Edge locally. CI installs Chromium; set `CI=1` to use Playwright Chromium locally after installing it with `pnpm exec playwright install chromium`.

## Review Ops

Two fictional PR exercises provide before/after code, acceptance criteria, authored reviewer perspectives, evidence dossiers, editable classification and severity, and a release verdict. A counterexample in a dossier is reasoned evidence, not a claim of executed SQL/Redis tests. Optional reference assessments are authored teaching material, never live AI output. An executable browser model lets visitors step through a last-unit race and compare an atomic guard; it is explicitly not a SQL/driver simulation.

The gate requires a rationale and evidence reference for every claim. Confirmed defects request changes; risks hold for verification; otherwise the exercise is ready for human approval. The gate does not validate the quality of entered evidence. Scenario decisions are isolated, remain in tab memory until reload, and export as JSON with provenance and limitations.

The independent report workspace preserves JSON imports, deterministic correlation, manual split/merge, human dispositions, and JSON export. It uses word overlap and file proximity; false correlations and missed duplicates remain possible. Merge/split invalidate affected dispositions. Empty reports remain draft.

No AI service, GitHub authentication, external API execution, browser storage, or confidential employer code is involved in Review Ops. No export re-import or persistence across reload is implemented.

## Evidence and scope

- BenchFlow and Shelf Sense descriptions are grounded in their public architecture, implementation, and test files; links appear on each project card.
- Author’s Board remains in development.
- Project screenshots show fictional data and load from the existing public repositories. Fonts and those images require network access; review interactions run locally.

## Verification and release

`verify.yml` is manual-only and builds/tests without deploying. It is not dispatched as part of this work; validation is performed locally to avoid consuming hosted CI allowances. `deploy.yml` deploys only on a main-branch push or an explicit manual dispatch. Branch pushes and PR creation do not deploy this portfolio. Merging to main triggers deployment and requires owner approval outside this change.

Do not dispatch deployment or merge without the owner’s explicit approval. No additional hosting service is required for this change.
