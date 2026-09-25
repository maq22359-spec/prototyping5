'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/home.module.css';

const scenes = [
  { name: 'Rain on the window', short: 'Rain', note: 'A name, a little daydream, a rainy afternoon.', className: styles.rain },
  { name: 'Notes to myself', short: 'Stickers', note: 'Collecting little things that make me, me.', className: styles.paper },
  { name: 'A spoonful of daydreams', short: 'Dream', note: 'A little sweetness, a little imagination.', className: styles.dream },
];
export default function NameScene() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [restart, setRestart] = useState(0);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  // Each scene gets a full two seconds, including after a manual selection.
  useEffect(() => {
    if (paused || !pageVisible) return;
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % scenes.length), 2000);
    return () => window.clearTimeout(timer);
  }, [active, paused, pageVisible, restart]);

  function selectScene(index: number) {
    setActive(index);
    setRestart((value) => value + 1);
  }

  const scene = scenes[active];
  return <div className={styles.site}>
    <Link href="/#experiments" className={styles.skip}>Skip to selected work</Link>
    <section className={`${styles.cover} ${scene.className}`} aria-label="MA QIANYI — personal introduction">
      <img aria-hidden={active !== 0} className={`${styles.rainImage} ${styles.sceneImage} ${active === 0 ? styles.imageVisible : ''}`} src="/images/rain-name.png" alt="MA QIANYI and Kate handwritten in a misted, rain-covered window, surrounded by little stars" fetchPriority="high" />
      <img className={`${styles.stickerImage} ${styles.sceneImage} ${active === 1 ? styles.imageVisible : ''}`} aria-hidden={active !== 1} src="/images/sticker-name.png" alt="MA QIANYI and Kate in colorful glitter stickers on lined notebook paper, with stars and little cherubs" />
      <img className={`${styles.dreamImage} ${styles.sceneImage} ${active === 2 ? styles.imageVisible : ''}`} aria-hidden={active !== 2} src="/images/dream-name.png" alt="MA QIANYI and Kate spelled in golden cookie letters in a silver spoon of milk, with pastel heart macarons and star cookies" />
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>MA QIANYI <span>also, Kate</span></Link>
        <Link href="/#experiments" className={styles.workLink}>Selected work <span aria-hidden="true">↗</span></Link>
      </header>
      <main className={styles.introduction}>
        <h1 className={styles.srOnly}>MA QIANYI — Kate</h1>
        <p className={styles.topNote}>A SMALL CORNER OF MY WORLD</p>
        <p className={styles.caption} key={active}>{scene.note}</p>
      </main>
      <div className={styles.controls}>
        <div className={styles.sceneInfo} aria-live={paused ? 'polite' : 'off'}><span>0{active+1} / 03</span><span>{scene.name}</span></div>
        <div className={styles.switcher} role="group" aria-label="Choose a name artwork">
          {scenes.map((item,i)=><button key={item.short} type="button" aria-pressed={i===active} onClick={()=>selectScene(i)} className={i===active?styles.selected:undefined}><span className={styles.dot}/>{item.short}</button>)}
        </div>
        <div className={styles.playback}>
          <button className={styles.pause} type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}>{paused ? '▶ Play' : 'Ⅱ Pause'}</button>
          <button className={styles.next} type="button" onClick={()=>selectScene((active+1)%scenes.length)} aria-label="Show next name artwork">Next mood <span aria-hidden="true">→</span></button>
        </div>
      </div>
      <Link href="/#experiments" className={styles.scrollHint} aria-label="Explore selected work">EXPLORE THE WORK <span aria-hidden="true">↗</span></Link>
    </section>
  </div>;
}
