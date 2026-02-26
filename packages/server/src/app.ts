import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ code: 0, message: 'ok', data: null });
});

// TODO: 挂载路由
// app.use('/api/auth', authRoutes);
// app.use('/api/workshops', workshopRoutes);
// app.use('/api/members', memberRoutes);
// app.use('/api/skus', skuRoutes);
// app.use('/api/steps', stepRoutes);
// app.use('/api/records', recordRoutes);
// app.use('/api/settlements', settlementRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
