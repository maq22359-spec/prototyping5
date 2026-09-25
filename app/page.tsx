import Link from 'next/link';
import TouchScene from './touch/TouchScene';
import AirbuyFeature from './airbuy/Feature';
import SalomeFeature from './salome/Feature';
import MushroomFeature from './mushroom/Feature';
import styles from './styles/home.module.css';

export default function Home() {
  return <div className={styles.site}>
    <TouchScene />
    <AirbuyFeature />
    <SalomeFeature />
    <MushroomFeature />
    <section className={styles.experiments} id="playground" aria-labelledby="experiments-title">
      <div className={styles.sectionTop}><p>A FEW THINGS I’M PLAYING WITH</p><span>MA QIANYI / Kate</span></div>
      <h2 id="experiments-title">Little experiments.</h2>
      <div className={styles.projectList}>
        <Link href="/name"><span className={styles.projectIndex}>01</span><span>MA QIANYI / Kate<small>A name, a little daydream, a rainy afternoon.</small></span><span aria-hidden="true">↗</span></Link>
        <Link href="/prototypes/example"><span className={styles.projectIndex}>02</span><span>Getting started<small>A place for the next idea.</small></span><span aria-hidden="true">↗</span></Link>
        <Link href="/prototypes/confetti-button"><span className={styles.projectIndex}>03</span><span>Confetti button<small>A little moment of joy.</small></span><span aria-hidden="true">↗</span></Link>
      </div>
      <footer className={styles.footer}><span>Made with curiosity.</span><span>Kate © 2026</span></footer>
    </section>
  </div>;
}
