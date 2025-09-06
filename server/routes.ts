import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve the GLB model file
  app.get('/api/models/earth.glb', (req, res) => {
    const filePath = path.join(process.cwd(), 'public', 'models', 'earth.glb');
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error serving GLB file:', err);
        res.status(404).json({ error: 'GLB model not found' });
      }
    });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
