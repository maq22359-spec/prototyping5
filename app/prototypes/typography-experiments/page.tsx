"use client";

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import styles from './styles.module.css';

type Mode = 'cutout' | 'wave' | 'circle' | 'skew';
type Palette = 'acid' | 'paper' | 'blue' | 'pink';
const modes: Mode[] = ['cutout', 'wave', 'circle', 'skew'];
const palettes: Palette[] = ['acid', 'paper', 'blue', 'pink'];
const cn = (...names: string[]) => names.map(name => styles[name]).filter(Boolean).join(' ');
const variables = (values: Record<string, string | number>) => values as CSSProperties;
const copy = {
  zh: {back:'返回首页', badge:'CSS 字体实验', eyebrow:'让文字，有点不一样。', title:'给你的文字，\n换一种形状。', input:'写下你的文字', hint:'短词更能看清面包气孔；输入后海报会实时更新。', treatment:'字体效果', names:['面包字','波浪','环绕','立体倾斜'], variable:'可变字体', weight:'字重', width:'宽度', optical:'视觉尺寸', customize:'自由调整', distortion:'变形程度', palette:'背景 / 墨色', motion:'让文字动起来', live:'实时海报', notes:['像从面包瓤里切出来的字：手工轮廓、深浅不一的气孔。','给文字一点节奏。','让文字围成一个圆。','换个角度，看见新的可能。'], same:'同样的文字。', different:'不一样的可能。', print:'打印 / 保存 PDF', empty:'你的文字，会出现在这里。', foot:'动手试试，随意改变。', fontNote:'可变轴作用于拉丁字母；中文使用系统字体。', paletteNames:['黑底','纸白','蓝底','粉底']},
  en: {back:'Back to home', badge:'CSS type experiments', eyebrow:'WORDS IN. WORLDS OUT.', title:'Give your words\na different shape.', input:'Your words', hint:'Short words show the bread’s open crumb best. The poster updates as you type.', treatment:'Treatment', names:['Bread type','Wave','Orbit','Perspective'], variable:'Variable type', weight:'Weight', width:'Width', optical:'Optical size', customize:'Make it yours', distortion:'Distortion', palette:'Background / ink', motion:'Set it in motion', live:'LIVE SPECIMEN', notes:['Letters cut from the crumb: uneven edges and pockets of air.','A little rhythm. A lot of character.','Words that come full circle.','A different angle on the everyday.'], same:'Same words.', different:'Different possibilities.', print:'Print / Save PDF', empty:'Your words go here.', foot:'Built to play. Made to be bent.', fontNote:'Variable axes affect Latin letters; Chinese uses a system font.', paletteNames:['Black','Paper','Blue','Pink']}
};

// Text becomes ordinary spans. CSS handles every visual effect and animation.
function characters(text: string) { return Array.from(text); }
function makeLines(text: string, maxLength: number) {
  const lines: string[] = [];
  for (const paragraph of text.trim().split(/\n/u)) {
    let line = '';
    for (const word of paragraph.trim().split(/\s+/u).filter(Boolean)) {
      const remaining = characters(word);
      if (line && characters(line).length + 1 + remaining.length > maxLength) { lines.push(line); line = ''; }
      if (remaining.length > maxLength) {
        while (remaining.length > maxLength) lines.push(remaining.splice(0,maxLength).join(''));
        line = remaining.join('');
      } else line += (line ? ' ' : '') + word;
    }
    if (line) lines.push(line);
  }
  return lines;
}

// CSS paints the photo and pores; these values make each letter a different cutout.
function glyphStyle(char: string, index: number) {
  const seed = (char.codePointAt(0) ?? 0) + index * 47;
  return variables({
    '--i':index,
    '--turn':`${[-7,5,-3,7,-5,2][index % 6]}deg`,
    '--stretch':[1.08,.92,1.02,.96,1.11,.94][index % 6],
    '--rise':`${[-.04,.03,-.01,.06,-.03,.02][index % 6]}em`,
    '--shear':`${[3,-4,1,-2,4,-3][index % 6]}deg`,
    '--photo-x':`${[13,54,95][index % 3]}%`,
    '--photo-y':`${[21,25,18,29][index % 4]}%`,
    '--p1x':`${18 + seed * 13 % 61}%`, '--p1y':`${18 + seed * 17 % 55}%`,
    '--p2x':`${15 + seed * 29 % 68}%`, '--p2y':`${23 + seed * 31 % 52}%`,
    '--p3x':`${17 + seed * 43 % 65}%`, '--p3y':`${15 + seed * 19 % 69}%`,
    '--p4x':`${12 + seed * 37 % 73}%`, '--p4y':`${20 + seed * 23 % 59}%`,
  });
}

// Pixel bounds of the hand-cut letters in the user's bread alphabet reference.
// CSS positions the full photo inside each span; no canvas or image processing runs in the page.
const breadAlphabet: Record<string, [number, number, number, number]> = {
  A:[267,173,159,159], B:[445,166,104,157], C:[581,166,105,149], D:[718,180,90,126],
  E:[839,184,82,124], F:[955,170,93,150], G:[353,370,116,135], H:[511,365,88,131],
  I:[619,391,104,112], J:[743,382,100,110], K:[878,368,98,134], L:[308,576,125,105],
  M:[463,582,173,83], N:[664,568,116,105], O:[807,560,83,114], P:[913,557,70,157],
  Q:[355,777,103,113], R:[471,742,88,176], S:[588,766,85,122], T:[701,760,120,133],
  U:[847,784,114,109], V:[324,993,96,91], W:[458,993,135,77], X:[617,969,93,133],
  Y:[733,972,119,137], Z:[869,981,141,115],
};

export default function TypographyExperiments() {
  const [language, setLanguage] = useState<'zh'|'en'>('zh');
  const [sentence, setSentence] = useState('BREAD\nTYPE');
  const [mode, setMode] = useState<Mode>('cutout');
  const [palette, setPalette] = useState<Palette>('acid');
  const [weight, setWeight] = useState(800);
  const [width, setWidth] = useState(100);
  const [optical, setOptical] = useState(72);
  const [intensity, setIntensity] = useState(62);
  const [motion, setMotion] = useState(false);
  const artRef = useRef<HTMLDivElement>(null);
  const compositionRef = useRef<HTMLDivElement>(null);
  const t = copy[language], index = modes.indexOf(mode), lines = makeLines(sentence, mode === 'cutout' ? 6 : 10);
  const raw = sentence.trim();
  const circleChars = characters(raw + ' · ');
  const ringCount = Math.ceil(circleChars.length / 44);
  const chunkSize = Math.ceil(circleChars.length / ringCount);
  const longest = Math.max(1, ...lines.map(line => characters(line).length));
  const fontSize = mode === 'cutout' ? Math.min(25,138 / longest,86 / Math.max(lines.length,1)) : Math.min(19,138 / longest,66 / Math.max(lines.length,1));
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
    return characters(text).map((char,i) => {
      const bounds = mode === 'cutout' ? breadAlphabet[char.toUpperCase()] : undefined;
      if (bounds) {
        const [x,y,w,h] = bounds;
        return <span key={i} className={styles.breadSprite} style={variables({
          '--sprite-width':`${w/150}em`, '--sprite-height':`${h/150}em`,
          '--sprite-x':`${-x/150}em`, '--sprite-y':`${-y/150}em`,
          '--i':i+offset, '--turn':`${[-5,3,-2,4,-3,2][(i+offset)%6]}deg`,
        })}/>;
      }
      return <span key={i} className={cn('glyph', /[\u3400-\u9fff]/u.test(char) ? 'cjkGlyph' : '')} data-char={char} style={glyphStyle(char,i+offset)}>{char}</span>;
    });
  }
  return <div className={styles.root} lang={language === 'zh' ? 'zh-CN' : 'en'}>
    <header><Link href="/" className={styles.brand}><span className={styles.logo}>t<span>e</span></span><span>typography<span className={styles['brand-bottom']}>experiments</span></span></Link><Link href="/#playground" className={styles.backLink}>← {t.back}</Link><button type="button" className={styles.language} onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')} aria-label="Switch between Chinese and English">中文 <span aria-hidden="true">/</span> EN</button></header>
    <main><aside><div className={styles.eyebrow}>{t.eyebrow}</div><h1>{t.title.split('\n').map((line,i)=><span key={i}>{line}{i===0&&<br/>}</span>)}</h1>
      <div className={styles['text-label']}><label htmlFor="sentence">{t.input}</label><span>{characters(sentence).length} / 80</span></div><textarea id="sentence" rows={3} value={sentence} spellCheck={false} onChange={event=>setSentence(characters(event.target.value).slice(0,80).join(''))}/><p className={styles.hint}>{t.hint}</p>
      <section><div className={styles['section-label']}><span>01</span><h2>{t.treatment}</h2></div><div className={styles.treatments} role="group" aria-label={t.treatment}>{modes.map((item,i)=><button key={item} type="button" onClick={()=>{setMode(item);if(item==='cutout')setPalette('acid');}} aria-pressed={mode===item}><span className={cn('mini',item==='circle'?'circle-mini':item+'-mini')} aria-hidden="true">{['Aa','~Aa~','◌','Aa'][i]}</span><span>{t.names[i]}</span><small>0{i+1}</small></button>)}</div></section>
      <section><div className={styles['section-label']}><span>02</span><h2>{t.variable}</h2><span className={styles.tag}>VF</span></div><div className={styles['font-name']}>Bricolage Grotesque</div>
        <label htmlFor="weight">{t.weight}<output>{weight}</output></label><input id="weight" type="range" min={200} max={800} value={weight} onChange={e=>setWeight(Number(e.target.value))}/>
        <label htmlFor="width">{t.width}<output>{width}%</output></label><input id="width" type="range" min={75} max={100} value={width} onChange={e=>setWidth(Number(e.target.value))}/>
        <label htmlFor="optical">{t.optical}<output>{optical}</output></label><input id="optical" type="range" min={12} max={96} value={optical} onChange={e=>setOptical(Number(e.target.value))}/><p className={styles.fontNote}>{mode === 'cutout' ? (language === 'zh' ? '面包字 A–Z 使用参考图的原始字形；可变轴影响其他模式及未收录的字符。' : 'Bread A–Z uses the original reference letters; variable axes affect other treatments and unsupported characters.') : t.fontNote}</p>
      </section>
      <section><div className={styles['section-label']}><span>03</span><h2>{t.customize}</h2></div><label htmlFor="intensity">{t.distortion}<output>{intensity}%</output></label><input id="intensity" type="range" min={0} max={100} value={intensity} onChange={e=>setIntensity(Number(e.target.value))}/>
        {mode !== 'cutout' && <div className={styles['palette-row']}><span>{t.palette}</span><div className={styles.palettes} role="group" aria-label={t.palette}>{palettes.map((item,i)=><button key={item} type="button" className={styles[item]} onClick={()=>setPalette(item)} aria-label={t.paletteNames[i]} aria-pressed={palette===item}/>)}</div></div>}
        <label className={styles['motion-label']}><span>{t.motion}</span><input type="checkbox" role="switch" checked={motion} onChange={e=>setMotion(e.target.checked)}/></label>
      </section>
    </aside><div className={styles.workspace}><div className={styles['work-top']}><div><span className={styles['live-label']}>{t.live}</span><span className={styles.treatmentLabel}>0{index+1} / {t.names[index]}</span></div><span className={styles['scale-label']}>{t.badge}</span></div>
      <div className={cn('poster',mode,...(motion?['moving']:[]))} data-palette={palette} role="img" aria-label={`${t.names[index]}: ${sentence}`} style={variables({'--weight':weight,'--width':width,'--optical':optical,'--intensity':intensity/100})}>
        <div className={styles['poster-top']} aria-hidden="true"><span>{mode === 'cutout' ? <>CUT FROM<br/>THE CRUMB.</> : <>TYPE IS A<br/>PLAYGROUND.</>}</span><span>EXPERIMENT<br/>№ 00{index+1}</span></div>
        <div ref={artRef} className={styles.art} aria-hidden="true">{!raw?<div className={styles['empty-note']}>{t.empty}</div>:mode==='circle'?Array.from({length:ringCount},(_,j)=>{const chunk=circleChars.slice(j*chunkSize,(j+1)*chunkSize);return <div key={j} className={styles['orbit-ring']} style={variables({'--count':chunk.length,'--ring':j})}>{glyphs(chunk.join(''))}</div>}):<div ref={compositionRef} className={styles.composition} style={variables({'--font-size':fontSize+'cqw'})}>{lines.map((line,i)=><span key={i} className={styles['type-line']}>{glyphs(line,i*3)}</span>)}</div>}</div>
        <div className={styles['poster-bottom']} aria-hidden="true"><span>{mode === 'cutout' ? <>SOURDOUGH LETTERS<br/>VARIABLE TYPE / CSS</> : <>BRICOLAGE GROTESQUE<br/>VARIABLE TYPE / CSS</>}</span><span className={styles['poster-symbol']}>✳</span><span>MAKE SOME NOISE<br/>BREAK A FEW RULES.</span></div>
      </div><div className={styles['work-bottom']}><span role="status" aria-live="polite">{t.notes[index]}</span><span>{mode === 'cutout' ? 'BREAD / OPEN CRUMB' : `CSS TRANSFORMS / 00${index+1}`}</span></div><div className={styles['under-poster']}><p>{t.same}<br/><em>{t.different}</em></p><button type="button" onClick={()=>window.print()}>{t.print} <span aria-hidden="true">↗</span></button></div>
    </div></main><footer><span>TYPOGRAPHY—EXPERIMENTS</span><span>{t.foot}</span><span>001 / CSS TYPE</span></footer>
  </div>;
}
