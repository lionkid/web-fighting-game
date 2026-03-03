import { CANVAS_W, CANVAS_H } from './Renderer.js';

export class ScreenEffects {
  constructor(ctx) {
    this.ctx = ctx;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
    this.hitSparks = [];
    this.koOverlay = 0;
  }

  triggerShake(intensity = 8, duration = 8) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  addHitSpark(x, y, type) {
    const count = type === 'hit' ? 8 : 4;
    for (let i = 0; i < count; i++) {
      this.hitSparks.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 15 + Math.random() * 10,
        maxLife: 25,
        color: type === 'hit' ? '#FFD700' : '#88CCFF',
        size: type === 'hit' ? 4 + Math.random() * 3 : 3 + Math.random() * 2,
      });
    }
  }

  triggerKO() {
    this.koOverlay = 120; // 2 seconds
  }

  update() {
    // Shake
    if (this.shakeDuration > 0) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeDuration--;
      this.shakeIntensity *= 0.9;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // Sparks
    for (let i = this.hitSparks.length - 1; i >= 0; i--) {
      const s = this.hitSparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.3;
      s.life--;
      if (s.life <= 0) this.hitSparks.splice(i, 1);
    }

    // KO overlay
    if (this.koOverlay > 0) this.koOverlay--;
  }

  applyShake() {
    this.ctx.save();
    this.ctx.translate(this.shakeX, this.shakeY);
  }

  restoreShake() {
    this.ctx.restore();
  }

  drawSparks() {
    const ctx = this.ctx;
    for (const s of this.hitSparks) {
      const alpha = s.life / s.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
    }
    ctx.globalAlpha = 1;
  }

  drawKOOverlay() {
    if (this.koOverlay <= 0) return;
    const ctx = this.ctx;
    const alpha = Math.min(0.6, this.koOverlay / 60);
    ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.15})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  reset() {
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeDuration = 0;
    this.hitSparks = [];
    this.koOverlay = 0;
  }
}
