'use client';

import { useRef, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface ArrayRailProps {
  id: string;
  values: unknown[];
  position: [number, number, number];
  highlightIndex?: number;
}

const TEAL = '#00FFD1';
const BOX_SIZE = 0.8;
const SPACING = 1.2;

export function ArrayRail({ id, values, position, highlightIndex }: ArrayRailProps) {
  // Cap at first 6 elements so the array doesn't overflow screen
  const items = values.slice(0, 6);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const edgeRefs = useRef<(THREE.LineSegments | null)[]>([]);

  // ── GSAP stagger spawn on mount ───────────────────────────────────────────────
  useEffect(() => {
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.scale.set(0, 0, 0);
      gsap.to(mesh.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.45,
        delay: i * 0.15,
        ease: 'back.out(1.5)',
      });
    });
  }, [id]);

  // ── Highlight pulse ───────────────────────────────────────────────────────────
  useEffect(() => {
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      if (i === highlightIndex) {
        gsap.to(mesh.scale, {
          x: 1.2, y: 1.2, z: 1.2,
          duration: 0.25,
          ease: 'expo.out',
          yoyo: true,
          repeat: 1,
        });
      }
    });
  }, [highlightIndex]);

  return (
    <group position={[0, 0, 0]}>
      {items.map((val, i) => {
        const x = (i - (items.length - 1) / 2) * SPACING;
        const isHighlighted = i === highlightIndex;
        return (
          <group key={i} position={[x, 0, 0]}>
            {/* Solid glassmorphic box */}
            <mesh ref={(el) => { meshRefs.current[i] = el; }}>
              <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
              <meshStandardMaterial
                color={isHighlighted ? TEAL : '#0B1A1A'}
                emissive={TEAL}
                emissiveIntensity={isHighlighted ? 2.2 : 0.35}
                metalness={0.7}
                roughness={0.15}
                transparent
                opacity={0.82}
              />
            </mesh>

            {/* Glowing wireframe edges */}
            <lineSegments ref={(el) => { edgeRefs.current[i] = el; }}>
              <edgesGeometry args={[new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE)]} />
              <lineBasicMaterial color={TEAL} linewidth={1} />
            </lineSegments>

            {/* Value label inside box */}
            <Text
              position={[0, 0, BOX_SIZE / 2 + 0.01]}
              fontSize={0.2}
              color={isHighlighted ? '#000' : TEAL}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.008}
              outlineColor="#000"
            >
              {String(val).slice(0, 6)}
            </Text>

            {/* Index label below */}
            <Text
              position={[0, -BOX_SIZE / 2 - 0.28, 0]}
              fontSize={0.16}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              [{i}]
            </Text>
          </group>
        );
      })}

      {/* Point light so material emissive glows correctly */}
      <pointLight color={TEAL} intensity={0.8} distance={5} />
    </group>
  );
}
