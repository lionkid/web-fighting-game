import { CANVAS_W } from './Renderer.js';
import { States } from '../game/FighterStateMachine.js';

export class HUD {
  constructor(ctx) {
    this.ctx = ctx;
  }

  draw(fighters, roundWins, timer, matchState) {
    this.drawHPBars(fighters);
    this.drawRoundDots(roundWins);
    this.drawTimer(timer);
    this.drawCombos(fighters);
    this.drawStateOverlay(matchState);
    this.drawControls();
  }

  drawHPBars(fighters) {
    const ctx = this.ctx;
    const barW = 450;
    const barH = 30;
    const barY = 30;
    const p1X = 60;
    const p2X = CANVAS_W - 60 - barW;

    for (let i = 0; i < 2; i++) {
      const f = fighters[i];
      const x = i === 0 ? p1X : p2X;
      const hpRatio = Math.max(0, f.hp / f.maxHP);

      // Background
      ctx.fillStyle = '#333';
      ctx.fillRect(x, barY, barW, barH);

      // Damage preview (white flash)
      if (f.damagePreview > 0 && f.damagePreviewTimer > 0) {
        const previewRatio = Math.max(0, (f.hp + f.damagePreview) / f.maxHP);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        if (i === 0) {
          ctx.fillRect(x + barW * hpRatio, barY, barW * (previewRatio - hpRatio), barH);
        } else {
          ctx.fillRect(x + barW * (1 - previewRatio), barY, barW * (previewRatio - hpRatio), barH);
        }
      }

      // HP bar (fills from outside-in: P1 left-to-right, P2 right-to-left)
      const hpColor = hpRatio > 0.5 ? '#4CAF50' : hpRatio > 0.25 ? '#FF9800' : '#f44336';
      ctx.fillStyle = hpColor;
      if (i === 0) {
        ctx.fillRect(x, barY, barW * hpRatio, barH);
      } else {
        ctx.fillRect(x + barW * (1 - hpRatio), barY, barW * hpRatio, barH);
      }

      // Border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, barY, barW, barH);

      // Player label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = i === 0 ? 'left' : 'right';
      ctx.fillText(`P${i + 1}`, i === 0 ? x : x + barW, barY - 8);

      // HP text
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.ceil(f.hp)}`, x + barW / 2, barY + barH / 2 + 5);
    }
  }

  drawRoundDots(roundWins) {
    const ctx = this.ctx;
    const dotR = 8;
    const dotY = 75;

    for (let p = 0; p < 2; p++) {
      const baseX = p === 0 ? CANVAS_W / 2 - 40 : CANVAS_W / 2 + 40;
      for (let r = 0; r < 2; r++) {
        const x = baseX + (p === 0 ? -r * 25 : r * 25);
        ctx.beginPath();
        ctx.arc(x, dotY, dotR, 0, Math.PI * 2);
        if (r < roundWins[p]) {
          ctx.fillStyle = p === 0 ? '#4FC3F7' : '#FF7043';
          ctx.fill();
        } else {
          ctx.strokeStyle = '#666';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
  }

  drawTimer(timer) {
    const ctx = this.ctx;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(String(Math.ceil(timer)).padStart(2, '0'), CANVAS_W / 2, 55);
  }

  drawCombos(fighters) {
    const ctx = this.ctx;
    for (let i = 0; i < 2; i++) {
      const f = fighters[i];
      if (f.comboCount >= 2) {
        const x = i === 0 ? 150 : CANVAS_W - 150;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${f.comboCount} HIT COMBO!`, x, 120);
      }
    }
  }

  drawStateOverlay(matchState) {
    const ctx = this.ctx;
    if (!matchState || matchState.phase === 'ACTIVE') return;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.textAlign = 'center';
    ctx.font = 'bold 64px monospace';

    if (matchState.phase === 'COUNTDOWN') {
      const count = matchState.countdown;
      ctx.fillStyle = '#FFD700';
      ctx.fillText(count > 0 ? String(count) : 'FIGHT!', CANVAS_W / 2, 350);
    } else if (matchState.phase === 'ROUND_END') {
      ctx.fillStyle = '#f44336';
      ctx.fillText(matchState.message || 'KO!', CANVAS_W / 2, 350);
    } else if (matchState.phase === 'MATCH_END') {
      ctx.fillStyle = '#FFD700';
      ctx.fillText(matchState.message || 'GAME OVER', CANVAS_W / 2, 300);
      ctx.font = 'bold 32px monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText('Press ENTER to restart', CANVAS_W / 2, 380);
    }
  }

  drawControls() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('P1: WASD move | R/T/Y atk (up/mid/down) | F block | G special', 20, 710);
    ctx.textAlign = 'right';
    ctx.fillText('P2: Arrows move | Num7/8/9 atk | Num4 block | Num5 special', CANVAS_W - 20, 710);
  }
}
