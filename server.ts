import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import { authRouter } from "./server/auth";
import { apiRouter } from "./server/api";
import { watsonRouter } from "./server/watson";
import { getDbClient } from "./server/db";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  const PORT = Number(process.env.PORT || 3000);
  const HMR_PORT = Number(process.env.VITE_HMR_PORT || 24678);

  console.log("Starting server...");

  // Database connection
  try {
    getDbClient();
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection failed:", err);
  }

  app.use(express.json());

  // API routes
  app.use("/api/auth", authRouter);
  app.use("/api/data", apiRouter);
  app.use("/api/watson", watsonRouter);

  // Development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          port: HMR_PORT,
        },
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(__dirname, "dist");

    app.use(express.static(distPath));

    app.get("*", (_, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend accessible at http://localhost:${PORT}/`);
  });
}

startServer().catch((err) => {
  console.error("Server failed to start:", err);
});