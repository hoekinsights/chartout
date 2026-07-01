'use client'
import { useEffect, useMemo, useRef } from 'react'
import { createChartoutModel } from 'chartout'
import { ChartoutWidget } from 'chartout/react'
import { openWithViz } from 'chartout/store'
import { renderHistogram } from '@/components/demo/shared/charts'

export function VizLikeDemo() {
  const model = useMemo(() => createChartoutModel({}), [])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const svg = renderHistogram(containerRef.current, 280, 108)
    openWithViz(model, svg, 'My Mug (11 oz)')
  }, [model])

  return (
    <div className="not-prose my-6 space-y-3">
      <p className="text-xs text-fd-muted-foreground uppercase tracking-wider">your chart</p>
      <div ref={containerRef} className="border border-fd-border rounded bg-white" />
      <p className="text-xs text-fd-muted-foreground uppercase tracking-wider">chartout widget</p>
      <ChartoutWidget model={model} style={{ width: '100%' }} />
    </div>
  )
}
