# Web Fighting Game

A web-based 2-player fighting game built with HTML Canvas and vanilla JavaScript. Zone-based combat, special moves, charged attacks, and a best-of-3 round system.

## Quick Start

```bash
# Install and run (recommended)
npm install && npm start
# → http://localhost:3000
```

<details>
<summary>Other ways to serve</summary>

```bash
# Python
cd public && python3 -m http.server 8080
# → http://localhost:8080

# Node.js serve package
npx serve public
```
</details>

---

## Controls

| Action | Player 1 | Player 2 |
|--------|----------|----------|
| Move | `W A S D` | Arrow keys |
| Attack High | `R` | Numpad `7` |
| Attack Mid | `T` | Numpad `8` |
| Attack Low | `Y` | Numpad `9` |
| Block | `F` | Numpad `4` |
| Special | `G` | Numpad `5` |

- **`` ` ``** — Toggle hitbox debug overlay
- **Enter** — Restart after match ends

---

## Special Moves

Directions are relative to the direction you're facing.

| Move | Input | Notes |
|------|-------|-------|
| Fireball | ↓ → + Mid | Projectile |
| Dragon Uppercut | → ↓ → + High | High damage, launches opponent |
| Sweep | ↓ ← + Low | Knockdown |

---

## Combat

### Attack Zones

Three zones — high, mid, low. Each has different trade-offs:

| Zone | Speed | Damage |
|------|-------|--------|
| High | Slow | 150 |
| Mid | Medium | 100 |
| Low | Fast | 60 |

### Blocking

Hold **Block** and match the incoming attack's zone. Wrong zone = full damage. Correct zone = chip damage only.

### Charged Attacks

Hold **Special + Attack**, then release Special to fire a charged version:

| Hold time | Effect |
|-----------|--------|
| 0.5s | 1.5× damage |
| 1.0s | 2.0× damage |
| 1.5s | 3.0× damage, unblockable |

### Combos

Chain hits within 1.5 seconds to build a combo counter. Each attack has startup, active, and recovery frames — hits only land during the active window.

---

## Match Rules

- Best-of-3 rounds
- 99-second timer per round
- KO when HP hits 0 · Timeout: higher HP wins

---

## LAN / iPad Play

Start the Express server and open the LAN URL on any device on the same network:

```bash
npm start
# Local:  http://localhost:3000
# LAN:    http://<your-ip>:3000  (shown by ./start.sh)
```

Two browsers can create/join rooms and play over the network via Socket.IO.

---

## Project Structure

```
public/js/
├── main.js                    # Entry point + rendering loop
├── engine/
│   ├── GameLoop.js            # Fixed 60 fps timestep
│   └── AssetLoader.js
├── input/
│   ├── InputManager.js        # 2-player input routing
│   ├── KeyboardInputSource.js
│   └── NetworkInputSource.js
├── game/
│   ├── Game.js                # Top-level orchestrator
│   ├── Match.js               # Best-of-3 rounds
│   ├── Round.js               # Single round lifecycle
│   ├── Fighter.js             # Fighter entity + physics
│   ├── FighterStateMachine.js
│   ├── FighterData.js         # Frame data, hitboxes, specials
│   ├── CombatSystem.js        # Hit detection + blocking
│   ├── ComboDetector.js       # Special move input sequences
│   └── PhysicsSystem.js       # Push collision
├── rendering/
│   ├── Renderer.js            # Canvas 2D drawing
│   ├── HUD.js                 # HP bars, timer, round indicators
│   ├── ScreenEffects.js       # Shake, sparks, KO overlay
│   └── SpriteAnimation.js     # Sprite sheet playback
└── network/
    ├── NetworkManager.js
    ├── LobbyUI.js
    └── StateSync.js
```
