import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import userRoutes from './routes/user';
import groupRoutes from './routes/group';
import itemRoutes from './routes/item';
import settlementRoutes from './routes/settlement';
import authRoutes from './routes/auth';
import invitationRoutes from './routes/invitation';
import messageRoutes from './routes/message';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

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
app.use('/api/invitations', invitationRoutes);
app.use('/api/messages', messageRoutes);

// Socket.IO - Real-time chat
const connectedUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`📱 User connected: ${socket.id}`);

  // Registrar usuario y su socket
  socket.on('register-user', (userId: string) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
  });

  // Unirse a una sala de grupo
  socket.on('join-group', (groupId: string) => {
    socket.join(groupId);
    io.to(groupId).emit('user-joined', { userId: socket.userId, timestamp: new Date() });
  });

  // Salir de una sala de grupo
  socket.on('leave-group', (groupId: string) => {
    socket.leave(groupId);
    io.to(groupId).emit('user-left', { userId: socket.userId, timestamp: new Date() });
  });

  // Enviar mensaje en el chat
  socket.on('send-message', async (data: { groupId: string; content: string; userName: string; userAvatar: string }) => {
    try {
      // Guardar mensaje en BD
      const Message = require('./models/message').default;
      const message = new Message({
        groupId: data.groupId,
        userId: socket.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        content: data.content,
        timestamp: new Date()
      });
      await message.save();

      // Emitir a todos en la sala
      io.to(data.groupId).emit('new-message', {
        id: message._id,
        groupId: data.groupId,
        userId: socket.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        content: data.content,
        timestamp: message.timestamp
      });
    } catch (err) {
      console.error('Error saving message:', err);
      socket.emit('message-error', { error: 'Failed to save message' });
    }
  });

  // Escribiendo... (indicador en tiempo real)
  socket.on('typing', (data: { groupId: string; userName: string }) => {
    io.to(data.groupId).emit('user-typing', { userId: socket.userId, userName: data.userName });
  });

  // Dejar de escribir
  socket.on('stop-typing', (groupId: string) => {
    io.to(groupId).emit('user-stopped-typing', { userId: socket.userId });
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.userId);
    console.log(`📱 User disconnected: ${socket.id}`);
  });
});

// Hacer disponible io en rutas si es necesario
app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
