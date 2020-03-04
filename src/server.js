const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 5000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

const welcomeMessage = 'Welcome to the Chat Room!';
io.on('connection', (socket) => {
  console.log('New WebSocket connection...');

  socket.emit('message', welcomeMessage);
  socket.broadcast.emit('message', 'A new user has joined!')

  socket.on('sendMessage', (message, callback) => {
    io.emit('message', message);
    callback();
  });

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left...');
  });

  socket.on('sendLocation', (position, callback) => {
    io.emit('message', `https://google.com/maps?q=${position.latitude},${position.longitude}`);

    callback();
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
