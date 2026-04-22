'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
// @ts-ignore — postprocessing type declarations may be missing in this version
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { GridFloor } from './effects/GridFloor';
import { ParticleField } from './effects/ParticleField';
import { Choreographer } from './Choreographer';
import { useExecutionStore } from '@/store/executionStore';
import { usePlaybackStore } from '@/store/playbackStore';

function SceneInner() {
  const { script, currentIndex } = useExecutionStore();
  const { isPlaying } = usePlaybackStore();
  const { camera } = useThree();

  // Set initial camera
  useEffect(() => {
    if (script?.scenePlan?.camera?.initialPosition) {
      const [x, y, z] = script.scenePlan.camera.initialPosition;
      camera.position.set(x, y, z);
    } else {
      camera.position.set(0, 2, 8);
    }
    camera.lookAt(0, 0, 0);
  }, [script, camera]);

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 18, 60]} />

      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[6, 10, 8]} intensity={0.8} color="#B9A8FF" />
      <pointLight position={[-6, 4, -4]} intensity={1.2} color="#4FE3C1" distance={20} />

      <Environment preset="night" />
      <GridFloor />
      <ParticleField count={200} />

      {script && (
        <Choreographer
          key={`step-${currentIndex}`}
          steps={script.steps}
          currentStep={currentIndex}
          playing={isPlaying}
        />
      )}

      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.18} luminanceSmoothing={0.4} mipmapBlur />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0006, 0.0006)}
          blendFunction={BlendFunction.NORMAL}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
      </EffectComposer>

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={6}
        maxDistance={28}
        autoRotate={!isPlaying}
        autoRotateSpeed={0.25}
      />
    </>
  );
}

export function VizScene() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 2)]}
      camera={{ position: [0, 2, 12], fov: 42, near: 0.1, far: 200 }}
      style={{ background: '#000000' }}
    >
      <SceneInner />
    </Canvas>
  );
}
