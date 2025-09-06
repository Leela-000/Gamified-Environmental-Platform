import express, { type Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve all assets under public/models (textures, bins, nested folders) so GLB dependencies resolve
  const modelsRoot = path.join(process.cwd(), 'public', 'models');
  app.use('/api/models', express.static(modelsRoot));

  // Serve any model from public/models safely
  app.get('/api/models/:file', (req, res) => {
    const { file } = req.params;
    // basic sanitization: only allow .glb or .gltf under public/models
    if (!/^[A-Za-z0-9._-]+\.(glb|gltf)$/.test(file)) {
      return res.status(400).json({ error: 'Invalid model filename' });
    }

    const filePath = path.join(process.cwd(), 'public', 'models', file);
    res.type(path.extname(filePath));
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error serving model file:', err);
        res.status(404).json({ error: 'Model not found' });
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
