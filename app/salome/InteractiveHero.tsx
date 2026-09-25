'use client';

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import styles from './salome.module.css';

type Point = { x: number; y: number };

export default function InteractiveSalomeHero() {
  const stageRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const pointRef = useRef<Point>({ x: 0.5, y: 0.42 });

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  function paint(point: Point) {
    const stage = stageRef.current;
    if (!stage) return;
    pointRef.current = point;
    const nx = point.x * 2 - 1;
    const ny = point.y * 2 - 1;
    const figureLightY = Math.min(1, Math.max(0, (point.y - 0.12) / 0.88));
    stage.style.setProperty('--light-x', `${point.x * 100}%`);
    stage.style.setProperty('--light-y', `${point.y * 100}%`);
    stage.style.setProperty('--figure-light-y', `${figureLightY * 100}%`);
    stage.style.setProperty('--figure-x', `${nx * 22}px`);
    stage.style.setProperty('--figure-y', `${ny * 8}px`);
    stage.style.setProperty('--rotate-y', `${nx * 5.5}deg`);
    stage.style.setProperty('--rotate-x', `${-ny * 3.2}deg`);
    stage.style.setProperty('--beam-turn', `${nx * 5}deg`);
  }

  function moveLight(event: PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const next = {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => paint(next));
  }

  function resetLight() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => paint({ x: 0.5, y: 0.42 }));
  }

  function moveWithKeyboard(event: KeyboardEvent<HTMLElement>) {
    const amount = event.shiftKey ? 0.12 : 0.055;
    const next = { ...pointRef.current };
    if (event.key === 'ArrowLeft') next.x -= amount;
    else if (event.key === 'ArrowRight') next.x += amount;
    else if (event.key === 'ArrowUp') next.y -= amount;
    else if (event.key === 'ArrowDown') next.y += amount;
    else if (event.key === 'Escape') return resetLight();
    else return;
    event.preventDefault();
    paint({ x: Math.min(1, Math.max(0, next.x)), y: Math.min(1, Math.max(0, next.y)) });
  }

  return (
    <section
      ref={stageRef}
      className={styles.interactiveHero}
      aria-labelledby="salome-interactive-title"
      aria-describedby="salome-interaction-note"
      onPointerMove={moveLight}
      onPointerDown={moveLight}
      onPointerLeave={resetLight}
      onKeyDown={moveWithKeyboard}
      tabIndex={0}
    >
      <div className={styles.interactiveBackdrop} aria-hidden="true" />
      <div className={styles.blueBeam} aria-hidden="true" />
      <div className={styles.lightPool} aria-hidden="true" />
      <div className={styles.figureShadow} aria-hidden="true">
        <img src="/images/salome/person-cutout.png" alt="" />
      </div>
      <div className={styles.figureStage}>
        <img
          className={styles.figureDim}
          src="/images/salome/person-cutout.png"
          alt="Salomé beneath a blue veil decorated with butterflies"
        />
        <img className={styles.figureLit} src="/images/salome/person-cutout.png" alt="" aria-hidden="true" />
      </div>
      <div className={styles.salomeWord}>
        <h1 className={styles.srOnly} id="salome-interactive-title">Salomé</h1>
        <img className={styles.wordDim} src="/images/salome/salome-title.png" alt="" aria-hidden="true" />
      </div>
      <div className={styles.interactiveMeta}>
        <span>Experimental video · 2025</span>
        <span>Light · Gaze · Inner self</span>
      </div>
      <p className={styles.interactionNote} id="salome-interaction-note">
        <span>Move to direct the light</span>
        <span lang="zh">移动鼠标，让光寻找她</span>
      </p>
      <a className={styles.heroScroll} href="#concept-title">Enter the story <span aria-hidden="true">↓</span></a>
    </section>
  );
}
