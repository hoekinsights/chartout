import { useEffect, useMemo, useRef, useState } from 'react';
import * as Plot from '@observablehq/plot';
import type { CartItem, ActiveItem } from 'chartout';
import { createModel } from './model';
import { ChartoutWidget } from './ChartoutWidget';

// ---------------------------------------------------------------------------
// Old Faithful geyser dataset (272 observations).
// eruptions = duration in minutes, waiting = time to next eruption in minutes.
// ---------------------------------------------------------------------------

const FAITHFUL: { eruptions: number; waiting: number }[] = [
  {eruptions:3.600,waiting:79},{eruptions:1.800,waiting:54},{eruptions:3.333,waiting:74},
  {eruptions:2.283,waiting:62},{eruptions:4.533,waiting:85},{eruptions:2.883,waiting:55},
  {eruptions:4.700,waiting:88},{eruptions:3.600,waiting:85},{eruptions:1.950,waiting:51},
  {eruptions:4.350,waiting:85},{eruptions:1.833,waiting:54},{eruptions:3.917,waiting:84},
  {eruptions:4.200,waiting:78},{eruptions:1.750,waiting:47},{eruptions:4.700,waiting:83},
  {eruptions:2.167,waiting:52},{eruptions:1.750,waiting:62},{eruptions:4.800,waiting:84},
  {eruptions:1.600,waiting:52},{eruptions:4.250,waiting:79},{eruptions:1.800,waiting:51},
  {eruptions:1.750,waiting:47},{eruptions:3.450,waiting:78},{eruptions:3.067,waiting:69},
  {eruptions:4.533,waiting:74},{eruptions:3.600,waiting:83},{eruptions:1.967,waiting:55},
  {eruptions:4.083,waiting:76},{eruptions:3.850,waiting:78},{eruptions:4.433,waiting:79},
  {eruptions:4.300,waiting:73},{eruptions:4.467,waiting:77},{eruptions:3.367,waiting:66},
  {eruptions:4.033,waiting:80},{eruptions:3.833,waiting:74},{eruptions:2.017,waiting:52},
  {eruptions:1.867,waiting:48},{eruptions:4.833,waiting:80},{eruptions:1.833,waiting:59},
  {eruptions:4.783,waiting:90},{eruptions:4.350,waiting:80},{eruptions:1.883,waiting:58},
  {eruptions:4.567,waiting:84},{eruptions:1.750,waiting:58},{eruptions:4.533,waiting:73},
  {eruptions:3.317,waiting:83},{eruptions:3.833,waiting:64},{eruptions:2.100,waiting:53},
  {eruptions:4.633,waiting:82},{eruptions:2.000,waiting:59},{eruptions:4.800,waiting:75},
  {eruptions:4.716,waiting:90},{eruptions:1.833,waiting:54},{eruptions:4.833,waiting:80},
  {eruptions:1.733,waiting:54},{eruptions:4.883,waiting:83},{eruptions:3.717,waiting:71},
  {eruptions:1.667,waiting:64},{eruptions:4.567,waiting:77},{eruptions:4.317,waiting:81},
  {eruptions:2.233,waiting:59},{eruptions:4.500,waiting:84},{eruptions:1.750,waiting:48},
  {eruptions:4.800,waiting:82},{eruptions:1.817,waiting:60},{eruptions:4.400,waiting:92},
  {eruptions:4.167,waiting:78},{eruptions:4.700,waiting:78},{eruptions:2.067,waiting:65},
  {eruptions:4.700,waiting:73},{eruptions:4.033,waiting:82},{eruptions:1.967,waiting:56},
  {eruptions:4.500,waiting:79},{eruptions:4.000,waiting:71},{eruptions:1.983,waiting:62},
  {eruptions:5.067,waiting:76},{eruptions:2.017,waiting:60},{eruptions:4.567,waiting:78},
  {eruptions:3.883,waiting:76},{eruptions:3.600,waiting:83},{eruptions:4.133,waiting:75},
  {eruptions:4.333,waiting:82},{eruptions:4.100,waiting:70},{eruptions:2.633,waiting:65},
  {eruptions:4.067,waiting:73},{eruptions:4.933,waiting:88},{eruptions:3.950,waiting:76},
  {eruptions:4.517,waiting:80},{eruptions:2.167,waiting:48},{eruptions:4.000,waiting:86},
  {eruptions:2.200,waiting:60},{eruptions:4.333,waiting:90},{eruptions:1.867,waiting:50},
  {eruptions:4.817,waiting:78},{eruptions:1.833,waiting:63},{eruptions:4.300,waiting:72},
  {eruptions:4.667,waiting:84},{eruptions:3.750,waiting:75},{eruptions:1.867,waiting:51},
  {eruptions:4.900,waiting:82},{eruptions:2.483,waiting:62},{eruptions:4.367,waiting:88},
  {eruptions:2.100,waiting:49},{eruptions:4.500,waiting:83},{eruptions:4.050,waiting:81},
  {eruptions:1.867,waiting:47},{eruptions:4.700,waiting:84},{eruptions:1.783,waiting:52},
  {eruptions:4.850,waiting:86},{eruptions:3.683,waiting:81},{eruptions:4.733,waiting:75},
  {eruptions:2.300,waiting:59},{eruptions:4.900,waiting:89},{eruptions:4.417,waiting:79},
  {eruptions:1.700,waiting:59},{eruptions:4.633,waiting:81},{eruptions:2.317,waiting:50},
  {eruptions:4.600,waiting:85},{eruptions:1.817,waiting:59},{eruptions:4.417,waiting:87},
  {eruptions:2.617,waiting:53},{eruptions:4.067,waiting:69},{eruptions:4.250,waiting:77},
  {eruptions:1.967,waiting:56},{eruptions:4.600,waiting:88},{eruptions:3.767,waiting:81},
  {eruptions:1.917,waiting:45},{eruptions:4.500,waiting:82},{eruptions:2.267,waiting:55},
  {eruptions:4.650,waiting:90},{eruptions:1.867,waiting:45},{eruptions:4.167,waiting:83},
  {eruptions:2.800,waiting:56},{eruptions:4.333,waiting:89},{eruptions:1.833,waiting:46},
  {eruptions:4.383,waiting:82},{eruptions:1.883,waiting:51},{eruptions:4.933,waiting:86},
  {eruptions:2.033,waiting:53},{eruptions:3.733,waiting:79},{eruptions:4.233,waiting:81},
  {eruptions:2.233,waiting:60},{eruptions:4.533,waiting:82},{eruptions:4.817,waiting:77},
  {eruptions:4.333,waiting:76},{eruptions:1.983,waiting:59},{eruptions:4.633,waiting:80},
  {eruptions:2.017,waiting:49},{eruptions:5.100,waiting:96},{eruptions:1.800,waiting:53},
  {eruptions:5.033,waiting:77},{eruptions:4.000,waiting:77},{eruptions:2.400,waiting:65},
  {eruptions:4.600,waiting:81},{eruptions:3.567,waiting:71},{eruptions:4.000,waiting:70},
  {eruptions:4.500,waiting:81},{eruptions:4.083,waiting:93},{eruptions:1.800,waiting:53},
  {eruptions:3.967,waiting:89},{eruptions:2.200,waiting:45},{eruptions:4.150,waiting:86},
  {eruptions:2.000,waiting:58},{eruptions:3.833,waiting:78},{eruptions:3.500,waiting:66},
  {eruptions:4.583,waiting:76},{eruptions:2.367,waiting:63},{eruptions:5.000,waiting:88},
  {eruptions:1.933,waiting:52},{eruptions:4.617,waiting:93},{eruptions:1.917,waiting:49},
  {eruptions:2.083,waiting:57},{eruptions:4.583,waiting:77},{eruptions:3.333,waiting:68},
  {eruptions:4.167,waiting:81},{eruptions:4.333,waiting:81},{eruptions:4.500,waiting:73},
  {eruptions:2.417,waiting:50},{eruptions:4.000,waiting:85},{eruptions:4.167,waiting:74},
  {eruptions:1.883,waiting:55},{eruptions:4.583,waiting:77},{eruptions:4.250,waiting:83},
  {eruptions:3.767,waiting:83},{eruptions:2.033,waiting:51},{eruptions:4.433,waiting:78},
  {eruptions:4.083,waiting:84},{eruptions:1.833,waiting:46},{eruptions:4.417,waiting:83},
  {eruptions:2.183,waiting:55},{eruptions:4.800,waiting:81},{eruptions:1.833,waiting:57},
  {eruptions:4.800,waiting:76},{eruptions:4.100,waiting:84},{eruptions:3.966,waiting:77},
  {eruptions:4.233,waiting:81},{eruptions:3.500,waiting:87},{eruptions:4.366,waiting:77},
  {eruptions:2.250,waiting:51},{eruptions:4.667,waiting:78},{eruptions:2.100,waiting:60},
  {eruptions:4.350,waiting:82},{eruptions:4.133,waiting:91},{eruptions:1.867,waiting:53},
  {eruptions:4.600,waiting:78},{eruptions:1.783,waiting:46},{eruptions:4.367,waiting:77},
  {eruptions:3.850,waiting:84},{eruptions:1.933,waiting:49},{eruptions:4.500,waiting:83},
  {eruptions:2.383,waiting:71},{eruptions:4.700,waiting:80},{eruptions:1.867,waiting:49},
  {eruptions:3.833,waiting:75},{eruptions:3.417,waiting:64},{eruptions:4.233,waiting:76},
  {eruptions:2.400,waiting:53},{eruptions:4.800,waiting:94},{eruptions:2.000,waiting:55},
  {eruptions:4.150,waiting:76},{eruptions:1.867,waiting:50},{eruptions:4.267,waiting:82},
  {eruptions:1.750,waiting:54},{eruptions:4.483,waiting:75},{eruptions:4.000,waiting:78},
  {eruptions:4.117,waiting:79},{eruptions:4.083,waiting:78},{eruptions:4.267,waiting:78},
  {eruptions:3.917,waiting:70},{eruptions:4.550,waiting:79},{eruptions:4.083,waiting:70},
  {eruptions:2.417,waiting:54},{eruptions:4.183,waiting:86},{eruptions:2.217,waiting:50},
  {eruptions:4.450,waiting:90},{eruptions:1.883,waiting:54},{eruptions:1.850,waiting:54},
  {eruptions:4.283,waiting:77},{eruptions:3.950,waiting:79},{eruptions:2.333,waiting:64},
  {eruptions:4.150,waiting:75},{eruptions:2.350,waiting:47},{eruptions:4.933,waiting:86},
  {eruptions:2.900,waiting:63},{eruptions:4.583,waiting:85},{eruptions:3.833,waiting:82},
  {eruptions:2.083,waiting:57},{eruptions:4.367,waiting:82},{eruptions:2.133,waiting:67},
  {eruptions:4.350,waiting:74},{eruptions:2.200,waiting:54},{eruptions:4.450,waiting:83},
  {eruptions:3.567,waiting:73},{eruptions:4.500,waiting:73},{eruptions:4.150,waiting:88},
  {eruptions:3.817,waiting:80},{eruptions:3.917,waiting:71},{eruptions:4.450,waiting:83},
  {eruptions:2.000,waiting:56},{eruptions:4.283,waiting:79},{eruptions:4.767,waiting:78},
  {eruptions:4.533,waiting:84},{eruptions:1.850,waiting:58},{eruptions:4.250,waiting:83},
  {eruptions:1.983,waiting:43},{eruptions:2.250,waiting:60},{eruptions:4.750,waiting:75},
  {eruptions:4.117,waiting:81},{eruptions:2.150,waiting:46},{eruptions:4.417,waiting:90},
  {eruptions:1.817,waiting:46},{eruptions:4.467,waiting:74},
];

// ---------------------------------------------------------------------------
// Render a Plot SVG into a container element (display use).
// ---------------------------------------------------------------------------

function renderPlot(container: HTMLElement, width: number, height: number) {
  container.innerHTML = '';
  const plot = Plot.plot({
    width,
    height,
    inset: 10,
    marks: [
      Plot.density(FAITHFUL, { x: 'waiting', y: 'eruptions', stroke: 'steelblue', strokeWidth: 0.25 }),
      Plot.density(FAITHFUL, { x: 'waiting', y: 'eruptions', stroke: 'steelblue', thresholds: 4 }),
      Plot.dot(FAITHFUL,     { x: 'waiting', y: 'eruptions', fill: 'currentColor', r: 1.5 }),
    ],
  });
  container.append(plot);
  return plot;
}

// ---------------------------------------------------------------------------
// Convert a Plot SVG element → Uint8Array PNG at the given pixel dimensions.
// SVG is resolution-independent so it scales cleanly to print dimensions.
// ---------------------------------------------------------------------------

function svgToBytes(svgEl: SVGSVGElement, width: number, height: number): Promise<Uint8Array> {
  // Ensure the SVG has explicit dimensions before serialising
  svgEl.setAttribute('width',  String(width));
  svgEl.setAttribute('height', String(height));

  const xml = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([xml], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = Object.assign(document.createElement('canvas'), { width, height });
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const b64  = canvas.toDataURL('image/png').split(',')[1];
      const bin  = atob(b64);
      const arr  = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      resolve(arr);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG rasterisation failed')); };
    img.src = url;
  });
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

type Tab = 'vizlike' | 'cartitem' | 'cart';

const TABS: { id: Tab; label: string; description: string }[] = [
  {
    id: 'vizlike',
    label: 'VizLike',
    description:
      'Preview art on a product without adding anything to the cart. ' +
      'Set active_item with placement content — the 3D viewer renders the art on the selected product.',
  },
  {
    id: 'cartitem',
    label: 'CartItem',
    description:
      'A single product in the cart, with the art attached as its print placement. ' +
      'The cart item carries the content; clicking it in the cart updates the 3D viewer.',
  },
  {
    id: 'cart',
    label: 'Cart',
    description:
      'Three products, each with their own pixel dimensions for the default placement: ' +
      'canvas (3900×3900), mousepad (2700×2250), mug (2700×1050). ' +
      'Click any item in the cart to see the art rendered on that product in the viewer.',
  },
];

const SNIPPETS: Record<Tab, string> = {
  vizlike: `\
import * as Plot from '@observablehq/plot';

// Any Plot chart works. Rasterise the SVG to PNG bytes at print resolution.
const div = document.createElement('div');
const svg = Plot.plot({
  inset: 10,
  marks: [
    Plot.density(data, { x: 'waiting', y: 'eruptions', stroke: 'steelblue', strokeWidth: 0.25 }),
    Plot.density(data, { x: 'waiting', y: 'eruptions', stroke: 'steelblue', thresholds: 4 }),
    Plot.dot(data,     { x: 'waiting', y: 'eruptions', fill: 'currentColor', r: 1.5 }),
  ],
});
div.append(svg);
const bytes = await svgToBytes(svg, 3900, 3900);

model.set('active_item', {
  id: 'canvas_10x10',
  name: 'Canvas (10″×10″)',
  placements: [{ id: 'default', content: bytes }],
} satisfies ActiveItem);`,

  cartitem: `\
const bytes = await svgToBytes(svg, 3900, 3900);

const item: CartItem = {
  id: 'canvas_10x10',
  name: 'Canvas (10″×10″)',
  quantity: 1,
  placements: [{ id: 'default', content: bytes }],
};
model.set('cart', [item]);`,

  cart: `\
// Rasterise once per product at the required pixel dimensions.
const [canvasBytes, mousepadBytes, mugBytes] = await Promise.all([
  svgToBytes(svg, 3900, 3900),
  svgToBytes(svg, 2700, 2250),
  svgToBytes(svg, 2700, 1050),
]);

const cart: CartItem[] = [
  { id: 'canvas_10x10',       name: 'Canvas (10″×10″)', quantity: 1,
    placements: [{ id: 'default', content: canvasBytes }] },
  { id: 'mousepad_white_8x7', name: 'Mousepad (8″×7″)', quantity: 1,
    placements: [{ id: 'default', content: mousepadBytes }] },
  { id: 'mug_black_11oz',     name: 'Mug (11 oz)',       quantity: 1,
    placements: [{ id: 'default', content: mugBytes }] },
];
model.set('cart', cart);`,
};

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const ACTIVE_ITEM_BASE = { id: 'canvas_10x10', name: 'Canvas (10″×10″)' };

// Product specs: id, name, placement, pixel dimensions
const PRODUCTS = [
  { id: 'canvas_10x10',       name: 'Canvas (10″×10″)', placement: 'default', w: 3900, h: 3900 },
  { id: 'mousepad_white_8x7', name: 'Mousepad (8″×7″)', placement: 'default', w: 2700, h: 2250 },
  { id: 'mug_black_11oz',     name: 'Mug (11 oz)',       placement: 'default', w: 2700, h: 1050 },
];

export function App() {
  const [tab, setTab]   = useState<Tab>('vizlike');
  const plotRef         = useRef<HTMLDivElement>(null);
  const thumbRefs       = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const svgRef          = useRef<SVGSVGElement | null>(null);
  const bytesRef        = useRef<Uint8Array[] | null>(null);

  const model = useMemo(() => createModel({}), []);

  // Render Plot preview and rasterise product bytes once on mount
  useEffect(() => {
    const container = plotRef.current;
    if (!container) return;

    let cancelled = false;

    // Display preview
    const plot = renderPlot(container, container.clientWidth || 640, 260);
    const svg = plot as unknown as SVGSVGElement;
    svgRef.current = svg;

    // Rasterise all product sizes in parallel
    Promise.all(PRODUCTS.map(p => svgToBytes(svg, p.w, p.h))).then(allBytes => {
      if (cancelled) return;
      bytesRef.current = allBytes;

      // Render small thumbnails for the Cart tab preview
      PRODUCTS.forEach((p, i) => {
        const el = thumbRefs.current[i];
        if (!el) return;
        const thumbH = 80;
        const thumbW = Math.round((p.w / p.h) * thumbH);
        renderPlot(el, thumbW, thumbH);
      });

      applyTab('vizlike', bytesRef.current, model);
    });

    return () => { cancelled = true; };
  }, [model]);

  const handleTabClick = (id: Tab) => {
    setTab(id);
    applyTab(id, bytesRef.current, model);
  };

  const info = TABS.find(t => t.id === tab)!;

  return (
    <div style={{
      maxWidth: 960,
      margin: '48px auto',
      padding: '0 24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#111',
    }}>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 20, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        chartout · widget reference
      </p>

      {/* Observable Plot preview */}
      <div
        ref={plotRef}
        style={{ width: '100%', marginBottom: 0, border: '1px solid #e8e8e8', background: '#fff' }}
      />

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8', marginTop: 20 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => handleTabClick(t.id)}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontFamily: 'inherit',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid #1b195d' : '2px solid transparent',
              color: tab === t.id ? '#1b195d' : '#888',
              fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: '#555', margin: '12px 0 12px', lineHeight: 1.5 }}>
        {info.description}
      </p>

      {/* Product thumbnails — Cart tab only */}
      {tab === 'cart' && (
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 12 }}>
          {PRODUCTS.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div
                ref={el => { thumbRefs.current[i] = el; }}
                style={{ height: 80, width: 'auto', display: 'block', border: '1px solid #e8e8e8', background: '#fff' }}
              />
              <span style={{ fontSize: 11, color: '#444', fontFamily: 'ui-monospace, monospace' }}>{p.id}</span>
              <span style={{ fontSize: 10, color: '#999' }}>{p.placement} · {p.w}×{p.h}</span>
            </div>
          ))}
        </div>
      )}

      {/* Code snippet */}
      <pre style={{
        margin: '0 0 16px',
        padding: '16px',
        background: '#f7f7f7',
        border: '1px solid #e8e8e8',
        borderRadius: 4,
        fontSize: 12,
        lineHeight: 1.6,
        color: '#333',
        overflowX: 'auto',
        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
        whiteSpace: 'pre',
      }}>
        {SNIPPETS[tab]}
      </pre>

      {/* Widget — stays mounted, model state changes on tab switch */}
      <ChartoutWidget model={model} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Model update logic
// ---------------------------------------------------------------------------

function applyTab(tab: Tab, bytes: Uint8Array[] | null, model: ReturnType<typeof createModel>) {
  if (!bytes) return;

  const canvasPlacement = [{ id: 'default', content: bytes[0] }];
  const activeItem: ActiveItem = { ...ACTIVE_ITEM_BASE, placements: canvasPlacement };

  if (tab === 'vizlike') {
    model.set('cart', []);
    model.set('active_item', activeItem);
    return;
  }

  if (tab === 'cartitem') {
    model.set('cart', [{ ...ACTIVE_ITEM_BASE, quantity: 1, placements: canvasPlacement }]);
    model.set('active_item', activeItem);
    return;
  }

  // cart — each product at its own dimensions
  const cart: CartItem[] = PRODUCTS.map((p, i) => ({
    id: p.id,
    name: p.name,
    quantity: 1,
    placements: [{ id: p.placement, content: bytes[i] }],
  }));
  model.set('cart', cart);
  model.set('active_item', activeItem);
}
