# ChartOut - JavaScript Module

**Print Your Insights, Anytime, Anywhere**

> With every purchase, we donate 10% to NumFOCUS to support open-source scientific software.

This example shows how to embed the [chartout](https://www.npmjs.com/package/chartout)
widget in a React application without Jupyter.

## How it works

Three steps connect your chart to the widget:

```
1. createChartoutModel()  — create the state bridge
2. svgToBytes(svg, w, h)  — rasterise your chart at print resolution
3. model.set('cart', …)   — push the bytes in; the widget re-renders
   model.set('active_item', …)
```

The widget uses the [anywidget](https://anywidget.dev) model protocol. Outside Jupyter
you create the model yourself and pass it to `<ChartoutWidget>`.

## Widget state

| Key | Direction | Type | Description |
|-----|-----------|------|-------------|
| `cart` | → | `CartItem[]` | Products in the cart |
| `active_item` | → | `ActiveItem \| null` | Item shown in the 3D viewer — placements carry the PNG bytes |
| `view` | → | `'cart' \| 'checkout'` | Which store view to show |
| `shipping_location` | → | `ShippingLocation` | Pre-fills the checkout country/state selector |
| `active_texture` | ← | `ActiveTexture \| null` | Composite texture rendered by the widget |

## Quick start

```ts
import { createChartoutModel } from 'chartout';
import type { CartItem, ActiveItem } from 'chartout';
import { svgToBytes } from './rasterise';

const model = createChartoutModel({});

// Rasterise your chart at print resolution
const bytes = svgToBytes(mySvgElement, 3900, 3900);

// VizLike: preview without adding to cart
model.set('active_item', {
  id: 'canvas_10x10',
  name: 'Canvas (10″×10″)',
  placements: [{ id: 'default', content: bytes }],
} satisfies ActiveItem);

// CartItem: add to cart
model.set('cart', [{
  id: 'mug_black_11oz',
  name: 'Mug (11 oz)',
  quantity: 1,
  placements: [{ id: 'default', content: bytes }],
} satisfies CartItem]);

// Listen to cart changes (e.g. when the user updates quantities)
model.on('change:cart', () => {
  const cart = model.get('cart');
  // cart is CartItem[] — sync to your own state or trigger a checkout flow
});
```

## Rendering (React)

The widget has a fixed height and expands to fill its container's width.

```tsx
import { ChartoutWidget } from './ChartoutWidget';

<ChartoutWidget model={model} style={{ width: '100%' }} />
```

## Print dimensions

`svgToBytes(svg, width, height)` must be called at the product's exact print size:

| Variant ID | Name | Width | Height |
|------------|------|-------|--------|
| `canvas_10x10` | Canvas (10″×10″) | 3900 | 3900 |
| `canvas_16x32_vertical` | Canvas (16″×32″) Vertical | 5184 | 9600 |
| `canvas_16x32_horizontal` | Canvas (16″×32″) Horizontal | 9600 | 5184 |
| `mug_black_11oz` | Mug (Black / 11 oz) | 2700 | 1050 |
| `mug_green_11oz` | Mug (Green / 11 oz) | 2700 | 1050 |
| `mousepad_white_8x7` | Mouse Pad (White / 8.7″×7.1″) | 2700 | 2250 |

## Running the example

```bash
npm install
npm run dev
```

Open http://localhost:5174. The three tabs demonstrate the three integration
patterns: **VizLike** (preview only), **CartItem** (single product), **Cart**
(multiple products).

## File overview

| File | Purpose |
|------|---------|
| `src/App.tsx` | Tutorial, the three integration patterns end-to-end |
| `src/rasterise.ts` | `svgToBytes()` SVG to PNG via resvg-wasm |
| `src/charts.ts` | Observable Plot chart render functions |
| `src/examples.ts` | Product specs and code snippets for the three tabs |
| `src/ChartoutWidget.tsx` | React component wrapper around the chartout widget |
| `src/polyfills.ts` | `SharedArrayBuffer` polyfill required by resvg-wasm |
