import express from 'express';
import cors from 'cors';
import accountRoutes from '@/routes/accountsRoutes';
import { errorHandler } from '@/middlewares/errorHandler';


export function createApp() {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Routes
  app.get('/', (req, res) => {
    res.send('Hello World');
  });
  app.use('/api', accountRoutes);

  // Error Handler
  app.use(errorHandler);

  return app;
}