'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { anim } from '@/lib/stage';
import { mat } from './parts';

const SEGMENTS = 44;
const WIDTH = 0.8;

/** The PCIe flex that ties the HAT to the Pi. It stretches as the stack pulls apart. */
export default function Ribbon() {
  const mesh = useRef<THREE.Mesh>(null);
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(Array.from({ length: 5 }, () => new THREE.Vector3())),
    []
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = (SEGMENTS + 1) * 2;
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));

    const index: number[] = [];
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i <= SEGMENTS; i++) {
      uv.setXY(i * 2, i / SEGMENTS, 0);
      uv.setXY(i * 2 + 1, i / SEGMENTS, 1);
      if (i < SEGMENTS) {
        const a = i * 2;
        index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    geo.setIndex(index);
    return geo;
  }, []);

  useFrame(() => {
    const top = anim.gap;
    const p = curve.points;
    p[0].set(3.5, 0.32, 2.12);
    p[1].set(4.35, 0.32 + (top - 0.32) * 0.36, 2.14);
    p[2].set(4.6, top - 0.24, 2.1);
    p[3].set(3.4, top - 0.03, 2.06);
    p[4].set(1.85, top - 0.05, 2.04);

    const position = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i <= SEGMENTS; i++) {
      const point = curve.getPoint(i / SEGMENTS);
      position.setXYZ(i * 2, point.x, point.y, point.z - WIDTH / 2);
      position.setXYZ(i * 2 + 1, point.x, point.y, point.z + WIDTH / 2);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  });

  return <mesh ref={mesh} geometry={geometry} material={mat.ribbon} castShadow />;
}
