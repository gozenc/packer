#!/usr/bin/env node

import { readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

function bumpPatch(version) {
  const [major, minor, patch = "0"] = version.split(".");
  const numericPatch = Number.parseInt(patch, 10);
  if (Number.isNaN(numericPatch)) {
    return version;
  }
  return `${major}.${minor}.${numericPatch + 1}`;
}

function isValidVersion(value) {
  return /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:[-+][0-9A-Za-z-.]+)?$/.test(
    value
  );
}

function prompt(question, defaultValue) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const fullQuestion = defaultValue
      ? `${question} (${defaultValue}): `
      : `${question}: `;
    rl.question(fullQuestion, (answer) => {
      rl.close();
      const value = answer.trim();
      resolve(value || defaultValue || "");
    });
  });
}

async function updateJSONFile(relativePath, updater) {
  const filePath = join(rootDir, relativePath);
  const original = await readFile(filePath, "utf8");
  const data = JSON.parse(original);
  const updated = await updater(data);
  await writeFile(filePath, `${JSON.stringify(updated, null, 2)}\n`);
}

async function updateTextFile(relativePath, replacements) {
  const filePath = join(rootDir, relativePath);
  const original = await readFile(filePath, "utf8");
  let updated = original;

  for (const { from, to, description } of replacements) {
    const next = updated.replace(from, to);
    if (next === updated) {
      console.warn(`⚠️  No match found for ${description} in ${relativePath}`);
    }
    updated = next;
  }

  if (updated !== original) {
    await writeFile(filePath, updated);
  }
}

async function main() {
  console.log("🔍 Reading package metadata...");

  const packageJsonPath = join(rootDir, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

  const currentVersion = packageJson.version;
  const suggestedVersion = bumpPatch(currentVersion);

  let targetVersion = process.argv[2]?.trim();

  if (!targetVersion) {
    targetVersion = await prompt(
      `Current version is ${currentVersion}. Enter new version`,
      suggestedVersion
    );
  }

  if (!targetVersion) {
    console.error("❌ No version provided. Aborting.");
    process.exitCode = 1;
    return;
  }

  if (!isValidVersion(targetVersion)) {
    console.error(`❌ ${targetVersion} is not a valid semver string.`);
    process.exitCode = 1;
    return;
  }

  if (targetVersion === currentVersion) {
    console.error("❌ New version matches the current version. Nothing to do.");
    process.exitCode = 1;
    return;
  }

  console.log(`🚀 Updating version to ${targetVersion}...`);

  await updateJSONFile("package.json", async (data) => ({
    ...data,
    version: targetVersion,
  }));

  await updateJSONFile("package-lock.json", async (data) => {
    const updated = { ...data, version: targetVersion };
    if (updated.packages?.[""]) {
      updated.packages[""] = {
        ...updated.packages[""],
        version: targetVersion,
      };
    }
    return updated;
  });

  const softwareVersionFrom = `"softwareVersion": "${currentVersion}"`;
  const softwareVersionTo = `"softwareVersion": "${targetVersion}"`;

  await updateTextFile("html/test-dist.html", [
    {
      from: softwareVersionFrom,
      to: softwareVersionTo,
      description: "softwareVersion JSON-LD entry",
    },
  ]);

  await updateTextFile("docs/index.html", [
    {
      from: softwareVersionFrom,
      to: softwareVersionTo,
      description: "softwareVersion JSON-LD entry",
    },
  ]);

  console.log("✅ Version bump complete.");
  console.log("🔢 Previous version:", currentVersion);
  console.log("✨ New version:", targetVersion);
  console.log(
    "📦 Remember to update the changelog and run npm publish when ready."
  );
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Failed to bump version:", error);
    process.exitCode = 1;
  });
}

export default main;
