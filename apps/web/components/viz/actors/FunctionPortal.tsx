import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface FunctionPortalProps {
  id: string;
  name: string;
  position: [number, number, number];
  state: 'open' | 'active' | 'close';
}

export function FunctionPortal({ id, name, position, state }: FunctionPortalProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (!groupRef.current || !ringRef.current) return;

    if (state === 'open') {
      // Ring scales up
      gsap.from(ringRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'expo.out' });
      // Camera dollies toward portal
      gsap.to(camera.position, {
        x: position[0],
        y: position[1],
        z: position[2] + 4,
        duration: 1.6,
        ease: 'expo.inOut',
      });
    }
    if (state === 'close') {
      gsap.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: 'power3.in' });
    }
  }, [state, position, camera]);

  useFrame((_, dt) => {
    if (ringRef.current) ringRef.current.rotation.z += dt * 0.3;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.2, 0.04, 32, 128]} />
        <meshStandardMaterial color="#7C5CFF" emissive="#7C5CFF" emissiveIntensity={2.5} />
      </mesh>
      {/* Inner disc */}
      <mesh>
        <circleGeometry args={[1.18, 64]} />
        <meshBasicMaterial color="#05060A" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Label */}
      <Text position={[0, 1.6, 0]} fontSize={0.28} color="#EAEAF0">
        {name}()
      </Text>
    </group>
  );
}
