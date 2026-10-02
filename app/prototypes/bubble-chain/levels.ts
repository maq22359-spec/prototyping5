export type OrbSpec = { x: number; y: number; size?: number; color?: number };
export type Level = { name: string; hint: string; seconds: number; orbs: OrbSpec[] };

const cyan = 0x36e8ef;
const pink = 0xff4bb6;
const yellow = 0xffdc65;
const violet = 0xae80ff;

export const levels: Level[] = [
  {
    name: 'NEON WARMUP',
    hint: 'Swipe through the glowing orbs. The core catches what you hit.',
    seconds: 30,
    orbs: [
      { x: 337, y: 190, color: cyan },
      { x: 623, y: 190, color: yellow },
      { x: 333, y: 375, color: pink },
      { x: 627, y: 375, color: violet },
    ],
  },
  {
    name: 'DOUBLE TROUBLE',
    hint: 'Keep dragging. You can hit more than one orb in a swipe.',
    seconds: 38,
    orbs: [
      { x: 315, y: 205, color: cyan },
      { x: 645, y: 205, color: yellow },
      { x: 315, y: 355, color: pink },
      { x: 645, y: 355, color: violet },
      { x: 217, y: 186, size: 22, color: yellow },
      { x: 743, y: 186, size: 22, color: pink },
      { x: 217, y: 374, size: 22, color: cyan },
      { x: 743, y: 374, size: 22, color: violet },
    ],
  },
  {
    name: 'ORBIT BREAKER',
    hint: 'Catch the outer orbs before the clock runs out.',
    seconds: 46,
    orbs: [
      { x: 325, y: 195, color: cyan },
      { x: 635, y: 195, color: yellow },
      { x: 325, y: 365, color: pink },
      { x: 635, y: 365, color: violet },
      { x: 215, y: 112, size: 21, color: yellow },
      { x: 215, y: 278, size: 21, color: cyan },
      { x: 745, y: 112, size: 21, color: pink },
      { x: 745, y: 278, size: 21, color: violet },
      { x: 215, y: 448, size: 21, color: pink },
      { x: 745, y: 448, size: 21, color: yellow },
    ],
  },
  {
    name: 'POWER SURGE',
    hint: 'Each collision makes the core bigger and easier to feed.',
    seconds: 54,
    orbs: [
      { x: 335, y: 280, size: 27, color: cyan },
      { x: 625, y: 280, size: 27, color: pink },
      { x: 480, y: 140, color: yellow },
      { x: 480, y: 420, color: violet },
      { x: 210, y: 165, size: 21, color: yellow },
      { x: 210, y: 280, size: 21, color: cyan },
      { x: 210, y: 395, size: 21, color: pink },
      { x: 750, y: 165, size: 21, color: cyan },
      { x: 750, y: 280, size: 21, color: violet },
      { x: 750, y: 395, size: 21, color: yellow },
      { x: 480, y: 55, size: 21, color: pink },
      { x: 480, y: 505, size: 21, color: cyan },
    ],
  },
  {
    name: 'FINAL FRENZY',
    hint: 'Sweep fast, build a huge core, and clear the whole arena.',
    seconds: 62,
    orbs: [
      { x: 330, y: 190, size: 27, color: cyan },
      { x: 630, y: 190, size: 27, color: yellow },
      { x: 330, y: 370, size: 27, color: pink },
      { x: 630, y: 370, size: 27, color: violet },
      { x: 205, y: 110, size: 21, color: yellow },
      { x: 205, y: 205, size: 21, color: cyan },
      { x: 205, y: 355, size: 21, color: pink },
      { x: 205, y: 450, size: 21, color: violet },
      { x: 755, y: 110, size: 21, color: pink },
      { x: 755, y: 205, size: 21, color: violet },
      { x: 755, y: 355, size: 21, color: yellow },
      { x: 755, y: 450, size: 21, color: cyan },
      { x: 480, y: 105, size: 21, color: yellow },
      { x: 480, y: 455, size: 21, color: pink },
    ],
  },
];
