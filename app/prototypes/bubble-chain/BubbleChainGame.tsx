'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Application, Graphics } from 'pixi.js';
import { levels } from './levels';
import styles from './styles.module.css';

type Status = 'ready' | 'playing' | 'won' | 'timeup';
type Orb = {
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: number;
  phase: number;
  launched: boolean;
  captured: boolean;
  graphic: Graphics;
};
type Particle = { x: number; y: number; vx: number; vy: number; age: number; duration: number; graphic: Graphics };
type TrailPoint = { x: number; y: number; life: number };
type Point = { x: number; y: number };

const BOARD_SIZE = 560;
const CORE = BOARD_SIZE / 2;
const SCENE_SCALE = 0.85;
const START_RADIUS = 35;
const toBoardX = (x: number) => CORE + (x - 480) * SCENE_SCALE;
const toBoardY = (y: number) => CORE + (y - 280) * SCENE_SCALE;

function distanceToSegment(point: Point, start: Point, end: Point) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
}

export default function BubbleChainGame() {
  const canvasHost = useRef<HTMLDivElement>(null);
  const restartRef = useRef<(level: number) => void>(() => {});
  const hitRef = useRef<(orb: number) => void>(() => {});
  const selectRef = useRef<(orb: number) => void>(() => {});
  const [levelIndex, setLevelIndex] = useState(0);
  const [status, setStatus] = useState<Status>('ready');
  const [collected, setCollected] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(levels[0].seconds);
  const [coreSize, setCoreSize] = useState(100);
  const [completed, setCompleted] = useState<number[]>([]);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let app: Application | null = null;
    let removeListeners = () => {};

    async function setup() {
      try {
        const { Application: PixiApplication, Graphics: PixiGraphics } = await import('pixi.js');
        if (cancelled || !canvasHost.current) return;

        const instance = new PixiApplication();
        await instance.init({
          width: BOARD_SIZE,
          height: BOARD_SIZE,
          background: '#080d20',
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
        instance.canvas.style.touchAction = 'none';
        canvasHost.current.appendChild(instance.canvas);

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let currentLevel = 0;
        let phase: Status = 'ready';
        let orbs: Orb[] = [];
        let particles: Particle[] = [];
        let trailPoints: TrailPoint[] = [];
        let trail: Graphics;
        let coreGraphic: Graphics;
        let cursor: Graphics;
        let keyboardMarker: Graphics | null = null;
        let elapsed = 0;
        let timer = levels[0].seconds;
        let lastShownSecond = levels[0].seconds;
        let currentScore = 0;
        let capturedCount = 0;
        let targetRadius = START_RADIUS;
        let renderedRadius = START_RADIUS;
        let activePointer: number | null = null;
        let previousPoint: Point | null = null;

        function drawOrb(radius: number, color: number) {
          return new PixiGraphics()
            .circle(0, 0, radius + 10).fill({ color, alpha: 0.1 })
            .circle(0, 0, radius + 3).stroke({ color, alpha: 0.7, width: 2 })
            .circle(0, 0, radius).fill({ color, alpha: 0.34 })
            .circle(0, 0, radius - 5).fill({ color, alpha: 0.68 })
            .circle(-radius * 0.25, -radius * 0.29, Math.max(3, radius * 0.19)).fill({ color: 0xffffff, alpha: 0.85 });
        }

        function drawCore() {
          const pulse = reduceMotion ? 0 : Math.sin(elapsed * 3.3) * 3;
          const radius = renderedRadius + pulse;
          coreGraphic.clear()
            .circle(0, 0, radius + 30).fill({ color: 0xff3caa, alpha: 0.07 })
            .circle(0, 0, radius + 15).fill({ color: 0xff3caa, alpha: 0.14 })
            .circle(0, 0, radius + 8).stroke({ color: 0xff66c8, alpha: 0.6, width: 2 })
            .circle(0, 0, radius).fill({ color: 0xff3caa, alpha: 0.8 })
            .circle(0, 0, radius - 8).fill({ color: 0xff9de0, alpha: 0.76 })
            .circle(-radius * 0.24, -radius * 0.29, Math.max(5, radius * 0.17)).fill({ color: 0xffffff, alpha: 0.75 });
        }

        function burst(x: number, y: number, color: number, count: number) {
          if (reduceMotion) return;
          for (let i = 0; i < count; i += 1) {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
            const speed = 65 + Math.random() * 115;
            const graphic = new PixiGraphics().circle(0, 0, 2 + Math.random() * 2.5).fill({ color, alpha: 0.95 });
            graphic.position.set(x, y);
            instance.stage.addChild(graphic);
            particles.push({
              x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
              age: 0, duration: 0.35 + Math.random() * 0.28, graphic,
            });
          }
        }

        function launch(orb: Orb, chain = false) {
          if (orb.launched || orb.captured || phase === 'won' || phase === 'timeup') return;
          if (keyboardMarker) keyboardMarker.visible = false;
          if (phase === 'ready') {
            phase = 'playing';
            setStatus('playing');
          }
          orb.launched = true;
          const dx = CORE - orb.x;
          const dy = CORE - orb.y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const speed = chain ? 290 : 330;
          orb.vx = dx / distance * speed;
          orb.vy = dy / distance * speed;
          burst(orb.x, orb.y, orb.color, chain ? 7 : 12);
        }

        function capture(orb: Orb) {
          if (orb.captured) return;
          orb.captured = true;
          orb.graphic.visible = false;
          burst(orb.x, orb.y, orb.color, 17);
          targetRadius = Math.min(112, targetRadius + 6);
          capturedCount += 1;
          currentScore += 100 + capturedCount * 20;
          setCollected(capturedCount);
          setScore(currentScore);
          setCoreSize(Math.round(targetRadius / START_RADIUS * 100));
          if (capturedCount === orbs.length) {
            phase = 'won';
            setStatus('won');
            setCompleted((previous) => previous.includes(currentLevel) ? previous : [...previous, currentLevel]);
          }
        }

        function select(index: number) {
          if (phase === 'won' || phase === 'timeup' || !orbs.length) return;
          let safeIndex = (index + orbs.length) % orbs.length;
          for (let i = 0; i < orbs.length && orbs[safeIndex].captured; i += 1) safeIndex = (safeIndex + 1) % orbs.length;
          const orb = orbs[safeIndex];
          if (!keyboardMarker) {
            keyboardMarker = new PixiGraphics();
            instance.stage.addChild(keyboardMarker);
          }
          keyboardMarker.visible = true;
          keyboardMarker.clear().circle(0, 0, orb.radius + 15).stroke({ color: 0xffffff, alpha: 0.95, width: 2 });
          keyboardMarker.position.set(orb.x, orb.y);
          setSelected(safeIndex);
        }

        function startLevel(index: number) {
          currentLevel = index;
          phase = 'ready';
          elapsed = 0;
          timer = levels[index].seconds;
          lastShownSecond = timer;
          currentScore = 0;
          capturedCount = 0;
          targetRadius = START_RADIUS;
          renderedRadius = START_RADIUS;
          orbs = [];
          particles = [];
          trailPoints = [];
          keyboardMarker = null;
          activePointer = null;
          previousPoint = null;
          for (const child of instance.stage.removeChildren()) child.destroy({ children: true });

          const arena = new PixiGraphics();
          for (let line = 0; line <= BOARD_SIZE; line += 40) {
            arena.moveTo(line, 0).lineTo(line, BOARD_SIZE).stroke({ color: 0x3a5278, alpha: 0.18, width: 1 });
            arena.moveTo(0, line).lineTo(BOARD_SIZE, line).stroke({ color: 0x3a5278, alpha: 0.18, width: 1 });
          }
          arena.circle(CORE, CORE, 120).stroke({ color: 0x21dce9, alpha: 0.16, width: 2 });
          arena.circle(CORE, CORE, 205).stroke({ color: 0x21dce9, alpha: 0.09, width: 2 });
          arena.rect(10, 10, BOARD_SIZE - 20, BOARD_SIZE - 20).stroke({ color: 0x2de4ef, alpha: 0.22, width: 2 });
          instance.stage.addChild(arena);

          coreGraphic = new PixiGraphics();
          coreGraphic.position.set(CORE, CORE);
          instance.stage.addChild(coreGraphic);
          drawCore();

          levels[index].orbs.forEach((spec, orbIndex) => {
            const x = toBoardX(spec.x);
            const y = toBoardY(spec.y);
            const radius = (spec.size ?? 25) * SCENE_SCALE;
            const color = spec.color ?? 0x36e8ef;
            const graphic = drawOrb(radius, color);
            graphic.position.set(x, y);
            instance.stage.addChild(graphic);
            orbs.push({
              anchorX: x, anchorY: y, x, y, vx: 0, vy: 0, radius, color,
              phase: orbIndex * 1.9, launched: false, captured: false, graphic,
            });
          });

          trail = new PixiGraphics();
          instance.stage.addChild(trail);
          cursor = new PixiGraphics()
            .circle(0, 0, 15).stroke({ color: 0xffffff, alpha: 0.9, width: 2 })
            .moveTo(-22, 0).lineTo(-10, 0).stroke({ color: 0x36e8ef, width: 2 })
            .moveTo(10, 0).lineTo(22, 0).stroke({ color: 0x36e8ef, width: 2 })
            .moveTo(0, -22).lineTo(0, -10).stroke({ color: 0x36e8ef, width: 2 })
            .moveTo(0, 10).lineTo(0, 22).stroke({ color: 0x36e8ef, width: 2 });
          cursor.visible = false;
          instance.stage.addChild(cursor);

          setLevelIndex(index);
          setStatus('ready');
          setCollected(0);
          setScore(0);
          setTimeLeft(timer);
          setCoreSize(100);
          setSelected(0);
        }

        function pointFromEvent(event: PointerEvent): Point {
          const bounds = instance.canvas.getBoundingClientRect();
          return {
            x: (event.clientX - bounds.left) * BOARD_SIZE / bounds.width,
            y: (event.clientY - bounds.top) * BOARD_SIZE / bounds.height,
          };
        }

        function onPointerDown(event: PointerEvent) {
          if (phase === 'won' || phase === 'timeup') return;
          activePointer = event.pointerId;
          previousPoint = pointFromEvent(event);
          trailPoints.push({ ...previousPoint, life: 0.2 });
          cursor.position.set(previousPoint.x, previousPoint.y);
          cursor.visible = true;
          instance.canvas.setPointerCapture(event.pointerId);
        }

        function onPointerMove(event: PointerEvent) {
          if (activePointer !== event.pointerId || !previousPoint) return;
          const point = pointFromEvent(event);
          cursor.position.set(point.x, point.y);
          const distance = Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
          if (distance > 1) {
            trailPoints.push({ ...point, life: 0.2 });
            for (const orb of orbs) {
              if (!orb.launched && !orb.captured && distanceToSegment(orb, previousPoint, point) <= orb.radius + 13) {
                launch(orb);
              }
            }
          }
          previousPoint = point;
        }

        function onPointerEnd(event: PointerEvent) {
          if (activePointer !== event.pointerId) return;
          activePointer = null;
          previousPoint = null;
          cursor.visible = false;
          if (instance.canvas.hasPointerCapture(event.pointerId)) instance.canvas.releasePointerCapture(event.pointerId);
        }

        restartRef.current = startLevel;
        hitRef.current = (index: number) => { if (orbs[index]) launch(orbs[index]); };
        selectRef.current = select;
        startLevel(0);

        instance.canvas.addEventListener('pointerdown', onPointerDown);
        instance.canvas.addEventListener('pointermove', onPointerMove);
        instance.canvas.addEventListener('pointerup', onPointerEnd);
        instance.canvas.addEventListener('pointercancel', onPointerEnd);
        removeListeners = () => {
          instance.canvas.removeEventListener('pointerdown', onPointerDown);
          instance.canvas.removeEventListener('pointermove', onPointerMove);
          instance.canvas.removeEventListener('pointerup', onPointerEnd);
          instance.canvas.removeEventListener('pointercancel', onPointerEnd);
        };

        instance.ticker.add((ticker) => {
          const dt = Math.min(ticker.deltaMS / 1000, 0.05);
          elapsed += dt;
          renderedRadius += (targetRadius - renderedRadius) * Math.min(1, dt * 9);
          drawCore();

          for (const orb of orbs) {
            if (orb.captured) continue;
            if (orb.launched) {
              const dx = CORE - orb.x;
              const dy = CORE - orb.y;
              const distance = Math.max(1, Math.hypot(dx, dy));
              orb.vx += dx / distance * 670 * dt;
              orb.vy += dy / distance * 670 * dt;
              const speed = Math.hypot(orb.vx, orb.vy);
              if (speed > 520) { orb.vx *= 520 / speed; orb.vy *= 520 / speed; }
              orb.x += orb.vx * dt;
              orb.y += orb.vy * dt;
              if (distance <= renderedRadius + orb.radius - 2) capture(orb);
            } else {
              const drift = reduceMotion ? 0 : 6;
              orb.x = orb.anchorX + Math.sin(elapsed * 1.2 + orb.phase) * drift;
              orb.y = orb.anchorY + Math.cos(elapsed * 1.05 + orb.phase) * drift;
            }
            orb.graphic.position.set(orb.x, orb.y);
          }

          // A flying orb can knock another orb toward the center.
          for (const flying of orbs) {
            if (!flying.launched || flying.captured) continue;
            for (const waiting of orbs) {
              if (!waiting.launched && !waiting.captured &&
                Math.hypot(flying.x - waiting.x, flying.y - waiting.y) < flying.radius + waiting.radius) {
                launch(waiting, true);
              }
            }
          }

          for (let i = particles.length - 1; i >= 0; i -= 1) {
            const particle = particles[i];
            particle.age += dt;
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.graphic.position.set(particle.x, particle.y);
            particle.graphic.alpha = Math.max(0, 1 - particle.age / particle.duration);
            if (particle.age >= particle.duration) {
              instance.stage.removeChild(particle.graphic);
              particle.graphic.destroy();
              particles.splice(i, 1);
            }
          }

          for (let i = trailPoints.length - 1; i >= 0; i -= 1) {
            trailPoints[i].life -= dt;
            if (trailPoints[i].life <= 0) trailPoints.splice(i, 1);
          }
          trail.clear();
          for (let i = 1; i < trailPoints.length; i += 1) {
            trail.moveTo(trailPoints[i - 1].x, trailPoints[i - 1].y)
              .lineTo(trailPoints[i].x, trailPoints[i].y)
              .stroke({ color: 0x36e8ef, alpha: trailPoints[i].life / 0.2 * 0.72, width: 7 });
          }

          if (phase === 'playing') {
            timer = Math.max(0, timer - dt);
            const shown = Math.ceil(timer);
            if (shown !== lastShownSecond) {
              lastShownSecond = shown;
              setTimeLeft(shown);
            }
            if (timer <= 0 && capturedCount < orbs.length) {
              phase = 'timeup';
              setStatus('timeup');
            }
          }
        });

        const onVisibilityChange = () => {
          if (document.hidden) instance.stop();
          else instance.start();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        const removeInputs = removeListeners;
        removeListeners = () => {
          removeInputs();
          document.removeEventListener('visibilitychange', onVisibilityChange);
        };
      } catch (cause) {
        if (!cancelled) {
          console.error('Bubble Rush could not start', cause);
          setError('The game could not start in this browser. Please try reloading the page.');
        }
      }
    }

    void setup();
    return () => {
      cancelled = true;
      removeListeners();
      restartRef.current = () => {};
      hitRef.current = () => {};
      selectRef.current = () => {};
      if (app) app.destroy({ removeView: true, releaseGlobalResources: true }, { children: true });
    };
  }, []);

  const level = levels[levelIndex];
  const total = level.orbs.length;
  const nextLevel = () => restartRef.current((levelIndex + 1) % levels.length);
  const handleBoardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || status === 'won' || status === 'timeup') return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      selectRef.current(selected + (event.key === 'ArrowRight' ? 1 : -1));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      hitRef.current(selected);
    }
  };

  return (
    <section className={styles.gameShell} aria-label="Bubble Rush game">
      <div className={styles.boardWrap}>
        <div className={styles.boardTop}><strong>STAGE {String(levelIndex + 1).padStart(2, '0')} / {String(levels.length).padStart(2, '0')}</strong><span>{level.name}</span></div>
        <div
          className={styles.board}
          role="group"
          tabIndex={0}
          aria-label={`Arcade board with ${total} orbs. Hold and drag through them to feed the center. Keyboard: left and right arrows choose an orb; Enter launches it.`}
          onKeyDown={handleBoardKeyDown}
        >
          <div className={styles.canvasHost} ref={canvasHost} aria-hidden="true" />
          <div className={styles.hud} aria-hidden="true">
            <span>SCORE <strong>{String(score).padStart(5, '0')}</strong></span>
            <span>CORE <strong>{coreSize}%</strong></span>
            <span>TIME <strong>{timeLeft}s</strong></span>
          </div>
          <span className={styles.boardBadge}>{status === 'ready' ? 'HOLD + SWIPE' : status === 'playing' ? 'CORE CHARGING' : status === 'won' ? 'STAGE CLEAR' : 'TIME UP'}</span>
          {status === 'ready' && <span className={styles.boardHint}>Hold + drag through an orb to launch it →</span>}
          {error && <div className={styles.result}><div className={styles.resultCard}><h2>GAME ERROR</h2><p>{error}</p></div></div>}
          {!error && (status === 'won' || status === 'timeup') && (
            <div className={styles.result} role="status">
              <div className={styles.resultCard}>
                <span className={styles.resultIcon} aria-hidden="true">{status === 'won' ? '✦' : '00'}</span>
                <h2>{status === 'won' ? 'STAGE CLEAR!' : 'TIME UP!'}</h2>
                <p>{status === 'won' ? `The core grew to ${coreSize}%. Final score: ${score}.` : `You fed the core ${collected} of ${total} orbs. Give it another run.`}</p>
                <div className={styles.resultActions}>
                  {status === 'won' && <button onClick={nextLevel}>{levelIndex === levels.length - 1 ? 'PLAY AGAIN ↻' : 'NEXT STAGE →'}</button>}
                  <button className={styles.secondaryButton} onClick={() => restartRef.current(levelIndex)}>RETRY STAGE</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <aside className={styles.side}>
        <div><div className={styles.sideKicker}>HOW TO PLAY</div><h2>HIT.<br />FEED.<br /><span>GROW.</span></h2></div>
        <p className={styles.sideDescription}>Hold the mouse button and sweep through the small orbs. They fly toward the center. Every collision makes the core bigger.</p>
        <p className={styles.levelHint}>↳ {level.hint}</p>
        <div className={styles.levelList} aria-label="Choose a stage">
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
          <div className={styles.progressLabel}><span>ORBS FED</span><strong>{collected} / {total}</strong></div>
          <div className={styles.progressTrack} role="progressbar" aria-label="Orbs fed to the core" aria-valuemin={0} aria-valuemax={total} aria-valuenow={collected}><span className={styles.progressFill} style={{ width: `${(collected / total) * 100}%` }} /></div>
          <button className={styles.restartButton} onClick={() => restartRef.current(levelIndex)}>↻ &nbsp; RESTART STAGE</button>
        </div>
      </aside>
    </section>
  );
}
