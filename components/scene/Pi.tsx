'use client';

import { useMemo } from 'react';
import {
  BOARD_D,
  BOARD_W,
  GpioHeader,
  HOLES,
  Part,
  Passives,
  mat,
  useBoardMaterial,
  usePcb,
} from './parts';

const TOP = 0.14;

function Usb({ z, blue }: { z: number; blue?: boolean }) {
  return (
    <group position={[3.62, TOP, z]}>
      <Part size={[1.68, 1.55, 1.5]} position={[0, 0.775, 0]} material={mat.steel} />
      <Part
        size={[0.06, 0.42, 1.15]}
        position={[0.86, 0.42, 0]}
        material={blue ? mat.blue : mat.plastic}
      />
      <Part
        size={[0.06, 0.42, 1.15]}
        position={[0.86, 1.12, 0]}
        material={blue ? mat.blue : mat.plastic}
      />
    </group>
  );
}

/** Raspberry Pi 5, modelled to the real 85 x 56 mm outline. */
export default function Pi() {
  const pcb = usePcb(BOARD_W, BOARD_D, HOLES);
  const surface = useBoardMaterial(
    useMemo(
      () => ({
        width: BOARD_W,
        depth: BOARD_D,
        base: '#166046',
        trace: '#37a473',
        seed: 91,
        label: 'Raspberry Pi 5',
        sublabel: 'Model B',
      }),
      []
    )
  );

  return (
    <group>
      <mesh geometry={pcb} material={surface} castShadow receiveShadow />

      <GpioHeader y={TOP} />

      {/* right edge: network, then two stacked USB banks */}
      <group position={[3.62, TOP, -1.55]}>
        <Part size={[1.62, 1.35, 1.6]} position={[0, 0.675, 0]} material={mat.steel} />
        <Part size={[0.06, 0.78, 1.25]} position={[0.83, 0.62, 0]} material={mat.plastic} />
        <Part size={[0.12, 0.1, 0.1]} position={[0.8, 1.16, -0.5]} material={mat.brass} />
      </group>
      <Usb z={0.05} blue />
      <Usb z={1.85} blue />

      {/* front edge: power in, two micro HDMI */}
      <Part size={[0.92, 0.34, 0.78]} position={[-3.13, TOP + 0.17, 2.6]} material={mat.steel} />
      <Part size={[0.74, 0.34, 0.64]} position={[-1.65, TOP + 0.17, 2.62]} material={mat.steel} />
      <Part size={[0.74, 0.34, 0.64]} position={[-0.33, TOP + 0.17, 2.62]} material={mat.steel} />

      {/* PCIe FFC socket, left flap up */}
      <group position={[3.72, TOP, 2.12]}>
        <Part size={[0.58, 0.28, 1.12]} position={[0, 0.14, 0]} material={mat.plastic} />
        <Part size={[0.2, 0.09, 1.12]} position={[-0.18, 0.32, 0]} material={mat.brass} />
      </group>

      {/* camera / display flex sockets */}
      <Part size={[0.36, 0.3, 1.15]} position={[-3.98, TOP + 0.15, -0.62]} material={mat.plastic} />
      <Part size={[0.36, 0.3, 1.15]} position={[-3.98, TOP + 0.15, 0.58]} material={mat.plastic} />

      {/* BCM2712 with its metal lid */}
      <group position={[-0.35, TOP, -0.55]}>
        <Part size={[1.46, 0.13, 1.46]} position={[0, 0.065, 0]} material={mat.chip} />
        <Part size={[1.18, 0.05, 1.18]} position={[0, 0.155, 0]} material={mat.steel} />
      </group>

      <Part size={[1.05, 0.11, 1.25]} position={[1.38, TOP + 0.055, -0.92]} material={mat.chip} />
      <Part size={[0.92, 0.1, 0.92]} position={[1.45, TOP + 0.05, 1.15]} material={mat.chip} />
      <Part size={[0.62, 0.09, 0.62]} position={[-2.62, TOP + 0.045, 1.62]} material={mat.chip} />
      <Part size={[0.5, 0.09, 0.5]} position={[2.55, TOP + 0.045, 1.9]} material={mat.chip} />

      {/* fan header, debug UART, power button, activity LEDs */}
      <Part size={[0.4, 0.26, 0.46]} position={[2.32, TOP + 0.13, -2.5]} material={mat.pale} />
      <Part size={[0.82, 0.24, 0.28]} position={[3.42, TOP + 0.12, -2.55]} material={mat.plastic} />
      <mesh position={[-4.02, TOP + 0.1, 2.28]} material={mat.rasp} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.2, 16]} />
      </mesh>
      <Part size={[0.16, 0.07, 0.1]} position={[-4.0, TOP + 0.035, 1.75]} material={mat.rasp} />
      <Part size={[0.16, 0.07, 0.1]} position={[-4.0, TOP + 0.035, 1.5]} material={mat.pale} />

      {/* microSD cage, underside */}
      <Part size={[1.5, 0.14, 1.32]} position={[-3.85, -0.07, 0.2]} material={mat.steel} />

      <Passives seed={11} y={TOP} />
    </group>
  );
}
