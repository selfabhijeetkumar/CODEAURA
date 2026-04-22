'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function OceanBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    const isMobile = window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000814, 1);
    el.appendChild(renderer.domElement);

    // ── Scene / Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000814, 0.035);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 2, 14);
    camera.lookAt(0, 0, 0);

    // ── Mouse parallax ────────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    // ── Group for parallax ────────────────────────────────────────────────────
    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    // ── 1. PARTICLES ─────────────────────────────────────────────────────────
    const PARTICLE_COUNT = isMobile ? 80 : 200;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      sizes[i] = Math.random() * 0.06 + 0.02;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00b4d8,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    sceneGroup.add(particles);

    // ── 2. WIREFRAME ICOSAHEDRONS ─────────────────────────────────────────────
    const icoData = [
      { size: 1.8, x: -6, y: 1, z: -5, opac: 0.12 },
      { size: 1.2, x: 5, y: -1, z: -3, opac: 0.10 },
      { size: 2.4, x: 0, y: -3, z: -8, opac: 0.08 },
      { size: 0.9, x: 7, y: 2, z: -2, opac: 0.15 },
      { size: 1.5, x: -8, y: -2, z: -6, opac: 0.09 },
    ];
    const icos: THREE.Mesh[] = [];
    icoData.forEach(d => {
      const geo = new THREE.IcosahedronGeometry(d.size, 1);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x0077b6,
        wireframe: true,
        transparent: true,
        opacity: d.opac,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(d.x, d.y, d.z);
      sceneGroup.add(mesh);
      icos.push(mesh);
    });

    // ── 3. TORUS RINGS ────────────────────────────────────────────────────────
    const torusData = [
      { r: 3.0, tube: 0.02, x: -4, y: 0, z: -4, rx: 1.2, rz: 0.4 },
      { r: 2.2, tube: 0.02, x: 4, y: 1, z: -6, rx: 0.6, rz: 1.0 },
      { r: 4.0, tube: 0.02, x: 0, y: -2, z: -10, rx: 0.3, rz: 0.7 },
    ];
    const tori: THREE.Mesh[] = [];
    torusData.forEach(d => {
      const geo = new THREE.TorusGeometry(d.r, d.tube, 8, 40);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x0077b6,
        transparent: true,
        opacity: 0.06,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(d.x, d.y, d.z);
      mesh.rotation.x = d.rx;
      mesh.rotation.z = d.rz;
      sceneGroup.add(mesh);
      tori.push(mesh);
    });

    // ── 4. WAVE GRID FLOOR ────────────────────────────────────────────────────
    const gridGeo = new THREE.PlaneGeometry(60, 60, 50, 50);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x0077b6,
      wireframe: true,
      transparent: true,
      opacity: 0.05,
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -5;
    sceneGroup.add(grid);

    // Cache original y positions for wave
    const gridPos = gridGeo.attributes.position as THREE.BufferAttribute;
    const origY = new Float32Array(gridPos.count);
    for (let i = 0; i < gridPos.count; i++) origY[i] = gridPos.getY(i);

    // ── 5. LIGHT RAYS ─────────────────────────────────────────────────────────
    const rayData = [
      { x: -3, opac: 0.04 },
      { x: 0, opac: 0.03 },
      { x: 4, opac: 0.05 },
    ];
    const rays: { mesh: THREE.Mesh; speed: number; dir: number }[] = [];
    rayData.forEach((d, i) => {
      const geo = new THREE.PlaneGeometry(0.3, 18);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x48cae4,
        transparent: true,
        opacity: d.opac,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(d.x, 3, -4 - i * 2);
      sceneGroup.add(mesh);
      rays.push({ mesh, speed: 0.003 + i * 0.001, dir: i % 2 === 0 ? 1 : -1 });
    });

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Visibility pause ──────────────────────────────────────────────────────
    let paused = false;
    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    // ── Animation loop ────────────────────────────────────────────────────────
    let rafId: number;
    let t = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (paused) return;
      t += 0.01;

      // Mouse parallax lerp
      target.x += (mouse.x * 0.02 - target.x) * 0.05;
      target.y += (-mouse.y * 0.02 - target.y) * 0.05;
      sceneGroup.position.x = target.x;
      sceneGroup.position.y = target.y;

      // Particles float upward
      const pos = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let y = pos.getY(i) + 0.01;
        if (y > 10) y = -10;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;

      // Rotate icos
      icos.forEach((ico, i) => {
        ico.rotation.x += 0.003 + i * 0.001;
        ico.rotation.y += 0.004 + i * 0.0005;
        ico.rotation.z += 0.002;
      });

      // Rotate tori
      tori.forEach((tor, i) => {
        tor.rotation.y += 0.005 + i * 0.002;
        tor.rotation.x += 0.002;
      });

      // Wave grid
      const gp = gridGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < gp.count; i++) {
        const x = gp.getX(i);
        const z = gp.getZ(i);
        gp.setY(i, origY[i] + Math.sin(t + x * 0.3 + z * 0.3) * 0.3);
      }
      gp.needsUpdate = true;

      // Light rays drift
      rays.forEach(r => {
        r.mesh.position.x += r.speed * r.dir;
        if (Math.abs(r.mesh.position.x) > 8) r.dir *= -1;
      });

      renderer.render(scene, camera);
    };
    animate();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#000814',
      }}
    />
  );
}
