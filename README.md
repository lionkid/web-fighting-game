# Web Fighting Game

A web-based 2-player fighting game built with HTML Canvas and vanilla JavaScript. Features zone-based combat, special moves, charged attacks, and a best-of-3 round system.

## How to Play

Serve the `public/` directory with any static file server:

```bash
# Python
cd public && python3 -m http.server 8080

# Node.js (with serve)
npx serve public

# Or use the built-in Express server (requires npm install)
npm install && npm start
```

Then open `http://localhost:8080` in your browser.

## Controls

| Action | Player 1 | Player 2 |
|--------|----------|----------|
| Move | WASD | Arrow keys |
| Attack Up | R | Numpad 7 |
| Attack Mid | T | Numpad 8 |
| Attack Down | Y | Numpad 9 |
| Block | F | Numpad 4 |
| Special | G | Numpad 5 |

- **Backtick** (`` ` ``) — Toggle hitbox debug display
- **Enter** — Restart after match ends

### Special Moves

Input sequences are relative to the direction you're facing:

| Move | Input | Properties |
|------|-------|------------|
| Fireball | Down, Forward, Attack Mid | Projectile |
| Dragon Uppercut | Forward, Down, Forward, Attack Up | High damage, launches |
| Sweep | Down, Back, Attack Down | Knockdown |

### Charged Attacks

Hold **Special + any Attack button**, then release Special:

| Charge Time | Effect |
|-------------|--------|
| 0.5s | 1.5x damage |
| 1.0s | 2.0x damage |
| 1.5s | 3.0x damage, unblockable |

## Combat System

- **3 attack zones** — Up (slow/high damage), Mid (balanced), Down (fast/low damage)
- **Blocking** — Hold block + match the attack zone. Correct block takes chip damage; wrong zone takes full damage
- **Combos** — Chain hits within 1.5 seconds for a combo counter
- **Frame data** — Each attack has startup, active, and recovery frames. Hits only connect during active frames

## Match Rules

- Best-of-3 rounds
- 99-second timer per round
- KO when HP reaches 0
- Timeout: higher HP wins

## Project Structure

```
public/js/
├── main.js                  # Entry point + rendering
├── engine/
│   ├── GameLoop.js          # Fixed 60fps timestep
│   └── AssetLoader.js       # Image preloader
├── input/
│   ├── InputManager.js      # 2-player input routing
│   ├── KeyboardInputSource.js
│   └── NetworkInputSource.js
├── game/
│   ├── Game.js              # Top-level orchestrator
│   ├── Match.js             # Best-of-3 rounds
│   ├── Round.js             # Single round lifecycle
│   ├── Fighter.js           # Fighter entity
│   ├── FighterStateMachine.js
│   ├── FighterData.js       # Frame data, hitboxes, specials
│   ├── CombatSystem.js      # Hit detection + blocking
│   ├── ComboDetector.js     # Special move input sequences
│   └── PhysicsSystem.js     # Push collision
├── rendering/
│   ├── Renderer.js          # Canvas 2D drawing
│   ├── HUD.js               # HP bars, timer, round dots
│   ├── ScreenEffects.js     # Shake, sparks, KO overlay
│   └── SpriteAnimation.js   # Sprite sheet playback
└── network/                 # LAN multiplayer (Phase 2)
    ├── NetworkManager.js
    ├── LobbyUI.js
    └── StateSync.js
```

## LAN Multiplayer (Phase 2)

Network scaffolding is in place. To enable LAN play:

```bash
npm install
npm start
```

This starts an Express + Socket.IO server on port 3000. Two browsers can create/join rooms and play over the network.
