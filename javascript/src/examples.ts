/**
 * Example configurations for the chartout reference implementation.
 *
 * Each Example describes one of the three integration patterns:
 *   VizLike  — preview a chart on a product without adding it to the cart
 *   CartItem — add a single product to the cart
 *   Cart     — fill the cart with several products at once
 *
 * ProductSpec ties a product id to the chart render function that produces its
 * texture. printRatio comes from GET /v1/products and is used to size the chart
 * at an appropriate aspect ratio for display and rendering. It does NOT
 * control rasterisation pixel size — svgToBytes() handles print resolution
 * automatically, preserving the SVG's natural aspect ratio.
 */

import { renderScatterDensity, renderHistogram, renderTimeSeries } from './charts';

// ── Types ────────────────────────────────────────────────────────────────────

export type ExampleId = 'vizlike' | 'cartitem' | 'cart';

export interface ProductSpec {
  /** Short key used to look up rasterised bytes (e.g. 'canvas'). */
  key: string;
  /** chartout product id as returned by GET /v1/products. */
  id: string;
  name: string;
  placement: string;
  /**
   * Placement aspect ratio from GET /v1/products (e.g. '1:1', '18:7', '6:5').
   * Used to size the chart at an appropriate aspect ratio for display.
   * Not a fixed pixel size — the widget fits the chart onto the product's
   * placement area using its built-in scale/alignment controls.
   */
  printRatio: string;
  /** Renders the chart SVG into `container` at the given display dimensions. */
  renderFn: (container: HTMLElement, w: number, h: number) => SVGSVGElement;
}

export interface Example {
  id: ExampleId;
  label: string;
  description: string;
  /** Keys of products whose previews are shown for this tab. */
  previewKeys: string[];
  /** Code snippets displayed in the UI. */
  snippets: {
    /** The chart-library code (collapsible — users already know this). */
    chart: string;
    /** The chartout integration code — this is the tutorial focus. */
    store: string;
  };
}

// ── Products ──────────────────────────────────────────────────────────────────
// printRatio matches the value returned by GET /v1/products for each product.

export const PRODUCTS: ProductSpec[] = [
  {
    key: 'canvas_10x10', id: 'canvas_10x10', name: 'Canvas (10″×10″)',
    placement: 'default', printRatio: '1:1', renderFn: renderScatterDensity,
  },
  {
    key: 'mug_black_11oz', id: 'mug_black_11oz', name: 'Mug (11 oz)',
    placement: 'default', printRatio: '18:7', renderFn: renderHistogram,
  },
  {
    key: 'mousepad_white_8x7', id: 'mousepad_white_8x7', name: 'Mousepad (8″×7″)',
    placement: 'default', printRatio: '6:5', renderFn: renderTimeSeries,
  },
];

// ── Examples ──────────────────────────────────────────────────────────────────

export const EXAMPLES: Example[] = [
  {
    id: 'vizlike',
    label: 'VizLike',
    description:
      'Preview a chart on a product in the 3D viewer without adding it to the cart. ' +
      'Pass any chart as an active_item — the viewer renders it on the product instantly. ' +
      'Useful for "try before you buy" flows or live chart previews.',
    previewKeys: ['mug_black_11oz'],
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
import { openWithViz } from 'chartout/store';

// Rasterises the SVG and loads it into the store — user picks product.
// Defaults to mug_black_11oz; the user can switch product inside the store.
await openWithViz(model, svg, 'Histogram');`,
    },
  },

  {
    id: 'cartitem',
    label: 'CartItem',
    description:
      'Add a single product to the cart with its chart already attached as the print texture. ' +
      'Clicking the item in the 3D viewer cart switches to that product.',
    previewKeys: ['canvas_10x10'],
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
import { openWithItem } from 'chartout/store';

// Rasterises the SVG and opens the store with the canvas pre-selected.
// productId must be a valid id from GET /v1/products.
await openWithItem(model, 'canvas_10x10', svg, 'Scatter density');`,
    },
  },

  {
    id: 'cart',
    label: 'Cart',
    description:
      'Fill the cart with several products at once, each with its own chart. ' +
      'Design each chart at its natural proportions — svgToBytes preserves the aspect ratio. ' +
      'Switch between items in the viewer to see each product.',
    previewKeys: ['canvas_10x10', 'mousepad_white_8x7', 'mug_black_11oz'],
    snippets: {
      chart: `\
import * as Plot from '@observablehq/plot';

// Design each chart at proportions that suit the data, not the product.
// The widget handles fitting the chart onto the product's placement area.
const canvasSvg   = Plot.plot({ marks: [Plot.density(data, {...}), Plot.dot(data, {...})]   }) as SVGSVGElement;
const mousepadSvg = Plot.plot({ marks: [Plot.areaY(series, {...}), Plot.lineY(series, {...})] }) as SVGSVGElement;
const mugSvg      = Plot.plot({ marks: [Plot.rectY(data, Plot.binX({...})), Plot.ruleY([])] }) as SVGSVGElement;`,
      store: `\
import { openWithCart, svgToBytes } from 'chartout/store';

// Rasterise each chart at its own natural aspect ratio, then build the cart.
const [canvasBytes, mugBytes, mousepadBytes] = await Promise.all([
  svgToBytes(canvasSvg), svgToBytes(mugSvg), svgToBytes(mousepadSvg),
]);

openWithCart(model, [
  { id: 'canvas_10x10',       name: 'Canvas (10″×10″)', quantity: 1, placements: [{ id: 'default', content: canvasBytes   }] },
  { id: 'mug_black_11oz',     name: 'Mug (11 oz)',      quantity: 1, placements: [{ id: 'default', content: mugBytes      }] },
  { id: 'mousepad_white_8x7', name: 'Mousepad (8″×7″)', quantity: 2, placements: [{ id: 'default', content: mousepadBytes }] },
] satisfies CartItem[]);`,
    },
  },
];
