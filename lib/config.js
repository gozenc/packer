/**
 * Parse command-line arguments and return configuration
 */
export function parseArgs(args = []) {
  const config = {
    // Default values
    dist: "dist",
    host: "127.0.0.1",
    port: 8080,
    docsDir: "docs",
    docsFile: "docs.html",
  };

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");

      // Convert kebab-case to camelCase
      const camelKey = key.replace(/-([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );

      // Parse port as number
      if (camelKey === "port") {
        config[camelKey] = parseInt(value, 10);
      } else if (value !== undefined) {
        config[camelKey] = value;
      }
    }
  }

  return config;
}

/**
 * Get default configuration
 */
export function getDefaults() {
  return {
    dist: "dist",
    host: "127.0.0.1",
    port: 8080,
    docsDir: "docs",
    docsFile: "docs.html",
  };
}
