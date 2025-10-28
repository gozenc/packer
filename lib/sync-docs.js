#!/usr/bin/env node
import { mkdir, readFile, writeFile, rm, cp } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const htmlSource = path.join(rootDir, "html", "test-dist.html");
const distSource = path.join(rootDir, "dist");
const docsDir = path.join(rootDir, "docs");
const docsDist = path.join(docsDir, "dist");
const docsIndex = path.join(docsDir, "index.html");

async function run() {
  await mkdir(docsDir, { recursive: true });

  const html = await readFile(htmlSource, "utf8");
  await writeFile(docsIndex, html, "utf8");

  await rm(docsDist, { recursive: true, force: true });
  await cp(distSource, docsDist, { recursive: true });

  console.log("Docs synced: html/test-dist.html -> docs/index.html");
  console.log("Copied dist/ -> docs/dist/");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((error) => {
    console.error("Failed to sync docs:", error);
    process.exitCode = 1;
  });
}

export default run;
