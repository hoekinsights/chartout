/**
 * Observable Plot chart definitions used in the reference examples.
 *
 * Each function accepts a container element and display dimensions, appends
 * an <svg> to the container, and returns it. The same SVG element is both
 * displayed as the inline preview and passed to svgToBytes() for rasterisation
 * One render, one element, two uses.
 *
 * Swap these out for any chart library (D3, Vega-Lite, ECharts…) as long as
 * the function returns an SVGSVGElement.
 */

import * as Plot from '@observablehq/plot';

// Old Faithful geyser eruption data (272 observations).
// eruptions: duration in minutes; waiting: time to next eruption in minutes.
import FAITHFUL from './faithful.json';
const FAITHFUL_INDEXED = FAITHFUL.map((d, i) => ({ ...d, i }));

/** Scatter-density plot, good for square products (canvas, poster). */
export function renderScatterDensity(
  container: HTMLElement,
  width: number,
  height: number,
): SVGSVGElement {
  container.innerHTML = '';
  const svg = Plot.plot({
    width, height, inset: 10,
    marks: [
      Plot.density(FAITHFUL, { x: 'waiting', y: 'eruptions', stroke: 'steelblue', strokeWidth: 0.25 }),
      Plot.density(FAITHFUL, { x: 'waiting', y: 'eruptions', stroke: 'steelblue', thresholds: 4 }),
      Plot.dot(FAITHFUL,     { x: 'waiting', y: 'eruptions', fill: 'currentColor', r: 1.5 }),
    ],
  }) as unknown as SVGSVGElement;
  container.append(svg);
  return svg;
}

/** Histogram, good for wide products (mug, t-shirt). */
export function renderHistogram(
  container: HTMLElement,
  width: number,
  height: number,
): SVGSVGElement {
  container.innerHTML = '';
  const svg = Plot.plot({
    width, height, marginLeft: 40,
    marks: [
      Plot.rectY(FAITHFUL, Plot.binX({ y: 'count' }, { x: 'eruptions', fill: 'steelblue' })),
      Plot.ruleY([0]),
    ],
  }) as unknown as SVGSVGElement;
  container.append(svg);
  return svg;
}

/** Interference pattern raster, good for near-square products (mousepad). */
export function renderRaster(
  container: HTMLElement,
  width: number,
  height: number,
): SVGSVGElement {
  container.innerHTML = '';
  const cols = 240, rows = 200;
  const values = Float64Array.from({ length: cols * rows }, (_, i) => {
    const x = (i % cols) / cols * 4 - 2;
    const y = Math.floor(i / cols) / rows * 4 - 2;
    return Math.sin(x * 3) * Math.cos(y * 3) + Math.sin((x + y) * 2);
  });
  const svg = Plot.plot({
    width, height,
    axis: null,
    color: { scheme: 'RdBu' },
    marks: [
      Plot.raster(values, { width: cols, height: rows, x1: -2, x2: 2, y1: -2, y2: 2 }),
    ],
  }) as unknown as SVGSVGElement;
  container.append(svg);
  return svg;
}
