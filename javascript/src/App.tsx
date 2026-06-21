/**
 * chartout reference implementation for JavaScript / React applications
 *
 * This file is the tutorial. It shows the three steps needed to drive the
 * chartout widget from a React application:
 *
 *   1. createChartoutModel()   creates the state bridge
 *   2. svgToBytes(svg)         rasterises your chart at print resolution
 *   3. openWithViz(model, …)   opens the store (or openWithItem / openWithCart)
 *
 * The three tabs demonstrate the three integration patterns (VizLike,
 * CartItem, Cart). Each one is a different combination of model.set calls.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CartItem } from 'chartout';
import { createChartoutModel } from 'chartout';
import { ChartoutWidget } from 'chartout/react';
import { openWithViz, openWithItem, openWithCart, svgToBytes } from 'chartout/store';
import { PRODUCTS, EXAMPLES, type ExampleId, type ProductSpec } from './examples';

/**
 * Compute display dimensions from a printRatio string (e.g. '18:7') so that
 * the long edge equals targetLongEdge pixels.
 */
function ratioSize(spec: ProductSpec, targetLongEdge: number): [number, number] {
  const [rw, rh] = spec.printRatio.split(':').map(Number);
  if (rw >= rh) return [targetLongEdge, Math.round(targetLongEdge * rh / rw)];
  return [Math.round(targetLongEdge * rw / rh), targetLongEdge];
}

export function App() {
  // ── Step 1: Create the model ───────────────────────────────────────────────
  // createChartoutModel() returns the state bridge between your application
  // and the <ChartoutWidget>. Pass it to the widget, then call model.set()
  // to update what the 3D viewer displays.
  const model = useMemo(() => createChartoutModel({}), []);

  const hashId = window.location.hash.slice(1) as ExampleId;
  const [tab, setTab] = useState<ExampleId>(
    EXAMPLES.some(e => e.id === hashId) ? hashId : 'vizlike'
  );
  const example = EXAMPLES.find(e => e.id === tab)!;
  const previewProducts = example.previewKeys.map(k => PRODUCTS.find(p => p.key === k)!);

  // ── Step 2: Render all charts into their preview divs on mount ───────────
  // One render per product. The same SVG element is both displayed and
  // passed to the chartout/store helpers for rasterisation.
  const svgEls = useRef(new Map<string, SVGSVGElement>());

  useEffect(() => {
    const PREVIEW_H = 180;
    for (const p of PRODUCTS) {
      const el = previewEls.current.get(p.key);
      if (!el) continue;
      const [pw, ph] = ratioSize(p, PREVIEW_H);
      svgEls.current.set(p.key, p.renderFn(el, pw, ph));
    }
    updateWidget('vizlike');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step 3: Drive the widget via chartout/store helpers ───────────────────
  const updateWidget = useCallback(async (id: ExampleId) => {
    const canvas   = PRODUCTS.find(p => p.key === 'canvas_10x10')!;
    const mug      = PRODUCTS.find(p => p.key === 'mug_black_11oz')!;
    const mousepad = PRODUCTS.find(p => p.key === 'mousepad_white_8x7')!;

    if (id === 'vizlike') {
      // openWithViz: user picks product inside the store (defaults to mug_black_11oz)
      await openWithViz(model, svgEls.current.get('mug_black_11oz')!, mug.name);

    } else if (id === 'cartitem') {
      // openWithItem: specific product pre-selected
      await openWithItem(model, canvas.id, svgEls.current.get('canvas_10x10')!, canvas.name);

    } else {
      // openWithCart: pre-built cart with multiple products
      const [canvasBytes, mugBytes, mousepadBytes] = await Promise.all([
        svgToBytes(svgEls.current.get('canvas_10x10')!),
        svgToBytes(svgEls.current.get('mug_black_11oz')!),
        svgToBytes(svgEls.current.get('mousepad_white_8x7')!),
      ]);
      openWithCart(model, [
        { id: canvas.id,   name: canvas.name,   quantity: 1, placements: [{ id: canvas.placement,   content: canvasBytes   }] },
        { id: mug.id,      name: mug.name,      quantity: 1, placements: [{ id: mug.placement,      content: mugBytes      }] },
        { id: mousepad.id, name: mousepad.name, quantity: 2, placements: [{ id: mousepad.placement, content: mousepadBytes }] },
      ] satisfies CartItem[]);
    }
  }, [model]);

  const handleTabClick = (id: ExampleId) => {
    setTab(id);
    updateWidget(id);
    window.location.hash = id;
  };

  // Preview containers, always mounted, toggled with display:none.
  // Charts are rendered into these on mount and persist across tab switches.
  const previewEls = useRef(new Map<string, HTMLDivElement | null>());

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{
      maxWidth: 960,
      margin: '48px auto',
      padding: '0 24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#111',
    }}>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        chartout · reference implementation
      </p>
      <p style={{ fontSize: 14, color: '#555', margin: '0 0 24px', lineHeight: 1.6 }}>
        Three ways to turn a chart into a printed product. Pick the pattern that fits your use case.
      </p>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8' }}>
        {EXAMPLES.map(ex => (
          <button
            key={ex.id}
            onClick={() => handleTabClick(ex.id)}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontFamily: 'inherit',
              background: 'none',
              border: 'none',
              borderBottom: tab === ex.id ? '2px solid #1b195d' : '2px solid transparent',
              color: tab === ex.id ? '#1b195d' : '#888',
              fontWeight: tab === ex.id ? 600 : 400,
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: '#555', margin: '12px 0', lineHeight: 1.5 }}>
        {example.description}
      </p>

      {/* Chart previews, always mounted, toggled with display */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 16 }}>
        {PRODUCTS.map(p => {
          const visible = previewProducts.some(pp => pp.key === p.key);
          return (
            <div key={p.key} style={{ display: visible ? 'flex' : 'none', flexDirection: 'column', gap: 4 }}>
              <div
                ref={el => { previewEls.current.set(p.key, el); }}
                style={{ border: '1px solid #e8e8e8', background: '#fff' }}
              />
              <span style={{ fontSize: 11, color: '#444', fontFamily: 'ui-monospace, monospace' }}>{p.id}</span>
              <span style={{ fontSize: 10, color: '#999' }}>{p.placement} · {p.printRatio}</span>
            </div>
          );
        })}
      </div>

      {/* Your chart */}
      <p style={{ fontSize: 11, color: '#999', margin: '0 0 6px', letterSpacing: '0.03em' }}>
        your chart (any library)
      </p>
      <pre style={{ ...snippetStyle('#f7f7f7', '#555'), marginBottom: 8 }}>
        {example.snippets.chart}
      </pre>

      {/* ChartOut integration */}
      <p style={{ fontSize: 11, color: '#999', margin: '0 0 6px', letterSpacing: '0.03em' }}>
        chartout integration
      </p>
      <pre style={{ ...snippetStyle('#f7f7f7', '#333'), marginBottom: 16 }}>
        {example.snippets.store}
      </pre>

      {/* The widget stays mounted; model state drives what it displays */}
      <ChartoutWidget model={model} style={{ width: '100%' }} />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function snippetStyle(bg: string, color: string): React.CSSProperties {
  return {
    margin: '4px 0 0',
    padding: '14px 16px',
    background: bg,
    border: '1px solid #e8e8e8',
    borderRadius: 4,
    fontSize: 12,
    lineHeight: 1.6,
    color,
    overflowX: 'auto',
    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
    whiteSpace: 'pre',
  };
}
