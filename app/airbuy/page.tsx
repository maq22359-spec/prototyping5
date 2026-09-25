import Link from 'next/link';
import type { Metadata } from 'next';
import AirbuyFeature from './Feature';
import styles from './airbuy.module.css';

export const metadata: Metadata = { title: 'AirBuy — MA QIANYI / Kate', description: 'Unbox Air, Unload Care. A brand and physical experience exploring emotional relief beyond consumption.' };

export default function AirbuyPage() {
  return <div className={styles.page}>
    <nav className={styles.nav} aria-label="Project navigation"><Link href="/#experiments">← All work</Link><span>MA QIANYI / KATE</span></nav>
    <main>
      <AirbuyFeature detail />
      <section className={styles.intro} aria-labelledby="idea-title">
        <div><p className={styles.kicker}>01 / The idea</p><h2 className={styles.title} id="idea-title">What if relief<br />wasn’t another<br />purchase?</h2></div>
        <div className={styles.body}><p>Stress can lead to an impulsive purchase, a brief moment of pleasure, and then guilt. AirBuy asks how design might interrupt that cycle.</p><p>The project keeps the anticipation and tactile pleasure of unboxing, then turns attention toward making and the world outside: tear-open packaging, modular flower puzzles, and transparent posters completed by real landscapes.</p><p lang="zh">AirBuy 保留拆箱的期待与触感，把注意力从“继续购买”转向动手创造和户外体验，让情绪的出口不只是一件新的商品。</p></div>
      </section>
      <img className={styles.fullImage} src="/images/airbuy/collection.jpg" alt="The complete AirBuy physical collection: flower puzzles, blue patterned tape, and tear-open packaging" loading="lazy" />
      <section className={styles.designProcess} aria-labelledby="visual-title">
        <div className={styles.designHeader}>
          <div><p className={styles.kicker}>02 / Building the visual language</p><h2 className={styles.title} id="visual-title">A little nature.<br />A whole new language.</h2></div>
          <div><p className={styles.designIntro}>From the shape of a petal to a repeating rhythm. AirBuy’s visual identity grows from flowers, simplified into a family of playful blue forms.</p><p className={styles.chinese} lang="zh">从真实花瓣中提取轮廓，以对称、旋转与重复构建图形，让自然的轻盈感贯穿品牌。</p></div>
        </div>
        <div className={styles.designStages}>
          <figure className={styles.stage}>
            <div className={styles.stageImage}><img src="/images/airbuy/flower-inspiration.jpg" alt="Flower photographs with the petal silhouettes and geometric motifs derived from them" loading="lazy" /></div>
            <figcaption><span className={styles.stageNumber}>01 / OBSERVE</span><h3>Look closer.</h3><p>Petals, silhouettes, and the small details of nature.</p><p lang="zh">观察花瓣与轮廓，提取自然中的细节。</p></figcaption>
          </figure>
          <figure className={styles.stage}>
            <div className={styles.stageImage}><img src="/images/airbuy/pattern-exploration.jpg" alt="Nine AirBuy graphic studies exploring blue flower shapes, circular repetition, symmetry, and gradients" loading="lazy" /></div>
            <figcaption><span className={styles.stageNumber}>02 / EXPLORE</span><h3>Find the rhythm.</h3><p>Rotate, repeat, and rearrange a family of floral forms.</p><p lang="zh">通过旋转、重复与组合，探索图形的节奏。</p></figcaption>
          </figure>
          <figure className={styles.stage}>
            <div className={`${styles.stageImage} ${styles.stripImage}`}><img src="/images/airbuy/pattern-strips.jpg" alt="AirBuy’s continuous blue and white pattern strips with floral motifs, the hand logo, and Unbox Air Unload Care lettering" loading="lazy" /></div>
            <figcaption><span className={styles.stageNumber}>03 / EXTEND</span><h3>Let it grow.</h3><p>A continuous visual system for tape, packaging, and print.</p><p lang="zh">让连续纹样延展到胶带、包装与平面物料。</p></figcaption>
          </figure>
        </div>
      </section>
      <section className={styles.process} aria-labelledby="process-title">
        <p className={styles.eyebrow}>03 / A small ritual</p><h2 className={styles.processTitle} id="process-title">Tear. Unbox. Make.</h2>
        <div className={styles.steps}>
          {[{title:'Tear away',image:'unbox',text:'A tear-open box makes the first moment physical. Start with the simple satisfaction of opening.'},{title:'Let it go',image:'peel',text:'Multiple peelable strips turn the packaging itself into a tactile stress-relief experience.'},{title:'Make it yours',image:'assemble',text:'Discover the pieces inside and assemble them into your own playful, flower-like forms.'}].map((step,i)=><article key={step.image}><img className={styles.stepImage} src={`/images/airbuy/${step.image}.jpg`} alt={step.title + ' — AirBuy packaging and puzzle process'} loading="lazy"/><h3 className={styles.stepName}>{step.title}<span>0{i+1}</span></h3><p className={styles.stepText}>{step.text}</p></article>)}
        </div>
      </section>
      <img className={styles.fullImage} src="/images/airbuy/hands.jpg" alt="Hands assembling interlocking blue and white flower puzzle pieces into three-dimensional structures" loading="lazy" />
      <section className={styles.gallery} aria-labelledby="outside-title">
        <img className={styles.outdoorPhoto} src="/images/airbuy/outdoors.jpg" alt="A hand holding AirBuy’s transparent Unbox Air, Unload Care poster against green foliage" loading="lazy" />
        <div><p className={styles.kicker}>04 / Take it outside</p><h2 className={styles.title} id="outside-title">Let the world<br />finish the picture.</h2><p className={styles.galleryText}>A transparent acrylic poster becomes an invitation to step outside. Trees, sky, and water complete the composition. The blue palette carries that same connection to open air through the identity and printed pieces.</p><p className={styles.chinese} lang="zh">让树木、天空与水面成为海报的一部分。蓝色从品牌延伸到实物，把拆箱后的注意力重新带回自然。</p><img className={styles.posterPhoto} src="/images/airbuy/posters.jpg" alt="Three blue AirBuy poster designs using modular floral graphics" loading="lazy"/></div>
      </section>
      <section className={styles.posterSection} aria-labelledby="poster-title">
        <div className={styles.posterHeader}><div><p className={styles.kicker}>05 / Out in the world</p><h2 className={styles.title} id="poster-title">A breath of blue.</h2></div><div><p className={styles.posterDescription}>The floral language moves into public space. An AirBuy Festival poster brings the identity together at an architectural scale.</p><p className={styles.chinese} lang="zh">让花朵图形走进公共空间，以户外海报呈现完整的品牌视觉。</p></div></div>
        <figure className={styles.billboard}><img src="/images/airbuy/festival-billboard.jpg" alt="AirBuy Festival billboard on a concrete building beneath a blue sky, featuring the blue floral identity and Unbox Air Unload Care tagline" loading="lazy"/><figcaption>AirBuy Festival · Outdoor poster mockup <span>品牌应用 / 户外海报</span></figcaption></figure>
      </section>
    </main>
    <footer className={styles.end}><p>Unbox air. Unload care.</p><Link href="/#experiments">Back to selected work ↗</Link></footer>
  </div>;
}
