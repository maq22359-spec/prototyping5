import type { Metadata } from 'next';
import Link from 'next/link';
import BubbleChainGame from './BubbleChainGame';
import styles from './styles.module.css';

export const metadata: Metadata = {
  title: 'Bubble Chain — MA QIANYI / Kate',
  description: 'One tap. One ripple. Can you pop every bubble?',
};

export default function BubbleChainPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">MA QIANYI <span>/ Kate</span></Link>
        <Link className={styles.backLink} href="/#playground">← Back to experiments</Link>
      </header>

      <section className={styles.intro} aria-labelledby="game-title">
        <div className={styles.eyebrow}><span className={styles.eyebrowDot} /> A LITTLE EXPERIMENT · 05</div>
        <h1 id="game-title">A little <em>chain reaction.</em></h1>
        <p>One little tap can change everything. Choose a bubble, watch the ripples travel, and try to pop them all.</p>
      </section>

      <BubbleChainGame />

      <footer className={styles.footer}><span>Made with curiosity.</span><Link href="/#playground">More experiments ↗</Link></footer>
    </main>
  );
}
