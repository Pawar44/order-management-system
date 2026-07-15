import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import orderRoutes from './routes/order.routes';
import archiveRoutes from './routes/archive.routes';
import analyticsRoutes from './routes/analytics.routes';
import { errorHandler } from './middleware/errorHandler';
import { initSocket } from './sockets/socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Set up Socket.IO on the same server
initSocket(httpServer);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/orders', orderRoutes);
app.use('/archive-old-orders', archiveRoutes);
app.use('/analytics', analyticsRoutes);

// Error handler must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});