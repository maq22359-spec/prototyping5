'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import styles from './threeLab.module.css';

// World coordinates: the central cube (our stand-in for a person) is at 0, 0, 0.
const CAMERA_PATH = [
  { progress: 0, position: new THREE.Vector3(0, 0.8, 9) },
  { progress: 0.3, position: new THREE.Vector3(0, 0.7, 5) },
  { progress: 0.6, position: new THREE.Vector3(5, 1.3, 2.5) },
  { progress: 1, position: new THREE.Vector3(0, 1.2, -8) },
];
const LOOK_AT = new THREE.Vector3(0, 0, 0);

export default function ThreeLabScene() {
  const pageRef = useRef<HTMLElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    const canvasHost = canvasHostRef.current;
    if (!page || !canvasHost) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return; // The page remains scrollable if WebGL is unavailable.
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const centralGeometry = new THREE.BoxGeometry(1.4, 2.1, 0.9);
    const centralMaterial = new THREE.MeshPhongMaterial({ color: 0x8799ff, shininess: 65 });
    const central = new THREE.Mesh(centralGeometry, centralMaterial);
    scene.add(central);

    const foregroundGeometry = new THREE.ConeGeometry(0.65, 1.4, 5);
    const foregroundMaterial = new THREE.MeshPhongMaterial({ color: 0xffaa7b, shininess: 55 });
    const foreground = new THREE.Mesh(foregroundGeometry, foregroundMaterial);
    foreground.position.set(-2.4, -0.7, 2.8);
    scene.add(foreground);

    const backgroundGeometry = new THREE.SphereGeometry(0.9, 24, 16);
    const backgroundMaterial = new THREE.MeshPhongMaterial({ color: 0x9bd9cf, shininess: 75 });
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    background.position.set(2.6, 0.8, -4);
    scene.add(background);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const light = new THREE.DirectionalLight(0xdce0ff, 2);
    light.position.set(2, 4, 5);
    scene.add(light);

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    canvasHost.appendChild(renderer.domElement);

    const position = new THREE.Vector3();
    const updateCamera = (progress: number) => {
      const nextIndex = CAMERA_PATH.findIndex((point) => progress <= point.progress);
      const end = CAMERA_PATH[nextIndex < 0 ? CAMERA_PATH.length - 1 : Math.max(nextIndex, 1)];
      const start = CAMERA_PATH[CAMERA_PATH.indexOf(end) - 1];
      const fraction = THREE.MathUtils.clamp(
        (progress - start.progress) / (end.progress - start.progress), 0, 1,
      );
      position.lerpVectors(start.position, end.position, fraction);
      camera.position.copy(position);
      camera.lookAt(LOOK_AT);
      renderer.render(scene, camera);
    };
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };
    updateCamera(0);
    resize();
    window.addEventListener('resize', resize);

    gsap.registerPlugin(ScrollTrigger);
    const cameraTravel = { progress: 0 };
    const tween = gsap.to(cameraTravel, {
      progress: 1,
      ease: 'none',
      onUpdate: () => updateCamera(cameraTravel.progress),
      scrollTrigger: { trigger: page, start: 'top top', end: 'bottom bottom', scrub: true },
    });

    let frame = 0;
    let lastFrame = performance.now();
    const animate = (now: number) => {
      const delta = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      central.rotation.x += delta * 0.1;
      central.rotation.y += delta * 0.25;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };
    const onVisibilityChange = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden) {
        lastFrame = performance.now();
        frame = window.requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    if (!document.hidden) frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', resize);
      tween.scrollTrigger?.kill();
      tween.kill();
      scene.remove(central, foreground, background, light);
      centralGeometry.dispose();
      centralMaterial.dispose();
      foregroundGeometry.dispose();
      foregroundMaterial.dispose();
      backgroundGeometry.dispose();
      backgroundMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <main ref={pageRef} className={styles.page}>
      <div ref={canvasHostRef} className={styles.canvasLayer} aria-hidden="true" />
      <header className={styles.header}>
        <Link href="/">← Back to portfolio</Link>
        <span>THREE LAB / CAMERA PATH</span>
      </header>
      <section className={styles.step}>
        <p>00% / FRONT</p>
        <h1>Scroll through space.</h1>
        <span>Cube: central figure · Cone: foreground · Sphere: background</span>
      </section>
      <section className={styles.step}>
        <p>30% / APPROACH</p>
        <h2>Move closer.</h2>
      </section>
      <section className={styles.step}>
        <p>60% / RIGHT SIDE</p>
        <h2>Move around.</h2>
      </section>
      <section className={styles.step}>
        <p>100% / BEHIND</p>
        <h2>Look back.</h2>
        <span>Scroll upward to retrace the same path.</span>
      </section>
    </main>
  );
}
