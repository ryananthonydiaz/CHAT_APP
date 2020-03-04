const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users');

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

  socket.on('join', ({ username, room }) => {
    socket.join(room);

    socket.emit('message', generateMessage(`Welcome to ${room} chat room!`));
    socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`));
  });

  socket.on('sendMessage', (message, callback) => {
    io.to('ufc').emit('message', generateMessage(message));
    callback();
  });

  socket.on('disconnect', () => {
    io.emit('message', generateMessage('A user has left...'));
  });

  socket.on('sendLocation', (position, callback) => {
    io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${position.latitude},${position.longitude}`));

    callback();
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
