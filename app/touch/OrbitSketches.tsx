'use client';
import { useEffect, useRef, type RefObject } from 'react';
import styles from './touch.module.css';

const sketches = [
  {name:'sad ghost',crop:[40,70,410,510],angle:Math.PI-.30,y:-.06,size:190,word:false},
  {name:'reaching ghost',crop:[500,70,535,500],angle:Math.PI+.30,y:.22,size:228,word:false},
  {name:"It's me",crop:[1035,225,475,225],angle:-1.10,y:-.06,size:270,word:true},
  {name:'Sad...',crop:[40,675,440,260],angle:1.26,y:0,size:240,word:true},
  {name:'Anxiety',crop:[510,665,510,285],angle:Math.PI+.18,y:-.13,size:270,word:true},
  {name:'Fuck',crop:[0,0,1536,1024],angle:Math.PI-.18,y:-.055,size:230,word:true},
  {name:'Please',crop:[1030,660,480,280],angle:-2.05,y:.20,size:250,word:true},
];
export default function OrbitSketches({motion,wake}:{motion:RefObject<{x:number;y:number}>;wake:RefObject<()=>void>}) {
  const refs=useRef<(HTMLDivElement|null)[]>([]);
  useEffect(()=>{
    let raf=0;let last=0;let x=0;let y=0;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const render=(now:number)=>{
      raf=0;
      const dt=Math.min((now-last)/1000||1/60,.05);last=now;
      const blend=reduced.matches?1:1-Math.exp(-dt/.14);
      x+=(motion.current.x-x)*blend;y+=(motion.current.y-y)*blend;
      const stage=refs.current[0]?.parentElement;
      if(!stage)return;
      const w=stage.clientWidth,h=stage.clientHeight;
      const centre=w>760?.59:.5;
      const radius=Math.min(w*.37,h*.57);
      sketches.forEach((item,i)=>{
        const el=refs.current[i];if(!el)return;
        const theta=item.angle-x*1.95;
        const depth=Math.cos(theta);
        const scale=(.79+depth*.17)*Math.min(1,Math.max(.70,w/1000));
        const px=w*centre+Math.sin(theta)*radius;
        // Keep the entire rotated sketch above the bridge of the nose,
        // including when a larger word swings to the front of the face.
        const halfHeight=scale*item.size*(item.crop[3]/item.crop[2]*.5+.075);
        const py=Math.min(h*(.25+item.y)+depth*h*.04+y*10,h*.47-halfHeight);
        el.style.transform=`translate3d(${px}px,${py}px,0) translate(-50%,-50%) scale(${scale}) rotate(${Math.sin(theta)*8}deg)`;
        el.style.zIndex=depth>0?'30':'10';
        // The two ghost poses take turns, so they do not pile on top of
        // each other at the end of the orbit.
        const poseVisibility=i<2
          ?Math.min(1,Math.max(0,(i===0?x:-x)*2+.4))
          :item.name==='Anxiety'
            ?Math.min(1,Math.max(0,-x*2+.2))
            :item.name==='Fuck'
              ?Math.min(1,Math.max(0,x*2+.2))
              :1;
        el.style.opacity=String((.72+(depth+1)*.14)*poseVisibility);
        el.dataset.depth=depth>0?'front':'behind';
      });
      if(Math.abs(motion.current.x-x)+Math.abs(motion.current.y-y)>.001)raf=requestAnimationFrame(render);
    };
    const resume=()=>{if(!raf&&!document.hidden){last=performance.now();raf=requestAnimationFrame(render);}};
    const visibility=()=>{cancelAnimationFrame(raf);raf=0;if(!document.hidden)resume();};
    wake.current=resume;resume();
    addEventListener('resize',resume);document.addEventListener('visibilitychange',visibility);
    return()=>{cancelAnimationFrame(raf);wake.current=()=>{};removeEventListener('resize',resume);document.removeEventListener('visibilitychange',visibility);};
  },[motion,wake]);
  return <>{sketches.map((item,i)=>{
    const [x,y,w,h]=item.crop;
    return <div key={item.name} ref={el=>{refs.current[i]=el;}} aria-hidden="true" className={`${styles.orbitItem} ${item.word?styles.orbitWord:''}`} style={{width:item.size,aspectRatio:`${w}/${h}`}}>
      <div className={styles.sprite} style={{backgroundImage:item.name==='Fuck'?"url(/images/touch/orbit/fuck-lettering.png)":undefined,backgroundSize:item.name==='Fuck'?'contain':`${1536/w*100}% ${1024/h*100}%`,backgroundPosition:item.name==='Fuck'?'center':`${x/(1536-w)*100}% ${y/(1024-h)*100}%`}} />
    </div>;
  })}</>;
}
