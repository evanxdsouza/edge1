import * as THREE from 'three';

type Options = {
  width: number;
  depth: number;
  base: string;
  trace: string;
  seed: number;
  label?: string;
  sublabel?: string;
};

const PPU = 190;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Paints solder mask, copper pour, vias and silkscreen so the board reads at close range. */
export function pcbTexture(options: Options) {
  const { width, depth, base, trace, seed, label, sublabel } = options;
  const w = Math.round(width * PPU);
  const h = Math.round(depth * PPU);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const rand = rng(seed);

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // copper pour, seen through the mask as a slightly warmer field
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = trace;
  for (let i = 0; i < 26; i++) {
    const bw = 120 + rand() * 460;
    const bh = 90 + rand() * 340;
    ctx.fillRect(rand() * (w - bw), rand() * (h - bh), bw, bh);
  }

  // routed traces
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = trace;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < 320; i++) {
    let x = rand() * w;
    let y = rand() * h;
    ctx.lineWidth = 2 + rand() * 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const legs = 1 + Math.floor(rand() * 3);
    for (let n = 0; n < legs; n++) {
      const len = 30 + rand() * 200;
      const dir = Math.floor(rand() * 4);
      if (dir === 0) x += len;
      else if (dir === 1) x -= len;
      else if (dir === 2) y += len;
      else {
        x += len * 0.7;
        y += len * 0.7;
      }
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // vias and pads
  ctx.globalAlpha = 1;
  for (let i = 0; i < 260; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 3 + rand() * 4;
    ctx.fillStyle = '#c9a24a';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }

  // silkscreen outlines
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = '#eef2ec';
  ctx.lineWidth = 3;
  for (let i = 0; i < 34; i++) {
    const bw = 24 + rand() * 90;
    const bh = 18 + rand() * 60;
    ctx.strokeRect(rand() * (w - bw), rand() * (h - bh), bw, bh);
  }

  ctx.fillStyle = '#eef2ec';
  ctx.font = `600 ${Math.round(h * 0.03)}px ui-sans-serif, system-ui, sans-serif`;
  for (let i = 0; i < 16; i++) {
    ctx.fillText(`R${Math.floor(rand() * 90) + 10}`, rand() * (w - 90), 40 + rand() * (h - 80));
  }

  if (label) {
    ctx.globalAlpha = 1;
    ctx.font = `700 ${Math.round(h * 0.07)}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText(label, w * 0.62, h * 0.86);
  }
  if (sublabel) {
    ctx.font = `500 ${Math.round(h * 0.034)}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText(sublabel, w * 0.62, h * 0.92);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.anisotropy = 8;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(-1 / width, 1 / depth);
  texture.offset.set(0.5, 0.5);
  return texture;
}
