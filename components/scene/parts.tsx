'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { pcbTexture } from '@/lib/pcb-texture';

export const BOARD_W = 8.5;
export const BOARD_D = 5.6;
export const HAT_W = 6.5;
export const HOLES: [number, number][] = [
  [-3.9, -2.45],
  [1.9, -2.45],
  [-3.9, 2.45],
  [1.9, 2.45],
];

export const mat = {
  pcb: new THREE.MeshStandardMaterial({ color: '#1a6b47', roughness: 0.52, metalness: 0.14 }),
  pcbHat: new THREE.MeshStandardMaterial({ color: '#123a2c', roughness: 0.45, metalness: 0.2 }),
  silk: new THREE.MeshStandardMaterial({ color: '#e8ece6', roughness: 0.8 }),
  pale: new THREE.MeshStandardMaterial({ color: '#b9c0b4', roughness: 0.72 }),
  steel: new THREE.MeshStandardMaterial({
    color: '#a9b1b8',
    roughness: 0.33,
    metalness: 0.78,
    envMapIntensity: 1.7,
  }),
  alu: new THREE.MeshStandardMaterial({
    color: '#89929c',
    roughness: 0.44,
    metalness: 0.8,
    envMapIntensity: 0.85,
  }),
  plastic: new THREE.MeshStandardMaterial({ color: '#0d1013', roughness: 0.62, metalness: 0.05 }),
  chip: new THREE.MeshStandardMaterial({
    color: '#0d1014',
    roughness: 0.3,
    metalness: 0.42,
    envMapIntensity: 1.4,
  }),
  brass: new THREE.MeshStandardMaterial({
    color: '#e0ac48',
    roughness: 0.33,
    metalness: 1,
    envMapIntensity: 1.8,
  }),
  blue: new THREE.MeshStandardMaterial({ color: '#1c56a6', roughness: 0.55 }),
  rasp: new THREE.MeshStandardMaterial({ color: '#c7185b', roughness: 0.4 }),
  ribbon: new THREE.MeshStandardMaterial({
    color: '#c8a271',
    roughness: 0.72,
    metalness: 0.05,
    side: THREE.DoubleSide,
  }),
};

function rounded(w: number, d: number, r: number) {
  const shape = new THREE.Shape();
  const x = w / 2;
  const y = d / 2;
  shape.moveTo(-x + r, -y);
  shape.lineTo(x - r, -y);
  shape.absarc(x - r, -y + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x, y - r);
  shape.absarc(x - r, y - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-x + r, y);
  shape.absarc(-x + r, y - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-x, -y + r);
  shape.absarc(-x + r, -y + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}

export function useBoardMaterial(opts: {
  width: number;
  depth: number;
  base: string;
  trace: string;
  seed: number;
  label: string;
  sublabel: string;
}) {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: pcbTexture(opts),
        roughness: 0.4,
        metalness: 0.24,
        envMapIntensity: 1.15,
      }),
    [opts]
  );
}

export function usePcb(w: number, d: number, holes: [number, number][], thickness = 0.14) {
  return useMemo(() => {
    const shape = rounded(w, d, 0.32);
    for (const [hx, hz] of holes) {
      const hole = new THREE.Path();
      hole.absarc(hx, -hz, 0.175, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 1,
      curveSegments: 14,
    });
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, [w, d, holes, thickness]);
}

type BoxProps = {
  size: [number, number, number];
  position: [number, number, number];
  material: THREE.Material;
  rotation?: [number, number, number];
};

export function Part({ size, position, material, rotation }: BoxProps) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      material={material}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
    </mesh>
  );
}

/** 2x20 gold pins in a black shroud, 2.54 mm pitch. */
export function GpioHeader({ y = 0.14 }: { y?: number }) {
  const pins = useMemo(() => {
    const m = new THREE.Matrix4();
    const list: THREE.Matrix4[] = [];
    for (let col = 0; col < 20; col++) {
      for (let row = 0; row < 2; row++) {
        m.makeTranslation(-3.42 + col * 0.254, 0, -2.577 + row * 0.254);
        list.push(m.clone());
      }
    }
    return list;
  }, []);

  return (
    <group position={[0, y, 0]}>
      <Part size={[5.16, 0.25, 0.52]} position={[-1, 0.125, -2.45]} material={mat.plastic} />
      <Pins matrices={pins} height={0.62} width={0.064} />
    </group>
  );
}

function Pins({
  matrices,
  height,
  width,
}: {
  matrices: THREE.Matrix4[];
  height: number;
  width: number;
}) {
  const ref = useMemo(() => {
    const geo = new THREE.BoxGeometry(width, height, width);
    geo.translate(0, height / 2, 0);
    const inst = new THREE.InstancedMesh(geo, mat.brass, matrices.length);
    matrices.forEach((m, i) => inst.setMatrixAt(i, m));
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = true;
    return inst;
  }, [matrices, height, width]);

  return <primitive object={ref} />;
}

/** Scattered 0402/0603 passives - the thing that makes a board read as a board. */
export function Passives({
  count = 130,
  seed = 7,
  width = BOARD_W,
  depth = BOARD_D,
  y = 0.14,
}: {
  count?: number;
  seed?: number;
  width?: number;
  depth?: number;
  y?: number;
}) {
  const mesh = useMemo(() => {
    let s = seed;
    const rand = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };

    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    const material = new THREE.MeshStandardMaterial({
      color: '#161a1e',
      roughness: 0.55,
      metalness: 0.2,
    });
    const inst = new THREE.InstancedMesh(geo, material, count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      const long = 0.07 + rand() * 0.09;
      const short = 0.038 + rand() * 0.02;
      const flip = rand() > 0.5;
      pos.set((rand() - 0.5) * (width - 0.9), y, (rand() - 0.5) * (depth - 0.9));
      scale.set(flip ? long : short, 0.035 + rand() * 0.02, flip ? short : long);
      q.identity();
      m.compose(pos, q, scale);
      inst.setMatrixAt(i, m);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = true;
    return inst;
  }, [count, seed, width, depth, y]);

  return <primitive object={mesh} />;
}

/** Finned heatsink over the Hailo module. */
export function Heatsink() {
  const fins = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.062, 0.62, 2.5);
    geo.translate(0, 0.31, 0);
    const inst = new THREE.InstancedMesh(geo, mat.alu, 16);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 16; i++) {
      m.makeTranslation(-1.4 + i * 0.187, 0.16, 0);
      inst.setMatrixAt(i, m);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = true;
    return inst;
  }, []);

  return (
    <group>
      <Part size={[3.1, 0.16, 2.6]} position={[0, 0.08, 0]} material={mat.alu} />
      <primitive object={fins} />
    </group>
  );
}
