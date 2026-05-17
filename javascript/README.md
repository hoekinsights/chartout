# chartout — JavaScript reference implementation

This example shows how to embed the [chartout](https://www.npmjs.com/package/chartout)
widget in a JavaScript application without Jupyter.

## How it works

The chartout widget uses the [anywidget](https://anywidget.dev) model protocol to sync
state. In Jupyter this is handled automatically by traitlets. Outside Jupyter you create
a model yourself — a plain object with six methods — and pass it to the widget's render
function.

```
your app  ──→  model  ──→  chartout widget (closed source, npm)
                ↑
          active_texture
```

### State

| Key | Direction | Type | Description |
|-----|-----------|------|-------------|
| `cart` | → | `CartItem[]` | Items to show in the cart |
| `active_item` | → | `ActiveItem \| null` | Item currently shown in the 3D viewer — placements carry the PNG content |
| `init_viz` | → | `Record<number, Uint8Array> \| null` | PNG bytes per slot index — fallback when active_item placements are empty (e.g. after selecting from cart) |
| `active_texture` | ← | `ActiveTexture \| null` | Composite texture rendered by the widget |

### The model

```ts
import { createModel } from './src/model';

const model = createModel({
  cart: [{ id: 'mug_white_11oz', name: 'White 11oz Mug', quantity: 1, placements: [] }],
  active_item: {
    id: 'mug_white_11oz',
    name: 'White 11oz Mug',
    placements: [{ id: 'front', content: pngBytes }],  // Uint8Array from your chart library
  },
});

// Update the chart image at any time
model.set('active_item', { ...model.get('active_item'), placements: [{ id: 'front', content: newPngBytes }] });

// Listen to widget output
model.on('change:active_texture', () => {
  const { texture } = model.get('active_texture');
  // texture is a Uint8Array — use it to preview or upload the artwork
});
```

### Rendering (React)

```tsx
import { ChartoutWidget } from './src/ChartoutWidget';

<ChartoutWidget model={model} />
```

### Rendering (vanilla JS)

```js
import chartout from 'chartout';

const cleanup = chartout.render({
  model,
  el: document.getElementById('widget-container'),
  experimental: {},
});

// Call cleanup() to unmount
```

## Running the example

```bash
npm install
npm run dev
```

Open http://localhost:5173. The example renders a simple bar chart as a PNG,
passes it to the widget as `init_viz`, and shows the composite texture written
back by the widget in a sidebar.

## Using your own chart

Replace `renderChartAsPng` in `App.tsx` with the output of any library that
produces a PNG — Vega-Altair (via the Python bridge), D3, Chart.js, Observable Plot, etc.
The only requirement is a `Uint8Array` of PNG bytes at the right dimensions:

| Product | Width | Height |
|---------|-------|--------|
| Mug | 2700 | 1050 |
| Canvas | 3900 | 3900 |
| Poster | 3900 | 3900 |
| T-shirt | 2700 | 1050 |
| Mousepad | 2700 | 2250 |
