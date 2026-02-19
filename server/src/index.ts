import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import userRoutes from './routes/user';
import groupRoutes from './routes/group';
import itemRoutes from './routes/item';
import settlementRoutes from './routes/settlement';
import authRoutes from './routes/auth';

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/compraconmigo';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Mongo connection error', err));

// Basic health check
app.get('/', (req, res) => res.send('CompraConmigo API')); 

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/settlements', settlementRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
