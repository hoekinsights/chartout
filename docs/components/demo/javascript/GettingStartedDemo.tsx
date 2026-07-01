'use client'
import { useState, useMemo, useCallback } from 'react'
import { VegaEmbed } from 'react-vega'
import type { Result } from 'vega-embed'
import { createChartoutModel } from 'chartout'
import { ChartoutWidget } from 'chartout/react'
import { openWithViz } from 'chartout/store'
import spec from '../../../public/imdb-histogram.json'

const EMBED_OPTIONS = {
  actions: { export: { svg: true, png: true }, source: false, compiled: false, editor: false },
  renderer: 'svg' as const,
}

// Shared model so StorePreview (below the second code block) stays in sync.
const sharedModel = createChartoutModel({})

function injectOpenInStore(result: Result, onOpen: () => void) {
  // result.view.container() is the inner chart div; its parent is the .vega-embed element.
  // .vega-actions is a sibling div inside the <details> that vega-embed appends.
  const embedEl = result.view.container()?.parentElement
  const actionsDiv = embedEl?.querySelector<HTMLDivElement>('.vega-actions')
  const detailsEl = actionsDiv?.closest('details')
  if (!actionsDiv) return

  const link = document.createElement('a')
  link.textContent = 'Open in Store'
  link.href = '#'
  link.addEventListener('click', (e) => {
    e.preventDefault()
    detailsEl?.removeAttribute('open')
    onOpen()
  })
  actionsDiv.appendChild(link)
}

export function ChartPreview() {
  const [modalOpen, setModalOpen] = useState(false)
  const modalModel = useMemo(() => createChartoutModel({}), [])

  const handleEmbed = useCallback((result: Result) => {
    result.view.toSVG().then(svgString => {
      const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml')
      const svgEl = doc.querySelector('svg')
      if (!svgEl) return

      // Feed the chart into the shared model for StorePreview.
      openWithViz(sharedModel, svgEl, 'IMDB Ratings')

      // Inject "Open in Store" — clicking re-fetches SVG and opens the modal.
      injectOpenInStore(result, () => {
        result.view.toSVG().then(s => {
          const d = new DOMParser().parseFromString(s, 'image/svg+xml')
          const el = d.querySelector('svg')
          if (el) {
            openWithViz(modalModel, el, 'IMDB Ratings')
            setModalOpen(true)
          }
        })
      })
    })
  }, [modalModel])

  return (
    <>
      <div className="not-prose my-6">
        <VegaEmbed spec={spec as never} options={EMBED_OPTIONS} onEmbed={handleEmbed} />
      </div>

      {modalOpen && (
        <div
          className="not-prose fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-fd-border">
              <span className="text-sm font-medium text-fd-foreground">ChartOut Store</span>
              <button
                className="text-fd-muted-foreground hover:text-fd-foreground text-lg leading-none"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >×</button>
            </div>
            <div className="p-4">
              <ChartoutWidget model={modalModel} style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function StorePreview() {
  return (
    <div className="not-prose my-6">
      <ChartoutWidget model={sharedModel} style={{ width: '100%' }} />
    </div>
  )
}
