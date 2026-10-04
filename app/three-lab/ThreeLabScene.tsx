'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { createGazeRenderer } from '../touch/gazeRenderer';
import styles from './threeLab.module.css';

const FPS = 24;
const CENTRE = 80 / FPS;
const clamp = (n: number, low: number, high: number) => Math.min(high, Math.max(low, n));

function gazeTime(position: number) {
  let frame = position < 0.5 ? 109 - position * 58 : 80 - (position - 0.5) * 24;
  if (frame > 86 && frame < 95) frame = frame < 90.5 ? 86 : 95;
  return (frame + 0.1) / FPS;
}

// 3D Camera Trajectory:
// p = 0.0 -> 0.32: Camera stays in front, allowing 2.5D Dolly Zoom from face to full body
// p = 0.32 -> 0.65: Plunging forward through octagonal airlock rings
// p = 0.65 -> 1.0: 90° Lateral swing orbiting around descending figure & crates with extreme foreshortening
const CAMERA_PATH = [
  { progress: 0.0, position: new THREE.Vector3(0, 0.0, 9.0), lookAt: new THREE.Vector3(0, 0.0, 0.0) },
  { progress: 0.32, position: new THREE.Vector3(0, 0.0, 7.5), lookAt: new THREE.Vector3(0, -0.1, -1.0) },
  { progress: 0.55, position: new THREE.Vector3(0, -0.2, 0.8), lookAt: new THREE.Vector3(0, -0.4, -7.0) },
  { progress: 0.72, position: new THREE.Vector3(4.2, 0.8, -6.5), lookAt: new THREE.Vector3(0, -0.5, -10.5) },
  { progress: 0.88, position: new THREE.Vector3(7.4, 0.4, -10.5), lookAt: new THREE.Vector3(0, -0.5, -10.5) },
  { progress: 1.0, position: new THREE.Vector3(4.6, -0.9, -15.5), lookAt: new THREE.Vector3(0, -0.5, -10.5) },
];

interface CrateConfig {
  title: string;
  category: string;
  number: string;
  size: [number, number, number];
  pos: [number, number, number];
  rotSpeed: [number, number, number];
}

const CRATES: CrateConfig[] = [
  {
    title: 'AIRBUY',
    category: 'BRAND · SYSTEM',
    number: 'NO. 01',
    size: [2.0, 2.0, 2.0], // Huge foreground crate (近大远小)
    pos: [4.8, 0.4, -8.2],
    rotSpeed: [0.07, 0.12, 0.05],
  },
  {
    title: 'SALOME',
    category: 'EXPERIMENTAL VIDEO',
    number: 'NO. 02',
    size: [1.4, 1.2, 1.3],
    pos: [-3.0, 1.6, -9.8],
    rotSpeed: [-0.08, 0.11, 0.06],
  },
  {
    title: 'MUSHROOM',
    category: 'EDITORIAL BOOK',
    number: 'NO. 03',
    size: [1.5, 1.3, 1.4],
    pos: [1.8, -2.6, -11.2],
    rotSpeed: [0.06, -0.1, 0.04],
  },
  {
    title: 'BUBBLE CHAIN',
    category: 'PIXI.JS GAME',
    number: 'NO. 04',
    size: [1.0, 1.0, 1.0], // Distant background
    pos: [-3.8, -1.2, -14.5],
    rotSpeed: [-0.05, 0.13, -0.07],
  },
  {
    title: 'KATE / 2026',
    category: 'FRAGILE · ZERO-G',
    number: 'EXP. 05',
    size: [0.9, 0.9, 0.9],
    pos: [0.6, 3.4, -13.0],
    rotSpeed: [0.1, 0.07, -0.09],
  },
];

function createCrateTexture(title: string, category: string, number: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#9c6f44';
  ctx.fillRect(0, 0, 512, 512);

  const plankCount = 5;
  const plankH = 512 / plankCount;
  for (let i = 0; i < plankCount; i++) {
    const y = i * plankH;
    ctx.fillStyle = i % 2 === 0 ? '#a5794e' : '#91663c';
    ctx.fillRect(0, y, 512, plankH);

    ctx.fillStyle = '#4e3117';
    ctx.fillRect(0, y, 512, 4);

    ctx.fillStyle = 'rgba(65, 40, 20, 0.12)';
    for (let g = 0; g < 4; g++) {
      ctx.fillRect(0, y + 10 + g * 20, 512, 2);
    }
  }

  ctx.strokeStyle = '#3e2612';
  ctx.lineWidth = 30;
  ctx.strokeRect(15, 15, 482, 482);

  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(30, 30);
  ctx.lineTo(482, 482);
  ctx.stroke();

  ctx.fillStyle = '#26180b';
  [[30, 30], [482, 30], [30, 482], [482, 482]].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(65, 180, 382, 152);
  ctx.strokeStyle = '#22150a';
  ctx.lineWidth = 3;
  ctx.strokeRect(69, 184, 374, 144);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#1e140d';
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillText(`${number} · ${category}`, 256, 218);

  ctx.font = 'bold 38px "Impact", "Arial Black", sans-serif';
  ctx.fillText(title, 256, 270);

  ctx.font = '13px monospace';
  ctx.fillStyle = '#593e28';
  ctx.fillText('HANDLE WITH CARE // ZERO GRAVITY', 256, 306);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createOctagonShape(radius: number) {
  const shape = new THREE.Shape();
  const sides = 8;
  for (let i = 0; i <= sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
}

export default function ThreeLabScene() {
  const pageRef = useRef<HTMLElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);

  // 2.5D Dolly Zoom DOM Refs
  const heroDollyRef = useRef<HTMLDivElement>(null);
  const dollyWrapperRef = useRef<HTMLDivElement>(null);
  const gazePortraitRef = useRef<HTMLCanvasElement>(null);
  const shoulderLeftRef = useRef<HTMLImageElement>(null);
  const shoulderRightRef = useRef<HTMLImageElement>(null);
  const fullBodyRef = useRef<HTMLImageElement>(null);

  // Gaze eye tracking state
  const gazeVideoRef = useRef<HTMLVideoElement>(null);
  const gazeTarget = useRef(CENTRE);
  const gazePos = useRef(0.5);
  const gazeVelocity = useRef(0);
  const lastPointer = useRef<{ x: number; time: number } | null>(null);
  const wakeGaze = useRef<() => void>(() => {});

  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // 1. Initialize Real Eye Tracking Video Pipeline (Exactly as in TouchScene)
  useEffect(() => {
    const canvas = gazePortraitRef.current;
    const video = gazeVideoRef.current;
    if (!canvas || !video) return;

    const renderer = createGazeRenderer(canvas);
    if (!renderer) return;

    let disposed = false;
    const poster = new Image();
    poster.onload = () => {
      if (!disposed && video.readyState < 2) renderer.draw(poster);
    };
    poster.src = '/videos/touch/gaze-matte-poster.jpg';

    const draw = () => {
      if (video.readyState >= 2) renderer.draw(video);
    };
    video.addEventListener('seeked', draw);
    video.addEventListener('loadeddata', draw);
    draw();

    return () => {
      disposed = true;
      poster.onload = null;
      video.removeEventListener('seeked', draw);
      video.removeEventListener('loadeddata', draw);
      renderer.dispose();
    };
  }, []);

  // 2. Playhead seeker loop for the Gaze Video
  useEffect(() => {
    const video = gazeVideoRef.current;
    if (!video) return;
    let raf = 0;
    let previousTime = 0;
    let playhead = CENTRE;
    let stopped = false;

    function tick(now: number) {
      raf = 0;
      if (stopped || !video || document.hidden || video.readyState < 2) return;
      const dt = Math.min((now - previousTime) / 1000 || 1 / 60, 0.05);
      previousTime = now;
      const response = 0.10 - 0.072 * clamp(gazeVelocity.current / 2, 0, 1);
      playhead += (gazeTarget.current - playhead) * (1 - Math.exp(-dt / response));
      gazeVelocity.current *= Math.exp(-dt / 0.16);

      const settled = Math.abs(gazeTarget.current - playhead) < 0.006;
      if (settled) playhead = gazeTarget.current;

      if (!video.seeking && Math.abs(video.currentTime - playhead) > 0.009) {
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

    wakeGaze.current = resume;
    video.addEventListener('loadeddata', resume);
    video.addEventListener('seeked', resume);
    if (video.readyState >= 2) resume();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      wakeGaze.current = () => {};
      video.removeEventListener('loadeddata', resume);
      video.removeEventListener('seeked', resume);
    };
  }, []);

  function handleGazePointer(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = dollyWrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const now = performance.now();
    const prev = lastPointer.current;
    gazeVelocity.current = prev ? clamp(Math.abs(x - prev.x) / Math.max((now - prev.time) / 1000, 0.008), 0, 5) : 0;
    lastPointer.current = { x, time: now };

    // Match TouchScene exactly: face sits slightly right of centre on wide screens
    const centre = rect.width > 760 ? 0.59 : 0.5;
    gazePos.current = x < centre ? (0.5 * x) / centre : 0.5 + (0.5 * (x - centre)) / (1 - centre);

    const rightReach = rect.width > 760 ? 0.88 : 0.84;
    const rightProgress = clamp((x - centre) / (rightReach - centre), 0, 1);
    const gazePosition = x <= centre ? gazePos.current : 0.5 + 0.5 * Math.pow(rightProgress, 0.8);
    gazeTarget.current = gazeTime(gazePosition);
    wakeGaze.current();
  }

  // 3. Three.js Space Engine Setup
  useEffect(() => {
    const page = pageRef.current;
    const canvasHost = canvasHostRef.current;
    if (!page || !canvasHost) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x252629, 0.038);

    const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 100);
    renderer.setClearColor(0x1a1a1c, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    canvasHost.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xdbe3ff, 2.0));
    const mainLight = new THREE.DirectionalLight(0xfff3e5, 2.6);
    mainLight.position.set(5, 9, 8);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x608eff, 2.4);
    rimLight.position.set(-8, -3, -13);
    scene.add(rimLight);

    // Starfield & Cosmic Dust
    const particleCount = 1200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 26;
      particlePositions[i + 1] = (Math.random() - 0.5) * 22;
      particlePositions[i + 2] = 12 - Math.random() * 36;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xa8cbff,
      size: 0.09,
      transparent: true,
      opacity: 0.8,
    });
    const starfield = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(starfield);

    // Octagonal Airlock Rings (Astronaut Station layers)
    const portalRings: THREE.Group[] = [];
    const ringZPositions = [6.0, 3.8, 1.5, -0.8, -3.2];
    const octagonPoints = createOctagonShape(3.2).getPoints();
    const octagonLineGeometry = new THREE.BufferGeometry().setFromPoints(octagonPoints);

    ringZPositions.forEach((z, idx) => {
      const ringGroup = new THREE.Group();
      ringGroup.position.set(0, 0, z);

      const lineMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? 0x76b9ff : 0xa4caff,
        transparent: true,
        opacity: 0.65 - idx * 0.07,
        linewidth: 2,
      });
      const outerLine = new THREE.LineLoop(octagonLineGeometry, lineMat);
      ringGroup.add(outerLine);

      const strutPoints = [
        new THREE.Vector3(-3.2, 0, 0), new THREE.Vector3(-2.8, 0, 0),
        new THREE.Vector3(3.2, 0, 0), new THREE.Vector3(2.8, 0, 0),
        new THREE.Vector3(0, -3.2, 0), new THREE.Vector3(0, -2.8, 0),
        new THREE.Vector3(0, 3.2, 0), new THREE.Vector3(0, 2.8, 0),
      ];
      const strutGeo = new THREE.BufferGeometry().setFromPoints(strutPoints);
      const strutMat = new THREE.LineBasicMaterial({ color: 0x5a90e0, transparent: true, opacity: 0.5 });
      ringGroup.add(new THREE.LineSegments(strutGeo, strutMat));

      scene.add(ringGroup);
      portalRings.push(ringGroup);
    });

    // 3D Figure Meshes for Shot 2 & Shot 3
    const textureLoader = new THREE.TextureLoader();
    let frontFigureMesh: THREE.Mesh | null = null;
    let sideDiveMesh: THREE.Mesh | null = null;
    let currentScrollP = 0;

    // Shot 2: Front Figure in 3D Tunnel (Seamlessly handed off from 2.5D Dolly)
    textureLoader.load('/images/three-lab/figure-float.png', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const aspect = tex.image.width / tex.image.height;
      const height = 4.2;
      const width = height * aspect;
      const geo = new THREE.PlaneGeometry(width, height);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        opacity: 0,
      });
      frontFigureMesh = new THREE.Mesh(geo, mat);
      frontFigureMesh.position.set(0, -0.4, 0.8);
      scene.add(frontFigureMesh);
      syncVisibility(currentScrollP);
    });

    // Shot 3: Side Dive Figure in Deep Void (The dramatic falling silhouette with extreme foreshortening)
    textureLoader.load('/images/three-lab/figure-dive.png', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const aspect = tex.image.width / tex.image.height;
      const height = 4.8;
      const width = height * aspect;
      const geo = new THREE.PlaneGeometry(width, height);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        opacity: 0,
      });
      sideDiveMesh = new THREE.Mesh(geo, mat);
      sideDiveMesh.position.set(0, -0.5, -10.5);
      sideDiveMesh.rotation.y = Math.PI * 0.3; // Tilted towards the side camera arc
      scene.add(sideDiveMesh);
      syncVisibility(currentScrollP);
    });

    // 3D Floating Wooden Crates (Shot 3)
    const crateMeshes: {
      mesh: THREE.Mesh;
      baseY: number;
      rotSpeed: [number, number, number];
      phase: number;
      geo: THREE.BoxGeometry;
      mat: THREE.MeshStandardMaterial;
      tex: THREE.CanvasTexture;
    }[] = [];

    CRATES.forEach((c, idx) => {
      const tex = createCrateTexture(c.title, c.category, c.number);
      const geo = new THREE.BoxGeometry(...c.size);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.7,
        metalness: 0.18,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...c.pos);
      mesh.rotation.set(0.3 * idx, 0.4 * idx, 0.2 * idx);
      scene.add(mesh);
      crateMeshes.push({
        mesh,
        baseY: c.pos[1],
        rotSpeed: c.rotSpeed,
        phase: idx * 1.4,
        geo,
        mat,
        tex,
      });
    });

    // Synchronizes the 2.5D Dolly Zoom & 3D Objects along the scroll timeline
    function syncVisibility(p: number) {
      currentScrollP = p;

      // 1. 2.5D Dolly Zoom (Scroll 0.0 -> 0.32)
      // Pulls camera back from close-up face to reveal full body seamlessly!
      if (dollyWrapperRef.current && heroDollyRef.current) {
        if (p <= 0.32) {
          heroDollyRef.current.style.opacity = '1';
          heroDollyRef.current.style.pointerEvents = p < 0.1 ? 'auto' : 'none';

          // Fraction of dolly pull-back
          const pullP = p / 0.32; // 0 to 1

          // Scale from 1.0 (close-up eyes) down to 0.24 (full body head size)
          const scale = 1.0 - pullP * 0.76;
          // Shift translateY to keep head anchored while body expands downward
          const translateY = pullP * -12; // vh
          dollyWrapperRef.current.style.transform = `scale(${scale}) translateY(${translateY}vh)`;

          // Face dissolves smoothly into the full body head
          if (gazePortraitRef.current) {
            gazePortraitRef.current.style.opacity = `${1 - pullP * 0.65}`;
          }
          if (shoulderLeftRef.current && shoulderRightRef.current) {
            shoulderLeftRef.current.style.opacity = `${1 - pullP * 0.8}`;
            shoulderRightRef.current.style.opacity = `${1 - pullP * 0.8}`;
          }
          if (fullBodyRef.current) {
            // Full body emerges from below as camera pulls away!
            fullBodyRef.current.style.opacity = `${Math.min(1, pullP * 1.6)}`;
          }
        } else if (p <= 0.42) {
          // Hand-off window from DOM Dolly to 3D WebGL
          const fadeOut = 1 - (p - 0.32) / 0.1;
          heroDollyRef.current.style.opacity = `${fadeOut}`;
          heroDollyRef.current.style.pointerEvents = 'none';
        } else {
          heroDollyRef.current.style.opacity = '0';
          heroDollyRef.current.style.pointerEvents = 'none';
        }
      }

      // 2. Shot 2: 3D Front Figure takes over in tunnel (0.30 -> 0.65)
      if (frontFigureMesh) {
        const mat = frontFigureMesh.material as THREE.MeshBasicMaterial;
        if (p < 0.28) {
          mat.opacity = 0;
        } else if (p < 0.38) {
          mat.opacity = (p - 0.28) / 0.1;
        } else if (p < 0.65) {
          mat.opacity = 1 - (p - 0.48) / 0.17;
        } else {
          mat.opacity = 0;
        }
        frontFigureMesh.visible = mat.opacity > 0.01;
      }

      // 3. Shot 3: Side Dive Figure in Void & Orbit (0.55 -> 1.0)
      if (sideDiveMesh) {
        const mat = sideDiveMesh.material as THREE.MeshBasicMaterial;
        mat.opacity = THREE.MathUtils.clamp((p - 0.55) * 3.5, 0, 1);
        sideDiveMesh.visible = mat.opacity > 0.01;
        sideDiveMesh.rotation.y = Math.PI * 0.3 + (p - 0.65) * 0.8;
      }

      // Crates visibility in Shot 3
      crateMeshes.forEach(({ mesh }) => {
        mesh.visible = p > 0.45;
      });
    }

    const currentPos = new THREE.Vector3();
    const currentLookAt = new THREE.Vector3();

    const updateCameraFromProgress = (p: number) => {
      const nextIndex = CAMERA_PATH.findIndex((pt) => p <= pt.progress);
      const endPt = CAMERA_PATH[nextIndex < 0 ? CAMERA_PATH.length - 1 : Math.max(nextIndex, 1)];
      const startPt = CAMERA_PATH[CAMERA_PATH.indexOf(endPt) - 1];
      const fraction = THREE.MathUtils.clamp(
        (p - startPt.progress) / (endPt.progress - startPt.progress),
        0,
        1,
      );

      currentPos.lerpVectors(startPt.position, endPt.position, fraction);
      currentLookAt.lerpVectors(startPt.lookAt, endPt.lookAt, fraction);
      syncVisibility(p);
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouse.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', handlePointerMove);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    updateCameraFromProgress(0);
    resize();
    window.addEventListener('resize', resize);

    // ScrollTrigger Binding
    gsap.registerPlugin(ScrollTrigger);
    const cameraTravel = { progress: 0 };
    const tween = gsap.to(cameraTravel, {
      progress: 1,
      ease: 'none',
      onUpdate: () => updateCameraFromProgress(cameraTravel.progress),
      scrollTrigger: {
        trigger: page,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.0,
      },
    });

    // Animation Loop
    let frame = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.06;
      mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.06;

      camera.position.copy(currentPos);
      camera.position.x += mouse.current.x * 0.35;
      camera.position.y += -mouse.current.y * 0.25;

      const dynamicLookAt = currentLookAt.clone();
      dynamicLookAt.x += mouse.current.x * 0.45;
      dynamicLookAt.y += -mouse.current.y * 0.3;
      camera.lookAt(dynamicLookAt);

      portalRings.forEach((ring, idx) => {
        ring.rotation.z += (idx % 2 === 0 ? 0.05 : -0.04) * dt;
      });

      if (frontFigureMesh) {
        frontFigureMesh.position.y = -0.4 + Math.sin(now * 0.001) * 0.08;
      }

      if (sideDiveMesh) {
        sideDiveMesh.position.y = -0.5 + Math.cos(now * 0.0012) * 0.14;
        sideDiveMesh.rotation.z = Math.sin(now * 0.0008) * 0.08;
      }

      crateMeshes.forEach(({ mesh, baseY, rotSpeed, phase }) => {
        mesh.rotation.x += rotSpeed[0] * dt;
        mesh.rotation.y += rotSpeed[1] * dt;
        mesh.rotation.z += rotSpeed[2] * dt;
        mesh.position.y = baseY + Math.sin(now * 0.0011 + phase) * 0.15;
      });

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);

    const onVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else {
        lastTime = performance.now();
        frame = window.requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', resize);
      tween.scrollTrigger?.kill();
      tween.kill();

      scene.clear();
      particleGeometry.dispose();
      particleMaterial.dispose();
      octagonLineGeometry.dispose();

      crateMeshes.forEach(({ geo, mat, tex }) => {
        geo.dispose();
        mat.dispose();
        tex.dispose();
      });

      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <main ref={pageRef} className={styles.page}>
      {/* 3D WebGL Canvas Layer */}
      <div ref={canvasHostRef} className={styles.canvasLayer} aria-hidden="true" />

      {/* 2.5D Dolly Zoom Hero Container: Pulls back from real Gaze Portrait to Full Body */}
      <div ref={heroDollyRef} className={styles.heroDolly}>
        <div
          ref={dollyWrapperRef}
          className={styles.dollyWrapper}
          onPointerMove={handleGazePointer}
          onPointerDown={handleGazePointer}
        >
          {/* Head & Gaze Face (Eyes track cursor horizontally) */}
          <canvas
            ref={gazePortraitRef}
            className={styles.gazePortrait}
            role="img"
            aria-label="女孩肖像，眼神跟随光标"
          />

          {/* Shoulder Caps for authentic silhouette */}
          <img
            ref={shoulderLeftRef}
            className={`${styles.shoulderPlate} ${styles.shoulderLeft}`}
            src="/images/touch/shoulder-caps.png"
            alt=""
            aria-hidden="true"
          />
          <img
            ref={shoulderRightRef}
            className={`${styles.shoulderPlate} ${styles.shoulderRight}`}
            src="/images/touch/shoulder-caps.png"
            alt=""
            aria-hidden="true"
          />

          {/* Full-Body Transparent PNG that naturally reveals as camera pulls back! */}
          <img
            ref={fullBodyRef}
            className={styles.fullBodyImage}
            src="/images/three-lab/figure-float.png"
            alt="正面浮空全身像"
            aria-hidden="true"
          />

          {/* Video decoder for gaze matte */}
          <video
            ref={gazeVideoRef}
            className={styles.sourceVideo}
            src="/videos/touch/gaze-matte-v1.mp4"
            preload="auto"
            muted
            playsInline
            disablePictureInPicture
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Header Navigation */}
      <header className={styles.header}>
        <Link href="/">MA QIANYI / Kate</Link>
        <span>2.5D ZERO-G SPACE JOURNEY</span>
        <Link href="/#playground">Works ↗</Link>
      </header>

      {/* Narrative Storytelling Steps */}
      <section className={styles.step}>
        <p>STAGE 01 // THE GAZE</p>
        <h1>A Mind in Motion.</h1>
        <span>Move your cursor horizontally to guide her gaze. Scroll down to pull the camera back.</span>
      </section>

      <section className={styles.step}>
        <p>STAGE 02 // DOLLY OUT &amp; DIVE</p>
        <h1>Floating in Space.</h1>
        <span>The camera pulls back to reveal the full body floating, then plunges through the airlock.</span>
      </section>

      <section className={styles.step}>
        <p>STAGE 03 // LATERAL DESCENT</p>
        <h1>Weightless Orbit.</h1>
        <span>The camera sweeps to the side, orbiting around the falling figure and floating crates.</span>
      </section>

      <div className={styles.scrollCue}>
        <span>Scroll to Travel</span>
        <span aria-hidden="true">↓</span>
      </div>
    </main>
  );
}


