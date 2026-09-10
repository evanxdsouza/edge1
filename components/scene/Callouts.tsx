'use client';

export type Note = {
  at: [number, number, number];
  layer: 'pi' | 'hat' | 'sink';
  title: string;
  body: string;
};

export const notes: Note[] = [
  {
    at: [0.9, 0.9, 0],
    layer: 'sink',
    title: 'Hailo-8',
    body: '26 TOPS of NPU',
  },
  {
    at: [-2.6, 0.16, -1.4],
    layer: 'hat',
    title: 'AI HAT+',
    body: 'Bolts onto the 40-pin header',
  },
  {
    at: [3.72, 0.4, 2.12],
    layer: 'pi',
    title: 'PCIe Gen 3 ×1',
    body: 'One ribbon, model to silicon',
  },
  {
    at: [1.38, 0.25, -0.92],
    layer: 'pi',
    title: '8 or 16 GB',
    body: 'LPDDR4X, your whole weight budget',
  },
  {
    at: [-0.35, 0.3, -0.55],
    layer: 'pi',
    title: 'BCM2712',
    body: '4× Cortex-A76 @ 2.4 GHz',
  },
  {
    at: [-3.13, 0.35, 2.6],
    layer: 'pi',
    title: '5 V in',
    body: 'No API key. No monthly bill.',
  },
];

export type CalloutNodes = {
  root: HTMLDivElement | null;
  paths: (SVGPathElement | null)[];
  dots: (SVGCircleElement | null)[];
  labels: (HTMLDivElement | null)[];
};

export default function Callouts({ nodes }: { nodes: React.RefObject<CalloutNodes> }) {
  return (
    <div
      className="callouts"
      aria-hidden
      ref={(el) => {
        nodes.current.root = el;
      }}
    >
      <svg className="leaders">
        {notes.map((note, i) => (
          <g key={note.title}>
            <path
              ref={(el) => {
                nodes.current.paths[i] = el;
              }}
            />
            <circle
              r="3.5"
              ref={(el) => {
                nodes.current.dots[i] = el;
              }}
            />
          </g>
        ))}
      </svg>

      {notes.map((note, i) => (
        <div
          key={note.title}
          className="callout"
          ref={(el) => {
            nodes.current.labels[i] = el;
          }}
        >
          <b>{note.title}</b>
          {note.body}
        </div>
      ))}
    </div>
  );
}
