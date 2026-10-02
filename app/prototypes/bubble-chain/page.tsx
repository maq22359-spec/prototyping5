import type { Metadata } from 'next';
import Link from 'next/link';
import BubbleChainGame from './BubbleChainGame';
import styles from './styles.module.css';

export const metadata: Metadata = {
  title: 'Bubble Rush — MA QIANYI / Kate',
  description: 'Swipe the orbs, feed the core, and watch it grow.',
};

export default function BubbleChainPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">MA QIANYI <span>/ Kate</span></Link>
        <Link className={styles.backLink} href="/#playground">← Back to experiments</Link>
      </header>

      <section className={styles.intro} aria-labelledby="game-title">
        <div className={styles.eyebrow}><span className={styles.eyebrowDot} /> KATE'S ARCADE · GAME 01</div>
        <h1 id="game-title">BUBBLE <em>RUSH.</em></h1>
        <p>Swipe into the glowing orbs. Send them flying toward the center and grow the core before the clock runs out.</p>
      </section>

      <BubbleChainGame />

      <footer className={styles.footer}><span>Made with curiosity.</span><Link href="/#playground">More experiments ↗</Link></footer>
    </main>
  );
}
