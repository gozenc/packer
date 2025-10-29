# @gozenc/packer

A CLI tool with essential package builder scripts for React library projects. Streamline your React library development workflow with version management, documentation syncing, and package testing utilities.

## Features

- 🔢 **Version Bumping**: Interactive or automated version updates across package files
- 📚 **Documentation Sync**: Automatically sync built documentation to GitHub Pages
- 🧪 **Package Testing**: Verify package structure and test locally before publishing
- 🌐 **Browser Testing**: Local development server for testing built packages
- ⚡ **Zero Config**: Works out of the box with standard React library setups

## Installation

Install globally to use across all your projects:

```bash
npm install -g @gozenc/packer
```

Or install as a dev dependency in your project:

```bash
npm install --save-dev @gozenc/packer
```

## Usage

### Global Installation

If installed globally, use the `packer` command directly:

```bash
packer <command> [options]
```

### Local Installation

If installed locally, add scripts to your `package.json`:

```json
{
  "scripts": {
    "bump": "packer bump",
    "docs": "packer docs",
    "verify": "packer verify",
    "preview": "packer preview"
  }
}
```

Then run with npm:

```bash
npm run bump
```

## Commands

### `packer bump [version]`

Bump the package version across all relevant files.

**Interactive mode** (prompts for version):

```bash
packer bump
```

**Direct version** (specify version):

```bash
packer bump 1.2.3
```

Updates:

- `package.json`
- `package-lock.json`
- `docs.html` (softwareVersion in JSON-LD, if exists)
- `docs/index.html` (softwareVersion in JSON-LD, if exists)

### `packer docs`

Sync documentation from `docs.html` to `docs/` directory for GitHub Pages or Cloudflare Pages.

```bash
packer docs
```

This command:

- Copies `docs.html` → `docs/index.html`
- Copies `dist/` → `docs/dist/`

**Note**: The `docs/` folder should be added to `.gitignore` to avoid committing generated files. Only `docs.html` (the source file) should be committed to your repository.

### `packer verify`

Comprehensive package verification before publishing. This command builds, packs, and thoroughly tests your package to ensure it's ready for npm.

```bash
packer verify
```

This command:

1. Builds the package (`npm run build`)
2. Packs it (`npm pack`)
3. Extracts and verifies the tarball structure
4. Checks for required files (package.json, README.md, LICENSE, dist files)
5. Analyzes bundle size
6. Verifies no `react-jsx-runtime` is bundled (critical for React libraries)
7. Cleans up temporary files

This is the most thorough test and should be run before publishing to npm.

### `packer preview`

Start a local HTTP server to preview your documentation in a browser.

```bash
packer preview
```

- Serves files from project root
- Default URL: `http://127.0.0.1:8080/`
- Serves `docs/index.html` at root path
- Press `Ctrl+C` to stop the server

## Project Structure

This tool expects your React library project to follow this structure:

```
your-project/
├── dist/              # Built package output (gitignored)
├── docs/              # Generated docs for Pages hosting (gitignored)
├── docs.html          # Source HTML file for documentation
├── src/               # Source files
├── package.json
└── package-lock.json
```

**Important**: Add the following to your `.gitignore`:

```gitignore
# Build outputs
dist/

# Docs folder (generated from docs.html)
docs/
```

This keeps your repository clean by only tracking the source `docs.html` file, not the generated `docs/` folder.

## Typical Workflow

Here's a typical release workflow using packer:

```bash
# 1. Verify package (builds, packs, and tests)
packer verify

# 2. Preview docs in browser (optional)
packer preview

# 3. Sync documentation
packer docs

# 4. Bump version
packer bump

# 5. Publish to npm
npm publish
```

Or combine steps in a release script:

```json
{
  "scripts": {
    "release": "packer verify && packer docs && packer bump && npm publish"
  }
}
```

## Requirements

- Node.js >= 18.0.0
- npm or yarn
- Standard React library build setup (TypeScript + Vite recommended)

## Examples

See these projects using `@gozenc/packer`:

- [@gozenc/react-tooltip](https://github.com/gozenc/react-tooltip)
- [@gozenc/react-dark-mode-toggle](https://github.com/gozenc/react-dark-mode-toggle)

## License

MIT © Fatih Gözenç

## Contributing

Issues and pull requests are welcome! Please visit the [GitHub repository](https://github.com/gozenc/package-builder).
