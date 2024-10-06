import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { exec } from 'child_process';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

const connections = new Set();

io.on('connection', (socket) => {
  connections.add(socket);
  
  socket.on('disconnect', () => {
    connections.delete(socket);
  });
});

app.post('/execute', async (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  try {
    const process = exec(command);
    
    process.stdout.on('data', (data) => {
      for (const socket of connections) {
        socket.emit('output', { type: 'stdout', data });
      }
    });

    process.stderr.on('data', (data) => {
      for (const socket of connections) {
        socket.emit('output', { type: 'stderr', data });
      }
    });

    process.on('close', (code) => {
      for (const socket of connections) {
        socket.emit('command-complete', { code });
      }
    });

    res.json({ status: 'Command received' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 9000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Container server running on port ${PORT}`);
});