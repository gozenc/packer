#!/usr/bin/env node
import { mkdir, readFile, writeFile, rm, cp } from "fs/promises";
import path from "path";
import { parseArgs } from "./config.js";

async function run(...args) {
  // Parse configuration from arguments
  const config = parseArgs(args);

  // Use process.cwd() to get the project directory where the command is run
  const projectDir = process.cwd();
  const htmlSource = path.join(projectDir, config.docsFile);
  const distSource = path.join(projectDir, config.dist);
  const docsDir = path.join(projectDir, config.docsDir);
  const docsDist = path.join(docsDir, config.dist);
  const docsIndex = path.join(docsDir, "index.html");

  // Create docs directory
  await mkdir(docsDir, { recursive: true });

  // Copy docs file to docs/index.html
  const html = await readFile(htmlSource, "utf8");
  await writeFile(docsIndex, html, "utf8");

  // Remove old dist folder in docs and copy fresh one
  await rm(docsDist, { recursive: true, force: true });
  await cp(distSource, docsDist, { recursive: true });

  console.log("✅ Docs synced successfully!");
  console.log(`   ${config.docsFile} -> ${config.docsDir}/index.html`);
  console.log(`   ${config.dist}/ -> ${config.docsDir}/${config.dist}/`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((error) => {
    console.error("Failed to sync docs:", error);
    process.exitCode = 1;
  });
}

export default run;
