import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pty from 'node-pty';
import os from 'os';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const shells = new Map();

io.on('connection', (socket) => {
  // Create a new pseudoterminal for each connection
  const shell = pty.spawn(os.platform() === 'win32' ? 'powershell.exe' : 'bash', [], {
    name: 'xterm-color',
    env: process.env
  })

  shells.set(socket.id, shell);

  // Handle incoming data
  socket.on('input', (data) => {
    shell.write(data);
  });

  // Handle terminal resize
  socket.on('resize', (size) => {
    shell.resize(size.cols, size.rows);
  });

  // Send output to client
  shell.on('data', (data) => {
    socket.emit('output', data);
  });

  socket.on('disconnect', () => {
    const shell = shells.get(socket.id);
    if (shell) {
      shell.kill();
      shells.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 9000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Container server running on port ${PORT}`);
});