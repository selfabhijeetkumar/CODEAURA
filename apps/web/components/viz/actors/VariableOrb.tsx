import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Text } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface VariableOrbProps {
  id: string;
  name: string;
  value: string;
  position: [number, number, number];
  state: 'spawn' | 'idle' | 'mutate' | 'dispose';
  color?: string;
}

export function VariableOrb({ id, name, value, position, state, color = '#7C5CFF' }: VariableOrbProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Spawn animation
  useEffect(() => {
    if (!groupRef.current) return;
    if (state === 'spawn') {
      groupRef.current.scale.set(0, 0, 0);
      groupRef.current.position.y = position[1] - 2;
      gsap.to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'expo.out' });
      gsap.to(groupRef.current.position, { y: position[1], duration: 1.2, ease: 'expo.out' });
    }
    if (state === 'mutate') {
      gsap.to(groupRef.current.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.25, ease: 'power2.inOut', yoyo: true, repeat: 1 });
      if (lightRef.current) gsap.to(lightRef.current, { intensity: 3.5, duration: 0.25, yoyo: true, repeat: 1 });
    }
    if (state === 'dispose') {
      gsap.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.6, ease: 'power3.in' });
    }
  }, [state, position]);

  // Slow rotation
  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.25;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.55, 3]} />
        <MeshTransmissionMaterial
          thickness={0.8}
          roughness={0.05}
          transmission={1}
          ior={1.45}
          chromaticAberration={0.05}
          color={color}
          backside
          distortion={0.3}
          temporalDistortion={0.1}
        />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={1.2} distance={4} />
      {/* Label: name above */}
      <Text position={[0, 0.85, 0]} fontSize={0.22} color="#EAEAF0" font="/fonts/GeistMono.woff">
        {name}
      </Text>
      {/* Value inside (small) */}
      <Text position={[0, 0, 0]} fontSize={0.16} color="#4FE3C1" font="/fonts/GeistMono.woff" maxWidth={0.9} textAlign="center">
        {String(value).slice(0, 12)}
      </Text>
    </group>
  );
}
