'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChartoutWidget } from 'chartout/react'
import { StaticSvgRenderer } from './chartRenderers'
import { ChartCell, StoreCell } from './NotebookOutput'
import { openStorePattern, type StorePattern } from './openStore'
import { getSessionModel, getSessionSvgs, setSessionSvgs, subscribeSessionSvgs } from './session'
import { withBasePath } from '@/lib/basePath'

export type ChartLibrary = 'altair' | 'vgplot' | 'matplotlib'

type ChartName = 'scatter' | 'andrews' | 'heatmap'

// Each store pattern shows the chart(s) whose ratios suit its product(s):
//   vizlike → one wide Andrews-curve chart; cartItem → one square scatter (canvas);
//   cart → scatter (canvas 1:1) + Andrews (mug 18:7) + heatmap (mousepad 6:5).
// Each viz renders 200px tall (see .chartout-demo-chart in globals.css).
const PATTERN_CHARTS: Record<StorePattern, ChartName[]> = {
  vizlike: ['andrews'],
  cartItem: ['scatter'],
  cart: ['scatter', 'andrews', 'heatmap'],
}

// vgplot has no pre-rendered assets yet (support is planned); reuse the Altair SVGs.
function assetSrc(library: ChartLibrary, chart: ChartName): string {
  const lib = library === 'vgplot' ? 'altair' : library
  return withBasePath(`/charts/penguins-${lib}-${chart}.svg`)
}

type PythonChartOutputProps = {
  library: ChartLibrary
  sessionId: string
  pattern: StorePattern
}

type PythonStoreOutputProps = {
  sessionId: string
  pattern: StorePattern
}

export function PythonChartOutput({ library, sessionId, pattern }: PythonChartOutputProps) {
  const charts = PATTERN_CHARTS[pattern]

  // Collect one SVG per chart, then publish to the session once all are ready.
  const collected = useRef<(SVGSVGElement | null)[]>([])
  useEffect(() => {
    collected.current = new Array(charts.length).fill(null)
  }, [sessionId, library, pattern, charts.length])

  const reportSvg = useCallback(
    (index: number, svg: SVGSVGElement) => {
      collected.current[index] = svg
      if (collected.current.every((s) => s !== null)) {
        setSessionSvgs(sessionId, collected.current as SVGSVGElement[])
      }
    },
    [sessionId],
  )

  return (
    <ChartCell>
      <div className={charts.length > 1 ? 'flex gap-3 flex-wrap items-end' : undefined}>
        {charts.map((chart, i) => (
          <div key={`${chart}-${i}`} className="min-w-0">
            <StaticSvgRenderer src={assetSrc(library, chart)} onSvg={(svg) => reportSvg(i, svg)} />
          </div>
        ))}
      </div>
    </ChartCell>
  )
}

function useSessionSvgs(sessionId: string) {
  const [svgs, setSvgs] = useState<SVGSVGElement[]>(() => getSessionSvgs(sessionId))
  useEffect(
    () => subscribeSessionSvgs(sessionId, () => setSvgs([...getSessionSvgs(sessionId)])),
    [sessionId],
  )
  return svgs
}

export function PythonStoreOutput({ sessionId, pattern }: PythonStoreOutputProps) {
  const svgs = useSessionSvgs(sessionId)
  const model = getSessionModel(sessionId)
  const needed = PATTERN_CHARTS[pattern].length
  const openedRef = useRef(false)

  useEffect(() => {
    if (svgs.length < needed || openedRef.current) return
    openedRef.current = true
    void openStorePattern(sessionId, pattern, getSessionSvgs(sessionId)).catch((err) => {
      openedRef.current = false
      console.error('chartout docs demo: failed to open store', err)
    })
  }, [sessionId, pattern, needed, svgs.length])

  return (
    <StoreCell>
      <ChartoutWidget model={model} style={{ width: '100%' }} />
    </StoreCell>
  )
}
