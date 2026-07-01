'use client'
import { useEffect, useMemo, useRef } from 'react'
import type { CartItem } from 'chartout'
import { createChartoutModel } from 'chartout'
import { ChartoutWidget } from 'chartout/react'
import { openWithCart, svgToBytes } from 'chartout/store'
import { renderScatterDensity, renderHistogram, renderRaster } from '@/components/demo/shared/charts'

export function CartDemo() {
  const model = useMemo(() => createChartoutModel({}), [])
  const canvasRef = useRef<HTMLDivElement>(null)
  const mugRef = useRef<HTMLDivElement>(null)
  const mousepadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !mugRef.current || !mousepadRef.current) return

    const canvasSvg    = renderScatterDensity(canvasRef.current, 180, 180)
    const mugSvg       = renderHistogram(mugRef.current, 280, 108)
    const mousepadSvg  = renderRaster(mousepadRef.current, 216, 180)

    Promise.all([svgToBytes(canvasSvg), svgToBytes(mugSvg), svgToBytes(mousepadSvg)])
      .then(([canvasBytes, mugBytes, mousepadBytes]) => {
        openWithCart(model, [
          { id: 'canvas_10x10',       name: 'My Canvas (10″×10″)', quantity: 1, placements: [{ id: 'default', content: canvasBytes    }] },
          { id: 'mug_black_11oz',     name: 'My Mug (11 oz)',      quantity: 1, placements: [{ id: 'default', content: mugBytes       }] },
          { id: 'mousepad_white_8x7', name: 'My Mousepad (8″×7″)', quantity: 2, placements: [{ id: 'default', content: mousepadBytes  }] },
        ] satisfies CartItem[])
      })
  }, [model])

  return (
    <div className="not-prose my-6 space-y-3">
      <p className="text-xs text-fd-muted-foreground uppercase tracking-wider">your charts</p>
      <div className="flex gap-3 flex-wrap items-end">
        <div ref={canvasRef}   className="border border-fd-border rounded bg-white inline-block" />
        <div ref={mugRef}      className="border border-fd-border rounded bg-white inline-block" />
        <div ref={mousepadRef} className="border border-fd-border rounded bg-white inline-block" />
      </div>
      <p className="text-xs text-fd-muted-foreground uppercase tracking-wider">chartout widget</p>
      <ChartoutWidget model={model} style={{ width: '100%' }} />
    </div>
  )
}
