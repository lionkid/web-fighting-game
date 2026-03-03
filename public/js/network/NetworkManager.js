// Phase 2: Socket.IO client wrapper
export class NetworkManager {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.playerIndex = -1;
    this.onOpponentInput = null;
    this.onGameStart = null;
    this.onDisconnect = null;
  }

  connect(serverUrl = '/') {
    // Requires socket.io client script loaded
    this.socket = io(serverUrl);

    this.socket.on('opponent-input', (data) => {
      if (this.onOpponentInput) this.onOpponentInput(data);
    });

    this.socket.on('game-start', (data) => {
      if (this.onGameStart) this.onGameStart(data);
    });

    this.socket.on('player-disconnected', (data) => {
      if (this.onDisconnect) this.onDisconnect(data);
    });
  }

  createRoom() {
    return new Promise((resolve) => {
      this.socket.emit('create-room', (result) => {
        if (!result.error) {
          this.roomId = result.roomId;
          this.playerIndex = result.playerIndex;
        }
        resolve(result);
      });
    });
  }

  joinRoom(roomId) {
    return new Promise((resolve) => {
      this.socket.emit('join-room', roomId, (result) => {
        if (!result.error) {
          this.roomId = result.roomId;
          this.playerIndex = result.playerIndex;
        }
        resolve(result);
      });
    });
  }

  sendInput(input) {
    if (this.socket) {
      this.socket.emit('player-input', input);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
