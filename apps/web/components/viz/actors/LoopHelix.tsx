import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface LoopHelixProps {
  id: string;
  iterations: number;
  currentIteration: number;
  position: [number, number, number];
  state: 'forming' | 'active' | 'closing';
}

export function LoopHelix({ id, iterations, currentIteration, position, state }: LoopHelixProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRefs = useRef<THREE.Mesh[]>([]);

  const helixPoints = useMemo(() => {
    return Array.from({ length: Math.min(iterations, 5) }, (_, i) => {
      const t = i / Math.max(iterations - 1, 1);
      return new THREE.Vector3(Math.cos(t * Math.PI * 4) * 1.2, i * 1.2 - 2, Math.sin(t * Math.PI * 4) * 1.2);
    });
  }, [iterations]);

  useEffect(() => {
    if (!groupRef.current) return;
    if (state === 'forming') {
      groupRef.current.scale.set(1, 0, 1);
      gsap.to(groupRef.current.scale, { y: 1, duration: 0.8, ease: 'expo.out' });
    }
    if (state === 'closing') {
      gsap.to(groupRef.current.scale, { y: 0, duration: 0.6, ease: 'power3.in' });
    }
  }, [state]);

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.3;
  });

  const clampedIter = Math.min(iterations, 5);

  return (
    <group ref={groupRef} position={position}>
      {helixPoints.map((pt, i) => (
        <mesh
          key={i}
          position={[pt.x, pt.y, pt.z]}
          ref={(el) => { if (el) nodeRefs.current[i] = el; }}
        >
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial
            color={i === currentIteration && currentIteration < clampedIter ? '#4FE3C1' : '#5A5F75'}
            emissive={i === currentIteration ? '#4FE3C1' : '#000000'}
            emissiveIntensity={i === currentIteration ? 2 : 0}
          />
        </mesh>
      ))}
      {/* Helix connecting line */}
      {helixPoints.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(helixPoints.flatMap(p => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#7C5CFF" linewidth={2} />
        </line>
      )}
    </group>
  );
}
