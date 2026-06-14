/**
 * Observable Plot chart definitions used in the reference examples.
 *
 * Each function accepts a container element and display dimensions, appends
 * an <svg> to the container, and returns it. The same SVG element is both
 * displayed as the inline preview and passed to svgToBytes() for rasterisation
 * — one render, one element, two uses.
 *
 * Swap these out for any chart library (D3, Vega-Lite, ECharts…) as long as
 * the function returns an SVGSVGElement.
 */

import * as Plot from '@observablehq/plot';

// Old Faithful geyser eruption data (272 observations).
// eruptions: duration in minutes; waiting: time to next eruption in minutes.
import FAITHFUL from './faithful.json';
const FAITHFUL_INDEXED = FAITHFUL.map((d, i) => ({ ...d, i }));

/** Scatter-density plot — good for square products (canvas, poster). */
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

/** Histogram — good for wide products (mug, t-shirt). */
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

/** Area + line time series — good for near-square products (mousepad). */
export function renderTimeSeries(
  container: HTMLElement,
  width: number,
  height: number,
): SVGSVGElement {
  container.innerHTML = '';
  const svg = Plot.plot({
    width, height, marginLeft: 40,
    marks: [
      Plot.areaY(FAITHFUL_INDEXED, { x: 'i', y: 'waiting', fill: 'steelblue', fillOpacity: 0.15 }),
      Plot.lineY(FAITHFUL_INDEXED, { x: 'i', y: 'waiting', stroke: 'steelblue', strokeWidth: 1 }),
      Plot.ruleY([0]),
    ],
  }) as unknown as SVGSVGElement;
  container.append(svg);
  return svg;
}
