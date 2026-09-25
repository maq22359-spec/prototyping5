import Link from 'next/link';
import styles from './airbuy.module.css';

export default function AirbuyFeature({ detail = false }: { detail?: boolean }) {
  return <section className={styles.feature} id="experiments" aria-labelledby="airbuy-title">
    <div className={styles.inner}>
      <div className={styles.eyebrow}><span>{detail ? 'A project by MA QIANYI' : '01 / Selected work'}</span><span>Brand design · Physical experience</span></div>
      <div className={styles.heading}>
        {detail ? <h1 className={styles.name} id="airbuy-title">AirBuy</h1> : <h2 className={styles.name} id="airbuy-title">AirBuy</h2>}
        <p className={styles.tagline}>Unbox air.<br />Unload care.</p>
      </div>
      {detail ? <img className={styles.heroImage} src="/images/airbuy/hero.jpg" alt="AirBuy’s blue and white flower-shaped puzzle sculptures, photographed with the matching packaging" /> :
        <Link href="/airbuy" className={styles.imageLink} aria-label="Explore AirBuy project">
          <img className={styles.heroImage} src="/images/airbuy/hero.jpg" alt="AirBuy’s blue and white flower-shaped puzzle sculptures, photographed with the matching packaging" loading="lazy" />
          <span className={styles.imageLabel}>Explore AirBuy <span aria-hidden="true">↗</span></span>
        </Link>}
      <div className={styles.summary}>
        <div className={styles.tags}><span>Brand identity</span><span>Packaging</span><span>Playful objects</span></div>
        <div><p className={styles.summaryText}>The joy of opening something. The freedom of needing less. A playful response to the cycle of stress and impulse buying.</p><p className={styles.chinese} lang="zh">拆开一点快乐，放下一点负担。以拆箱、拼插与自然体验，回应压力下的冲动消费。</p></div>
      </div>
    </div>
  </section>;
}
