import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';

export function createApp() {
  const app = express();

  // Atras do proxy nginx: confia no X-Forwarded-For para o rate limit enxergar
  // o IP real do cliente.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));

  // Healthcheck do Coolify - publico e sem tocar no banco.
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', authRoutes);
  app.use('/tasks', taskRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
