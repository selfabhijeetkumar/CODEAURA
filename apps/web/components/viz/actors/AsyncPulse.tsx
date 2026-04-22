import { useRef, useEffect} from 'react';
import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface AsyncPulseProps {
  id: string;
  state: 'pending' | 'resolved' | 'rejected';
  position: [number, number, number];
}

const colors = { pending: '#FFB547', resolved: '#4FE3C1', rejected: '#FF6B4A' };

export function AsyncPulse({ id, state, position }: AsyncPulseProps) {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const c = colors[state];
    [ring1Ref, ring2Ref, ring3Ref].forEach((ref, i) => {
      if (!ref.current) return;
      const delay = i * 0.3;
      // Reset
      gsap.set(ref.current.scale, { x: 0.5, y: 0.5, z: 0.5 });
      (ref.current.material as THREE.MeshStandardMaterial).color.set(c);
      (ref.current.material as THREE.MeshStandardMaterial).emissive.set(c);
      // Ripple
      gsap.to(ref.current.scale, { x: 2.5, y: 2.5, z: 2.5, duration: 1.2, delay, ease: 'power2.out', repeat: -1 });
      gsap.to((ref.current.material as THREE.MeshStandardMaterial), { opacity: 0, duration: 1.2, delay, ease: 'power2.out', repeat: -1 });
    });
  }, [state]);

  return (
    <group position={position}>
      {[ring1Ref, ring2Ref, ring3Ref].map((ref, i) => (
        <mesh key={i} ref={ref}>
          <ringGeometry args={[0.8 + i * 0.1, 0.85 + i * 0.1, 64]} />
          <meshStandardMaterial
            color={colors[state]}
            emissive={colors[state]}
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
