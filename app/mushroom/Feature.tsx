import Link from 'next/link';
import styles from './mushroom.module.css';

export default function MushroomFeature({ detail = false }: { detail?: boolean }) {
  const title = <><span>Don’t Mess With</span><span>Mushroooom</span></>;
  const photo = <img className={`${styles.cover} ${detail ? '' : styles.homeCover}`} src={detail ? '/images/mushroom/cover.jpg' : '/images/mushroom/home-cover.webp'} alt="Don’t Mess With Mushroooom book opened against a black background" loading={detail ? 'eager' : 'lazy'} />;
  return <section className={styles.feature} id="mushroom" aria-labelledby="mushroom-title">
    <div className={styles.meta}><span>{detail ? 'An unconventional encyclopedia' : '03 / Selected work'}</span><span>Book design · Visual culture</span></div>
    <div className={styles.featureGrid}>
      <div className={styles.featureCopy}>{detail ? <h1 className={styles.title} id="mushroom-title">{title}</h1> : <h2 className={styles.title} id="mushroom-title">{title}</h2>}<span className={styles.spectrum} aria-hidden="true"/><p className={styles.description}>Not quite a field guide.<br />A curious collection of the mushrooms hiding in everyday life.</p><p className={styles.chinese} lang="zh">一本不太正经的蘑菇百科，收集日常生活里那些“不是蘑菇的蘑菇”。</p>{!detail && <Link href="/mushroom" className={styles.link}>Explore the book <span aria-hidden="true">↗</span></Link>}<div className={styles.tags}><span>Editorial design</span><span>Image collection</span><span>Print</span></div></div>
      {detail ? photo : <Link href="/mushroom" className={`${styles.coverLink} ${styles.homeCoverLink}`} aria-label="Explore Don’t Mess With Mushroooom project">{photo}</Link>}
    </div>
  </section>;
}
