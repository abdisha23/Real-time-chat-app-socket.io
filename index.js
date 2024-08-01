const { Server } = require("socket.io");

const io = new Server({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

let onlineUsers = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle adding a new user
  socket.on('addNewUser', (userId) => {
    !onlineUsers.some(user => user.userId === userId) &&
      onlineUsers.push({ userId, socketId: socket.id });
    
    io.emit('getOnlineUsers', onlineUsers);
    console.log('Online users:', onlineUsers);
  });

  // Handle sending a message
  socket.on('sendMessage', (message) => {
    console.log('Message received on server:', message);
    const user = onlineUsers.find((user) => user.userId === message.recipientId);
    if (user) {
      io.to(user.socketId).emit('getMessage', message);
      io.to(user.socketId).emit('getNotification', {senderId: message.senderId, isRead: false, date: new Date()});
      console.log('Message sent to:', user.userId);
    } else {
      console.log('Recipient user not found or not online:', message.recipientId);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
    io.emit('getOnlineUsers', onlineUsers);
    console.log('A user disconnected:', socket.id);
    console.log('Online users:', onlineUsers);
  });
});

io.listen(3001, () => {
  console.log('Socket.io server listening on port 3001');
});
