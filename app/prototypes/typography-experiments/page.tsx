"use client";

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import styles from './styles.module.css';

type Mode = 'wave' | 'circle' | 'skew' | 'cutout' | 'dragon';
type Palette = 'acid' | 'paper' | 'blue' | 'pink';
const modes: Mode[] = ['dragon', 'wave', 'circle', 'skew', 'cutout'];
const palettes: Palette[] = ['acid', 'paper', 'blue', 'pink'];
const cn = (...names: string[]) => names.map(name => styles[name]).filter(Boolean).join(' ');
const variables = (values: Record<string, string | number>) => values as CSSProperties;
const copy = {
  zh: {back:'返回首页', badge:'CSS 字体实验', eyebrow:'让文字，有点不一样。', title:'给你的文字，\n换一种形状。', input:'写下你的文字', hint:'输入后，字行和小龙会实时更新。', treatment:'字体效果', names:['龙与面包字','波浪','环绕','立体倾斜','面包纹理'], variable:'可变字体', weight:'字重', width:'宽度', optical:'视觉尺寸', customize:'自由调整', distortion:'变形程度', palette:'纸张 / 墨色', motion:'让文字动起来', live:'实时海报', notes:['小龙在面包质感的字行间游走。','给文字一点节奏。','让文字围成一个圆。','换个角度，看见新的可能。','灵感来自面包孔隙里的字母。'], same:'同样的文字。', different:'不一样的可能。', print:'打印 / 保存 PDF', empty:'你的文字，会出现在这里。', foot:'动手试试，随意改变。', fontNote:'可变轴作用于拉丁字母；中文使用系统字体。', paletteNames:['黑底黄字','纸白黑字','蓝底白字','粉底红字']},
  en: {back:'Back to home', badge:'CSS type experiments', eyebrow:'WORDS IN. WORLDS OUT.', title:'Give your words\na different shape.', input:'Your words', hint:'Type anything. The letter field updates live.', treatment:'Treatment', names:['Dragon in bread type','Wave','Orbit','Perspective','Crumb'], variable:'Variable type', weight:'Weight', width:'Width', optical:'Optical size', customize:'Make it yours', distortion:'Distortion', palette:'Paper / ink', motion:'Set it in motion', live:'LIVE SPECIMEN', notes:['A small dragon moves through lines of bread-textured type.','A little rhythm. A lot of character.','Words that come full circle.','A different angle on the everyday.','Inspired by letters found in bread.'], same:'Same words.', different:'Different possibilities.', print:'Print / Save PDF', empty:'Your words go here.', foot:'Built to play. Made to be bent.', fontNote:'Variable axes affect Latin letters; Chinese uses a system font.', paletteNames:['Acid on black','Black on paper','White on blue','Red on pink']}
};

// Text becomes ordinary spans. CSS handles every visual effect and animation.
function characters(text: string) { return Array.from(text); }
function makeDragonRows(text: string) {
  const source = characters(text.trim() || '龙在文字之间游走 THE DRAGON MOVES BETWEEN THE LETTERS');
  const mostlyChinese = source.filter(char => /[\u3400-\u9fff]/u.test(char)).length > source.length / 10;
  const width = mostlyChinese ? 17 : 23;
  const gaps = [19, 35, 51, 59, 44, 27, 20, 36, 53, 60, 47, 30];
  let cursor = 0;
  const take = (amount: number) => Array.from({length:amount}, () => source[(cursor++) % source.length]).join('');
  return gaps.map((split, i) => {
    const left = Math.max(3, Math.round(width * split / 78));
    return {left:take(left), right:take(width - left), split, key:i};
  });
}

function makeLines(text: string) {
  const lines: string[] = []; let line = '';
  for (const word of text.trim().split(/\s+/u)) {
    if (line && characters(line + ' ' + word).length > 10) { lines.push(line); line = ''; }
    const remaining = characters(word);
    if (remaining.length > 12) {
      if (line) { lines.push(line); line = ''; }
      while (remaining.length > 12) lines.push(remaining.splice(0,12).join(''));
      line = remaining.join('');
    } else line += (line ? ' ' : '') + word;
  }
  if (line) lines.push(line);
  return lines;
}

export default function TypographyExperiments() {
  const [language, setLanguage] = useState<'zh'|'en'>('zh');
  const [sentence, setSentence] = useState('龙在文字之间游走 THE DRAGON MOVES BETWEEN THE LETTERS');
  const [mode, setMode] = useState<Mode>('dragon');
  const [palette, setPalette] = useState<Palette>('paper');
  const [weight, setWeight] = useState(700);
  const [width, setWidth] = useState(100);
  const [optical, setOptical] = useState(72);
  const [intensity, setIntensity] = useState(50);
  const [motion, setMotion] = useState(true);
  const artRef = useRef<HTMLDivElement>(null);
  const compositionRef = useRef<HTMLDivElement>(null);
  const t = copy[language], index = modes.indexOf(mode), lines = makeLines(sentence), dragonRows = makeDragonRows(sentence);
  const raw = sentence.trim();
  const circleChars = characters(raw + ' · ');
  const ringCount = Math.ceil(circleChars.length / 44);
  const chunkSize = Math.ceil(circleChars.length / ringCount);
  const longest = Math.max(1, ...lines.map(line => characters(line).length));
  const fontSize = Math.min(19,138 / longest,66 / Math.max(lines.length,1));
  useEffect(() => {
    const art = artRef.current, composition = compositionRef.current;
    if (!art || !composition) return;
    let disposed = false;
    const fit = () => {
      if (disposed) return;
      composition.style.setProperty('--fit','1');
      const maxWidth = Math.max(1,...Array.from(composition.children).map(child => (child as HTMLElement).scrollWidth));
      const ratio = Math.min(1,art.clientWidth*.92 / maxWidth,art.clientHeight*.84 / Math.max(composition.scrollHeight,1));
      composition.style.setProperty('--fit',String(ratio));
    };
    fit(); const observer = new ResizeObserver(fit); observer.observe(art);
    document.fonts.ready.then(fit);
    return () => { disposed = true; observer.disconnect(); };
  }, [sentence,mode,weight,width,optical,language]);

  function glyphs(text: string, offset = 0) {
    return characters(text).map((char,i) => <span key={i} className={styles.glyph} style={variables({'--i':i+offset})}>{char}</span>);
  }
  return <div className={styles.root} lang={language === 'zh' ? 'zh-CN' : 'en'}>
    <header><Link href="/" className={styles.brand}><span className={styles.logo}>t<span>e</span></span><span>typography<span className={styles['brand-bottom']}>experiments</span></span></Link><Link href="/#playground" className={styles.backLink}>← {t.back}</Link><button type="button" className={styles.language} onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')} aria-label="Switch between Chinese and English">中文 <span aria-hidden="true">/</span> EN</button></header>
    <main><aside><div className={styles.eyebrow}>{t.eyebrow}</div><h1>{t.title.split('\n').map((line,i)=><span key={i}>{line}{i===0&&<br/>}</span>)}</h1>
      <div className={styles['text-label']}><label htmlFor="sentence">{t.input}</label><span>{characters(sentence).length} / {mode === 'dragon' ? 300 : 80}</span></div><textarea id="sentence" rows={3} value={sentence} spellCheck={false} onChange={event=>setSentence(characters(event.target.value).slice(0,mode === 'dragon' ? 300 : 80).join(''))}/><p className={styles.hint}>{t.hint}</p>
      <section><div className={styles['section-label']}><span>01</span><h2>{t.treatment}</h2></div><div className={styles.treatments} role="group" aria-label={t.treatment}>{modes.map((item,i)=><button key={item} type="button" onClick={()=>{setMode(item);if(item==='cutout')setPalette('acid');if(item==='dragon')setPalette('paper');}} aria-pressed={mode===item}><span className={cn('mini',item==='circle'?'circle-mini':item+'-mini')} aria-hidden="true">{['龍','~Aa~','◌','Aa','Aa'][i]}</span><span>{t.names[i]}</span><small>0{i+1}</small></button>)}</div></section>
      <section className={mode === 'dragon' ? styles.dragonHiddenControl : undefined}><div className={styles['section-label']}><span>02</span><h2>{t.variable}</h2><span className={styles.tag}>VF</span></div><div className={styles['font-name']}>Bricolage Grotesque</div>
        <label htmlFor="weight">{t.weight}<output>{weight}</output></label><input id="weight" type="range" min={200} max={800} value={weight} onChange={e=>setWeight(Number(e.target.value))}/>
        <label htmlFor="width">{t.width}<output>{width}%</output></label><input id="width" type="range" min={75} max={100} value={width} onChange={e=>setWidth(Number(e.target.value))}/>
        <label htmlFor="optical">{t.optical}<output>{optical}</output></label><input id="optical" type="range" min={12} max={96} value={optical} onChange={e=>setOptical(Number(e.target.value))}/><p className={styles.fontNote}>{t.fontNote}</p>
      </section>
      <section className={mode === 'dragon' ? styles.dragonHiddenControl : undefined}><div className={styles['section-label']}><span>03</span><h2>{t.customize}</h2></div><label htmlFor="intensity">{t.distortion}<output>{intensity}%</output></label><input id="intensity" type="range" min={0} max={100} value={intensity} onChange={e=>setIntensity(Number(e.target.value))}/>
        <div className={styles['palette-row']}><span>{t.palette}</span><div className={styles.palettes} role="group" aria-label={t.palette}>{palettes.map((item,i)=><button key={item} type="button" className={styles[item]} onClick={()=>setPalette(item)} aria-label={t.paletteNames[i]} aria-pressed={palette===item}/>)}</div></div>
        <label className={styles['motion-label']}><span>{t.motion}</span><input type="checkbox" role="switch" checked={motion} onChange={e=>setMotion(e.target.checked)}/></label>
      </section>
    </aside><div className={styles.workspace}><div className={styles['work-top']}><div><span className={styles['live-label']}>{t.live}</span><span className={styles.treatmentLabel}>0{index+1} / {t.names[index]}</span></div>{mode === 'dragon' ? <button type="button" className={styles.dragonMotionButton} aria-pressed={motion} onClick={()=>setMotion(!motion)}>{motion ? (language === 'zh' ? '暂停游龙 ◼' : 'Pause dragon ◼') : (language === 'zh' ? '让龙游走 ▶' : 'Animate dragon ▶')}</button> : <span className={styles['scale-label']}>{t.badge}</span>}</div>
      <div className={cn('poster',mode,...(motion?['moving']:[]))} data-palette={palette} role="img" aria-label={`${t.names[index]}: ${sentence}`} style={variables({'--weight':weight,'--width':width,'--optical':optical,'--intensity':intensity/100})}>
        {mode === 'dragon' ? <div className={styles.dragonPage}>
          <div className={styles.dragonKicker} aria-hidden="true"><span>{language === 'zh' ? '龙与文字的游记' : 'THE DRAGON BETWEEN THE LINES'}</span><span>✦ &nbsp; № 001</span></div>
          <div className={styles.dragonTextField} aria-hidden="true">{dragonRows.map(row => <div key={row.key} className={styles.dragonBreadRow} style={variables({'--split':row.split+'%'})}><span className={styles.dragonBreadText}>{row.left}</span><span className={styles.dragonGap}/><span className={styles.dragonBreadText}>{row.right}</span></div>)}</div>
          <div className={styles.dragonTraveler} aria-hidden="true"/>
          <div className={styles.dragonColophon} aria-hidden="true">{language === 'zh' ? '面包字 / 游龙 / 字形实验' : 'BREAD TYPE / WANDERING DRAGON'} <span>{language === 'zh' ? '字在动，龙也在动。' : 'WORDS IN MOTION.'}</span></div>
        </div> : <>
        <div className={styles['poster-top']} aria-hidden="true"><span>TYPE IS A<br/>PLAYGROUND.</span><span>EXPERIMENT<br/>№ 00{index+1}</span></div>
        <div ref={artRef} className={styles.art} aria-hidden="true">{!raw?<div className={styles['empty-note']}>{t.empty}</div>:mode==='circle'?Array.from({length:ringCount},(_,j)=>{const chunk=circleChars.slice(j*chunkSize,(j+1)*chunkSize);return <div key={j} className={styles['orbit-ring']} style={variables({'--count':chunk.length,'--ring':j})}>{glyphs(chunk.join(''))}</div>}):<div ref={compositionRef} className={styles.composition} style={variables({'--font-size':fontSize+'cqw'})}>{lines.map((line,i)=><span key={i} className={styles['type-line']}>{glyphs(line,i*3)}</span>)}</div>}</div>
        <div className={styles['poster-bottom']} aria-hidden="true"><span>BRICOLAGE GROTESQUE<br/>VARIABLE TYPE / CSS</span><span className={styles['poster-symbol']}>✳</span><span>MAKE SOME NOISE<br/>BREAK A FEW RULES.</span></div>
        </>}
      </div><div className={styles['work-bottom']}><span role="status" aria-live="polite">{t.notes[index]}</span><span>{mode === 'dragon' ? 'DRAGON / BREAD TYPE' : `CSS TRANSFORMS / 00${index+1}`}</span></div><div className={styles['under-poster']}><p>{t.same}<br/><em>{t.different}</em></p><button type="button" onClick={()=>window.print()}>{t.print} <span aria-hidden="true">↗</span></button></div>
    </div></main><footer><span>TYPOGRAPHY—EXPERIMENTS</span><span>{t.foot}</span><span>{mode === 'dragon' ? 'ORIGINAL DRAGON ART / BREAD TYPE' : '001 / CSS TYPE'}</span></footer>
  </div>;
}
