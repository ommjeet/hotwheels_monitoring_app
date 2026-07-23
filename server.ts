import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import systemParametersRouter from './server/routes/systemParameters.routes';
import { requestLogger } from './server/middleware/logger';
import { errorHandler } from './server/middleware/errorHandler';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // Logging Middleware
  app.use(requestLogger);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Instamart Collector Engine API', timestamp: new Date().toISOString() });
  });

  // System Parameters API Routes
  app.use('/api/system-parameters', systemParametersRouter);

  // Global Error Handler for API
  app.use(errorHandler);

  // Vite Middleware in development mode or Static Serving in production mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Instamart Collector running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Error]', err);
  process.exit(1);
});
