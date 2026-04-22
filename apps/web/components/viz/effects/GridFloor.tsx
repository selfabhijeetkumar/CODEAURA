import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function GridFloor() {
  const ref = useRef<THREE.GridHelper>(null);
  const mat = new THREE.LineBasicMaterial({ color: 0x1C2030, transparent: true, opacity: 0.4 });

  return (
    <gridHelper
      ref={ref}
      args={[40, 40, '#1C2030', '#1C2030']}
      position={[0, -3, 0]}
    />
  );
}
