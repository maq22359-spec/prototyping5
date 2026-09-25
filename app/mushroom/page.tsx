import Link from 'next/link';
import type { Metadata } from 'next';
import MushroomFeature from './Feature';
import InteractiveSpread from './InteractiveSpread';
import styles from './mushroom.module.css';

export const metadata: Metadata = { title: 'Don’t Mess With Mushroooom — MA QIANYI / Kate', description: 'A playful book collecting mushroom-inspired forms and unexpected connections in everyday visual culture.' };
const spreads = [
  { title: 'An unexpected index', imagePath: '/images/mushroom/spread-1-interactive.webp' },
  { title: 'Forms in everyday life', imagePath: '/images/mushroom/spread-2-interactive.webp' },
  { title: 'A familiar silhouette', imagePath: '/images/mushroom/spread-3-interactive.webp' },
  { title: 'Playful transformations', imagePath: '/images/mushroom/spread-4-interactive.webp' },
  { title: 'Mushrooms in pop culture', imagePath: '/images/mushroom/spread-5-interactive.webp' },
  { title: 'A spectrum of associations', imagePath: '/images/mushroom/spread-6-interactive.webp' },
  { title: 'Shape and scale', imagePath: '/images/mushroom/spread-7-interactive.webp' },
  { title: 'A collection of characters', imagePath: '/images/mushroom/spread-8-interactive.webp' },
];
export default function MushroomPage() {
  return <div className={styles.page}>
    <nav className={styles.nav} aria-label="Project navigation"><Link href="/#mushroom">← All work</Link><span>MA QIANYI / KATE</span></nav>
    <main>
      <MushroomFeature detail />
      <section className={styles.intro} aria-labelledby="idea-title"><div><p className={styles.kicker}>01 / An unlikely encyclopedia</p><h2 className={styles.heading} id="idea-title">Mushrooms,<br />where you least<br />expect them.</h2></div><div><p className={styles.body}>Growing up around mushrooms sparked a fascination with their strange shapes and colors. Rather than make another scientific guide, this book collects their unexpected echoes in everyday objects, images, and popular culture. It invites the reader to notice, make connections, and smile.</p><p className={styles.chinese} lang="zh">从成长环境中熟悉的蘑菇出发，将奇妙的形态与色彩转化为一本带着幽默感的图像书。它不急于给出科学定义，而是寻找蘑菇在日常物件、流行文化和视觉图像中的回声。</p></div></section>
      <section className={styles.process} aria-label="Book design development"><figure><img src="/images/mushroom/inspiration.jpg" alt="A fine coordinate grid with mushroom silhouettes alongside mushrooms growing on tree bark" loading="lazy"/><figcaption className={styles.caption}>01 / From natural clusters to a coordinate grid<br /><span lang="zh">从自然生长的簇群，提取封面的网格与散点语言。</span></figcaption></figure><figure><img src="/images/mushroom/editions.jpg" alt="Three cover iterations: a mushroom illustration, a minimal grid, and a grid with colorful mushroom shapes" loading="lazy"/><figcaption className={styles.caption}>02 / Three editions, one evolving idea<br /><span lang="zh">从具象插画到网格，再到彩色形态的三次封面探索。</span></figcaption></figure></section>
      <section className={styles.spreads} aria-labelledby="spreads-title"><div className={styles.spreadTop}><h2 className={styles.heading} id="spreads-title">Inside the book.</h2><p>Selected spreads / 内页选集</p></div><div className={styles.spreadGrid}><InteractiveSpread spreads={spreads} /></div></section>
    </main>
    <footer className={styles.footer}><Link href="/#mushroom">← Back to selected work</Link><Link href="/salome">Explore Salomé ↗</Link></footer>
  </div>;
}
