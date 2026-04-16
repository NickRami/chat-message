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

    socket.on('new_message', (newMessage: any) => {
      // The client hit the REST API -> DB saved it -> client emits it here
      const chat = newMessage.chatId;
      if (!chat.users) return console.log('chat.users not defined');

      // We emit to everyone in the chat except the sender
      chat.users.forEach((user: any) => {
        if (user._id === newMessage.senderId._id) return;
        socket.in(user._id).emit('message_received', newMessage);
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
