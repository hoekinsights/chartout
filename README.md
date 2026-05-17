# Chartout

**Print Your Insights, Anytime, Anywhere**

<sub><sup>With every purchase, we donate 10% to NumFOCUS to support open-source scientific software.</sup></sub>

Chartout turns data visualizations into beautiful, printed products. You create a chart, pick a product, and chartout handles everything from 3D preview to order fulfilment.

## Repository Structure

```
chartout/
├── python/       ← pip installable Python package (Jupyter integration)
├── javascript/   ← reference implementation for embedding the widget in JS apps
├── pixi.toml     ← development environment
└── README.md
```

The interactive 3D widget is published separately as a closed-source npm package:
[`chartout` on npm](https://www.npmjs.com/package/chartout)

## Python

### Install

```bash
pip install chartout
```

### Quick start

```python
import chartout as co

# Create a chart
chart = co.altair_comet()

# Open the store widget in Jupyter
store = co.Store(chart)
store
```

After adding to cart in the widget, state is synchronized back to Python:

```python
store.cart            # list of cart items
store.active_texture  # rendered texture as PNG bytes
```

### Development setup

Requires [chartout-api](https://github.com/hoekinsights/chartout-api) running locally.

```bash
git clone https://github.com/mattijn/chartout.git
cd chartout
pixi install
pixi run lab        # starts Jupyter Lab in python/
pixi run test       # runs the test suite
```

API must be running at `http://localhost:8000`. See [chartout-api](https://github.com/hoekinsights/chartout-api) for setup.

## JavaScript

See [`javascript/README.md`](javascript/README.md) for how to embed the chartout widget in a JavaScript application.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
