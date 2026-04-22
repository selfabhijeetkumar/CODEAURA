import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface ClassTempleProps {
  className: string;
  instanceCount: number;
  position: [number, number, number];
}

export function ClassTemple({ className, instanceCount, position }: ClassTempleProps) {
  const pillarRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!pillarRef.current) return;
    pillarRef.current.scale.y = 0;
    gsap.to(pillarRef.current.scale, { y: 1, duration: 1.4, ease: 'expo.out' });
  }, []);

  // Instance orbs in orbit
  const orbs = Array.from({ length: Math.min(instanceCount, 5) });

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      if (i === 0) return; // skip pillar group
      const t = clock.getElapsedTime() + (i * Math.PI * 2) / orbs.length;
      child.position.x = Math.cos(t * 0.6) * 2.5;
      child.position.z = Math.sin(t * 0.6) * 2.5;
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Central pillar */}
      <mesh ref={pillarRef}>
        <cylinderGeometry args={[0.25, 0.35, 4, 8]} />
        <meshStandardMaterial color="#C084FC" emissive="#C084FC" emissiveIntensity={0.8} metalness={0.8} roughness={0.2} />
      </mesh>
      <Text position={[0, 2.5, 0]} fontSize={0.26} color="#EAEAF0">{className}</Text>

      {/* Instance orbs */}
      {orbs.map((_, i) => (
        <mesh key={i} position={[Math.cos(i * 1.26) * 2.5, 0.5, Math.sin(i * 1.26) * 2.5]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#A78BFA" emissive="#A78BFA" emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  );
}
