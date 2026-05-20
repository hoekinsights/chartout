# chartout — Python package

**Print Your Insights, Anytime, Anywhere**

<sub><sup>With every purchase, we donate 10% to NumFOCUS to support open-source scientific software.</sup></sub>

Chartout turns data visualizations into beautiful, printed products. You create a chart, pick a product, and chartout handles everything from 3D preview to order fulfilment.

## Install

```bash
pip install chartout
```

## Quick start

```python
import altair as alt
import chartout

chart = alt.Chart(data).mark_point().encode(x='x', y='y')
store = chartout.Store(chart)
store  # renders the interactive widget in Jupyter
```

After adding to cart in the widget, state is synchronized back to Python:

```python
store.cart            # list of cart items
store.active_texture  # rendered texture as PNG bytes
```

## Development setup

Requires [chartout-api](https://github.com/hoekinsights/chartout-api) running locally.

```bash
git clone https://github.com/mattijn/chartout.git
cd chartout
pixi install
pixi run lab        # starts Jupyter Lab in python/
pixi run test       # runs the test suite
```

API must be running at `http://localhost:8000`. See [chartout-api](https://github.com/hoekinsights/chartout-api) for setup.
