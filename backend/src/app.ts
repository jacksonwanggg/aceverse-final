import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { extractUser } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import replyRoutes from './routes/replies.js';
import userRoutes from './routes/users.js';
import timelineRoutes from './routes/timeline.js';
import notificationRoutes from './routes/notifications.js';
import searchRoutes from './routes/search.js';
import gamesRoutes from './routes/games.js';

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(extractUser);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/games', gamesRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
