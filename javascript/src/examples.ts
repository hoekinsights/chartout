/**
 * Example configurations for the chartout reference implementation.
 *
 * Each Example describes one of the three integration patterns:
 *   VizLike  — preview a chart on a product without adding it to the cart
 *   CartItem — add a single product to the cart
 *   Cart     — fill the cart with several products at once
 *
 * ProductSpec ties a product id / print dimensions to the chart render
 * function that produces its texture. The same spec drives both the
 * screen-size preview and the full-resolution rasterisation.
 */

import { renderScatterDensity, renderHistogram, renderTimeSeries } from './charts';

// ── Types ────────────────────────────────────────────────────────────────────

export type ExampleId = 'vizlike' | 'cartitem' | 'cart';

export interface ProductSpec {
  /** Short key used to look up rasterised bytes (e.g. 'canvas'). */
  key: string;
  /** chartout product id as accepted by the API. */
  id: string;
  name: string;
  placement: string;
  /** Print width in pixels. */
  w: number;
  /** Print height in pixels. */
  h: number;
  /** Renders the chart SVG into `container` at the given dimensions. */
  renderFn: (container: HTMLElement, w: number, h: number) => SVGSVGElement;
}

export interface Example {
  id: ExampleId;
  label: string;
  description: string;
  /** Products whose previews are shown for this tab. */
  previewProducts: ProductSpec[];
  /** Code snippets displayed in the UI. */
  snippets: {
    /** The chart-library code (collapsible — users already know this). */
    chart: string;
    /** The chartout integration code — this is the tutorial focus. */
    store: string;
  };
}

// ── Product specs ─────────────────────────────────────────────────────────────

export const CANVAS: ProductSpec = {
  key: 'canvas', id: 'canvas_10x10', name: 'Canvas (10″×10″)',
  placement: 'default', w: 3900, h: 3900, renderFn: renderScatterDensity,
};

export const MUG: ProductSpec = {
  key: 'mug', id: 'mug_black_11oz', name: 'Mug (11 oz)',
  placement: 'default', w: 2700, h: 1050, renderFn: renderHistogram,
};

export const MOUSEPAD: ProductSpec = {
  key: 'mousepad', id: 'mousepad_white_8x7', name: 'Mousepad (8″×7″)',
  placement: 'default', w: 2700, h: 2250, renderFn: renderTimeSeries,
};

/** All products used across the examples — rasterised once on mount. */
export const ALL_PRODUCTS: ProductSpec[] = [CANVAS, MUG, MOUSEPAD];

// ── Examples ──────────────────────────────────────────────────────────────────

export const EXAMPLES: Example[] = [
  {
    id: 'vizlike',
    label: 'VizLike',
    description:
      'Preview a chart on a product in the 3D viewer without adding it to the cart. ' +
      'Pass any chart as an active_item — the viewer renders it on the product instantly. ' +
      'Useful for "try before you buy" flows or live chart previews.',
    previewProducts: [CANVAS],
    snippets: {
      chart: `\
import * as Plot from '@observablehq/plot';

const svg = Plot.plot({
  inset: 10,
  marks: [
    Plot.density(data, { x: 'waiting', y: 'eruptions', stroke: 'steelblue', strokeWidth: 0.25 }),
    Plot.density(data, { x: 'waiting', y: 'eruptions', stroke: 'steelblue', thresholds: 4 }),
    Plot.dot(data,     { x: 'waiting', y: 'eruptions', fill: 'currentColor', r: 1.5 }),
  ],
}) as SVGSVGElement;`,
      store: `\
import { svgToBytes } from './rasterise';

// Rasterise at canvas print resolution, 3900×3900 px (1:1 square)
const bytes = svgToBytes(svg, 3900, 3900);

// Push to the widget: no cart, just a live preview on the product
model.set('active_item', {
  id: 'canvas_10x10',
  name: 'Canvas (10″×10″)',
  placements: [{ id: 'default', content: bytes }],
} satisfies ActiveItem);`,
    },
  },

  {
    id: 'cartitem',
    label: 'CartItem',
    description:
      'Add a single product to the cart with its chart already attached as the print texture. ' +
      'Clicking the item in the 3D viewer cart switches to that product.',
    previewProducts: [MUG],
    snippets: {
      chart: `\
import * as Plot from '@observablehq/plot';

const svg = Plot.plot({
  marginLeft: 40,
  marks: [
    Plot.rectY(data, Plot.binX({ y: 'count' }, { x: 'eruptions', fill: 'steelblue' })),
    Plot.ruleY([0]),
  ],
}) as SVGSVGElement;`,
      store: `\
import { svgToBytes } from './rasterise';

// Rasterise at mug print resolution, 2700×1050 px (~2.6:1 wide)
const bytes = svgToBytes(svg, 2700, 1050);

model.set('cart', [{
  id: 'mug_black_11oz',
  name: 'Mug (11 oz)',
  quantity: 1,
  placements: [{ id: 'default', content: bytes }],
} satisfies CartItem]);`,
    },
  },

  {
    id: 'cart',
    label: 'Cart',
    description:
      'Fill the cart with several products at once, each with its own chart rendered at the ' +
      'correct pixel dimensions for its placement. Switch between items in the viewer to see each product.',
    previewProducts: [CANVAS, MOUSEPAD, MUG],
    snippets: {
      chart: `\
import * as Plot from '@observablehq/plot';

// One chart per product, each rendered at its own aspect ratio
const canvasSvg   = Plot.plot({ marks: [Plot.density(data, {...}), Plot.dot(data, {...})]   }) as SVGSVGElement;
const mousepadSvg = Plot.plot({ marks: [Plot.areaY(series, {...}), Plot.lineY(series, {...})] }) as SVGSVGElement;
const mugSvg      = Plot.plot({ marks: [Plot.rectY(data, Plot.binX({...})), Plot.ruleY([])] }) as SVGSVGElement;`,
      store: `\
import { svgToBytes } from './rasterise';

const canvasBytes   = svgToBytes(canvasSvg,   3900, 3900);  // 1:1 square
const mousepadBytes = svgToBytes(mousepadSvg, 2700, 2250);  // ~1.2:1
const mugBytes      = svgToBytes(mugSvg,      2700, 1050);  // ~2.6:1

model.set('cart', [
  { id: 'canvas_10x10',       name: 'Canvas (10″×10″)', quantity: 1, placements: [{ id: 'default', content: canvasBytes   }] },
  { id: 'mousepad_white_8x7', name: 'Mousepad (8″×7″)', quantity: 2, placements: [{ id: 'default', content: mousepadBytes }] },
  { id: 'mug_black_11oz',     name: 'Mug (11 oz)',      quantity: 1, placements: [{ id: 'default', content: mugBytes      }] },
] satisfies CartItem[]);`,
    },
  },
];
