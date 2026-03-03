// Phase 2: Receives inputs from the network instead of keyboard
export class NetworkInputSource {
  constructor() {
    this.latestInput = this._emptyInput();
  }

  receiveInput(input) {
    this.latestInput = input;
  }

  poll() {
    const snapshot = { ...this.latestInput };
    // Clear edge-triggered inputs after polling
    this.latestInput.attackUp = false;
    this.latestInput.attackMid = false;
    this.latestInput.attackDown = false;
    this.latestInput.up = false;
    return snapshot;
  }

  _emptyInput() {
    return {
      left: false, right: false, up: false, down: false,
      attackUp: false, attackMid: false, attackDown: false,
      block: false, special: false,
    };
  }
}
