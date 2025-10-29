#!/usr/bin/env node

/**
 * Test the built package locally using npm pack
 */

import { execSync } from "child_process";
import { readFileSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

// Use process.cwd() to get the project directory where the command is run
const projectDir = process.cwd();

async function testLocal() {
  console.log("🧪 Testing built package locally...\n");

  try {
    // 1. Build the package
    console.log("📦 Building package...");
    execSync("npm run build", { stdio: "inherit", cwd: projectDir });

    // 2. Pack the package
    console.log("\n📦 Packing package...");
    const packResult = execSync("npm pack", {
      encoding: "utf8",
      cwd: projectDir,
    });
    const tarballName = packResult.trim();

    // 3. Create test directory
    const testDir = join(projectDir, "test-package-temp");
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
    mkdirSync(testDir);

    // 4. Extract and test
    console.log("\n📂 Extracting package...");
    execSync(`tar -xzf ${tarballName} -C ${testDir}`, {
      stdio: "inherit",
      cwd: projectDir,
    });

    const packageDir = join(testDir, "package");

    // 5. Verify package structure
    console.log("\n🔍 Verifying package structure...");

    const requiredFiles = [
      "package.json",
      "README.md",
      "LICENSE",
      "dist/index.js",
      "dist/index.d.ts",
    ];

    let allFilesExist = true;
    for (const file of requiredFiles) {
      const filePath = join(packageDir, file);
      if (existsSync(filePath)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
      }
    }

    // 6. Check package.json
    const packageJson = JSON.parse(
      readFileSync(join(packageDir, "package.json"), "utf8")
    );
    console.log(`\n📋 Package: ${packageJson.name}@${packageJson.version}`);
    console.log(`📄 Main: ${packageJson.main}`);
    console.log(`📝 Types: ${packageJson.types}`);

    // 7. Check bundle size
    const bundleContent = readFileSync(
      join(packageDir, "dist/index.js"),
      "utf8"
    );
    const bundleSize = (bundleContent.length / 1024).toFixed(2);
    console.log(`📊 Bundle size: ${bundleSize} KB`);

    // 8. Check for react-jsx-runtime
    const hasJsxRuntime = bundleContent.includes("react-jsx-runtime");
    console.log(
      `🔍 Contains react-jsx-runtime: ${hasJsxRuntime ? "❌ YES" : "✅ NO"}`
    );

    // 9. Cleanup
    console.log("\n🧹 Cleaning up...");
    rmSync(testDir, { recursive: true });
    rmSync(tarballName);

    if (allFilesExist && !hasJsxRuntime) {
      console.log("\n🎉 Package test PASSED! Ready for publishing.");
      console.log("\nNext steps:");
      console.log("1. npm login");
      console.log("2. npm publish");
    } else {
      console.log("\n❌ Package test FAILED. Please fix the issues above.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testLocal();
}

export default testLocal;
