export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const GROUND_Y = 600;
export const STAGE_LEFT = 50;
export const STAGE_RIGHT = CANVAS_W - 50;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
  }

  clear() {
    this.ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  }

  drawBackground() {
    const ctx = this.ctx;
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(0.6, '#16213e');
    grad.addColorStop(1, '#0f3460');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Ground
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_W, GROUND_Y);
    ctx.stroke();
  }

  drawFighter(fighter, color, alpha) {
    const ctx = this.ctx;
    const x = fighter.prevX + (fighter.x - fighter.prevX) * alpha;
    const y = fighter.prevY + (fighter.y - fighter.prevY) * alpha;

    ctx.save();

    // Fighter body
    ctx.fillStyle = color;
    ctx.fillRect(x - fighter.width / 2, y - fighter.height, fighter.width, fighter.height);

    // Direction indicator
    ctx.fillStyle = '#fff';
    const eyeX = fighter.facing === 1
      ? x + fighter.width / 4
      : x - fighter.width / 4;
    ctx.fillRect(eyeX - 3, y - fighter.height + 15, 6, 6);

    ctx.restore();
  }

  drawHitbox(box, color = 'rgba(255,0,0,0.3)') {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
  }
}
