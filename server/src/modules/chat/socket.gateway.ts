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

  io.on('connection', (socket: Socket) => {
    console.log(`New connection: ${socket.id} for user ${socket.data.user.id}`);
    
    // Each user joins their own private room
    socket.join(socket.data.user.id);
    console.log(`User ${socket.data.user.id} joined their private room.`);


    socket.on('join_chat', (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${socket.data.user.id} joined chat ${chatId}`);
    });

    socket.on('new_message', (newMessage: any) => {
      const chat = newMessage.chatId;
      if (!chat || !chat.users) {
        console.log('Error: chat or chat.users not defined in new_message');
        return;
      }

      const senderIdStr = newMessage.senderId?._id?.toString() || newMessage.senderId?.toString();

      chat.users.forEach((user: any) => {
        const userIdStr = user._id?.toString() || user.toString();
        
        // Skip sender
        if (userIdStr === senderIdStr) return;
        
        // Emit to the user's private room
        console.log(`Emitting message_received to user room: ${userIdStr}`);
        io.to(userIdStr).emit('message_received', newMessage);
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
