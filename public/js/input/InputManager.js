export class InputManager {
  constructor(source1, source2) {
    this.sources = [source1, source2];
  }

  poll(playerIndex) {
    return this.sources[playerIndex].poll();
  }

  setSource(playerIndex, source) {
    this.sources[playerIndex] = source;
  }
}
