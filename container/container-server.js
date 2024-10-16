import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pty from 'node-pty';
import os from 'os';
import { spawn } from 'child_process';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const shells = new Map();
let frontendServer = null;
let activeConnections = 0;

function startFrontendServer() {
  if (frontendServer) return; 

  console.log('Starting frontend server...');
  frontendServer = spawn('npm', ['run', 'dev'], {
    cwd: '/frontend',
    env: { ...process.env, PORT: '3000', HOST: '0.0.0.0' }
  });

  frontendServer.stdout.on('data', (data) => {
    io.emit('output', data);
  });

  frontendServer.stderr.on('data', (data) => {
    io.emit('output', data);
  });

  frontendServer.on('close', (code) => {
    console.log(`Frontend server process exited with code ${code}`);
    frontendServer = null;
  });
}

function stopFrontendServer() {
  if (frontendServer) {
    console.log('Stopping frontend server...');
    frontendServer.kill();
    frontendServer = null;
  }
}

io.on('connection', (socket) => {
  activeConnections++;
  
  if (activeConnections === 1) {
    startFrontendServer();
  }
  
  const shell = pty.spawn(os.platform() === 'win32' ? 'powershell.exe' : 'bash', [], {
    name: 'xterm-color',
    env: process.env
  });
  
  shells.set(socket.id, shell);

  socket.on('input', (data) => {
    shell.write(data);
  });

  socket.on('resize', (size) => {
    shell.resize(size.cols, size.rows);
  });

  shell.on('data', (data) => {
    socket.emit('output', data);
  });

  socket.on('disconnect', () => {
    activeConnections--;
    
    const shell = shells.get(socket.id);
    if (shell) {
      shell.kill();
      shells.delete(socket.id);
    }
    
    if (activeConnections === 0) {
      stopFrontendServer();
    }
  });
});

// Error handling for the main process
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 9000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Container server running on port ${PORT}`);
});