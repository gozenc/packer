#!/usr/bin/env node
import { mkdir, readFile, writeFile, rm, cp } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

// Use process.cwd() to get the project directory where the command is run
const projectDir = process.cwd();
const htmlSource = path.join(projectDir, "docs.html");
const distSource = path.join(projectDir, "dist");
const docsDir = path.join(projectDir, "docs");
const docsDist = path.join(docsDir, "dist");
const docsIndex = path.join(docsDir, "index.html");

async function run() {
  // Create docs directory
  await mkdir(docsDir, { recursive: true });
  // Copy docs.html to docs/index.html
  const html = await readFile(htmlSource, "utf8");
  await writeFile(docsIndex, html, "utf8");
  // Remove old dist folder in docs and copy fresh one
  await rm(docsDist, { recursive: true, force: true });
  await cp(distSource, docsDist, { recursive: true });
  console.log("✅ Docs synced successfully!");
  console.log("   docs.html -> docs/index.html");
  console.log("   dist/ -> docs/dist/");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((error) => {
    console.error("Failed to sync docs:", error);
    process.exitCode = 1;
  });
}

export default run;
