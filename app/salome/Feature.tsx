import Link from 'next/link';
import styles from './salome.module.css';

export default function SalomeFeature({ detail = false }: { detail?: boolean }) {
  return <section className={styles.feature} id="salome" aria-labelledby="salome-title">
    <div className={styles.topline}><span>{detail ? 'Experimental video / 2025' : '02 / Selected work'}</span><span>Moving image · Self-exploration</span></div>
    <div className={styles.cover}>
      {detail ? <img className={styles.portrait} src="/images/salome/portrait.jpg" alt="Salomé wrapped in a luminous blue veil with butterfly ornaments against a dark background" /> : <Link href="/salome" className={styles.portraitLink} aria-label="Explore Salomé project"><img className={styles.portrait} src="/images/salome/portrait.jpg" alt="Salomé wrapped in a luminous blue veil with butterfly ornaments against a dark background" loading="lazy" /></Link>}
      <div className={styles.coverCopy}>
        {detail ? <h1 className={styles.title} id="salome-title">Salomé</h1> : <h2 className={styles.title} id="salome-title">Salomé</h2>}
        <p className={styles.coverLine}>From the gaze of others<br />to a self reclaimed.</p>
        <p className={styles.coverChinese} lang="zh">从他人的凝视，走向与自我的和解。</p>
        {detail ? <a className={styles.coverLink} href="#film">Watch the film <span aria-hidden="true">↓</span></a> : <Link className={styles.coverLink} href="/salome">Explore Salomé <span aria-hidden="true">↗</span></Link>}
      </div>
    </div>
    <div className={styles.bottomline}><div className={styles.tags}><span>Experimental film</span><span>Light & performance</span><span>Visual storytelling</span></div><span>2025</span></div>
  </section>;
}
