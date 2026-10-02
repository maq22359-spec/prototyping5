# Bubble Rush / 泡泡冲撞

A five-stage arcade game built with PixiJS v8. Hold the mouse button or touch the screen, then drag through an outer orb to send it toward the center. Every orb caught by the center makes the core grow. Feed it every orb before the timer ends.

## Run locally

From the repository root:

```bash
npm install
npm run dev
```

Open `http://localhost:3000/prototypes/bubble-chain`. The homepage also links to the game under **Little experiments**.

## How it works

- Each stage has a fixed arrangement of orbs and a countdown timer.
- Hold and drag across an orb. It flies into the core. Flying orbs can also knock other orbs inward.
- The center grows after each capture. Clear the arena to advance, or restart a stage at any time.
- Keyboard alternative: focus the game board, use Left/Right to select an orb, then press Enter or Space to launch it.
- The scene uses PixiJS `Application`, `Graphics`, and the app ticker, plus pointer capture for reliable mouse and touch swipes. The surrounding page uses React and CSS Modules.
- The PixiJS application and its resources are destroyed when the page unmounts.

## Files

- `page.tsx`: page layout and metadata
- `BubbleChainGame.tsx`: game rendering and interaction
- `levels.ts`: the five level layouts
- `styles.module.css`: page and game styles
