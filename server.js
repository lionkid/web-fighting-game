import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(join(__dirname, 'public')));

// --- Room Management ---
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('create-room', (callback) => {
    const roomId = generateRoomId();
    rooms.set(roomId, {
      players: [socket.id],
      inputs: [null, null],
      state: null,
    });
    socket.join(roomId);
    socket.roomId = roomId;
    socket.playerIndex = 0;
    callback({ roomId, playerIndex: 0 });
    console.log(`Room ${roomId} created by ${socket.id}`);
  });

  socket.on('join-room', (roomId, callback) => {
    const room = rooms.get(roomId);
    if (!room) {
      callback({ error: 'Room not found' });
      return;
    }
    if (room.players.length >= 2) {
      callback({ error: 'Room is full' });
      return;
    }
    room.players.push(socket.id);
    socket.join(roomId);
    socket.roomId = roomId;
    socket.playerIndex = 1;
    callback({ roomId, playerIndex: 1 });

    // Notify both players the game can start
    io.to(roomId).emit('game-start', {
      players: room.players,
    });
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on('player-input', (input) => {
    if (!socket.roomId) return;
    const room = rooms.get(socket.roomId);
    if (!room) return;

    // Forward input to the other player
    socket.to(socket.roomId).emit('opponent-input', {
      playerIndex: socket.playerIndex,
      input,
    });
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        io.to(socket.roomId).emit('player-disconnected', {
          playerIndex: socket.playerIndex,
        });
        rooms.delete(socket.roomId);
      }
    }
  });
});

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

httpServer.listen(PORT, () => {
  console.log(`Fighting game server running on http://localhost:${PORT}`);
});
