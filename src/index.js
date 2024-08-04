// /src/index.js
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import { generateMessage, generateLocationMessage } from './utils/messages.js';
import { addUser, removeUser, getUser, getUsersInRoom } from './utils/users.js';

const app = express();
const server = createServer(app);
const io = new Server(server);

// Resolve __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

// Serve the public directory
app.use(express.static(join(__dirname, '../public')));

// Handle the root route
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public', 'index.html'));
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join', (options, callback)=>{
    const {error, user} = addUser({id: socket.id, ...options});
    if(error){
      return callback(error);
    }
    socket.join(user.room);
    socket.emit('adminMessage', generateMessage('Welcome!', "Admin"));
    socket.broadcast.to(user.room).emit('adminMessage', generateMessage(`${user.username} has joined!`, "Admin"));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    callback();
  })


  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('message', generateMessage(message, user.username));
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`, user.username));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if(user){

      io.to(user.room).emit('adminMessage', generateMessage(`${user.username} has left!`,"Admin"));
      io.to(user.room).emit('roomData',{
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
