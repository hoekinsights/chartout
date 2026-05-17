import { useEffect, useMemo, useRef } from 'react';
import { createModel } from './model';
import { ChartoutWidget } from './ChartoutWidget';

// ---------------------------------------------------------------------------
// Epitrochoid spirograph — overlapping parametric curves, instant render
// ---------------------------------------------------------------------------

function drawMathArt(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width;
  const H = canvas.height;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#fbfdfe');
  bg.addColorStop(1, '#e3f3f6');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2;
  const radius = Math.min(W, H) * 0.38;

  const layers: [number, number, number, string, number, number][] = [
    [1.0, 1/7,  0.85, '#1b195d', 2.5, 0.7],
    [1.0, 1/5,  0.70, '#ab2149', 2.0, 0.55],
    [1.0, 1/9,  0.95, '#177777', 1.8, 0.45],
    [1.0, 1/11, 0.60, '#5f5e8d', 1.5, 0.4],
    [1.0, 1/13, 0.80, '#c4637f', 1.3, 0.35],
  ];

  for (const [Rf, rf, df, color, lw, alpha] of layers) {
    const R = radius * Rf;
    const r = radius * rf;
    const d = radius * df;
    const period = Math.PI * 2 * (1 / rf);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.globalAlpha = alpha;
    ctx.lineJoin = 'round';

    for (let i = 0; i <= 2000; i++) {
      const t = (i / 2000) * period;
      const x = cx + (R + r) * Math.cos(t) - d * Math.cos(((R + r) / r) * t);
      const y = cy + (R + r) * Math.sin(t) - d * Math.sin(((R + r) / r) * t);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

async function canvasToUint8Array(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      blob!.arrayBuffer().then(buf => resolve(new Uint8Array(buf)));
    }, 'image/png');
  });
}

const C = {
  bg:       '#eff8fa',
  bgCard:   '#ffffff',
  primary:  '#1b195d',
  secondary:'#ab2149',
  outline:  '#d6d6d7',
  text:     '#32306d',
  textMuted:'#84848a',
};

export function App() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const drawnRef   = useRef(false);

  const model = useMemo(() => createModel({
    cart: [{
      id: 'canvas_10x10',
      name: 'Canvas (10″x10″)',
      quantity: 1,
      price: 7.49,
      placements: [],
    }],
    active_item: {
      id: 'canvas_10x10',
      name: 'Canvas (10″x10″)',
      placements: [],
    },
  }), []);

  useEffect(() => {
    if (drawnRef.current) return;
    drawnRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    drawMathArt(canvas);

    const offscreen = document.createElement('canvas');
    offscreen.width = 3900;
    offscreen.height = 3900;
    drawMathArt(offscreen);
    canvasToUint8Array(offscreen).then(png => {
      model.set('init_viz', { 0: png });
      model.set('active_item', {
        id: 'canvas_10x10',
        name: 'Canvas (10″x10″)',
        placements: [{ id: 'default', content: png }],
      });
    });
  }, [model]);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Source Sans 3', sans-serif" }}>

      {/* Header */}
      <header style={{ background: C.bgCard, borderBottom: `1px solid ${C.outline}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 20, color: C.primary }}>
            chartout
          </span>
          <span style={{ fontSize: 13, color: C.textMuted }}>Spirograph Series</span>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 700, color: C.primary, marginBottom: 8, lineHeight: 1.2 }}>
          Epitrochoid No. 4
        </h1>
        <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 32, fontStyle: 'italic' }}>
          Five overlapping parametric curves with prime gear ratios — paths that never exactly repeat.
        </p>

        {/* Chart */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.outline}`, overflow: 'hidden', marginBottom: 20 }}>
          <canvas
            ref={canvasRef}
            width={836}
            height={480}
            style={{ width: '100%', display: 'block' }}
          />
        </div>

        {/* Store — inline, full width, natural height */}
        <div style={{ marginTop: 8 }}>
          <ChartoutWidget model={model} />
        </div>

      </main>
    </div>
  );
}
