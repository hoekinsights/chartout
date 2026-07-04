'use client'
import { useEffect, useRef } from 'react'

// Charts are pre-rendered by the real libraries (Altair via vl_convert, matplotlib
// via its SVG backend) and committed under public/charts/. See
// scripts/generate_example_charts.py. This loader fetches one such SVG, displays it,
// and hands the live <svg> element back so the store demo can rasterise it onto a product.
export function StaticSvgRenderer({
  src,
  onSvg,
}: {
  src: string
  onSvg: (svg: SVGSVGElement) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    fetch(src)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled || !ref.current) return
        ref.current.innerHTML = text
        const svg = ref.current.querySelector('svg')
        if (svg) onSvg(svg)
      })
      .catch((err) => console.error(`chartout docs demo: failed to load ${src}`, err))
    return () => {
      cancelled = true
    }
  }, [src, onSvg])

  // Scale to the cell width; viewBox keeps the aspect ratio. The original width/height
  // attributes stay on the element so svgToBytes still sees intrinsic dimensions.
  return <div ref={ref} className="chartout-demo-chart" />
}
