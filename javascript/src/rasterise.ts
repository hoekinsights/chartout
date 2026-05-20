/**
 * Rasterise an SVG chart to PNG bytes at print resolution.
 *
 * chartout's widget only accepts Uint8Array PNG bytes as placement content.
 * This module bridges the gap: your chart library produces an <svg> element,
 * svgToBytes() converts it to the bytes the widget needs.
 *
 * Uses @nick/resvg (resvg-wasm) — the same renderer as vl-convert-python —
 * so output is pixel-consistent between the Python and JavaScript paths.
 * Synchronous after module initialisation; no canvas, no CORS, no Promises.
 *
 * Required print dimensions per product
 * ──────────────────────────────────────
 *  Canvas 10×10      3900 × 3900   (1 : 1)
 *  Poster            3900 × 3900   (1 : 1)
 *  Mug 11 oz         2700 × 1050   (~2.6 : 1)
 *  T-shirt           2700 × 1050   (~2.6 : 1)
 *  Mousepad 8×7      2700 × 2250   (~1.2 : 1)
 *
 * @example
 *   const svg = Plot.plot({ marks: [...] }) as SVGSVGElement;
 *
 *   const canvasBytes   = svgToBytes(svg, 3900, 3900);  // canvas / poster
 *   const mugBytes      = svgToBytes(svg, 2700, 1050);  // mug / t-shirt
 *   const mousepadBytes = svgToBytes(svg, 2700, 2250);  // mousepad
 */

import { render } from '@nick/resvg';
import type { Options } from '@nick/resvg';

export function svgToBytes(
  svgEl: SVGSVGElement,
  width: number,
  height: number,
): Uint8Array {
  // Clone so the displayed element isn't mutated by attribute changes below.
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('width',  String(width));
  clone.setAttribute('height', String(height));
  clone.setAttribute('xmlns',  'http://www.w3.org/2000/svg');

  return render(new XMLSerializer().serializeToString(clone), {
    defaultSize:    { width, height },
    fontFamily:     'Inter',
    fontFamilies:   { sans: 'Inter' },
    textRendering:  'geometricPrecision',
    shapeRendering: 'geometricPrecision',
  } satisfies Options);
}
