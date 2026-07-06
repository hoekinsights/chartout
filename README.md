# ChartOut

**Print your insights, anytime, anywhere**

> With every purchase, ChartOut donates to NumFOCUS to support the open-source ecosystem behind your charts.

**ChartOut** converts data visualizations into print-ready products. Pass it a chart, and the embedded widget lets users preview it on a realistic 3D product, adjust placement, and complete checkout.

**Documentation:** [hoekinsights.github.io/chartout/docs](https://hoekinsights.github.io/chartout/docs)

## Highlights

- **Works with your chart library.** Python: Altair and matplotlib today; JavaScript: Observable Plot and ECharts, plus any library that renders SVG.
- **Flexible integration.** Let users pick a product, preselect one, or build the cart ahead of time.
- **Real-time 3D preview.** Interactive mockups with fine-grained placement controls.
- **Ships worldwide.** Printed on demand and delivered to most countries.

ChartOut follows a "support all, depend on none" design: only `anywidget` and `traitlets` are required on the Python side. Chart libraries are optional extras.

## Quick start

### Python / Jupyter

```bash
pip install chartout
# or: uv add chartout
```

```python
import chartout

store = chartout.Store(chart)
store  # renders the widget inline in a notebook environment
```

Preselect a product or build a cart before opening the store:

```python
item = chartout.item("mug_black_11oz", chart)
store = chartout.Store(item)
```

See [Python docs](https://hoekinsights.github.io/chartout/docs/python) for environments (JupyterLab, VS Code, etc), `Cart` patterns, and the full API.

### JavaScript / React

```bash
npm install chartout react react-dom
```

```tsx
import { createChartoutModel } from "chartout";
import { ChartoutWidget } from "chartout/react";
import { openWithViz } from "chartout/store";

const model = createChartoutModel({});

<ChartoutWidget model={model} style={{ width: "100%" }} />;

await openWithViz(model, svgElement, "My chart title");
```

The npm package also supports Vue, Svelte, and vanilla JS via `chartout/mount`. See [JavaScript docs](https://hoekinsights.github.io/chartout/docs/javascript).

![ChartOut store widget](https://www.chartout.io/images/journey/store.jpg)

## How it works

1. **Create your chart** in a notebook or web app with the tools you already use.
2. **Preview in the store.** Browse products, adjust placement on a 3D mockup.
3. **Checkout.** Payment runs in a secure hosted flow; orders are printed on demand and shipped worldwide.

For architecture and design notes, see [How it works](https://hoekinsights.github.io/chartout/docs/how-it-works) in the docs.

## Development

This repo uses [Pixi](https://pixi.sh) for local development:

```bash
pixi run lab   # JupyterLab in python/
pixi run test  # pytest
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request.
