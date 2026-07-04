import type { CartItem } from 'chartout'
import { openWithCart, openWithItem, openWithViz, svgToBytes } from 'chartout/store'
import { getSessionModel } from './session'

export type StorePattern = 'vizlike' | 'cartItem' | 'cart'

const CHART_TITLE = 'Palmer Penguins'

export async function openStorePattern(sessionId: string, pattern: StorePattern, svgs: SVGSVGElement[]) {
  const model = getSessionModel(sessionId)

  switch (pattern) {
    case 'vizlike':
      await openWithViz(model, svgs[0], CHART_TITLE)
      break
    case 'cartItem':
      // Square scatter → square canvas (1:1), scaled to 0.8 to match the docs `scale=0.8`.
      await openWithItem(model, 'canvas_10x10', svgs[0], 'My Canvas (10″×10″)', {
        position: { scale: 0.8 },
      })
      break
    case 'cart': {
      // scatter → canvas (1:1), histogram → mug (18:7), raster → mousepad (6:5).
      const [canvasBytes, mugBytes, mousepadBytes] = await Promise.all([
        svgToBytes(svgs[0]),
        svgToBytes(svgs[1]),
        svgToBytes(svgs[2]),
      ])
      openWithCart(model, [
        { id: 'canvas_10x10', name: 'My Canvas (10″×10″)', quantity: 1, placements: [{ id: 'default', content: canvasBytes }] },
        { id: 'mug_black_11oz', name: 'My Mug (11 oz)', quantity: 2, placements: [{ id: 'default', content: mugBytes }] },
        { id: 'mousepad_white_8x7', name: 'My Mousepad (8″×7″)', quantity: 2, placements: [{ id: 'default', content: mousepadBytes }] },
      ] satisfies CartItem[])
      break
    }
  }
}
