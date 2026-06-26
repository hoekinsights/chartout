import * as Plot from '@observablehq/plot'
import FAITHFUL from './faithful.json'

/** Scatter-density plot — good for square products (canvas, poster). */
export function renderScatterDensity(container: HTMLElement, width: number, height: number): SVGSVGElement {
  container.innerHTML = ''
  const svg = Plot.plot({
    width, height, inset: 10,
    marks: [
      Plot.density(FAITHFUL, { x: 'waiting', y: 'eruptions', stroke: 'steelblue', strokeWidth: 0.25 }),
      Plot.density(FAITHFUL, { x: 'waiting', y: 'eruptions', stroke: 'steelblue', thresholds: 4 }),
      Plot.dot(FAITHFUL, { x: 'waiting', y: 'eruptions', fill: 'currentColor', r: 1.5 }),
    ],
  }) as unknown as SVGSVGElement
  container.append(svg)
  return svg
}

/** Histogram — good for wide products (mug, t-shirt). */
export function renderHistogram(container: HTMLElement, width: number, height: number): SVGSVGElement {
  container.innerHTML = ''
  const svg = Plot.plot({
    width, height, marginLeft: 40,
    marks: [
      // @ts-expect-error -- fill is a valid rectY option but Plot types are too narrow here
      Plot.rectY(FAITHFUL, Plot.binX({ y: 'count' }, { x: 'eruptions', fill: 'steelblue' })),
      Plot.ruleY([0]),
    ],
  }) as unknown as SVGSVGElement
  container.append(svg)
  return svg
}

/** Raster interference pattern — good for near-square products (mousepad). */
export function renderRaster(container: HTMLElement, width: number, height: number): SVGSVGElement {
  container.innerHTML = ''
  const cols = 240, rows = 200
  const values = Float64Array.from({ length: cols * rows }, (_, i) => {
    const x = (i % cols) / cols * 4 - 2
    const y = Math.floor(i / cols) / rows * 4 - 2
    return Math.sin(x * 3) * Math.cos(y * 3) + Math.sin((x + y) * 2)
  })
  const svg = Plot.plot({
    width, height, axis: null,
    color: { scheme: 'RdBu' },
    marks: [Plot.raster(values, { width: cols, height: rows, x1: -2, x2: 2, y1: -2, y2: 2 })],
  }) as unknown as SVGSVGElement
  container.append(svg)
  return svg
}
