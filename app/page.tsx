import Link from 'next/link';
import TouchScene from './touch/TouchScene';
import AirbuyFeature from './airbuy/Feature';
import SalomeFeature from './salome/Feature';
import MushroomFeature from './mushroom/Feature';
import styles from './styles/home.module.css';

const prototypes = [
  {title: 'MA QIANYI / Kate', description: 'A name, a little daydream, a rainy afternoon.', path: '/name'},
  {title: 'Getting started', description: 'A place for the next idea.', path: '/prototypes/example'},
  {title: 'Confetti button', description: 'A little moment of joy.', path: '/prototypes/confetti-button'},
  {title: 'Typography experiments / 字体实验', description: 'Shape your words with CSS. 用 CSS 探索文字的形状。', path: '/prototypes/typography-experiments'},
  {title: 'Bubble Chain / 泡泡连锁', description: 'One tap. One ripple. Can you pop them all?', path: '/prototypes/bubble-chain'},
];

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
        {prototypes.map((prototype, index) => (
          <Link key={prototype.path} href={prototype.path}>
            <span className={styles.projectIndex}>{String(index + 1).padStart(2, '0')}</span>
            <span>{prototype.title}<small>{prototype.description}</small></span>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
      <footer className={styles.footer}><span>Made with curiosity.</span><span>Kate © 2026</span></footer>
    </section>
  </div>;
}
