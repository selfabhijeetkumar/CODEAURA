'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface IOBeamProps {
  id: string;
  direction: 'in' | 'out';
  value: string;
  position: [number, number, number];
}

const OUTPUT_COLOR = '#00BFFF';
const INPUT_COLOR  = '#FF8C00';
const RING_RADII   = [0.6, 0.9, 1.2] as const;

export function IOBeam({ id, direction, value }: IOBeamProps) {
  const isOutput = direction === 'out';
  const color    = isOutput ? OUTPUT_COLOR : INPUT_COLOR;
  const label    = isOutput ? 'OUTPUT' : 'INPUT';

  const ringRefs  = useRef<(THREE.Mesh | null)[]>([]);
  const diskRef   = useRef<THREE.Mesh>(null);

  // ── Disk spawn ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!diskRef.current) return;
    diskRef.current.scale.set(0, 0, 0);
    gsap.to(diskRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(2)' });
  }, [id]);

  // ── Sonar ring pulse loop ─────────────────────────────────────────────────────
  useEffect(() => {
    const currentRings = ringRefs.current;
    currentRings.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      // stagger start so rings don't all pulse together
      gsap.to(mat, {
        opacity: 0,
        duration: 1.5,
        delay: i * 0.4,
        ease: 'power2.out',
        repeat: -1,
        onRepeat: () => { mat.opacity = 0.8; },
      });
      gsap.to(mesh.scale, {
        x: 1.6, y: 1.6, z: 1.6,
        duration: 1.5,
        delay: i * 0.4,
        ease: 'power2.out',
        repeat: -1,
        onRepeat: () => { mesh.scale.set(1, 1, 1); },
      });
    });
    return () => {
      // cleanup gsap on unmount
      currentRings.forEach((mesh) => mesh && gsap.killTweensOf(mesh));
    };
  }, [id]);

  // ── Slow disk rotation ────────────────────────────────────────────────────────
  useFrame((_, dt) => {
    if (diskRef.current) diskRef.current.rotation.z += dt * 0.6;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ── Hexagonal prism disk ───────────────────────────────────────────────── */}
      <mesh ref={diskRef}>
        {/* CylinderGeometry: radTop, radBot, height, radialSegments=6 */}
        <cylinderGeometry args={[0.4, 0.4, 0.1, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.5}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>

      {/* ── Sonar pulse rings ──────────────────────────────────────────────────── */}
      {RING_RADII.map((r, i) => (
        <mesh
          key={i}
          ref={(el) => { ringRefs.current[i] = el; }}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[r, 0.025, 8, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* ── Code text above ────────────────────────────────────────────────────── */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.22}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000"
        maxWidth={4}
      >
        {value || (isOutput ? 'printf(...)' : 'scanf(...)')}
      </Text>

      {/* ── OUTPUT / INPUT badge ───────────────────────────────────────────────── */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#000"
      >
        {label}
      </Text>

      {/* ── Point light ───────────────────────────────────────────────────────── */}
      <pointLight color={color} intensity={1.5} distance={5} />
    </group>
  );
}
