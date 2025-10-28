#!/usr/bin/env node

/**
 * Simple script to test the built package locally
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

function testPackage() {
  const distPath = "./dist";
  const packageJsonPath = "./package.json";

  console.log("🔍 Testing package build...\n");

  // Check if dist folder exists
  if (!existsSync(distPath)) {
    console.error('❌ dist folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Check if main files exist
  const mainFile = "./dist/index.js";
  const typesFile = "./dist/index.d.ts";

  if (!existsSync(mainFile)) {
    console.error("❌ Main file not found:", mainFile);
    process.exit(1);
  }

  if (!existsSync(typesFile)) {
    console.error("❌ Types file not found:", typesFile);
    process.exit(1);
  }

  // Read package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

  console.log("✅ Package structure looks good!");
  console.log(`📦 Package: ${packageJson.name}@${packageJson.version}`);
  console.log(`📄 Main: ${packageJson.main}`);
  console.log(`📝 Types: ${packageJson.types}`);
  console.log(`📁 Files to publish:`, packageJson.files);

  console.log("\n🚀 Ready for publishing!");
  console.log("\nNext steps:");
  console.log("1. npm login (if not already logged in)");
  console.log("2. npm publish");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testPackage();
}

export default testPackage;
