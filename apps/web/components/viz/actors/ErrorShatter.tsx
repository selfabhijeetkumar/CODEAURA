import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface ErrorShatterProps {
  message: string;
  position: [number, number, number];
}

export function ErrorShatter({ message, position }: ErrorShatterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shardRefs = useRef<THREE.Mesh[]>([]);
  const { camera } = useThree();

  const SHARD_COUNT = 18;

  useEffect(() => {
    if (!groupRef.current) return;

    // Camera shake
    const origPos = camera.position.clone();
    const shakeTl = gsap.timeline();
    for (let i = 0; i < 6; i++) {
      shakeTl.to(camera.position, {
        x: origPos.x + (Math.random() - 0.5) * 0.4,
        y: origPos.y + (Math.random() - 0.5) * 0.4,
        duration: 0.06, ease: 'none',
      });
    }
    shakeTl.to(camera.position, { x: origPos.x, y: origPos.y, duration: 0.2, ease: 'power2.out' });

    // Shards explode outward
    shardRefs.current.forEach((shard) => {
      if (!shard) return;
      const dx = (Math.random() - 0.5) * 8;
      const dy = (Math.random() - 0.5) * 6 + 2;
      const dz = (Math.random() - 0.5) * 4;
      gsap.from(shard.position, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'expo.out' });
      gsap.to(shard.position, { x: dx, y: dy, z: dz, duration: 1.2, ease: 'power3.out' });
      gsap.to(shard.rotation, { x: Math.random() * 10, y: Math.random() * 10, duration: 1.2 });
      gsap.to((shard.material as THREE.MeshStandardMaterial), { opacity: 0, duration: 1.2, delay: 0.6 });
    });
  }, [camera]);

  return (
    <group ref={groupRef} position={position}>
      {/* Shards */}
      {Array.from({ length: SHARD_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) shardRefs.current[i] = el; }}
          position={[0, 0, 0]}
        >
          <tetrahedronGeometry args={[0.3 + Math.random() * 0.3, 0]} />
          <meshStandardMaterial
            color="#FF6B4A"
            emissive="#FF2D55"
            emissiveIntensity={3}
            transparent
            opacity={1}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
      ))}
      {/* Point light flash */}
      <pointLight color="#FF2D55" intensity={8} distance={12} decay={2} />
    </group>
  );
}
