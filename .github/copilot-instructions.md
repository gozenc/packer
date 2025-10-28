# Repo-specific Copilot instructions

Quick, actionable guidance to help AI coding agents be productive in this repository.

- Project overview

  - This repository provides a small collection of Node.js helper scripts used to prepare, test, and publish front-end React libraries. The package is published as `@gozenc/packer` and the scripts live in `lib/`.

- Key entry points and what they do (reference files)

  - `lib/bump-version.js` — Interactive semver bump utility. Updates `package.json`, `package-lock.json`, and in-repo HTML/docs references (e.g. `html/test-dist.html`, `docs/index.html`). Example pattern: reads JSON, mutates version, writes back with 2-space JSON formatting.
  - `lib/sync-docs.js` — Copies `html/test-dist.html` to `docs/index.html` and synchronizes `dist/` into `docs/dist/` using `fs.promises.cp`. Useful when updating consumer-facing docs after a build.
  - `lib/test-package.js` — Automated package verification flow: runs `npm run build`, `npm pack`, extracts tarball to `./test-package-temp`, verifies required files (README.md, LICENSE, `dist/index.js`, `dist/index.d.ts`), checks bundle size, and looks for `react-jsx-runtime` in built bundle.
  - `lib/test-local.js` — Lightweight checks ensuring `dist/` exists and basic `package.json` fields are present. Good for quick pre-publish sanity checks.
  - `lib/test-browser.js` — Minimal static server to serve `html/test-dist.html` and assets on `http://127.0.0.1:8080` for manual browser testing.

- Common workflows and commands (explicit)

  - Build & test locally (typical sequence):

    1. npm run build # (project-specific) assumed to exist in downstream projects using these scripts
    2. node lib/test-local.js
    3. node lib/test-package.js
    4. node lib/test-browser.js # open browser to test-dist
    5. node lib/sync-docs.js # update docs folder
    6. node lib/bump-version.js <new-version> # or run interactively

  - Publish checklist (observed in scripts):
    - Ensure `dist/index.js` and `dist/index.d.ts` exist
    - Verify package files via `lib/test-package.js`
    - Bump version with `lib/bump-version.js` (this also updates `package-lock.json` and HTML JSON-LD softwareVersion entries)
    - Update changelog manually
    - npm login && npm publish

- Project-specific patterns and conventions

  - ESM modules: all scripts use ES module syntax (import/export) and include a standard Node shebang (for example: #!/usr/bin/env node). When editing these files keep ESM semantics and avoid top-level await.
  - Root-relative paths: scripts compute root with `fileURLToPath(import.meta.url)` + `path.join(__dirname, '..')`. New scripts should follow the same pattern to locate project files.
  - String replacement approach: `lib/bump-version.js` uses literal string search/replace for JSON-LD entries inside HTML files (e.g. `"softwareVersion": "1.0.0"`). When updating HTML use the same predictable phrasing to remain compatible.
  - Minimal dependencies: scripts rely only on Node's stdlib (`fs/promises`, `child_process`, `path`, `readline`). Avoid adding new heavy dependencies unless necessary.
  - Opinionated publish format: tests expect `dist/index.js` and `dist/index.d.ts` to exist in the package tarball and `README.md` and `LICENSE` to be present at package root.

- Files and locations to inspect for further edits

  - `package.json` — primary metadata; bump script changes version here and in `package-lock.json`.
  - `html/test-dist.html` — source of the hosted demo; `sync-docs.js` and `bump-version.js` reference and update this file.
  - `docs/index.html`, `docs/dist/` — published docs output; `sync-docs.js` copies to these paths.
  - `dist/` — built bundle expected by tests and pack process.

- Examples (concrete snippets) to follow when writing scripts

  - Use `fileURLToPath(import.meta.url)` + `path.dirname` to compute `__dirname` in ESM.
  - Use `fs/promises` APIs: `readFile`, `writeFile`, `cp`, `rm`, `mkdir` with the same error handling patterns used in the repo (catch, console.error, process.exitCode = 1).
  - When changing `package.json` programmatically, preserve formatting with `JSON.stringify(obj, null, 2) + '\n'`.

- What NOT to change without CI/maintainer confirmation

  - The version bump semantics (bump only on explicit new semver). `bump-version.js` validates semver with a regex—don't remove that without replacing it with semver package checks.
  - The expected package artifact layout (`dist/index.js`, `dist/index.d.ts`, `README.md`, `LICENSE`) because `lib/test-package.js` and downstream consumers rely on this.

- Suggested small improvements an agent may safely propose

  - Add a lightweight `npm run` script entries in `package.json` for `test-local`, `test-package`, `test-browser`, `sync-docs`, `bump-version` to make them discoverable.
  - Replace string-based semver validation with the `semver` package for stricter parsing (optional; ensure to add dependency and update scripts accordingly).

- Useful heuristics for code completion
  - Preserve ESM imports, avoid commonjs require().
  - Keep console messages consistent (emoji + short message) as seen across scripts.
  - Follow the repository's minimal, synchronous CLI style: log progress, perform actions, then exit with non-zero on error.

If anything here looks incomplete or you want more detail (examples or added commands in package.json), tell me which sections to expand and I'll iterate.
