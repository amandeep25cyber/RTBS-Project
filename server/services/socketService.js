let io;

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);
      
      // Handshake / room join
      socket.on('join', ({ role, userId }) => {
        if (role === 'admin') {
          socket.join('admin-room');
        } else if (role === 'advertiser' && userId) {
          socket.join(`advertiser-${userId}-room`);
        } else if (role === 'publisher' && userId) {
          socket.join(`publisher-${userId}-room`);
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
