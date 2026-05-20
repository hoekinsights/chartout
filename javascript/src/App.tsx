/**
 * chartout reference implementation for JavaScript / React applications
 *
 * This file is the tutorial. It shows the three steps needed to drive the
 * chartout widget from a React application:
 *
 *   1. createChartoutModel()       — create the state bridge
 *   2. svgToBytes(svg, w, h)       — rasterise your chart at print resolution
 *   3. model.set('active_item', …) — push bytes into the widget
 *      model.set('cart', […])
 *
 * The three tabs demonstrate the three integration patterns (VizLike,
 * CartItem, Cart). Each one is a different combination of model.set calls.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CartItem, ActiveItem } from 'chartout';
import { createChartoutModel } from 'chartout';
import { ChartoutWidget } from './ChartoutWidget';
import { svgToBytes } from './rasterise';
import { ALL_PRODUCTS, CANVAS, MUG, MOUSEPAD, EXAMPLES, type ExampleId } from './examples';

export function App() {
  // ── Step 1: Create the model ───────────────────────────────────────────────
  // createChartoutModel() returns the state bridge between your application
  // and the <ChartoutWidget>. Pass it to the widget, then call model.set()
  // to update what the 3D viewer displays.
  const model = useMemo(() => createChartoutModel({}), []);

  const [tab, setTab] = useState<ExampleId>('vizlike');
  const example = EXAMPLES.find(e => e.id === tab)!;

  // ── Step 2: Rasterise charts at print resolution (once on mount) ───────────
  // The widget requires PNG bytes at the product's exact print dimensions.
  // svgToBytes() uses resvg-wasm: synchronous, no canvas, no CORS issues.
  // This step is expensive (~50–200 ms per chart), so we do it once and cache.
  const rasterised = useRef(new Map<string, Uint8Array>());

  useEffect(() => {
    const scratch = document.createElement('div');
    for (const p of ALL_PRODUCTS) {
      const svg = p.renderFn(scratch, p.w, p.h);
      rasterised.current.set(p.key, svgToBytes(svg, p.w, p.h));
    }
    // Kick off the first example once rasterisation is done.
    updateWidget('vizlike');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step 3: Update the widget when the active example changes ─────────────
  // These are the model.set() calls you'd write in your own application.
  // Each pattern below matches one of the three integration approaches.
  const updateWidget = useCallback((id: ExampleId) => {
    const bytes = rasterised.current;

    if (id === 'vizlike') {
      // VizLike: preview a chart on a product without adding it to the cart.
      model.set('cart', []);
      model.set('active_item', {
        id: CANVAS.id, name: CANVAS.name,
        placements: [{ id: CANVAS.placement, content: bytes.get('canvas')! }],
      } satisfies ActiveItem);

    } else if (id === 'cartitem') {
      // CartItem: add a single product to the cart with its chart.
      model.set('cart', [{
        id: MUG.id, name: MUG.name, quantity: 1,
        placements: [{ id: MUG.placement, content: bytes.get('mug')! }],
      } satisfies CartItem]);
      model.set('active_item', {
        id: MUG.id, name: MUG.name,
        placements: [{ id: MUG.placement, content: bytes.get('mug')! }],
      } satisfies ActiveItem);

    } else {
      // Cart: fill the cart with several products, each with its own chart.
      model.set('cart', [
        { id: CANVAS.id,   name: CANVAS.name,   quantity: 1, placements: [{ id: CANVAS.placement,   content: bytes.get('canvas')!   }] },
        { id: MOUSEPAD.id, name: MOUSEPAD.name, quantity: 2, placements: [{ id: MOUSEPAD.placement, content: bytes.get('mousepad')! }] },
        { id: MUG.id,      name: MUG.name,      quantity: 1, placements: [{ id: MUG.placement,      content: bytes.get('mug')!      }] },
      ] satisfies CartItem[]);
      model.set('active_item', {
        id: CANVAS.id, name: CANVAS.name,
        placements: [{ id: CANVAS.placement, content: bytes.get('canvas')! }],
      } satisfies ActiveItem);
    }
  }, [model]);

  const handleTabClick = (id: ExampleId) => {
    setTab(id);
    updateWidget(id);
  };

  // ── Screen-size previews (re-render on tab switch) ─────────────────────────
  // These run at display size (180 px tall) so the DOM is fast.
  // All containers stay mounted so switching tabs doesn't lose the ref.
  const previewEls = useRef(new Map<string, HTMLDivElement | null>());

  useEffect(() => {
    const PREVIEW_H = 180;
    for (const p of example.previewProducts) {
      const el = previewEls.current.get(p.key);
      if (!el) continue;
      p.renderFn(el, Math.round(PREVIEW_H * p.w / p.h), PREVIEW_H);
    }
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

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
        Three patterns for bringing a chart into the store, pick the one that fits your workflow.
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

      {/* Chart previews — always mounted, toggled with display */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 16 }}>
        {ALL_PRODUCTS.map(p => {
          const visible = example.previewProducts.some(ep => ep.key === p.key);
          return (
            <div key={p.key} style={{ display: visible ? 'flex' : 'none', flexDirection: 'column', gap: 4 }}>
              <div
                ref={el => { previewEls.current.set(p.key, el); }}
                style={{ border: '1px solid #e8e8e8', background: '#fff' }}
              />
              <span style={{ fontSize: 11, color: '#444', fontFamily: 'ui-monospace, monospace' }}>{p.id}</span>
              <span style={{ fontSize: 10, color: '#999' }}>{p.placement} · {p.w}×{p.h}</span>
            </div>
          );
        })}
      </div>

      {/* Chart definition — collapsible, users already know their chart library */}
      <details style={{ marginBottom: 8 }}>
        <summary style={{
          fontSize: 11, color: '#999', cursor: 'pointer', userSelect: 'none',
          listStyle: 'none', display: 'inline-flex', alignItems: 'center',
          gap: 4, marginBottom: 6, letterSpacing: '0.03em',
        }}>
          chart definition
        </summary>
        <pre style={snippetStyle('#f7f7f7', '#555')}>
          {example.snippets.chart}
        </pre>
      </details>

      {/* Store integration — always visible, this is the chartout-specific part */}
      <pre style={{ ...snippetStyle('#f7f7f7', '#333'), marginBottom: 16 }}>
        {example.snippets.store}
      </pre>

      {/* The widget — stays mounted; model state drives what it displays */}
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
