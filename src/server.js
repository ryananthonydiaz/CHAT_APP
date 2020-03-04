const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 5000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// socket.emit: sends data to just the specific client
// io.emit: sends data to all the clients
// io.broadcast.emit: sends data to all clients except the socket client
// io.to.emit: sends data to all clients in a specific room
// io.broadcast.to.emit: sends data to all clients within a chat room besides socket client

io.on('connection', (socket) => {
  console.log('New WebSocket connection...');

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Admin', `Welcome to the ${user.room} chat room!`));

    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });

  socket.on('sendLocation', (position, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`));

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
  
    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left...`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      })
    }
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
