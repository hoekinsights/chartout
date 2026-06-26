'use client'
import { useEffect, useMemo, useRef } from 'react'
import { createChartoutModel } from 'chartout'
import { ChartoutWidget } from 'chartout/react'
import { openWithItem } from 'chartout/store'
import { renderScatterDensity } from './charts'

export function CartItemDemo() {
  const model = useMemo(() => createChartoutModel({}), [])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const svg = renderScatterDensity(containerRef.current, 180, 180)
    openWithItem(model, 'canvas_10x10', svg, 'My Canvas (10″×10″)')
  }, [model])

  return (
    <div className="not-prose my-6 space-y-3">
      <p className="text-xs text-fd-muted-foreground uppercase tracking-wider">your chart</p>
      <div ref={containerRef} className="border border-fd-border rounded bg-white inline-block" />
      <p className="text-xs text-fd-muted-foreground uppercase tracking-wider">chartout widget</p>
      <ChartoutWidget model={model} style={{ width: '100%' }} />
    </div>
  )
}
