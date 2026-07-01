import type { CartItem } from 'chartout'
import { openWithCart, openWithItem, openWithViz, svgToBytes } from 'chartout/store'
import { getSessionModel } from './session'

export type StorePattern = 'vizlike' | 'cartItem' | 'cart'

const CHART_TITLE = 'Old Faithful Eruptions'

export async function openStorePattern(sessionId: string, pattern: StorePattern, svg: SVGSVGElement) {
  const model = getSessionModel(sessionId)

  switch (pattern) {
    case 'vizlike':
      await openWithViz(model, svg, CHART_TITLE)
      break
    case 'cartItem':
      await openWithItem(model, 'mug_green_11oz', svg, 'Green Mug with my Viz')
      break
    case 'cart': {
      const bytes = await svgToBytes(svg)
      openWithCart(model, [
        {
          id: 'mug_black_11oz',
          name: 'My Mug (11 oz)',
          quantity: 2,
          placements: [{ id: 'default', content: bytes }],
        },
        {
          id: 'canvas_16x32_horizontal',
          name: 'My Canvas (16″×32″)',
          quantity: 3,
          placements: [{ id: 'default', content: bytes }],
        },
        {
          id: 'mousepad_white_8x7',
          name: 'My Mousepad (8″×7″)',
          quantity: 3,
          placements: [{ id: 'default', content: bytes }],
        },
      ] satisfies CartItem[])
      break
    }
  }
}
