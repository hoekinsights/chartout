/**
 * Example configurations for the chartout reference implementation.
 *
 * Each Example describes one of the three integration patterns:
 *   VizLike: preview a chart on a product without adding it to the cart
 *   CartItem: add a single product to the cart
 *   Cart: fill the cart with several products at once
 *
 * ProductSpec ties a product id to the chart render function that produces its
 * texture. printRatio comes from GET /v1/products and is used to size the chart
 * at an appropriate aspect ratio for display and rendering. It does NOT
 * control rasterisation pixel size. svgToBytes() handles print resolution
 * automatically, preserving the SVG's natural aspect ratio.
 */

import { renderScatterDensity, renderHistogram, renderRaster } from './charts';

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
   * Not a fixed pixel size. The widget fits the chart onto the product's
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
    /** The chart-library code shown above the chartout integration snippet. */
    chart: string;
    /** The chartout integration code, the tutorial focus. */
    store: string;
  };
}

// ── Products ──────────────────────────────────────────────────────────────────
// printRatio matches the value returned by GET /v1/products for each product.

export const PRODUCTS: ProductSpec[] = [
  {
    key: 'canvas_10x10', id: 'canvas_10x10', name: 'My Canvas (10″×10″)',
    placement: 'default', printRatio: '1:1', renderFn: renderScatterDensity,
  },
  {
    key: 'mug_black_11oz', id: 'mug_black_11oz', name: 'My Mug (11 oz)',
    placement: 'default', printRatio: '18:7', renderFn: renderHistogram,
  },
  {
    key: 'mousepad_white_8x7', id: 'mousepad_white_8x7', name: 'My Mousepad (8″×7″)',
    placement: 'default', printRatio: '6:5', renderFn: renderRaster,
  },
];

// ── Examples ──────────────────────────────────────────────────────────────────

export const EXAMPLES: Example[] = [
  {
    id: 'vizlike',
    label: 'VizLike',
    description:
      'Hand the user a chart and let them decide what to print it on. ' +
      'Good for "print this" buttons or live previews where product selection belongs to the user.',
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
});`,
      store: `\
import { openWithViz } from 'chartout/store';

// Rasterises the chart and opens the store.
// The user lands on the default product (mug) and can switch.
await openWithViz(model, svg, 'My Histogram');`,
    },
  },

  {
    id: 'cartitem',
    label: 'CartItem',
    description:
      'Arrive in the store with a product and chart already chosen. ' +
      'The user reviews and orders. ' +
      'Good when your UI decides the product, not the user.',
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
});`,
      store: `\
import { openWithItem } from 'chartout/store';

// Rasterises the chart and opens the store with this product pre-selected.
// productId comes from GET /v1/products.
await openWithItem(model, 'canvas_10x10', svg, 'My Scatter density');`,
    },
  },

  {
    id: 'cart',
    label: 'Cart',
    description:
      'Build the cart yourself and send the user straight to review. ' +
      'Good for bundles or dashboards where you know what they want to order.',
    previewKeys: ['canvas_10x10', 'mousepad_white_8x7', 'mug_black_11oz'],
    snippets: {
      chart: `\
import * as Plot from '@observablehq/plot';

// Each chart is designed at proportions that suit the data.
// ChartOut handles fitting it onto the product's print area.
const canvasSvg    = Plot.plot({ marks: [Plot.density(data, {...}), Plot.dot(data, {...})]  });
const mousepadSvg  = Plot.plot({ marks: [Plot.hexbin({ fill: 'count' }, {...})]             });
const mugSvg       = Plot.plot({ marks: [Plot.rectY(data, Plot.binX({...})), Plot.ruleY([])] });`,
      store: `\
import { openWithCart, svgToBytes } from 'chartout/store';

// Rasterise all charts in parallel, then send the cart.
const [canvasBytes, mousepadBytes, mugBytes] = await Promise.all([
  svgToBytes(canvasSvg), svgToBytes(mousepadSvg), svgToBytes(mugSvg),
]);

openWithCart(model, [
  { id: 'canvas_10x10',       name: 'My Canvas (10″×10″)', quantity: 1, placements: [{ id: 'default', content: canvasBytes   }] },
  { id: 'mousepad_white_8x7', name: 'My Mousepad (8″×7″)', quantity: 1, placements: [{ id: 'default', content: mousepadBytes }] },
  { id: 'mug_black_11oz',     name: 'My Mug (11 oz)',      quantity: 1, placements: [{ id: 'default', content: mugBytes      }] },
] satisfies CartItem[]);`,
    },
  },
];
