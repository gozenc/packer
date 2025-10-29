#!/usr/bin/env node

/**
 * Simple Node.js static file server for testing
 */

import { createServer } from "http";
import { readFile, stat } from "fs/promises";
import { join, extname } from "path";

// Use process.cwd() to get the project directory where the command is run
const projectDir = process.cwd();

const PORT = 8080;
const HOST = "127.0.0.1";

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

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      let filePath = req.url === "/" ? "/docs/index.html" : req.url;
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

  server.listen(PORT, HOST, () => {
    console.log(`🚀 Test at http://${HOST}:${PORT}/`);
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
