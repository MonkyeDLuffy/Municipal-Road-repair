import dotenv from 'dotenv';
dotenv.config();

console.log('[INDEX] JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES (length: ' + process.env.JWT_SECRET.length + ')' : 'NO');
console.log('[INDEX] PORT:', process.env.PORT);
console.log('[INDEX] FRONTEND_URL:', process.env.FRONTEND_URL);

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Dynamic imports for routes to ensure dotenv is loaded first
const authRoutes = (await import('./routes/auth.js')).default;
const workerRoutes = (await import('./routes/worker.js')).default;
const citizenRoutes = (await import('./routes/citizen.js')).default;
const supervisorRoutes = (await import('./routes/supervisor.js')).default;
const adminRoutes = (await import('./routes/admin.js')).default;

app.use('/api/auth', authRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('🚀 Backend running on http://localhost:${PORT}');
});

export default app;