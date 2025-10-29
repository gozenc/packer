#!/usr/bin/env node

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = {
  bump: {
    description: "Bump package version",
    file: "bump-version.js",
  },
  docs: {
    description: "Sync docs from docs.html to docs/",
    file: "sync-docs.js",
  },
  "test:browser": {
    description: "Start a local server to test in browser",
    file: "test-browser.js",
  },
  "test:local": {
    description: "Test the built package locally using npm pack",
    file: "test-local.js",
  },
  "test:package": {
    description: "Verify package structure before publishing",
    file: "test-package.js",
  },
};

async function showHelp() {
  const packageJson = JSON.parse(
    await readFile(join(__dirname, "..", "package.json"), "utf8")
  );

  console.log(`
${packageJson.name} v${packageJson.version}
${packageJson.description}

Usage: packer <command> [options]

Commands:
${Object.entries(commands)
  .map(([cmd, { description }]) => `  ${cmd.padEnd(20)} ${description}`)
  .join("\n")}

  help                 Show this help message

Examples:
  packer bump                    # Interactive version bump
  packer bump 1.2.3              # Bump to specific version
  packer docs                    # Sync documentation
  packer test:browser            # Start test server
  packer test:local              # Test package locally
  packer test:package            # Verify package structure

For more information, visit: ${
    packageJson.repository?.url || packageJson.homepage || ""
  }
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (
    !command ||
    command === "help" ||
    command === "--help" ||
    command === "-h"
  ) {
    await showHelp();
    return;
  }

  if (command === "version" || command === "--version" || command === "-v") {
    const packageJson = JSON.parse(
      await readFile(join(__dirname, "..", "package.json"), "utf8")
    );
    console.log(packageJson.version);
    return;
  }

  const commandConfig = commands[command];

  if (!commandConfig) {
    console.error(`❌ Unknown command: ${command}`);
    console.log(`Run 'packer help' to see available commands.`);
    process.exitCode = 1;
    return;
  }

  try {
    const commandPath = join(__dirname, "..", "lib", commandConfig.file);
    const commandModule = await import(commandPath);

    // If the module has a default export, call it
    if (commandModule.default) {
      await commandModule.default();
    }
  } catch (error) {
    console.error(`❌ Failed to execute command '${command}':`, error.message);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exitCode = 1;
});
