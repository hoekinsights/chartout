'use client'
import { useEffect, useRef, useState } from 'react'
import type { CartItem } from 'chartout'
import { createChartoutModel } from 'chartout'
import { ChartoutWidget } from 'chartout/react'
import { openWithCart, openWithItem, openWithViz, svgToBytes } from 'chartout/store'
import {
  renderHistogram, renderScatterDensity, renderRaster,
  renderHistogramECharts, renderScatterDensityECharts, renderRasterECharts,
} from '@/components/demo/shared/charts'

type Library = 'plot' | 'echarts'
type Pattern = 'vizlike' | 'cartItem' | 'cart'
type ChartoutModel = ReturnType<typeof createChartoutModel>

// Per-session state shared between a <ChartOutput> and its <StoreOutput>.
type Session = { model: ChartoutModel; svgs: SVGSVGElement[]; listeners: Set<() => void> }
const sessions = new Map<string, Session>()

function getSession(id: string): Session {
  let s = sessions.get(id)
  if (!s) {
    s = { model: createChartoutModel({}), svgs: [], listeners: new Set() }
    sessions.set(id, s)
  }
  return s
}

function setSessionSvgs(id: string, svgs: SVGSVGElement[]) {
  const s = getSession(id)
  s.svgs = svgs
  s.listeners.forEach((l) => l())
}

const RENDERERS = {
  plot: { histogram: renderHistogram, scatter: renderScatterDensity, raster: renderRaster },
  echarts: { histogram: renderHistogramECharts, scatter: renderScatterDensityECharts, raster: renderRasterECharts },
} as const

const CELL = 'inline-block [&_svg]:block'

/** Renders the chart(s) for a session: one for viz/cartItem, three for cart. */
export function ChartOutput({ sessionId, library = 'plot', pattern }: { sessionId: string; library?: Library; pattern: Pattern }) {
  const c1 = useRef<HTMLDivElement>(null)
  const c2 = useRef<HTMLDivElement>(null)
  const c3 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const r = RENDERERS[library]
    if (pattern === 'cart') {
      if (!c1.current || !c2.current || !c3.current) return
      setSessionSvgs(sessionId, [
        r.scatter(c1.current, 180, 180),   // canvas
        r.histogram(c2.current, 280, 108), // mug
        r.raster(c3.current, 216, 180),    // mousepad
      ])
    } else if (pattern === 'cartItem') {
      if (!c1.current) return
      setSessionSvgs(sessionId, [r.scatter(c1.current, 240, 240)])
    } else {
      if (!c1.current) return
      setSessionSvgs(sessionId, [r.histogram(c1.current, 400, 220)])
    }
  }, [sessionId, library, pattern])

  return (
    <div className="not-prose my-6">
      {pattern === 'cart' ? (
        <div className="flex gap-3 flex-wrap items-end">
          <div ref={c1} className={CELL} />
          <div ref={c2} className={CELL} />
          <div ref={c3} className={CELL} />
        </div>
      ) : (
        <div ref={c1} className={CELL} />
      )}
    </div>
  )
}

function useSessionSvgs(sessionId: string) {
  const [svgs, setSvgs] = useState<SVGSVGElement[]>(() => getSession(sessionId).svgs)
  useEffect(() => {
    const s = getSession(sessionId)
    const listener = () => setSvgs([...getSession(sessionId).svgs])
    s.listeners.add(listener)
    listener()
    return () => { s.listeners.delete(listener) }
  }, [sessionId])
  return svgs
}

// Docs demos rasterise several charts at once; keep resolution modest so
// parallel canvas work stays within browser memory limits.
const DEMO_RASTER_LONG_EDGE = 1200

async function rasteriseSvgs(svgs: SVGSVGElement[]): Promise<Uint8Array[]> {
  const bytes: Uint8Array[] = []
  for (const svg of svgs) {
    bytes.push(await svgToBytes(svg, DEMO_RASTER_LONG_EDGE))
  }
  return bytes
}

async function openStore(model: ChartoutModel, pattern: Pattern, svgs: SVGSVGElement[]) {
  if (pattern === 'vizlike') {
    await openWithViz(model, svgs[0], 'Old Faithful Eruptions')
  } else if (pattern === 'cartItem') {
    await openWithItem(model, 'canvas_10x10', svgs[0], 'My Canvas (10″×10″)')
  } else {
    const [canvas, mug, mousepad] = await rasteriseSvgs(svgs)
    openWithCart(model, [
      { id: 'canvas_10x10',       name: 'My Canvas (10″×10″)', quantity: 1, placements: [{ id: 'default', content: canvas }] },
      { id: 'mug_black_11oz',     name: 'My Mug (11 oz)',      quantity: 1, placements: [{ id: 'default', content: mug }] },
      { id: 'mousepad_white_8x7', name: 'My Mousepad (8″×7″)', quantity: 2, placements: [{ id: 'default', content: mousepad }] },
    ] satisfies CartItem[])
  }
}

/** Renders the store widget for a session once its chart(s) are available. */
export function StoreOutput({ sessionId, pattern }: { sessionId: string; pattern: Pattern }) {
  const svgs = useSessionSvgs(sessionId)
  const model = getSession(sessionId).model
  const ready = pattern === 'cart' ? svgs.length >= 3 : svgs.length >= 1
  const openedRef = useRef(false)

  useEffect(() => {
    if (!ready || openedRef.current) return
    openedRef.current = true
    const currentSvgs = getSession(sessionId).svgs
    void openStore(model, pattern, currentSvgs).catch((err) => {
      openedRef.current = false
      console.error('chartout docs demo: failed to open store', err)
    })
  }, [sessionId, model, pattern, ready])

  return (
    <div className="not-prose my-6">
      <ChartoutWidget model={model} style={{ width: '100%' }} />
    </div>
  )
}
