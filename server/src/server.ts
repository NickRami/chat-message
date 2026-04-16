import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { setupSocket } from './modules/chat/socket.gateway';

const server = http.createServer(app);

// Initialize Socket.io
setupSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
