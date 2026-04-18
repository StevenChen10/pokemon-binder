import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import collectionRoutes from './routes/collection';
import wishlistRoutes from './routes/wishlist';
import pricesRoutes from './routes/prices';
import leaderboardRoutes from './routes/leaderboard';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /\.vercel\.app$/,
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(new RegExp(`^${process.env.CLIENT_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
}
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Routes
app.use('/api/collection', collectionRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
