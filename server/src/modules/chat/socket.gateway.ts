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
      console.log(`User authenticated: ${decoded.id}`);
    } catch (err) {
      console.log('Authentication error:', err);
      return next(new Error('Authentication error'));
    }
    next();
  });

  const onlineUsers = new Map<string, Set<string>>(); // Map userId to Set of socketIds

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.id;
    console.log(`New connection: ${socket.id} for user ${userId}`);
    
    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)?.add(socket.id);
    
    // Broadcast updated online users list
    io.emit('update_online_users', Array.from(onlineUsers.keys()));

    // Each user joins their own private room
    socket.join(userId);
    console.log(`User ${userId} joined their private room.`);


    socket.on('join_chat', (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${userId} joined chat ${chatId}`);
    });

    socket.on('new_message', (newMessage: any) => {
      const chatId = newMessage.chatId?._id || newMessage.chatId;
      if (!chatId) return;

      // Broadcast to all users in the chat room EXCEPT the sender
      socket.to(chatId.toString()).emit('message_received', newMessage);
      
      console.log(`Message from ${userId} broadcasted to room ${chatId}`);
    });



    socket.on('typing', (data: { chatId: string, isTyping: boolean }) => {
      socket.to(data.chatId).emit('user_typing', {
        userId: userId,
        isTyping: data.isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
      io.emit('update_online_users', Array.from(onlineUsers.keys()));
    });
  });
};
