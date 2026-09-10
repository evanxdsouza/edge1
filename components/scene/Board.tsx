'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { anim, readStage } from '@/lib/stage';
import { poseAt } from '@/lib/keyframes';
import Pi from './Pi';
import Ribbon from './Ribbon';
import { HatBoard, HailoModule, ThermalPlate } from './Hat';
import { HOLES, mat } from './parts';
import { notes, type CalloutNodes } from './Callouts';

const GAP = 1.35;
const ROW = 54;

type Slot = { i: number; x: number; y: number; label: number };

export default function Board({ nodes }: { nodes: React.RefObject<CalloutNodes> }) {
  const root = useRef<THREE.Group>(null);
  const hat = useRef<THREE.Group>(null);
  const hailo = useRef<THREE.Group>(null);
  const sink = useRef<THREE.Group>(null);
  const markers = useRef<THREE.Object3D[]>([]);

  const { camera } = useThree();
  const smoothed = useRef(0);
  const look = useRef(new THREE.Vector3());
  const pointer = useRef(new THREE.Vector2());
  const probe = useRef(new THREE.Vector3());
  const slots = useRef<Slot[]>(notes.map((_, i) => ({ i, x: 0, y: 0, label: 0 })));

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function drawCallouts(opacity: number, width: number, height: number) {
    const dom = nodes.current;
    if (!dom.root) return;

    dom.root.style.opacity = opacity.toFixed(3);
    if (opacity < 0.01) return;

    const column = width * 0.76;
    const list = slots.current;

    for (const slot of list) {
      const marker = markers.current[slot.i];
      if (!marker) continue;
      probe.current.setFromMatrixPosition(marker.matrixWorld).project(camera);
      slot.x = (probe.current.x * 0.5 + 0.5) * width;
      slot.y = (-probe.current.y * 0.5 + 0.5) * height;
      slot.label = slot.y;
    }

    // stack the labels so none of them land on top of another
    const order = [...list].sort((a, b) => a.y - b.y);
    let floor = height * 0.08;
    for (const slot of order) {
      slot.label = Math.max(slot.y, floor);
      floor = slot.label + ROW;
    }

    for (const slot of list) {
      const path = dom.paths[slot.i];
      const dot = dom.dots[slot.i];
      const label = dom.labels[slot.i];
      if (!path || !dot || !label) continue;

      const elbow = slot.x + 34;
      path.setAttribute('d', `M${slot.x} ${slot.y}H${elbow}L${column - 12} ${slot.label}`);
      dot.setAttribute('cx', String(slot.x));
      dot.setAttribute('cy', String(slot.y));
      label.style.transform = `translate(${column}px, ${slot.label}px) translateY(-50%)`;
    }
  }

  useFrame((state, delta) => {
    const k = 1 - Math.exp(-5.5 * Math.min(delta, 0.05));
    smoothed.current += (readStage() - smoothed.current) * k;

    const pose = poseAt(smoothed.current);
    const t = state.clock.elapsedTime;
    const idle = reduced ? 0 : 1;

    if (!reduced) pointer.current.lerp(state.pointer, 0.06);

    // narrow screens get one framing: model centred horizontally and parked below the copy
    const narrow = state.size.width < 780;
    const drop = narrow ? 1.5 : 0;
    const ox = narrow ? pose.target[0] : 0;
    const oy = narrow ? pose.target[1] - drop : 0;

    camera.position.set(
      pose.camera[0] - ox + pointer.current.x * 0.7,
      pose.camera[1] - oy - pointer.current.y * 0.5,
      pose.camera[2]
    );
    look.current.set(pose.target[0] - ox, pose.target[1] - oy, pose.target[2]);
    camera.lookAt(look.current);

    anim.explode = pose.explode;
    anim.gap = GAP + pose.explode * 2.2;

    if (root.current) {
      const fit = Math.min(1, state.size.width / state.size.height / 1.5);
      root.current.rotation.y = pose.spin + idle * Math.sin(t * 0.24) * 0.05;
      root.current.rotation.x = pose.tilt;
      root.current.rotation.z = idle * Math.sin(t * 0.19) * 0.018;
      root.current.position.y = -pose.explode * 1.15 + idle * Math.sin(t * 0.62) * 0.07;
      root.current.scale.setScalar(pose.zoom * (0.42 + 0.58 * fit));
    }

    if (hat.current) hat.current.position.y = anim.gap;
    if (hailo.current) hailo.current.position.y = pose.explode * 0.75;
    if (sink.current) sink.current.position.y = pose.explode * 1.75;

    drawCallouts(pose.callouts, state.size.width, state.size.height);
  });

  return (
    <group ref={root} dispose={null}>
      <Pi />
      <Ribbon />

      {HOLES.map(([x, z]) => (
        <group key={`${x}:${z}`} position={[x, 0.14, z]}>
          <mesh material={mat.brass} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 1.21, 18]} />
          </mesh>
          <mesh position={[0, 0.66, 0]} material={mat.steel} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.12, 18]} />
          </mesh>
        </group>
      ))}

      <group ref={hat} position={[0, GAP, 0]}>
        <HatBoard />
        <group ref={hailo}>
          <HailoModule />
        </group>
        <group ref={sink}>
          <ThermalPlate />
        </group>
        {notes.map((note, i) =>
          note.layer === 'pi' ? null : (
            <object3D
              key={note.title}
              position={note.at}
              ref={(el) => {
                if (el) markers.current[i] = el;
              }}
            />
          )
        )}
      </group>

      {notes.map((note, i) =>
        note.layer === 'pi' ? (
          <object3D
            key={note.title}
            position={note.at}
            ref={(el) => {
              if (el) markers.current[i] = el;
            }}
          />
        ) : null
      )}
    </group>
  );
}
