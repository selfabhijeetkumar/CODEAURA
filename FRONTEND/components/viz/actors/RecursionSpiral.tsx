'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface RecursionSpiralProps {
  id: string;
  depth: number;
  functionName: string;
  position: [number, number, number];
}

// Five nested torus rings, plasma colour, GSAP stagger on mount
const RING_SCALES  = [1.2, 0.9, 0.65, 0.45, 0.3];
const PLASMA_COLOR = '#7C5CFF';

export function RecursionSpiral({ id, depth, functionName, position }: RecursionSpiralProps) {
  const groupRef  = useRef<THREE.Group>(null);
  // One ref per ring so we can stagger them individually
  const ringRefs  = useRef<(THREE.Mesh | null)[]>([]);

  // ── GSAP staggered spawn: rings scale 0 → full size, 200 ms apart ────────────
  useEffect(() => {
    ringRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.scale.set(0, 0, 0);
      gsap.to(mesh.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.55,
        delay:    i * 0.2,
        ease:     'expo.out',
      });
    });
  }, [id]);  // re-run if actor is replaced (new step)

  // ── Slow compound rotation so the nested rings feel alive ────────────────────
  useFrame((_, dt) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += dt * 0.35;
    // Each child ring gets a subtle independent tilt drift
    ringRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.rotation.x += dt * 0.12 * (i % 2 === 0 ? 1 : -1);
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {RING_SCALES.map((scale, i) => {
        const yRotOffset = (i * Math.PI) / RING_SCALES.length;
        return (
          <mesh
            key={i}
            ref={(el) => { ringRefs.current[i] = el; }}
            rotation={[Math.PI / 2, yRotOffset, 0]}
          >
            <torusGeometry args={[scale, 0.04, 16, 80]} />
            <meshStandardMaterial
              color={PLASMA_COLOR}
              emissive={PLASMA_COLOR}
              emissiveIntensity={2.5}
              transparent
              opacity={1 - i * 0.1}
            />
          </mesh>
        );
      })}

      {/* Central glow point */}
      <pointLight color={PLASMA_COLOR} intensity={1.2} distance={4} />

      {/* Depth label */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.22}
        color="#C4B5FD"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#1a0040"
      >
        {`depth: ${depth}`}
      </Text>

      {/* Function name label above */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.18}
        color="#A78BFA"
        anchorX="center"
        anchorY="middle"
      >
        {functionName}({depth})
      </Text>
    </group>
  );
}
