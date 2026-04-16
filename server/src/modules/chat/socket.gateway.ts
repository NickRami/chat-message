import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../../config/env';
import jwt from 'jsonwebtoken';

let io: Server;

export const setupSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string };
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.data.user.id}`);
    
    // Join user to their own private room
    socket.join(socket.data.user.id);

    socket.on('join_chat', (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${socket.data.user.id} joined chat ${chatId}`);
    });

    socket.on('send_message', (data: { chatId: string, content: string }) => {
      // In a real implementation we would save this to DB first,
      // then emit to the room.
      socket.to(data.chatId).emit('receive_message', {
        senderId: socket.data.user.id,
        content: data.content,
        chatId: data.chatId,
        timestamp: new Date()
      });
    });

    socket.on('typing', (data: { chatId: string, isTyping: boolean }) => {
      socket.to(data.chatId).emit('user_typing', {
        userId: socket.data.user.id,
        isTyping: data.isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
    });
  });
};
