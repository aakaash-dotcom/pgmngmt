import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser, getUserPgData, saveUserPgData } from "./src/db/users.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health API
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      database: "Cloud SQL PostgreSQL (asia-southeast1)"
    });
  });

  // User Sync Route
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      const name = (req.user as any)?.name || "";

      if (!uid) {
        return res.status(400).json({ error: "Missing user UID in token" });
      }

      const userRecord = await getOrCreateUser(uid, email, name);
      res.json({ success: true, user: userRecord });
    } catch (error: any) {
      console.error("User sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync user" });
    }
  });

  // Get all user PG Data from Cloud SQL
  app.get("/api/pg/data", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const data = await getUserPgData(uid);
      res.json(data);
    } catch (error: any) {
      console.error("Fetch PG data error:", error);
      res.status(500).json({ error: error.message || "Failed to load PG data from Cloud SQL" });
    }
  });

  // Save/Sync user PG Data to Cloud SQL
  app.post("/api/pg/data", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await saveUserPgData(uid, req.body);
      res.json({ success: true, message: "PG data saved to Cloud SQL database" });
    } catch (error: any) {
      console.error("Save PG data error:", error);
      res.status(500).json({ error: error.message || "Failed to save PG data to Cloud SQL" });
    }
  });

  // Google Apps Script Proxy: Uploads captured tenant photos directly to user's Google Drive without client OAuth/CORS issues!
  app.post("/api/drive/upload-appscript", async (req, res) => {
    try {
      const { scriptUrl, base64, filename, folderId } = req.body;
      if (!scriptUrl) {
        return res.status(400).json({ error: "Missing scriptUrl parameter" });
      }
      if (!base64) {
        return res.status(400).json({ error: "Missing base64 image data" });
      }

      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64,
          base64Data: base64,
          filename: filename || `Document_${Date.now()}.jpg`,
          fileName: filename || `Document_${Date.now()}.jpg`,
          folderName: "Agam PG Documents",
          folderId: folderId || "",
        }),
        redirect: "follow",
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { status: "success", raw: responseText };
      }

      res.json(responseData);
    } catch (error: any) {
      console.error("Apps Script upload proxy error:", error);
      res.status(500).json({ error: error.message || "Failed to upload via Google Apps Script" });
    }
  });

  // Google Apps Script Proxy: Exports entire PG ledger / financial tables directly to Google Sheets in User's Drive
  app.post("/api/drive/export-sheet-appscript", async (req, res) => {
    try {
      const { scriptUrl, title, tabs, folderName } = req.body;
      if (!scriptUrl) {
        return res.status(400).json({ error: "Missing scriptUrl parameter" });
      }

      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createSheet",
          title: title || `Agam PG Master Ledger - ${new Date().toLocaleDateString('en-IN')}`,
          folderName: folderName || "Agam PG Documents",
          tabs: tabs || [],
        }),
        redirect: "follow",
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { status: "success", raw: responseText };
      }

      res.json(responseData);
    } catch (error: any) {
      console.error("Apps Script sheet export proxy error:", error);
      res.status(500).json({ error: error.message || "Failed to export sheet via Google Apps Script" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Agam PG Server running on http://localhost:${PORT}`);
  });
}

startServer();
