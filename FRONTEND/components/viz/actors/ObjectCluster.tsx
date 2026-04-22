import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface ObjectClusterProps {
  id: string;
  keys: string[];
  values: string[];
  position: [number, number, number];
  mutatedKey?: string;
}

export function ObjectCluster({ id, keys, values, position, mutatedKey }: ObjectClusterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRefs = useRef<THREE.Mesh[]>([]);

  const nodePositions = keys.map((_, i) => {
    const angle = (i / Math.max(keys.length, 1)) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * 2.2, Math.sin(angle) * 1.2, 0);
  });

  useEffect(() => {
    if (!mutatedKey) return;
    const idx = keys.indexOf(mutatedKey);
    if (idx >= 0 && nodeRefs.current[idx]) {
      gsap.to(nodeRefs.current[idx].scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.3, yoyo: true, repeat: 1 });
    }
  }, [mutatedKey, keys]);

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.z += dt * 0.05;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Center node */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#E879F9" emissive="#E879F9" emissiveIntensity={1.5} />
      </mesh>

      {/* Property nodes */}
      {keys.map((key, i) => (
        <group key={key} position={[nodePositions[i].x, nodePositions[i].y, 0]}>
          <mesh ref={(el) => { if (el) nodeRefs.current[i] = el; }}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial
              color={key === mutatedKey ? '#FFB547' : '#1C2030'}
              emissive={key === mutatedKey ? '#FFB547' : '#5A5F75'}
              emissiveIntensity={key === mutatedKey ? 2 : 0.3}
            />
          </mesh>
          <Text position={[0, 0.45, 0]} fontSize={0.16} color="#9BA0B3">{key}</Text>
          <Text position={[0, -0.35, 0]} fontSize={0.14} color="#4FE3C1">{values[i]?.slice(0, 8)}</Text>
          {/* Edge line */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([0, 0, 0, -nodePositions[i].x, -nodePositions[i].y, 0]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#2E3244" />
          </line>
        </group>
      ))}
    </group>
  );
}
