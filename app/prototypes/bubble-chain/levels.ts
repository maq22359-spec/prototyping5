export type BubbleSpec = { x: number; y: number; blast: number; size?: number; color?: number };
export type Level = { name: string; hint: string; bubbles: BubbleSpec[] };

const coral = 0xc77d76;
const sage = 0x83aaa0;
const gold = 0xd7aa67;
const lavender = 0xa39cb9;

export const levels: Level[] = [
  {
    name: 'The first ripple',
    hint: 'One bubble has a little more reach than the others.',
    bubbles: [
      { x: 480, y: 280, blast: 210, size: 33, color: coral },
      { x: 337, y: 190, blast: 74, color: sage },
      { x: 623, y: 190, blast: 74, color: gold },
      { x: 333, y: 375, blast: 74, color: lavender },
      { x: 627, y: 375, blast: 74, color: sage },
    ],
  },
  {
    name: 'A gentle echo',
    hint: 'Look for the bubble that can reach both sides.',
    bubbles: [
      { x: 480, y: 280, blast: 205, size: 32, color: coral },
      { x: 315, y: 205, blast: 112, color: sage },
      { x: 645, y: 205, blast: 112, color: gold },
      { x: 315, y: 355, blast: 112, color: lavender },
      { x: 645, y: 355, blast: 112, color: sage },
      { x: 217, y: 186, blast: 65, color: gold },
      { x: 743, y: 186, blast: 65, color: lavender },
      { x: 217, y: 374, blast: 65, color: coral },
      { x: 743, y: 374, blast: 65, color: gold },
    ],
  },
  {
    name: 'The little constellation',
    hint: 'Send a ripple through the middle of the stars.',
    bubbles: [
      { x: 480, y: 280, blast: 210, size: 34, color: coral },
      { x: 325, y: 195, blast: 151, color: sage },
      { x: 635, y: 195, blast: 151, color: gold },
      { x: 325, y: 365, blast: 151, color: lavender },
      { x: 635, y: 365, blast: 151, color: sage },
      { x: 215, y: 112, blast: 60, color: gold },
      { x: 215, y: 278, blast: 60, color: coral },
      { x: 745, y: 112, blast: 60, color: lavender },
      { x: 745, y: 278, blast: 60, color: sage },
      { x: 215, y: 448, blast: 60, color: sage },
      { x: 745, y: 448, blast: 60, color: gold },
    ],
  },
  {
    name: 'Around the garden',
    hint: 'The center starts it; the side bubbles carry it on.',
    bubbles: [
      { x: 480, y: 280, blast: 172, size: 34, color: coral },
      { x: 335, y: 280, blast: 180, size: 29, color: sage },
      { x: 625, y: 280, blast: 180, size: 29, color: gold },
      { x: 480, y: 140, blast: 150, color: lavender },
      { x: 480, y: 420, blast: 150, color: sage },
      { x: 210, y: 165, blast: 60, color: gold },
      { x: 210, y: 280, blast: 60, color: coral },
      { x: 210, y: 395, blast: 60, color: lavender },
      { x: 750, y: 165, blast: 60, color: sage },
      { x: 750, y: 280, blast: 60, color: gold },
      { x: 750, y: 395, blast: 60, color: coral },
      { x: 480, y: 55, blast: 60, color: sage },
      { x: 480, y: 505, blast: 60, color: lavender },
    ],
  },
  {
    name: 'The whole sky',
    hint: 'A single ripple can become a whole sky of them.',
    bubbles: [
      { x: 480, y: 280, blast: 195, size: 35, color: coral },
      { x: 330, y: 190, blast: 160, size: 29, color: sage },
      { x: 630, y: 190, blast: 160, size: 29, color: gold },
      { x: 330, y: 370, blast: 160, size: 29, color: lavender },
      { x: 630, y: 370, blast: 160, size: 29, color: sage },
      { x: 205, y: 110, blast: 58, color: gold },
      { x: 205, y: 205, blast: 58, color: coral },
      { x: 205, y: 355, blast: 58, color: lavender },
      { x: 205, y: 450, blast: 58, color: sage },
      { x: 755, y: 110, blast: 58, color: lavender },
      { x: 755, y: 205, blast: 58, color: sage },
      { x: 755, y: 355, blast: 58, color: gold },
      { x: 755, y: 450, blast: 58, color: coral },
      { x: 480, y: 105, blast: 58, color: gold },
      { x: 480, y: 455, blast: 58, color: lavender },
    ],
  },
];
