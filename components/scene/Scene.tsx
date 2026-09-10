'use client';

import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import Board from './Board';
import type { CalloutNodes } from './Callouts';

export default function Scene({
  nodes,
  onReady,
}: {
  nodes: React.RefObject<CalloutNodes>;
  onReady: () => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 26, near: 0.5, far: 90, position: [0, 8.6, 17.6] }}
      onCreated={onReady}
    >
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[7, 11, 6]}
        intensity={3.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
      />
      <directionalLight position={[-6, 5, -9]} intensity={1.1} color="#bfe6d4" />
      <pointLight position={[-9, 4.5, -7]} intensity={42} color="#c7185b" />
      <pointLight position={[8, 2, 5]} intensity={20} color="#e6c07a" />

      <Board nodes={nodes} />

      <ContactShadows
        position={[0, -1.75, 0]}
        opacity={0.3}
        scale={26}
        blur={3.2}
        far={9}
        resolution={512}
        color="#04100c"
      />

      <Environment resolution={128}>
        <Lightformer intensity={4} position={[0, 6, 5]} scale={[12, 5, 1]} />
        <Lightformer intensity={2} position={[-7, 2, 3]} scale={[4, 9, 1]} color="#bfe3d2" />
        <Lightformer intensity={1.9} position={[7, 1, -3]} scale={[5, 6, 1]} color="#ffd9a0" />
        <Lightformer intensity={0.9} position={[0, -4, 0]} scale={[12, 6, 1]} color="#0f2b22" />
      </Environment>
    </Canvas>
  );
}
