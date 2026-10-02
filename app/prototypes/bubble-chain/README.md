# Bubble Chain / 泡泡连锁

A five-level, one-move chain-reaction game built with PixiJS v8. Click or tap one bubble; its expanding ripple pops nearby bubbles, which create more ripples. Clear the board to advance.

## Run locally

From the repository root:

```bash
npm install
npm run dev
```

Open `http://localhost:3000/prototypes/bubble-chain`. The homepage also links to the game under **Little experiments**.

## How it works

- Each level has a fixed arrangement of bubbles. Larger bubbles generally produce larger ripples.
- Only the first click is under the player's control; later pops are caused by the chain reaction.
- Choose a level from the side panel, or use **Try again** after an attempt.
- The scene uses PixiJS `Application`, `Graphics`, pointer events, and the app ticker. The surrounding page uses React and CSS Modules.
- The PixiJS application and its resources are destroyed when the page unmounts.

## Files

- `page.tsx`: page layout and metadata
- `BubbleChainGame.tsx`: game rendering and interaction
- `levels.ts`: the five level layouts
- `styles.module.css`: page and game styles
