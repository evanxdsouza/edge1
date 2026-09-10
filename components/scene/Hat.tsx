'use client';

import { useMemo } from 'react';
import {
  BOARD_D,
  HAT_W,
  HOLES,
  Heatsink,
  Part,
  Passives,
  mat,
  useBoardMaterial,
  usePcb,
} from './parts';

export const HAT_X = -1;

/** AI HAT+ carrier - 65 x 56 mm, same mounting pattern as every HAT. */
export function HatBoard() {
  const holes = HOLES.map(([x, z]) => [x - HAT_X, z] as [number, number]);
  const pcb = usePcb(HAT_W, BOARD_D, holes);
  const surface = useBoardMaterial(
    useMemo(
      () => ({
        width: HAT_W,
        depth: BOARD_D,
        base: '#123f2f',
        trace: '#2b8663',
        seed: 43,
        label: 'AI HAT+',
        sublabel: '26 TOPS Hailo-8',
      }),
      []
    )
  );

  return (
    <group position={[HAT_X, 0, 0]}>
      <mesh geometry={pcb} material={surface} castShadow receiveShadow />

      <Part size={[5.16, 0.55, 0.52]} position={[0, -0.275, -2.45]} material={mat.plastic} />
      <Part size={[0.42, 0.34, 2.3]} position={[2.68, 0.31, 0.32]} material={mat.plastic} />
      <Part size={[0.6, 0.26, 1.1]} position={[2.6, -0.13, 2.05]} material={mat.plastic} />

      <Passives count={54} seed={5} width={HAT_W} depth={BOARD_D} y={0.14} />
    </group>
  );
}

/** M.2 2242 module carrying the Hailo-8. */
export function HailoModule() {
  return (
    <group position={[HAT_X + 0.35, 0.14, 0.32]}>
      <Part size={[4.2, 0.11, 2.2]} position={[0, 0.055, 0]} material={mat.pcbHat} />
      <Part size={[1.35, 0.14, 1.35]} position={[-0.5, 0.18, 0]} material={mat.chip} />
      <Part size={[0.6, 0.09, 0.9]} position={[1.35, 0.155, 0.4]} material={mat.chip} />
      <Passives count={34} seed={29} width={4} depth={2} y={0.11} />
    </group>
  );
}

export function ThermalPlate() {
  return (
    <group position={[HAT_X + 0.05, 0.48, 0.32]}>
      <Heatsink />
    </group>
  );
}
