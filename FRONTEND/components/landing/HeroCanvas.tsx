'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Scene + Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 8);

    // Dark chrome code-cube (LineSegments)
    const geo = new THREE.BoxGeometry(3, 3, 3);
    const edges = new THREE.EdgesGeometry(geo);
    const mat = new THREE.LineBasicMaterial({ color: 0x7C5CFF, transparent: true, opacity: 0.5 });
    const cube = new THREE.LineSegments(edges, mat);
    scene.add(cube);

    // Inner wireframe (smaller, rotates opposite)
    const innerEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.8, 1.8, 1.8));
    const innerMat = new THREE.LineBasicMaterial({ color: 0x4FE3C1, transparent: true, opacity: 0.25 });
    const innerCube = new THREE.LineSegments(innerEdges, innerMat);
    scene.add(innerCube);

    // Particles
    const particleCount = window.innerWidth < 768 ? 80 : 200;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x5A5F75, size: 0.04, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Animate
    let animId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      cube.rotation.x = t * 0.08;
      cube.rotation.y = t * 0.12;
      innerCube.rotation.x = -t * 0.15;
      innerCube.rotation.y = -t * 0.1;
      particles.rotation.y = t * 0.02;
      // Pulsing opacity
      mat.opacity = 0.3 + 0.2 * Math.sin(t * 0.8);
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 -z-10"
      style={{ background: 'radial-gradient(ellipse at center, #05060A 0%, #000000 70%)' }}
    />
  );
}
