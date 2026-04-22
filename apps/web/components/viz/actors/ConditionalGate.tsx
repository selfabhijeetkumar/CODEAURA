import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface ConditionalGateProps {
  id: string;
  branch: 'true' | 'false';
  position: [number, number, number];
}

export function ConditionalGate({ id, branch, position }: ConditionalGateProps) {
  const trueDoorRef = useRef<THREE.Mesh>(null);
  const falseDoorRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const chosen = branch === 'true' ? trueDoorRef.current : falseDoorRef.current;
    if (!chosen) return;
    gsap.to(chosen.rotation, { y: -Math.PI / 2, duration: 0.9, ease: 'expo.out' });
  }, [branch]);

  return (
    <group position={position}>
      {/* True door — left, plasma */}
      <mesh ref={trueDoorRef} position={[-1.4, 0, 0]}>
        <planeGeometry args={[1.2, 2.4]} />
        <meshStandardMaterial
          color="#4FE3C1" emissive="#4FE3C1" emissiveIntensity={0.8}
          transparent opacity={0.8} side={THREE.DoubleSide}
        />
      </mesh>
      {/* False door — right, ember */}
      <mesh ref={falseDoorRef} position={[1.4, 0, 0]}>
        <planeGeometry args={[1.2, 2.4]} />
        <meshStandardMaterial
          color="#FF6B4A" emissive="#FF6B4A" emissiveIntensity={0.8}
          transparent opacity={0.8} side={THREE.DoubleSide}
        />
      </mesh>
      {/* Center frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 2.6, 0.06]} />
        <meshStandardMaterial color="#1C2030" />
      </mesh>
    </group>
  );
}
