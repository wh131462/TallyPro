import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../configs/.env') });

import { sequelize } from './models';
import { testConnection } from './config/database';
import { fail } from './utils/response';

// Import route modules
import authRoutes from './routes/auth';
import workshopRoutes from './routes/workshops';
import memberRoutes from './routes/members';
import skuRoutes from './routes/skus';
import stepRoutes from './routes/steps';
import recordRoutes from './routes/records';
import settlementRoutes from './routes/settlements';
import logRoutes from './routes/logs';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/upload';
import feedbackRoutes from './routes/feedbacks';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ code: 0, message: 'ok', data: null });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/workshops/:workshopId/members', memberRoutes);
app.use('/api/workshops/:workshopId/skus', skuRoutes);
app.use('/api/skus', skuRoutes);
app.use('/api/skus/:skuId/steps', stepRoutes);
app.use('/api/steps', stepRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/workshops/:workshopId/logs', logRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/feedbacks', feedbackRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json(fail('接口不存在', 404));
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json(fail('服务器内部错误'));
});

// Start server
async function start() {
  try {
    // Test database connection
    await testConnection();

    // Sync database models (use { alter: true } in development)
    const isDev = process.env.NODE_ENV !== 'production';

    // Clean up duplicate indexes before sync to avoid ER_TOO_MANY_KEYS
    if (isDev) {
      const qi = sequelize.getQueryInterface();
      const tables = await qi.showAllTables();
      for (const table of tables) {
        const indexes = (await qi.showIndex(table as string)) as any[];
        const seen = new Set<string>();
        for (const idx of indexes) {
          if (idx.primary) continue;
          const key = (idx.fields as any[]).map((f: any) => f.attribute).sort().join(',');
          if (seen.has(key)) {
            await qi.removeIndex(table as string, idx.name);
          } else {
            seen.add(key);
          }
        }
      }
    }

    await sequelize.sync({ alter: isDev });
    console.log('Database synced successfully.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
