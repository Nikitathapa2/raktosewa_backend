// index.ts
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './database/mongodb';
import * as notificationService from './services/notification.service';

dotenv.config();

// Connect to DB
connectDatabase();

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Export io for services
export { io };
notificationService.setSocketIO(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('authenticate', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`🔐 User ${userId} authenticated and joined room`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Start server
const PORT = Number(process.env.PORT) || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log('🔌 Socket.IO ready for connections');
});
