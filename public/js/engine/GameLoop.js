const TICK_RATE = 60;
const TICK_DURATION = 1000 / TICK_RATE;
const MAX_FRAME_SKIP = 5;

export class GameLoop {
  constructor(updateFn, renderFn) {
    this.update = updateFn;
    this.render = renderFn;
    this.accumulator = 0;
    this.lastTime = 0;
    this.running = false;
    this.rafId = null;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame((t) => this._loop(t));
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _loop(timestamp) {
    if (!this.running) return;

    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.accumulator += delta;

    let updates = 0;
    while (this.accumulator >= TICK_DURATION && updates < MAX_FRAME_SKIP) {
      this.update(TICK_DURATION / 1000);
      this.accumulator -= TICK_DURATION;
      updates++;
    }

    // interpolation alpha for smooth rendering
    const alpha = this.accumulator / TICK_DURATION;
    this.render(alpha);

    this.rafId = requestAnimationFrame((t) => this._loop(t));
  }
}

export { TICK_RATE, TICK_DURATION };
