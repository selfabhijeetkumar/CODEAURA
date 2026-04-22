'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';
import type { ExecutionStep } from 'shared/types/execution';
import { VariableOrb } from './actors/VariableOrb';
import { FunctionPortal } from './actors/FunctionPortal';
import { LoopHelix } from './actors/LoopHelix';
import { ConditionalGate } from './actors/ConditionalGate';
import { ArrayRail } from './actors/ArrayRail';
import { ObjectCluster } from './actors/ObjectCluster';
import { RecursionSpiral } from './actors/RecursionSpiral';
import { AsyncPulse } from './actors/AsyncPulse';
import { IOBeam } from './actors/IOBeam';
import { ErrorShatter } from './actors/ErrorShatter';
import { ReturnArrow } from './actors/ReturnArrow';
import { ClassTemple } from './actors/ClassTemple';
import { useSound } from '@/hooks/useSound';

interface ChoreographerProps {
  steps: ExecutionStep[];
  currentStep: number;
  playing: boolean;
}

// Stable position bank so actors don't jump every render
const POSITIONS: [number, number, number][] = [
  [0, 0, 0], [-3, 0, 0], [3, 0, 0], [0, 2.5, 0],
  [-3, 2.5, 0], [3, 2.5, 0], [0, -2, 0], [-4.5, 0, 0],
  [4.5, 0, 0], [0, 4, 0],
];

function getPos(idx: number): [number, number, number] {
  return POSITIONS[idx % POSITIONS.length];
}

// ── Fallback actor for comment_or_noop and unknown types ──────────────────────
// A tiny glowing firefly orb so "invisible" steps are still visually confirmed.
function GenericFirefly({ position, label }: { position: [number, number, number]; label: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.scale.set(0, 0, 0);
    gsap.to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out(2)' });
  }, []);

  useFrame((_, dt) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += dt * 1.2;
      meshRef.current.rotation.x += dt * 0.6;
    }
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(Date.now() * 0.002) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color="#4FE3C1"
          emissive="#4FE3C1"
          emissiveIntensity={1.5}
          wireframe
        />
      </mesh>
      <pointLight color="#4FE3C1" intensity={0.6} distance={3} />
    </group>
  );
}

// ── Closing Brace Actor ────────────────────────────────────────────────────────
function ClosingDoors() {
  const leftRef  = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!leftRef.current || !rightRef.current) return;
    // Start at x=±3 (open), slide to x=±1.5 (closed), then back out
    gsap.fromTo(leftRef.current.position,  { x: -3 }, { x: -1.5, duration: 0.8, ease: 'power2.out',
      onComplete: () => { gsap.to(leftRef.current!.position,  { x: -3, duration: 0.6, ease: 'power2.in', delay: 0.9 }); }
    });
    gsap.fromTo(rightRef.current.position, { x: 3  }, { x: 1.5,  duration: 0.8, ease: 'power2.out',
      onComplete: () => { gsap.to(rightRef.current!.position, { x: 3,  duration: 0.6, ease: 'power2.in', delay: 0.9 }); }
    });
  }, []);

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={leftRef} position={[-3, 0, 0]}>
        <planeGeometry args={[0.15, 3.0]} />
        <meshStandardMaterial color="#4DEEEA" emissive="#4DEEEA" emissiveIntensity={2} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={rightRef} position={[3, 0, 0]}>
        <planeGeometry args={[0.15, 3.0]} />
        <meshStandardMaterial color="#4DEEEA" emissive="#4DEEEA" emissiveIntensity={2} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, 0, 0]} fontSize={0.24} color="white" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#000">
        scope ends
      </Text>
      <pointLight color="#4DEEEA" intensity={1.2} distance={5} />
    </group>
  );
}

// ── Main Choreographer ────────────────────────────────────────────────────────
export function Choreographer({ steps, currentStep, playing }: ChoreographerProps) {
  const sound = useSound();
  const step = steps[currentStep];

  // ── Log ALL step types when the steps array first loads ─────────────────────
  useEffect(() => {
    if (!steps || steps.length === 0) return;

    console.log('[Choreographer] ═══════════════════════════════════════');
    console.log(`[Choreographer] STEPS LOADED — total: ${steps.length}`);
    console.log('[Choreographer] ═══════════════════════════════════════');

    // Count types
    const typeMap: Record<string, number> = {};
    steps.forEach((s) => {
      typeMap[s.type] = (typeMap[s.type] ?? 0) + 1;
    });
    console.log('[Choreographer] Type distribution:', typeMap);

    // List every step
    steps.forEach((s, i) => {
      console.log(
        `[Choreographer]   [${String(i).padStart(2, '0')}] type="${s.type}"  id="${s.id}"  title="${s.title}"`
      );
    });

    console.log('[Choreographer] ═══════════════════════════════════════');
  }, [steps]);

  // ── Log each stepToTween call + actor dispatch ─────────────────────────────
  useEffect(() => {
    if (!step) {
      console.warn(`[Choreographer] stepToTween — NO STEP at index ${currentStep} (steps.length=${steps.length})`);
      return;
    }

    console.log(
      `[Choreographer] ► stepToTween  index=${currentStep}/${steps.length - 1}  type="${step.type}"  title="${step.title}"`
    );
    console.log('[Choreographer]   payload:', step.payload);

    // Dispatch log — only fires ONCE per step change (not every frame)
    console.log(`[Choreographer] render — dispatching actor for type="${step.type}"`);
    console.log(step.type);

    // Sound
    switch (step.type) {
      case 'variable_declaration': sound.variable(); break;
      case 'function_call':        sound.functionCall(); break;
      case 'loop_iteration':       sound.loopTick(); break;
      case 'function_return':      sound.returnPing(); break;
      case 'error':                sound.errorShatter(); break;
      default: break;
    }
  }, [currentStep, step]);   // eslint-disable-line react-hooks/exhaustive-deps

  if (!step) return null;

  const p = getPos(currentStep);
  const payload = step.payload as Record<string, any>;

  // ── Actor dispatch ────────────────────────────────────────────────────────────

  switch (step.type) {
    // ── variable_declaration / variable_assignment ────────────────────────────
    case 'variable_declaration':
    case 'variable_assignment':
      return (
        <VariableOrb
          key={step.id}
          id={step.id}
          name={String(payload.name ?? 'var')}
          value={String(payload.value ?? '')}
          position={p}
          state={step.type === 'variable_declaration' ? 'spawn' : 'mutate'}
        />
      );

    // ── function_call — glowing purple torus ring + camera dolly ─────────────
    case 'function_call':
      return (
        <FunctionPortal
          key={step.id}
          id={step.id}
          name={String(payload.functionName ?? payload.name ?? 'fn')}
          position={p}
          state="open"
        />
      );

    // ── function_return ───────────────────────────────────────────────────────
    case 'function_return':
      return (
        <ReturnArrow
          key={step.id}
          from={p}
          to={[p[0], p[1] + 3, p[2]]}
          value={String(payload.returnValue ?? payload.value ?? '')}
        />
      );

    // ── loop_start — double helix forms ───────────────────────────────────────
    case 'loop_start':
      return (
        <LoopHelix
          key={step.id}
          id={step.id}
          iterations={Number(payload.iterations ?? payload.count ?? 5)}
          currentIteration={0}
          position={p}
          state="forming"
        />
      );

    // ── loop_iteration — helix node travels ───────────────────────────────────
    case 'loop_iteration':
      return (
        <LoopHelix
          key={step.id}
          id={step.id}
          iterations={5}
          currentIteration={Number(payload.iteration ?? payload.i ?? 0)}
          position={p}
          state="active"
        />
      );

    // ── loop_end ──────────────────────────────────────────────────────────────
    case 'loop_end':
      return (
        <LoopHelix
          key={step.id}
          id={step.id}
          iterations={5}
          currentIteration={5}
          position={p}
          state="closing"
        />
      );

    // ── conditional ───────────────────────────────────────────────────────────
    case 'conditional':
      return (
        <ConditionalGate
          key={step.id}
          id={step.id}
          branch={String(payload.branch ?? 'true') as 'true' | 'false'}
          position={p}
        />
      );

    // ── array_operation ───────────────────────────────────────────────────────
    case 'array_operation':
      return (
        <ArrayRail
          key={step.id}
          id={step.id}
          values={Array.isArray(payload.value) ? payload.value : [payload.value]}
          position={p}
          highlightIndex={payload.index as number | undefined}
        />
      );

    // ── object_mutation ───────────────────────────────────────────────────────
    case 'object_mutation':
      return (
        <ObjectCluster
          key={step.id}
          id={step.id}
          keys={Object.keys(payload).filter((k) => k !== 'objectId')}
          values={Object.entries(payload)
            .filter(([k]) => k !== 'objectId')
            .map(([, v]) => String(v))}
          position={p}
          mutatedKey={String(payload.key ?? '')}
        />
      );

    // ── class_instantiation ───────────────────────────────────────────────────
    case 'class_instantiation':
      return (
        <ClassTemple
          key={step.id}
          className={String(payload.className ?? 'Class')}
          instanceCount={1}
          position={p}
        />
      );

    // ── recursion — portal within portal ─────────────────────────────────────
    case 'recursion':
      return (
        <RecursionSpiral
          key={step.id}
          id={step.id}
          depth={Number(payload.depth ?? 1)}
          functionName={String(payload.functionName ?? payload.name ?? 'fn')}
          position={p}
        />
      );

    // ── async_await ───────────────────────────────────────────────────────────
    case 'async_await':
      return (
        <AsyncPulse
          key={step.id}
          id={step.id}
          state={(payload.state as 'pending' | 'resolved' | 'rejected') ?? 'pending'}
          position={p}
        />
      );

    // ── io_operation ──────────────────────────────────────────────────────────
    case 'io_operation':
      return (
        <IOBeam
          key={step.id}
          id={step.id}
          direction={(payload.direction as 'in' | 'out') ?? 'out'}
          value={String(payload.value ?? '')}
          position={p}
        />
      );

    // ── error ─────────────────────────────────────────────────────────────────
    case 'error':
      return (
        <ErrorShatter
          key={step.id}
          message={String(payload.message ?? 'Error')}
          position={p}
        />
      );

    // ── comment_or_noop — detect closing brace, else firefly ───────────────────
    case 'comment_or_noop': {
      const snippet = (step.codeSnippet ?? '').trim();
      const isClosingBrace = snippet === '}' || snippet === '};';
      if (isClosingBrace) {
        return <ClosingDoors key={step.id} />;
      }
      return (
        <GenericFirefly
          key={step.id}
          position={p}
          label={String(payload.note ?? '// …')}
        />
      );
    }

    // ── Unknown type safety net ────────────────────────────────────────────────
    default: {
      const unknownType = (step as any).type;
      console.warn(
        `[Choreographer] ⚠️  UNKNOWN step type "${unknownType}" at index ${currentStep} — rendering fallback firefly.`
      );
      return (
        <GenericFirefly
          key={step.id}
          position={p}
          label={unknownType}
        />
      );
    }
  }
}
