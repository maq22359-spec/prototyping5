'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react';
import styles from './touch.module.css';
import OrbitSketches from './OrbitSketches';
import { createGazeRenderer } from './gazeRenderer';

const FPS = 24;
const CENTRE = 80 / FPS;
const clamp = (n: number, low: number, high: number) => Math.min(high, Math.max(low, n));

// Calibrated against the supplied video in SCREEN coordinates: frame 109
// looks left, 80 looks forward, 68 looks right. Do not mirror the portrait.
function gazeTime(position: number) {
  let frame = position < .5 ? 109 - position * 58 : 80 - (position - .5) * 24;
  // Preserve the blink while crossing it, but never settle on closed eyelids.
  if (frame > 86 && frame < 95) frame = frame < 90.5 ? 86 : 95;
  return (frame + .1) / FPS;
}

export default function TouchScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbitMotion = useRef({ x: 0, y: 0 });
  const orbitWake = useRef<() => void>(() => {});
  const [renderFailed, setRenderFailed] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const target = useRef(CENTRE);
  const position = useRef(.5);
  const velocity = useRef(0);
  const lastPointer = useRef<{ x: number; time: number } | null>(null);
  const wake = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [inside, setInside] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const renderer = createGazeRenderer(canvas);
    if (!renderer) { setRenderFailed(true); return; }
    let disposed = false;
    const poster = new Image();
    poster.onload = () => { if (!disposed && video.readyState < 2) renderer.draw(poster); };
    poster.src = '/videos/touch/gaze-matte-poster.jpg';
    const draw = () => { if (video.readyState >= 2) renderer.draw(video); };
    video.addEventListener('seeked', draw);
    video.addEventListener('loadeddata', draw);
    canvas.addEventListener('webglcontextlost', () => setRenderFailed(true), { once: true });
    draw();
    return () => { disposed = true; poster.onload = null; video.removeEventListener('seeked', draw); video.removeEventListener('loadeddata', draw); renderer.dispose(); };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let raf = 0;
    let previousTime = 0;
    let playhead = CENTRE;
    let stopped = false;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');

    function tick(now: number) {
      raf = 0;
      if (stopped || !video || document.hidden || video.readyState < 2) return;
      const dt = Math.min((now - previousTime) / 1000 || 1 / 60, .05);
      previousTime = now;
      // Fast gestures shorten the pursuit lag from 100ms to about 28ms.
      // Time-based easing behaves consistently on 60Hz and 120Hz screens.
      const response = .10 - .072 * clamp(velocity.current / 2, 0, 1);
      playhead += (target.current - playhead) * (reduced.matches ? 1 : 1 - Math.exp(-dt / response));
      velocity.current *= Math.exp(-dt / .16);
      const settled = Math.abs(target.current - playhead) < .006;
      if (settled) playhead = target.current;
      // Only one seek in flight: discard obsolete pointer positions instead
      // of queuing them. The all-keyframe asset decodes either direction.
      if (!video.seeking && Math.abs(video.currentTime - playhead) > .009) {
        video.currentTime = playhead;
      }
      if (!settled || video.seeking) raf = requestAnimationFrame(tick);
    }
    function resume() {
      if (!raf && !document.hidden && !stopped) {
        previousTime = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }
    function loaded() { setError(false); resume(); }
    function sought() { setReady(true); resume(); }
    function failed() { setError(true); setReady(false); cancelAnimationFrame(raf); raf = 0; }
    function visibility() {
      cancelAnimationFrame(raf); raf = 0;
      if (!document.hidden) resume();
    }
    wake.current = resume;
    video.addEventListener('loadeddata', loaded);
    video.addEventListener('seeked', sought);
    video.addEventListener('error', failed);
    document.addEventListener('visibilitychange', visibility);
    if (video.readyState >= 2) loaded();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      wake.current = () => {};
      video.removeEventListener('loadeddata', loaded);
      video.removeEventListener('seeked', sought);
      video.removeEventListener('error', failed);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  function follow(event: PointerEvent<HTMLElement>) {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const now = performance.now();
    const previous = lastPointer.current;
    velocity.current = previous ? clamp(Math.abs(x - previous.x) / Math.max((now - previous.time) / 1000, .008), 0, 5) : 0;
    lastPointer.current = { x, time: now };
    // The face sits slightly right of centre on wide screens.
    const centre = rect.width > 760 ? .59 : .5;
    position.current = x < centre ? .5 * x / centre : .5 + .5 * (x - centre) / (1 - centre);
    // The rightward eye motion in the source clip is concentrated near its
    // final frames. Reach those frames sooner while leaving the orbit alone.
    const rightReach = rect.width > 760 ? .88 : .84;
    const rightProgress = clamp((x - centre) / (rightReach - centre), 0, 1);
    const gazePosition = x <= centre ? position.current : .5 + .5 * Math.pow(rightProgress, .8);
    target.current = gazeTime(gazePosition);
    orbitMotion.current = { x: (position.current - .5) * 2, y: (event.clientY - rect.top) / rect.height - .5 };
    orbitWake.current();
    if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${event.clientX - rect.left}px, ${event.clientY - rect.top}px, 0)`;
    wake.current();
  }
  function leave() {
    setInside(false); lastPointer.current = null;
    orbitMotion.current = { x: 0, y: 0 }; orbitWake.current();
    position.current = .5; target.current = CENTRE; velocity.current = 0; wake.current();
  }
  function keys(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget || !['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
    event.preventDefault();
    position.current = event.key === 'Home' ? .5 : clamp(position.current + (event.key === 'ArrowLeft' ? -.1 : .1), 0, 1);
    target.current = gazeTime(position.current); velocity.current = 1; wake.current();
    orbitMotion.current = { x: (position.current - .5) * 2, y: 0 }; orbitWake.current();
  }

  return (
    <main ref={stageRef} className={`${styles.stage} ${inside ? styles.isTracking : ''}`} tabIndex={0}
      aria-label="A bit of me. Move left or right, or use the arrow keys, to guide her gaze."
      onKeyDown={keys} onPointerEnter={() => setInside(true)} onPointerMove={follow}
      onPointerDown={follow} onPointerLeave={leave} onPointerCancel={leave}>
      <OrbitSketches motion={orbitMotion} wake={orbitWake} />
      <div className={styles.portraitFrame}>
        <img className={`${styles.shoulderPlate} ${styles.shoulderLeft}`} src="/images/touch/shoulder-caps.png" alt="" aria-hidden="true" />
        <img className={`${styles.shoulderPlate} ${styles.shoulderRight}`} src="/images/touch/shoulder-caps.png" alt="" aria-hidden="true" />
        <canvas ref={canvasRef} className={styles.portrait} role="img" aria-label="女孩的眼神随鼠标左右移动，小人与手写文字在她周围旋转" />
        {renderFailed && <img className={styles.portrait} src="/videos/touch/gaze-poster.webp" alt="女孩肖像" />}
      </div>
      <video ref={videoRef} className={styles.sourceVideo}
        src="/videos/touch/gaze-matte-v1.mp4" preload="auto" muted playsInline disablePictureInPicture aria-hidden="true" />
      <header className={styles.header}>
        <Link href="/">MA QIANYI / Kate</Link><span>01 / SHE SEES YOU</span><Link href="/#playground">Selected work ↗</Link>
      </header>
      <section className={styles.copy} aria-labelledby="touch-title">
        <p>A MIND IN MOTION</p><h1 id="touch-title">A BIT<br />OF ME</h1>
        <p className={styles.instruction}>A few thoughts, going around.<br /><span lang="zh">左右移动，看看脑袋后面藏着什么。</span></p>
      </section>
      <div className={styles.status} role="status">
        <span>{error ? '视频加载失败' : ready ? 'MOVE SLOW. MOVE FAST.' : 'LOADING…'}</span>
        <span>{inside ? 'I SEE YOU' : 'MOVE TO CONNECT'}</span>
      </div>
      {error && <button className={styles.retry} onClick={() => { setError(false); videoRef.current?.load(); }}>重新加载视频 ↻</button>}
      <Link href="/#experiments" className={styles.scrollHint}>SCROLL TO EXPLORE <span aria-hidden="true">↓</span></Link>
      <div ref={cursorRef} className={styles.cursor} aria-hidden="true"><span /></div>
    </main>
  );
}
