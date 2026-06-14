# ChartOut - JavaScript Module

**Print Your Insights, Anytime, Anywhere**

> With every purchase, we donate 10% to NumFOCUS to support open-source scientific software.

**chartout** turns data visualisations into physical products, mugs, canvases, mousepads, and more.
You pass an SVG chart; the widget lets the user preview it on a 3D product model, adjust the placement, and check out. This reference implementation shows how to embed the widget in a JavaScript application outside Jupyter.

## How it works

Three steps connect your chart to the widget:

```
1. createChartoutModel()    - create the state bridge
2. mount(el, { model })     - render the widget into any DOM element
3. openWithViz(model, svg)  - rasterise your chart and push it into the widget
   openWithItem(model, id, svg)
   openWithCart(model, items)
```

## Quick start

```ts
import { createChartoutModel } from 'chartout';
import { openWithViz, openWithItem, openWithCart, svgToBytes } from 'chartout/store';

const model = createChartoutModel({});

// VizLike: rasterise and preview, user picks product inside the store
await openWithViz(model, mugSvg, 'Histogram');

// CartItem: pre-select a specific product
await openWithItem(model, 'canvas_10x10', canvasSvg, 'Scatter density');

// Cart: fill the cart with several products at once
const [canvasBytes, mugBytes, mousepadBytes] = await Promise.all([
  svgToBytes(canvasSvg), svgToBytes(mugSvg), svgToBytes(mousepadSvg),
]);
openWithCart(model, [
  { id: 'canvas_10x10',       name: 'Canvas (10x10)',  quantity: 1, placements: [{ id: 'default', content: canvasBytes   }] },
  { id: 'mug_black_11oz',     name: 'Mug (11 oz)',     quantity: 1, placements: [{ id: 'default', content: mugBytes      }] },
  { id: 'mousepad_white_8x7', name: 'Mousepad (8x7)',  quantity: 2, placements: [{ id: 'default', content: mousepadBytes }] },
]);
```

## Widget state

| Key | Direction | Type | Description |
|-----|-----------|------|-------------|
| `cart` | -> | `CartItem[]` | Products in the cart |
| `active_item` | -> | `ActiveItem \| null` | Item shown in the 3D viewer, placements carry the PNG bytes |
| `view` | -> | `'cart' \| 'checkout'` | Which store view to show |
| `shipping_location` | -> | `ShippingLocation` | Pre-fills the checkout country/state selector |
| `active_texture` | <- | `ActiveTexture \| null` | Composite texture rendered by the widget |

## Rasterising SVG charts

Pass your SVG element directly to `svgToBytes`. It converts it to a high-resolution PNG
for printing. The chart's proportions, axes, and layout are untouched; only the pixel
output size increases.

```ts
import { svgToBytes } from 'chartout/store';

const bytes = await svgToBytes(mySvgElement);       // PNG at 3000 px on the long edge
const bytes = await svgToBytes(mySvgElement, 4000); // same chart, more pixels
```

## Product placement ratios

Use `GET /v1/products` to discover the placement aspect ratio for each product.
The ratio tells the widget the shape of the print area, it does **not** force
your chart into that shape.

```ts
// GET /v1/products response (excerpt)
[
  { id: 'canvas_10x10',           placements: [{ id: 'default', print_ratio: '1:1'  }] },
  { id: 'mug_black_11oz',         placements: [{ id: 'default', print_ratio: '18:7' }] },
  { id: 'mousepad_white_8x7',     placements: [{ id: 'default', print_ratio: '6:5'  }] },
  { id: 'canvas_16x32_vertical',  placements: [{ id: 'default', print_ratio: '27:50'}] },
  { id: 'canvas_16x32_horizontal',placements: [{ id: 'default', print_ratio: '50:27'}] },
  { id: 'mug_green_11oz',         placements: [{ id: 'default', print_ratio: '18:7' }] },
]
```

If you want the chart's proportions to closely match the product's placement area
(so the design fills most of the print surface), render your chart at those proportions
before passing it to `svgToBytes`:

```ts
const svg = Plot.plot({ width: 900, height: 350, ... }); // ~18:7 for a mug
const bytes = await svgToBytes(svg);
```

## Rendering

**React** - use `chartout/react` so the widget shares your app's React instance:

```tsx
import { createChartoutModel } from 'chartout';
import { ChartoutWidget } from 'chartout/react';
import { openWithViz } from 'chartout/store';

const model = createChartoutModel({});

button.onclick = () => openWithViz(model, svgElement, 'Histogram');

<ChartoutWidget model={model} style={{ width: '100%' }} />
```

**Vanilla JS / Vue / Svelte** - use `chartout/mount`:

```ts
import { createChartoutModel } from 'chartout';
import { mount } from 'chartout/mount';
import { openWithViz } from 'chartout/store';

const model = createChartoutModel({});
const { destroy } = mount(document.getElementById('store'), { model });

button.onclick = () => openWithViz(model, svgElement, 'Histogram');
```

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
| `src/examples.ts` | Product specs and code snippets for the three tabs |
| `src/charts.ts` | Observable Plot chart render functions |
| `src/faithful.json` | Old Faithful geyser data used by the charts |
| `src/main.tsx` | Vite entry point |
