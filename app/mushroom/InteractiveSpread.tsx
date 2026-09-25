'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import styles from './mushroom.module.css';

type SpreadItem = {
  imagePath: string;
  title: string;
};

type InteractiveSpreadProps = {
  spreads: SpreadItem[];
};

export default function InteractiveSpread({ spreads }: InteractiveSpreadProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const previewRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const openedFromRef = useRef(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tiltFrameRef = useRef<number | null>(null);
  const preparedRef = useRef(new Set<number>());

  const prepareImage = useCallback((index: number) => {
    const normalizedIndex = (index + spreads.length) % spreads.length;
    if (preparedRef.current.has(normalizedIndex)) return;
    preparedRef.current.add(normalizedIndex);
    const image = new Image();
    image.decoding = 'async';
    image.src = spreads[normalizedIndex].imagePath;
    image.decode().catch(() => undefined);
  }, [spreads]);

  const moveGallery = useCallback((step: -1 | 1) => {
    setDirection(step === 1 ? 'right' : 'left');
    setActiveIndex((current) => (current + step + spreads.length) % spreads.length);
  }, [spreads.length]);

  useEffect(() => {
    return () => {
      if (tiltFrameRef.current !== null) cancelAnimationFrame(tiltFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'ArrowLeft') moveGallery(-1);
      if (event.key === 'ArrowRight') moveGallery(1);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previewRefs.current[openedFromRef.current]?.focus();
    };
  }, [moveGallery, open]);

  useEffect(() => {
    if (!open) return;
    prepareImage(activeIndex);
    prepareImage(activeIndex - 1);
    prepareImage(activeIndex + 1);
  }, [activeIndex, open, prepareImage]);

  function openGallery(index: number) {
    openedFromRef.current = index;
    setActiveIndex(index);
    setDirection(null);
    prepareImage(index);
    setOpen(true);
  }

  function tiltPreview(event: PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const target = event.currentTarget;
    if (tiltFrameRef.current !== null) cancelAnimationFrame(tiltFrameRef.current);
    tiltFrameRef.current = requestAnimationFrame(() => {
      target.style.setProperty('--spread-rotate-x', `${-y * 2.4}deg`);
      target.style.setProperty('--spread-rotate-y', `${x * 3.2}deg`);
    });
  }

  function resetPreview(event: PointerEvent<HTMLButtonElement>) {
    event.currentTarget.style.setProperty('--spread-rotate-x', '0deg');
    event.currentTarget.style.setProperty('--spread-rotate-y', '0deg');
  }

  const activeSpread = spreads[activeIndex];

  return (
    <>
      {spreads.map((spread, index) => (
        <figure className={styles.interactiveSpreadFigure} key={spread.title}>
          <button
            ref={(node) => { previewRefs.current[index] = node; }}
            type="button"
            className={styles.interactiveSpreadButton}
            aria-label={`Open enlarged view: ${spread.title}`}
            aria-haspopup="dialog"
            onClick={() => openGallery(index)}
            onFocus={() => prepareImage(index)}
            onPointerEnter={() => prepareImage(index)}
            onPointerMove={tiltPreview}
            onPointerLeave={resetPreview}
          >
            <img src={spread.imagePath} alt={`${spread.title} — photographed book spread`} loading="lazy" decoding="async" />
            <span className={styles.spreadOpenHint} aria-hidden="true">Open · 打开</span>
          </button>
          <figcaption>{String(index + 1).padStart(2, '0')} / {spread.title}</figcaption>
        </figure>
      ))}

      {open && (
        <div
          className={styles.spreadLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged view: ${activeSpread.title}`}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <button
            ref={closeRef}
            type="button"
            className={styles.spreadClose}
            aria-label="Close enlarged view"
            onClick={() => setOpen(false)}
          >
            Close <span aria-hidden="true">×</span>
          </button>

          <button
            type="button"
            className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`}
            aria-label="Previous book spread"
            onClick={() => moveGallery(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>

          <div className={styles.coinStage}>
            <div className={styles.coinFlip}>
              <img
                key={activeSpread.imagePath}
                className={`${styles.coinFront} ${direction === 'right' ? styles.slideFromRight : direction === 'left' ? styles.slideFromLeft : ''}`}
                src={activeSpread.imagePath}
                alt={`Enlarged view of ${activeSpread.title}`}
              />
              <div className={styles.coinBack} aria-hidden="true"><span>Don’t Mess With<br />Mushroooom</span></div>
            </div>
          </div>

          <button
            type="button"
            className={`${styles.galleryArrow} ${styles.galleryArrowRight}`}
            aria-label="Next book spread"
            onClick={() => moveGallery(1)}
          >
            <span aria-hidden="true">→</span>
          </button>

          <p className={styles.spreadCounter} aria-live="polite">
            {String(activeIndex + 1).padStart(2, '0')} / {String(spreads.length).padStart(2, '0')} · {activeSpread.title}
          </p>
          <p className={styles.spreadCloseHint}>Click outside or press Esc · 点击空白处或按 Esc 关闭</p>
        </div>
      )}
    </>
  );
}
