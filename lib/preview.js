#!/usr/bin/env node

/**
 * Simple Node.js static file server for testing
 */

import { createServer } from "http";
import { readFile, stat } from "fs/promises";
import { join, extname } from "path";
import { parseArgs } from "./config.js";

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function startServer(...args) {
  // Parse configuration from arguments
  const config = parseArgs(args);

  // Use process.cwd() to get the project directory where the command is run
  const projectDir = process.cwd();

  const server = createServer(async (req, res) => {
    try {
      let filePath =
        req.url === "/" ? `/${config.docsDir}/index.html` : req.url;
      filePath = join(projectDir, filePath);

      const stats = await stat(filePath);

      if (stats.isFile()) {
        const ext = extname(filePath);
        const contentType = mimeTypes[ext] || "application/octet-stream";

        res.writeHead(200, {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
        });

        const content = await readFile(filePath);
        res.end(content);
      } else {
        res.writeHead(404);
        res.end("File not found");
      }
    } catch (error) {
      res.writeHead(404);
      res.end("File not found");
    }
  });

  server.listen(config.port, config.host, () => {
    console.log(`🚀 Preview at http://${config.host}:${config.port}/`);
    console.log(`📁 Serving from: ${projectDir}`);
    console.log(`📄 Root: ${config.docsDir}/index.html`);
  });

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n👋 Shutting down server...");
    server.close(() => {
      process.exit(0);
    });
  });

  return server;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default startServer;
