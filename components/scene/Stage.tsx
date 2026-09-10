'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { watchSections } from '@/lib/stage';
import Callouts, { notes, type CalloutNodes } from './Callouts';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

export default function Stage() {
  const nodes = useRef<CalloutNodes>({
    root: null,
    paths: notes.map(() => null),
    dots: notes.map(() => null),
    labels: notes.map(() => null),
  });

  const [ready, setReady] = useState(false);

  useEffect(() => watchSections(), []);

  return (
    <div className="stage" data-ready={ready} aria-hidden>
      <Scene nodes={nodes} onReady={() => setReady(true)} />
      <Callouts nodes={nodes} />
    </div>
  );
}
