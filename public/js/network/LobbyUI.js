// Phase 2: Room create/join UI
export class LobbyUI {
  constructor(container, networkManager) {
    this.container = container;
    this.network = networkManager;
    this.onReady = null;
    this.element = null;
  }

  show() {
    this.element = document.createElement('div');
    this.element.id = 'lobby';
    this.element.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:100">
        <div style="background:#222;padding:40px;border-radius:8px;text-align:center;color:white;font-family:monospace">
          <h1 style="color:#FFD700;margin-bottom:20px">FIGHTING GAME</h1>
          <div style="margin:20px 0">
            <button id="btn-create" style="padding:12px 24px;font-size:18px;cursor:pointer;background:#4FC3F7;border:none;border-radius:4px;color:#111;font-weight:bold">CREATE ROOM</button>
          </div>
          <div style="margin:20px 0">
            <input id="input-room" placeholder="Room Code" style="padding:12px;font-size:18px;text-align:center;width:150px;text-transform:uppercase" maxlength="6">
            <button id="btn-join" style="padding:12px 24px;font-size:18px;cursor:pointer;background:#FF7043;border:none;border-radius:4px;color:#111;font-weight:bold">JOIN</button>
          </div>
          <p id="lobby-status" style="color:#888;margin-top:15px"></p>
        </div>
      </div>
    `;
    this.container.appendChild(this.element);

    const status = this.element.querySelector('#lobby-status');

    this.element.querySelector('#btn-create').onclick = async () => {
      const result = await this.network.createRoom();
      if (result.error) {
        status.textContent = result.error;
      } else {
        status.textContent = `Room: ${result.roomId} — Waiting for opponent...`;
      }
    };

    this.element.querySelector('#btn-join').onclick = async () => {
      const code = this.element.querySelector('#input-room').value.toUpperCase();
      if (!code) return;
      const result = await this.network.joinRoom(code);
      if (result.error) {
        status.textContent = result.error;
      }
    };

    this.network.onGameStart = () => {
      this.hide();
      if (this.onReady) this.onReady(this.network.playerIndex);
    };
  }

  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
