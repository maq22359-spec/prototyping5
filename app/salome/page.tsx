import Link from 'next/link';
import type { Metadata } from 'next';
import InteractiveSalomeHero from './InteractiveHero';
import styles from './salome.module.css';

export const metadata: Metadata = { title: 'Salomé — MA QIANYI / Kate', description: 'An experimental reinterpretation of Salomé, exploring the gaze, the inner self, and reconciliation through blue light and performance.' };
const stills = [
  ['02','Salomé raises her hands beneath the translucent blue veil'],
  ['03','Electric blue light traces the folds of the veil'],
  ['04','An unveiled portrait against a black background'],
  ['05','Close-up of hands, eye markings, and luminous fabric'],
  ['08','Salomé holds a decorated sculptural head'],
  ['09','The performer embraces the sculptural head'],
  ['10','A quiet gesture beneath the lifted veil'],
  ['11','A sculptural head rests in glowing blue fabric'],
  ['12','Decorated sculptural forms with eye drawings and butterflies'],
  ['13','The performer rests beside the sculptural head'],
];
export default function SalomePage() {
  return <div className={styles.page}>
    <nav className={styles.nav} aria-label="Project navigation"><Link href="/#salome">← All work</Link><span>MA QIANYI / KATE</span></nav>
    <main>
      <InteractiveSalomeHero />
      <section className={styles.intro} aria-labelledby="concept-title">
        <div><p className={styles.kicker}>01 / Reframing the story</p><h2 className={styles.heading} id="concept-title">The other<br />is within.</h2></div>
        <div className={styles.body}><p>This experimental video reinterprets Oscar Wilde’s <em>Salomé</em> through an inward gaze. The focus shifts from desire for another person to an encounter with the parts of the self that remain concealed.</p><p>Seven layers of blue veil become a visual language for external scrutiny and inner suffocation. Through struggle, unveiling, and an eventual embrace, the narrative moves toward self-recognition and reconciliation.</p><p className={styles.chinese} lang="zh">这部实验影像将《莎乐美》的叙事从“追逐他者”转向“凝视自身”。蓝色面纱、眼睛符号与身体动作，呈现被压抑的自我如何逐渐被看见、接纳。</p></div>
      </section>
      <div className={styles.triptych}>
        <img className={styles.frame} src="/images/salome/still-06.jpg" alt="A fragmented gesture emerges from darkness" loading="lazy" />
        <img className={styles.frame} src="/images/salome/still-07.jpg" alt="Layered hands and eye symbols frame the performer’s face" loading="lazy" />
        <img className={styles.frame} src="/images/salome/still-14.jpg" alt="The performer rests with a sculptural head in a moment of reconciliation" loading="lazy" />
      </div>
      <section className={styles.chapter} aria-labelledby="light-title">
        <div className={styles.chapterHeader}><div><p className={styles.kicker}>02 / Light as an inner landscape</p><h2 className={styles.heading} id="light-title">Everything falls away.<br />Blue remains.</h2></div><div><p className={styles.chapterIntro}>Drawing on Derek Jarman’s minimalist approach, the project strips away the external setting. Black space and blue-violet light make fabric, skin, and gesture the focus. Lighting and mesh-veil tests establish the film’s visual language.</p><p className={styles.chinese} lang="zh">借鉴 Derek Jarman 的极简表达，以黑场与蓝紫光抽离外部环境，让情绪通过面料、皮肤和动作显现。</p></div></div>
        <div className={styles.lightGrid}><figure className={styles.study}><img src="/images/salome/lighting.jpg" alt="Blue lighting study illuminating textured surfaces" loading="lazy" /><figcaption><span>01 / Lighting study</span><span>光线测试</span></figcaption></figure><figure className={styles.study}><img src="/images/salome/veil-test.jpg" alt="Portrait from the mesh veil and lighting test" loading="lazy" /><figcaption><span>02 / Veil & portrait study</span><span>面纱与人物测试</span></figcaption></figure></div>
        <div className={styles.palette} aria-label="A palette of midnight black and blue-violet light">{['#030817','#4162e5','#466cfa','#233dcc','#09113d'].map(color=><div key={color} className={styles.swatch} style={{background:color}}>{color.toUpperCase()}</div>)}</div>
      </section>
      <section className={styles.story} aria-labelledby="story-title"><div className={styles.chapterHeader}><div><p className={styles.kicker}>03 / From script to sequence</p><h2 className={styles.heading} id="story-title">A gesture becomes<br />a narrative.</h2></div><div><p className={styles.chapterIntro}>The storyboard follows the body through concealment, confrontation, and reconciliation. Close-ups, ghosted movement, and recurring eye symbols turn psychological states into images.</p><p className={styles.chinese} lang="zh">分镜以遮蔽、对峙与和解串联身体动作，通过特写、重影和反复出现的眼睛符号，将心理状态转化为画面。</p></div></div><figure><img className={styles.storyboard} src="/images/salome/storyboard.jpg" alt="Twelve hand-drawn storyboard panels exploring veiling, hands, eyes, the sculptural head, and reconciliation" loading="lazy"/><figcaption className={styles.figureCaption}>Storyboard development / 分镜设计</figcaption></figure></section>
      <section className={styles.production} aria-labelledby="production-title"><div className={styles.productionGrid}><div><p className={styles.kicker}>04 / Behind the image</p><h2 className={styles.heading} id="production-title">Making the<br />inner world visible.</h2><p className={styles.chinese} lang="zh">从剧本改编、道具制作到布光与现场拍摄。</p><dl className={styles.details}><div><dt>Materials</dt><dd>Organza, mesh, netting, dried flowers, butterfly decorations, and RGB light.</dd></div><div><dt>Tools</dt><dd>CapCut · Photoshop · Procreate</dd></div><div><dt>Format</dt><dd>1920 × 1080 · Experimental video</dd></div><div><dt>Date</dt><dd>27 June 2025</dd></div></dl></div><figure><img className={styles.productionPhoto} src="/images/salome/production.jpg" alt="Six behind-the-scenes photographs showing lighting, set preparation, prop-making, performance, and painted eye markings" loading="lazy"/><figcaption className={styles.figureCaption}>Shooting process & prop-making / 拍摄与道具制作</figcaption><img className={styles.script} src="/images/salome/script.jpg" alt="Handwritten script notes, shot planning, and typed script pages" loading="lazy"/></figure></div></section>
      <section className={styles.stills} aria-labelledby="stills-title"><p className={styles.kicker}>05 / Selected frames</p><h2 className={styles.heading} id="stills-title">Between shadow<br />and self.</h2><div className={styles.stillGrid}>{stills.map(([n,alt])=><img key={n} src={`/images/salome/still-${n}.jpg`} alt={alt} loading="lazy" />)}</div></section>
      <a className={styles.film} id="film" href="https://youtu.be/npkavj45_iu" target="_blank" rel="noopener noreferrer" aria-label="Watch Salomé on YouTube (opens in a new tab)"><img src="/images/salome/still-07.jpg" alt="" loading="lazy"/><span className={styles.filmText}><span className={styles.play} aria-hidden="true">▶</span><span className={styles.filmTitle}>Watch Salomé</span><span className={styles.filmHint}>观看完整影像 · Opens on YouTube ↗</span></span></a>
    </main>
    <footer className={styles.footer}><Link href="/#salome">← Back to selected work</Link><Link href="/airbuy">Explore AirBuy ↗</Link></footer>
  </div>;
}
