'use client'
import { forwardRef, useCallback, useEffect, useRef } from 'react'
import { VegaEmbed } from 'react-vega'
import type { Result } from 'vega-embed'
import { renderHistogram } from '@/components/demo/shared/charts'
import { setSessionSvg } from './session'
import spec from '../../../public/faithful-histogram.json'

const EMBED_OPTIONS = {
  actions: false,
  renderer: 'svg' as const,
}

type ChartRendererProps = {
  sessionId: string
}

export function AltairChartRenderer({ sessionId }: ChartRendererProps) {
  const handleEmbed = useCallback(
    (result: Result) => {
      result.view.toSVG().then((svgString) => {
        const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml')
        const svgEl = doc.querySelector('svg')
        if (svgEl) setSessionSvg(sessionId, svgEl)
      })
    },
    [sessionId],
  )

  return <VegaEmbed spec={spec as never} options={EMBED_OPTIONS} onEmbed={handleEmbed} />
}

export function VgplotChartRenderer({ sessionId }: ChartRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const svg = renderHistogram(containerRef.current, 400, 200)
    setSessionSvg(sessionId, svg)
  }, [sessionId])

  return <div ref={containerRef} />
}

const MatplotlibHistogram = forwardRef<SVGSVGElement, { width: number; height: number }>(
  function MatplotlibHistogram({ width, height }, ref) {
    const bins = [2, 3, 4, 5, 6, 7, 8, 9, 10]
    const counts = [4, 12, 18, 22, 26, 20, 14, 8, 3]
    const maxCount = Math.max(...counts)
    const margin = { top: 16, right: 16, bottom: 36, left: 44 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom
    const barW = innerW / bins.length

    return (
      <svg ref={ref} width={width} height={height} xmlns="http://www.w3.org/2000/svg">
        <rect width={width} height={height} fill="white" />
        <g transform={`translate(${margin.left},${margin.top})`}>
          {counts.map((count, i) => {
            const barH = (count / maxCount) * innerH
            return (
              <rect
                key={bins[i]}
                x={i * barW + 1}
                y={innerH - barH}
                width={barW - 2}
                height={barH}
                fill="steelblue"
                stroke="none"
              />
            )
          })}
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="black" strokeWidth={1} />
          <line x1={0} y1={0} x2={0} y2={innerH} stroke="black" strokeWidth={1} />
          <text x={innerW / 2} y={innerH + 28} textAnchor="middle" fontSize={12} fontFamily="DejaVu Sans, sans-serif">
            Eruption duration (min)
          </text>
          <text
            x={-innerH / 2}
            y={-32}
            textAnchor="middle"
            fontSize={12}
            fontFamily="DejaVu Sans, sans-serif"
            transform="rotate(-90)"
          >
            Count
          </text>
        </g>
      </svg>
    )
  },
)

export function MatplotlibChartRenderer({ sessionId }: ChartRendererProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    setSessionSvg(sessionId, svgRef.current)
  }, [sessionId])

  return <MatplotlibHistogram ref={svgRef} width={400} height={200} />
}
