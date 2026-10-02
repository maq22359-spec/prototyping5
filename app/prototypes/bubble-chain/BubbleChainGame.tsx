'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Application, Graphics } from 'pixi.js';
import { levels } from './levels';
import styles from './styles.module.css';

type Status = 'ready' | 'running' | 'won' | 'lost';
type Bubble = {
  x: number;
  y: number;
  blast: number;
  radius: number;
  color: number;
  graphic: Graphics;
  popped: boolean;
};
type Ripple = { x: number; y: number; maxRadius: number; age: number; duration: number; color: number; graphic: Graphics };
type Spark = { x: number; y: number; vx: number; vy: number; age: number; duration: number; graphic: Graphics };

const BOARD_SIZE = 560;
const SCENE_SCALE = 0.85;
const toBoardX = (x: number) => BOARD_SIZE / 2 + (x - 480) * SCENE_SCALE;
const toBoardY = (y: number) => BOARD_SIZE / 2 + (y - 280) * SCENE_SCALE;

export default function BubbleChainGame() {
  const canvasHost = useRef<HTMLDivElement>(null);
  const restartRef = useRef<(level: number) => void>(() => {});
  const playRef = useRef<(bubble: number) => void>(() => {});
  const selectRef = useRef<(bubble: number) => void>(() => {});
  const [levelIndex, setLevelIndex] = useState(0);
  const [status, setStatus] = useState<Status>('ready');
  const [poppedCount, setPoppedCount] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let app: Application | null = null;
    let removeVisibilityListener = () => {};

    async function setup() {
      try {
        // Import PixiJS in the browser so the Next.js server only renders the page shell.
        const { Application: PixiApplication, Circle, Graphics: PixiGraphics } = await import('pixi.js');
        if (cancelled || !canvasHost.current) return;

        const instance = new PixiApplication();
        await instance.init({
          width: BOARD_SIZE,
          height: BOARD_SIZE,
          background: '#f4e7df',
          antialias: true,
          autoDensity: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          preference: 'webgl',
        });
        if (cancelled || !canvasHost.current) {
          instance.destroy({ removeView: true, releaseGlobalResources: true }, { children: true });
          return;
        }

        app = instance;
        instance.canvas.style.width = '100%';
        instance.canvas.style.height = '100%';
        instance.canvas.style.touchAction = 'manipulation';
        canvasHost.current.appendChild(instance.canvas);

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let currentLevel = 0;
        let phase: Status = 'ready';
        let bubbles: Bubble[] = [];
        let ripples: Ripple[] = [];
        let sparks: Spark[] = [];
        let keyboardMarker: Graphics | null = null;

        function makeBubble(x: number, y: number, radius: number, color: number, strong: boolean) {
          const graphic = new PixiGraphics();
          graphic.circle(0, 0, radius + 9).fill({ color, alpha: strong ? 0.11 : 0.07 });
          graphic.circle(0, 0, radius).fill({ color, alpha: 0.63 });
          graphic.circle(0, 0, radius).stroke({ color: 0xffffff, alpha: 0.68, width: 2 });
          graphic.circle(-radius * 0.29, -radius * 0.31, radius * 0.22).fill({ color: 0xffffff, alpha: 0.57 });
          if (strong) graphic.circle(0, 0, radius + 5).stroke({ color, alpha: 0.49, width: 1.5 });
          graphic.position.set(x, y);
          graphic.hitArea = new Circle(0, 0, Math.max(radius + 10, 29));
          graphic.eventMode = 'static';
          graphic.cursor = 'pointer';
          return graphic;
        }

        function addSparkles(bubble: Bubble) {
          if (reduceMotion) return;
          for (let i = 0; i < 9; i += 1) {
            const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.4;
            const speed = 62 + Math.random() * 65;
            const graphic = new PixiGraphics().circle(0, 0, 2 + Math.random() * 2).fill({ color: bubble.color, alpha: 0.75 });
            graphic.position.set(bubble.x, bubble.y);
            instance.stage.addChild(graphic);
            sparks.push({ x: bubble.x, y: bubble.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, age: 0, duration: 0.55, graphic });
          }
        }

        function burst(index: number) {
          const bubble = bubbles[index];
          if (!bubble || bubble.popped) return;
          bubble.popped = true;
          bubble.graphic.visible = false;
          bubble.graphic.eventMode = 'none';
          const graphic = new PixiGraphics();
          graphic.position.set(bubble.x, bubble.y);
          instance.stage.addChild(graphic);
          ripples.push({
            x: bubble.x,
            y: bubble.y,
            maxRadius: bubble.blast,
            age: 0,
            duration: reduceMotion ? 0.2 : 0.48 + bubble.blast / 850,
            color: bubble.color,
            graphic,
          });
          addSparkles(bubble);
          setPoppedCount(bubbles.filter((item) => item.popped).length);
        }

        function play(index: number) {
          if (phase !== 'ready' || !bubbles[index]) return;
          phase = 'running';
          setStatus('running');
          burst(index);
        }

        function select(index: number) {
          if (phase !== 'ready' || !bubbles.length) return;
          const safeIndex = (index + bubbles.length) % bubbles.length;
          const bubble = bubbles[safeIndex];
          if (!keyboardMarker) {
            keyboardMarker = new PixiGraphics();
            instance.stage.addChild(keyboardMarker);
          }
          keyboardMarker.clear().circle(0, 0, bubble.radius + 15).stroke({ color: 0x344b43, alpha: 0.9, width: 2 });
          keyboardMarker.position.set(bubble.x, bubble.y);
          setSelected(safeIndex);
        }

        function startLevel(index: number) {
          currentLevel = index;
          phase = 'ready';
          bubbles = [];
          ripples = [];
          sparks = [];
          keyboardMarker = null;
          for (const child of instance.stage.removeChildren()) child.destroy({ children: true });

          const dust = new PixiGraphics();
          for (let i = 0; i < 40; i += 1) {
            const x = 20 + ((i * 151) % 520);
            const y = 20 + ((i * 89) % 520);
            dust.circle(x, y, i % 6 === 0 ? 2 : 1).fill({ color: 0x937d74, alpha: i % 6 === 0 ? 0.2 : 0.1 });
          }
          instance.stage.addChild(dust);

          levels[index].bubbles.forEach((spec, bubbleIndex) => {
            const x = toBoardX(spec.x);
            const y = toBoardY(spec.y);
            const radius = (spec.size ?? 25) * SCENE_SCALE;
            const color = spec.color ?? 0x83aaa0;
            const graphic = makeBubble(x, y, radius, color, spec.blast >= 170);
            graphic.on('pointertap', () => play(bubbleIndex));
            instance.stage.addChild(graphic);
            bubbles.push({ x, y, radius, color, blast: spec.blast * SCENE_SCALE, graphic, popped: false });
          });

          setLevelIndex(index);
          setStatus('ready');
          setPoppedCount(0);
          setSelected(0);
        }

        restartRef.current = startLevel;
        playRef.current = play;
        selectRef.current = select;
        startLevel(0);

        instance.ticker.add((ticker) => {
          const dt = Math.min(ticker.deltaMS / 1000, 0.05);
          for (let i = ripples.length - 1; i >= 0; i -= 1) {
            const ripple = ripples[i];
            ripple.age += dt;
            const progress = Math.min(1, ripple.age / ripple.duration);
            const radius = ripple.maxRadius * progress;
            ripple.graphic.clear()
              .circle(0, 0, radius)
              .stroke({ color: ripple.color, alpha: (1 - progress) * 0.7, width: reduceMotion ? 2 : 3 });

            // A bubble starts its own ripple as soon as the expanding edge reaches it.
            bubbles.forEach((bubble, index) => {
              if (!bubble.popped && Math.hypot(bubble.x - ripple.x, bubble.y - ripple.y) <= radius + bubble.radius * 0.4) {
                burst(index);
              }
            });
            if (progress >= 1) {
              instance.stage.removeChild(ripple.graphic);
              ripple.graphic.destroy();
              ripples.splice(i, 1);
            }
          }
          for (let i = sparks.length - 1; i >= 0; i -= 1) {
            const spark = sparks[i];
            spark.age += dt;
            spark.x += spark.vx * dt;
            spark.y += spark.vy * dt;
            spark.graphic.position.set(spark.x, spark.y);
            spark.graphic.alpha = Math.max(0, 1 - spark.age / spark.duration);
            if (spark.age >= spark.duration) {
              instance.stage.removeChild(spark.graphic);
              spark.graphic.destroy();
              sparks.splice(i, 1);
            }
          }
          if (phase === 'running' && ripples.length === 0) {
            const won = bubbles.every((bubble) => bubble.popped);
            phase = won ? 'won' : 'lost';
            setStatus(phase);
            if (won) setCompleted((previous) => previous.includes(currentLevel) ? previous : [...previous, currentLevel]);
          }
        });

        const onVisibilityChange = () => {
          if (document.hidden) instance.stop();
          else instance.start();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        removeVisibilityListener = () => document.removeEventListener('visibilitychange', onVisibilityChange);
      } catch (cause) {
        if (!cancelled) {
          console.error('Bubble Chain could not start', cause);
          setError('The game could not start in this browser. Please try reloading the page.');
        }
      }
    }

    void setup();
    return () => {
      cancelled = true;
      removeVisibilityListener();
      restartRef.current = () => {};
      playRef.current = () => {};
      selectRef.current = () => {};
      if (app) app.destroy({ removeView: true, releaseGlobalResources: true }, { children: true });
    };
  }, []);

  const level = levels[levelIndex];
  const total = level.bubbles.length;
  const nextLevel = () => restartRef.current((levelIndex + 1) % levels.length);
  const handleBoardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || status !== 'ready') return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      selectRef.current(selected + (event.key === 'ArrowRight' ? 1 : -1));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      playRef.current(selected);
    }
  };

  return (
    <section className={styles.gameShell} aria-label="Bubble Chain game">
      <div className={styles.boardWrap}>
        <div className={styles.boardTop}><strong>LEVEL {String(levelIndex + 1).padStart(2, '0')} / {String(levels.length).padStart(2, '0')}</strong><span>{level.name}</span></div>
        <div
          className={styles.board}
          role="group"
          tabIndex={0}
          aria-label={`Game board with ${total} bubbles. Use left and right arrows to choose a bubble, then press Enter or Space to pop it.`}
          onFocus={() => selectRef.current(selected)}
          onKeyDown={handleBoardKeyDown}
        >
          <div className={styles.canvasHost} ref={canvasHost} aria-hidden="true" />
          <span className={styles.boardBadge}>{status === 'ready' ? 'ONE TAP ONLY' : status === 'running' ? 'WATCH THE RIPPLE' : status === 'won' ? 'ALL POPPED' : 'TRY ANOTHER BUBBLE'}</span>
          {status === 'ready' && <span className={styles.boardHint}>Tap a bubble to begin · or use ← → and Enter</span>}
          {error && <div className={styles.result}><div className={styles.resultCard}><h2>Oops, no bubbles.</h2><p>{error}</p></div></div>}
          {!error && (status === 'won' || status === 'lost') && (
            <div className={styles.result} role="status">
              <div className={styles.resultCard}>
                <span className={styles.resultIcon} aria-hidden="true">{status === 'won' ? '✳' : '○'}</span>
                <h2>{status === 'won' ? 'Beautifully done.' : 'Almost there.'}</h2>
                <p>{status === 'won' ? (levelIndex === levels.length - 1 ? 'You sent a ripple across the whole sky.' : 'Every bubble found its way into the chain.') : `You popped ${poppedCount} of ${total}. Try starting somewhere else.`}</p>
                <div className={styles.resultActions}>
                  {status === 'won' && <button onClick={nextLevel}>{levelIndex === levels.length - 1 ? 'Play again' : 'Next level →'}</button>}
                  <button className={styles.secondaryButton} onClick={() => restartRef.current(levelIndex)}>{status === 'won' ? 'Replay level' : 'Try again'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <aside className={styles.side}>
        <div><div className={styles.sideKicker}>HOW TO PLAY</div><h2>One tap.<br />Big ripple.</h2></div>
        <p className={styles.sideDescription}>Pick just one bubble. Its ripple will pop nearby bubbles, setting off a chain. Clear the board to move on.</p>
        <div className={styles.levelList} aria-label="Choose a level">
          {levels.map((item, index) => (
            <button
              key={item.name}
              className={`${styles.levelButton} ${index === levelIndex ? styles.levelButtonActive : ''}`}
              onClick={() => restartRef.current(index)}
              aria-current={index === levelIndex ? 'step' : undefined}
            >
              <span className={styles.levelNumber}>{String(index + 1).padStart(2, '0')}</span>
              <span>{item.name}</span>
              {completed.includes(index) && <span className={styles.levelDone} aria-label="completed">✓</span>}
            </button>
          ))}
        </div>
        <div className={styles.progress}>
          <div className={styles.progressLabel}><span>Bubbles popped</span><strong>{poppedCount} / {total}</strong></div>
          <div className={styles.progressTrack} role="progressbar" aria-label="Bubbles popped" aria-valuemin={0} aria-valuemax={total} aria-valuenow={poppedCount}><span className={styles.progressFill} style={{ width: `${(poppedCount / total) * 100}%` }} /></div>
          <button className={styles.restartButton} onClick={() => restartRef.current(levelIndex)}>↻ &nbsp; Restart level</button>
        </div>
      </aside>
    </section>
  );
}
