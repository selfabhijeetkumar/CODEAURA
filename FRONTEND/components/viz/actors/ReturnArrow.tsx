import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface ReturnArrowProps {
  from: [number, number, number];
  to: [number, number, number];
  value?: string;
}

export function ReturnArrow({ from, to, value }: ReturnArrowProps) {
  const arrowRef = useRef<THREE.ArrowHelper | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    gsap.from(groupRef.current, { visible: false, duration: 0 });
    gsap.to((arrowRef.current?.line?.material as THREE.LineBasicMaterial), {
      opacity: 0, duration: 0.8, delay: 0.9,
    });
  }, [from, to]);

  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]).normalize();
  const len = new THREE.Vector3(...from).distanceTo(new THREE.Vector3(...to));

  return (
    <group ref={groupRef} position={from}>
      <arrowHelper
        ref={arrowRef as any}
        args={[dir, new THREE.Vector3(0, 0, 0), len, 0xFFB547, 0.35, 0.2]}
      />
    </group>
  );
}
