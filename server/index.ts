import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express(); // express app
// Increase body size limits for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Ensure SQLite tables exist
  const { initDb } = await import('./db');
  initDb();
  // Seed default admin account
  const { DbStorage } = await import('./db-storage');
  const dbStorage = new DbStorage();
  await dbStorage.seedAdmin();

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
    // Seed sample tasks for test_teacher if present and no tasks yet
    try {
      const { storage } = await import('./storage');
      const teacher = 'test_teacher';
      const tasks = await (storage as any).listTeacherTasks(teacher);
      if (!Array.isArray(tasks) || tasks.length === 0) {
        await (storage as any).createTask(teacher, { title: 'Recycle Drive', description: 'Collect and sort recyclables.', maxPoints: 8, proofType: 'photo', groupMode: 'group', maxGroupSize: 4 });
        await (storage as any).createTask(teacher, { title: 'Plant a Tree', description: 'Plant a sapling in your neighborhood.', maxPoints: 10, proofType: 'photo', groupMode: 'solo' });
      }
    } catch {}
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
