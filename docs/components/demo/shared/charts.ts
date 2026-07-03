import * as Plot from '@observablehq/plot'
import * as echarts from 'echarts'
import FAITHFUL from '@/components/demo/shared/faithful.json'

type Faithful = { waiting: number; eruptions: number }
const ROWS = FAITHFUL as Faithful[]

/**
 * Render an ECharts option with the SVG renderer and return the root <svg>.
 * chartout rasterises an SVGSVGElement, so ECharts must use `renderer: 'svg'`.
 */
function echartsSvg(
  container: HTMLElement,
  width: number,
  height: number,
  option: echarts.EChartsOption,
): SVGSVGElement {
  echarts.getInstanceByDom(container)?.dispose()
  container.innerHTML = ''
  const chart = echarts.init(container, null, { renderer: 'svg', width, height })
  // Disable animation (and progressive rendering) so the SVG is fully drawn
  // synchronously — otherwise svgToBytes captures the initial (empty) frame
  // and only the axes/grid survive rasterisation.
  chart.setOption({ animation: false, ...option })
  const svg = container.querySelector('svg') as SVGSVGElement
  // Guarantee readable dimensions for svgToBytes.
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
  return svg
}

/** Bin a numeric array into [center, count] pairs for a histogram. */
function bins(values: number[], count = 20): [number, number][] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const step = (max - min) / count
  const counts = new Array(count).fill(0)
  for (const v of values) {
    counts[Math.min(count - 1, Math.floor((v - min) / step))]++
  }
  return counts.map((c, i) => [Number((min + step * (i + 0.5)).toFixed(2)), c])
}

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
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
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
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
  container.append(svg)
  return svg
}

/** Raster interference pattern — good for near-square products (mousepad). */
export function renderRaster(container: HTMLElement, width: number, height: number): SVGSVGElement {
  container.innerHTML = ''
  const cols = 80, rows = 67
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
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
  container.append(svg)
  return svg
}

// ── ECharts equivalents (SVG renderer) ─────────────────────────────────────────

/** Histogram (ECharts) — good for wide products (mug, t-shirt). */
export function renderHistogramECharts(container: HTMLElement, width: number, height: number): SVGSVGElement {
  return echartsSvg(container, width, height, {
    grid: { left: 40, right: 10, top: 10, bottom: 24 },
    xAxis: { type: 'value', name: 'eruptions' },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: bins(ROWS.map((d) => d.eruptions)), itemStyle: { color: 'steelblue' } }],
  })
}

/** Scatter (ECharts) — good for square products (canvas, poster). */
export function renderScatterDensityECharts(container: HTMLElement, width: number, height: number): SVGSVGElement {
  return echartsSvg(container, width, height, {
    grid: { left: 30, right: 10, top: 10, bottom: 24 },
    xAxis: { type: 'value', scale: true },
    yAxis: { type: 'value', scale: true },
    series: [{
      type: 'scatter',
      data: ROWS.map((d) => [d.waiting, d.eruptions]),
      symbolSize: 5,
      itemStyle: { color: 'steelblue', opacity: 0.6 },
    }],
  })
}

/** Heatmap (ECharts) — good for near-square products (mousepad). */
export function renderRasterECharts(container: HTMLElement, width: number, height: number): SVGSVGElement {
  const cols = 60, rows = 50
  const data: [number, number, number][] = []
  for (let yi = 0; yi < rows; yi++) {
    for (let xi = 0; xi < cols; xi++) {
      const x = (xi / cols) * 4 - 2
      const y = (yi / rows) * 4 - 2
      data.push([xi, yi, Math.sin(x * 3) * Math.cos(y * 3) + Math.sin((x + y) * 2)])
    }
  }
  return echartsSvg(container, width, height, {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: Array.from({ length: cols }, (_, i) => i) },
    yAxis: { type: 'category', show: false, data: Array.from({ length: rows }, (_, i) => i) },
    visualMap: { show: false, min: -2, max: 2, inRange: { color: ['#67001f', '#f7f7f7', '#053061'] } },
    series: [{ type: 'heatmap', data, progressive: 0, itemStyle: { borderWidth: 0 } }],
  })
}
