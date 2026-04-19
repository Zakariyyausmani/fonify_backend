const { Server } = require('socket.io');

let io;

const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust this for production
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Identify user and join their personal room
    socket.on('identify', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} identified with socket: ${socket.id}`);
    });

    // Join a specific chat room (for typing indicators in a specific conversation)
    socket.on('join_room', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation room: ${conversationId}`);
    });

    // Handle typing indicators (emitted to conversation room)
    socket.on('typing', (data) => {
      socket.to(data.conversationId).emit('user_typing', data);
    });

    socket.on('stop_typing', (data) => {
      socket.to(data.conversationId).emit('user_stop_typing', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { init, getIO };
