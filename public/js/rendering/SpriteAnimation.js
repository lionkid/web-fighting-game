export class SpriteAnimation {
  constructor(image, frameWidth, frameHeight, animations) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.animations = animations; // { stateName: { row, frames, speed, loop } }
    this.currentAnim = null;
    this.currentFrame = 0;
    this.frameTimer = 0;
  }

  play(animName) {
    if (this.currentAnim === animName) return;
    this.currentAnim = animName;
    this.currentFrame = 0;
    this.frameTimer = 0;
  }

  update() {
    const anim = this.animations[this.currentAnim];
    if (!anim) return;

    this.frameTimer++;
    if (this.frameTimer >= anim.speed) {
      this.frameTimer = 0;
      this.currentFrame++;
      if (this.currentFrame >= anim.frames) {
        this.currentFrame = anim.loop ? 0 : anim.frames - 1;
      }
    }
  }

  draw(ctx, x, y, facing) {
    const anim = this.animations[this.currentAnim];
    if (!anim || !this.image) return;

    const sx = this.currentFrame * this.frameWidth;
    const sy = anim.row * this.frameHeight;

    ctx.save();
    if (facing === -1) {
      ctx.translate(x, y - this.frameHeight);
      ctx.scale(-1, 1);
      ctx.drawImage(this.image, sx, sy, this.frameWidth, this.frameHeight,
        -this.frameWidth / 2, 0, this.frameWidth, this.frameHeight);
    } else {
      ctx.drawImage(this.image, sx, sy, this.frameWidth, this.frameHeight,
        x - this.frameWidth / 2, y - this.frameHeight, this.frameWidth, this.frameHeight);
    }
    ctx.restore();
  }
}
