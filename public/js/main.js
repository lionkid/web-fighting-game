import { GameLoop } from './engine/GameLoop.js';
import { Renderer } from './rendering/Renderer.js';
import { HUD } from './rendering/HUD.js';
import { ScreenEffects } from './rendering/ScreenEffects.js';
import { InputManager } from './input/InputManager.js';
import { KeyboardInputSource, P1_KEYS, P2_KEYS } from './input/KeyboardInputSource.js';
import { Game } from './game/Game.js';
import { States } from './game/FighterStateMachine.js';

// --- Init ---
const canvas = document.getElementById('game-canvas');
const renderer = new Renderer(canvas);
const hud = new HUD(renderer.ctx);
const effects = new ScreenEffects(renderer.ctx);

const p1Input = new KeyboardInputSource(P1_KEYS);
const p2Input = new KeyboardInputSource(P2_KEYS);
const inputManager = new InputManager(p1Input, p2Input);

const game = new Game(inputManager);

// --- Colors ---
const P1_COLOR = '#4FC3F7';
const P2_COLOR = '#FF7043';
const P1_COLOR_FLASH = '#FFFFFF';
const P2_COLOR_FLASH = '#FFFFFF';

// --- Game Loop ---
function update(dt) {
  const { hitEvents } = game.update(dt);

  // Process hit events for effects
  for (const evt of hitEvents) {
    if (evt.type === 'hit') {
      effects.addHitSpark(evt.x, evt.y, 'hit');
      effects.triggerShake(10, 8);
    } else if (evt.type === 'block') {
      effects.addHitSpark(evt.x, evt.y, 'block');
      effects.triggerShake(4, 4);
    }
  }

  // Check for KO
  for (const f of game.fighters) {
    if (f.sm.state === States.KO && f.sm.stateTimer === 1) {
      effects.triggerKO();
      effects.triggerShake(20, 15);
    }
  }

  effects.update();
}

function render(alpha) {
  const state = game.state;

  renderer.clear();

  effects.applyShake();
  renderer.drawBackground();

  // Draw projectiles
  const ctx = renderer.ctx;
  for (let i = 0; i < 2; i++) {
    const f = state.fighters[i];
    const color = i === 0 ? P1_COLOR : P2_COLOR;
    for (const p of f.projectiles) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.w / 2 + 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Draw fighters
  for (let i = 0; i < 2; i++) {
    const f = state.fighters[i];
    const baseColor = i === 0 ? P1_COLOR : P2_COLOR;
    const color = f.hitFlashTimer > 0 ? (i === 0 ? P1_COLOR_FLASH : P2_COLOR_FLASH) : baseColor;
    drawFighterDetailed(f, color, alpha, i);
  }

  // Debug hitboxes
  if (state.debugHitboxes) {
    for (const f of state.fighters) {
      renderer.drawHitbox(f.hurtbox, 'rgba(0,255,0,0.4)');
      const hitbox = f.activeHitbox;
      if (hitbox) {
        renderer.drawHitbox(hitbox, 'rgba(255,0,0,0.6)');
      }
    }
  }

  effects.drawSparks();
  effects.drawKOOverlay();
  effects.restoreShake();

  // HUD on top (not affected by shake)
  hud.draw(state.fighters, state.roundWins, state.timer, state.matchState);
}

function drawFighterDetailed(fighter, color, alpha, playerIndex) {
  const ctx = renderer.ctx;
  const x = fighter.prevX + (fighter.x - fighter.prevX) * alpha;
  const y = fighter.prevY + (fighter.y - fighter.prevY) * alpha;
  const w = fighter.width;
  const h = fighter.height;
  const facing = fighter.facing;
  const state = fighter.sm.state;

  ctx.save();

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, 600, w / 2, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body based on state
  const bodyX = x - w / 2;
  const bodyY = y - h;

  if (state === States.KO) {
    // Fallen fighter
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = color;
    ctx.fillRect(x - h / 2, y - 20, h, 20);
    ctx.globalAlpha = 1;
    ctx.restore();
    return;
  }

  if (state === States.HITSTUN || state === States.BLOCKSTUN) {
    // Recoil - lean back
    ctx.translate(x, y);
    ctx.rotate(-facing * 0.15);
    ctx.translate(-x, -y);
  }

  // Legs
  ctx.fillStyle = darkenColor(color, 0.7);
  const legW = w * 0.35;
  if (state === States.WALK) {
    const walkCycle = Math.sin(fighter.sm.stateTimer * 0.3) * 8;
    ctx.fillRect(x - legW - 2, y - h * 0.4, legW, h * 0.4 + walkCycle);
    ctx.fillRect(x + 2, y - h * 0.4, legW, h * 0.4 - walkCycle);
  } else if (state === States.JUMP) {
    // Tucked legs
    ctx.fillRect(x - legW - 2, y - h * 0.35, legW, h * 0.3);
    ctx.fillRect(x + 2, y - h * 0.35, legW, h * 0.3);
  } else {
    ctx.fillRect(x - legW - 2, y - h * 0.4, legW, h * 0.4);
    ctx.fillRect(x + 2, y - h * 0.4, legW, h * 0.4);
  }

  // Torso
  ctx.fillStyle = color;
  ctx.fillRect(bodyX + 5, bodyY + h * 0.15, w - 10, h * 0.45);

  // Head
  ctx.fillStyle = lightenColor(color, 1.2);
  const headR = w * 0.3;
  ctx.beginPath();
  ctx.arc(x, bodyY + headR + 2, headR, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#111';
  const eyeX = x + facing * 6;
  ctx.fillRect(eyeX - 3, bodyY + headR - 2, 6, 4);

  // Attack arm
  if (state === States.ATTACK && fighter.sm.attackData) {
    ctx.fillStyle = lightenColor(color, 1.3);
    const phase = fighter.sm.attackPhase;
    const zone = fighter.sm.attackData.zone;
    let armY = bodyY + h * 0.3;
    if (zone === 'up') armY = bodyY + h * 0.1;
    if (zone === 'down') armY = bodyY + h * 0.55;

    let armExtend = 0;
    if (phase === 'startup') armExtend = -10;
    if (phase === 'active') armExtend = 35;
    if (phase === 'recovery') armExtend = 10;

    const armW = 40 + armExtend;
    const armX = facing === 1 ? x + w * 0.2 : x - w * 0.2 - armW;
    ctx.fillRect(armX, armY, armW, 12);

    // Fist
    if (phase === 'active') {
      ctx.fillStyle = '#FFD700';
      const fistX = facing === 1 ? armX + armW : armX;
      ctx.fillRect(fistX - 4, armY - 2, 12, 16);
    }
  } else if (state === States.BLOCK) {
    // Block pose - arms crossed
    ctx.fillStyle = lightenColor(color, 1.1);
    ctx.fillRect(x - 18, bodyY + h * 0.25, 36, 14);
    ctx.fillRect(x - 14, bodyY + h * 0.35, 28, 14);
  } else {
    // Idle/walk arms
    ctx.fillStyle = darkenColor(color, 0.85);
    const armSwing = state === States.WALK ? Math.sin(fighter.sm.stateTimer * 0.3) * 5 : 0;
    ctx.fillRect(x - w / 2 - 6, bodyY + h * 0.2 + armSwing, 8, h * 0.3);
    ctx.fillRect(x + w / 2 - 2, bodyY + h * 0.2 - armSwing, 8, h * 0.3);
  }

  // Block zone indicator when blocking
  if (state === States.BLOCK) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    let shieldY = bodyY;
    if (fighter.blockZone === 'up') shieldY = bodyY;
    else if (fighter.blockZone === 'mid') shieldY = bodyY + h * 0.3;
    else shieldY = bodyY + h * 0.6;
    ctx.strokeRect(x - w / 2 - 5, shieldY, w + 10, h * 0.35);
    ctx.setLineDash([]);
  }

  // Charge indicator
  if (fighter.chargeTimer > 0) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, bodyY - 10, 15, 0, Math.PI * 2 * Math.min(1, fighter.chargeTimer / 90));
    ctx.stroke();
  }

  // Player indicator
  ctx.fillStyle = playerIndex === 0 ? '#4FC3F7' : '#FF7043';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`P${playerIndex + 1}`, x, bodyY - 10);

  ctx.restore();
}

function darkenColor(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * factor)},${Math.round(g * factor)},${Math.round(b * factor)})`;
}

function lightenColor(hex, factor) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) * factor);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) * factor);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) * factor);
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

// --- Start ---
const loop = new GameLoop(update, render);
loop.start();

console.log('Fighting game started! Press ` to toggle hitbox debug.');
