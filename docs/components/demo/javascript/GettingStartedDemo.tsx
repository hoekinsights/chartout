'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import embed, { type Result } from 'vega-embed'
import { createChartoutModel } from 'chartout'
import { ChartoutWidget } from 'chartout/react'
import { openWithViz } from 'chartout/store'
import spec from '../../../public/barley-trail.json'

const EMBED_OPTIONS = {
  actions: { export: { svg: true, png: true }, source: false, compiled: false, editor: false },
  renderer: 'svg' as const,
}

const CHART_TITLE = 'Barley Yield'

// Shared model so StorePreview (below the second code block) stays in sync.
const sharedModel = createChartoutModel({})

/** Serialize a vega view to an <svg> element for the store to rasterise. */
async function viewToSvg(result: Result): Promise<SVGSVGElement | null> {
  const svgString = await result.view.toSVG()
  return new DOMParser().parseFromString(svgString, 'image/svg+xml').querySelector('svg')
}

/** Keep one vega-embed actions menu when Strict Mode leaves duplicates behind. */
function cleanupActionMenus(container: HTMLElement) {
  const detailsList = Array.from(container.querySelectorAll('details'))
  if (detailsList.length <= 1) return

  const withStore = detailsList.filter(d => d.querySelector('[data-open-in-store]'))
  const keep = withStore[0] ?? detailsList[detailsList.length - 1]

  for (const details of detailsList) {
    if (details !== keep) details.remove()
  }
}

/** Append an "Open in Store" entry to the vega-embed actions menu (once). */
function injectOpenInStore(container: HTMLElement, onOpen: () => void) {
  for (const actions of container.querySelectorAll<HTMLDivElement>('.vega-actions')) {
    if (actions.querySelector('[data-open-in-store]')) continue
    const details = actions.closest('details')

    const link = document.createElement('a')
    link.textContent = 'Open in Store'
    link.href = '#'
    link.dataset.openInStore = 'true'
    link.addEventListener('click', (e) => {
      e.preventDefault()
      details?.removeAttribute('open')
      onOpen()
    })
    actions.appendChild(link)
  }

  cleanupActionMenus(container)
}

export function ChartPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const modalModel = useMemo(() => createChartoutModel({}), [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let result: Result | undefined
    let active = true

    // vega-embed directly (not react-vega) so we control teardown and inject the
    // custom action exactly once — avoids the duplicate actions menu that
    // react-vega left behind on React's Strict Mode double-mount.
    void embed(el, spec as never, EMBED_OPTIONS).then(async (r) => {
      if (!active) {
        // Strict Mode: the first embed can resolve after the second mount started.
        // Only finalize the stale view — never clear innerHTML here or we wipe the
        // live chart wrapper while leaving the actions menu behind.
        r.finalize()
        cleanupActionMenus(el)
        return
      }

      result = r

      injectOpenInStore(el, async () => {
        const modalSvg = await viewToSvg(r)
        if (!modalSvg) return
        openWithViz(modalModel, modalSvg, CHART_TITLE)
        setModalOpen(true)
      })

      const svgEl = await viewToSvg(r)
      if (!active) return
      if (svgEl) openWithViz(sharedModel, svgEl, CHART_TITLE)
    })

    return () => {
      active = false
      result?.finalize()
      el.innerHTML = ''
    }
  }, [modalModel])

  return (
    <>
      <div className="not-prose chartout-vega-preview my-6" ref={containerRef} />

      {modalOpen && (
        <div
          className="not-prose chartout-store-modal-overlay"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="chartout-store-modal-panel"
            onClick={e => e.stopPropagation()}
          >
            <div className="chartout-store-modal-header">
              <span className="chartout-store-modal-title">ChartOut Store in modal</span>
              <button
                className="chartout-store-modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >×</button>
            </div>
            <div className="chartout-store-modal-body">
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
