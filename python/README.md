# ChartOut - Python package

**Print Your Insights, Anytime, Anywhere**

> With every purchase, we donate 10% to NumFOCUS to support open-source scientific software.

ChartOut turns data visualizations into beautiful, printed products. You create a chart, pick a product, and chartout handles everything from 3D preview to order fulfilment.

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

![ChartOut store widget](../images/store.png)

## Discover products

```python
chartout.products()  # returns a list of available product dicts with id, name, and placements
```

> ```
> [{'name': 'Mouse Pad (White / 8.7″x7.1″)',
>   'id': 'mousepad_white_8x7',
>   'placements': [{'id': 'default', 'print_ratio': '6:5'}]},
>  {'name': 'Canvas (10″x10″)',
>   'id': 'canvas_10x10',
>   'placements': [{'id': 'default', 'print_ratio': '1:1'}]},
>  {'name': 'Canvas (16″x32″) Vertical',
>   'id': 'canvas_16x32_vertical',
>   'placements': [{'id': 'default', 'print_ratio': '27:50'}]},
>  {'name': 'Canvas (16″x32″) Horizontal',
>   'id': 'canvas_16x32_horizontal',
>   'placements': [{'id': 'default', 'print_ratio': '50:27'}]},
>  {'name': 'Ceramic Mug with Color Inside (Black / 11 oz)',
>   'id': 'mug_black_11oz',
>   'placements': [{'id': 'default', 'print_ratio': '18:7'}]},
>  {'name': 'Ceramic Mug with Color Inside (Green / 11 oz)',
>   'id': 'mug_green_11oz',
>   'placements': [{'id': 'default', 'print_ratio': '18:7'}]}]
> ```

Use the `id` values (e.g. `'mug_black_11oz'`, `'canvas_16x32_horizontal'`) as the first argument to `chartout.item()`.

## Create an item

`chartout.item()` wraps a chart and a product into a `CartItem`:

```python
item = chartout.item('mug_green_11oz', chart)
item
```

> ```
> CartItem(id='mug_green_11oz', name='Green Mug with my Viz', placements=[default], quantity=1)
> ```

The product id is validated against the API by default. Pass `validate=False` to skip the check when the id is already known.

### Positioning

Control where the chart lands on the product via shorthand kwargs or an explicit `PlacementPosition`:

```python
# shorthand — forwarded directly to PlacementPosition
item = chartout.item('mug_black_11oz', chart, horizontal='left', vertical='middle', scale=0.9)

# explicit
pos = chartout.PlacementPosition(
    horizontal='left',   # 'left' | 'center' | 'right'  (default: 'center')
    vertical='middle',   # 'top'  | 'middle' | 'bottom' (default: 'middle')
    scale=0.9,           # relative scale, optional
    dx=0.05,             # horizontal offset, optional
    dy=-0.02,            # vertical offset, optional
)
item = chartout.item('mug_black_11oz', chart, position=pos)
```

| Parameter | Values | Default |
|---|---|---|
| `horizontal` | `'left'`, `'center'`, `'right'` | `'center'` |
| `vertical` | `'top'`, `'middle'`, `'bottom'` | `'middle'` |
| `scale` | float | — |
| `dx` | float | — |
| `dy` | float | — |

## Build a cart

Group multiple items before opening the store:

```python
cart = chartout.Cart([
    chartout.item('mug_black_11oz',          chart, horizontal='left',  quantity=2),
    chartout.item('canvas_16x32_horizontal', chart, horizontal='right', quantity=3),
    chartout.item('mousepad_white_8x7',      chart, horizontal='right', quantity=3),
])
cart  # prints a summary of all items
```

> ```
> Cart:
>   - ID: mug_black_11oz
>     Name: mug_black_11oz
>     Quantity: 2
>     Placements: [default (middle, left)]
>   - ID: canvas_16x32_horizontal
>     Name: canvas_16x32_horizontal
>     Quantity: 3
>     Placements: [default (middle, right)]
>   - ID: mousepad_white_8x7
>     Name: mousepad_white_8x7
>     Quantity: 3
>     Placements: [default (middle, right)]
> ```

Add or remove items after creation:

```python
cart.add(another_item)   # append a CartItem
cart.remove(index=0)     # remove by position
```

## Open the store widget

Pass a single `CartItem`, a `Cart`, or a raw chart:

```python
store = chartout.Store(item)   # single item
store = chartout.Store(cart)   # full cart
store = chartout.Store(chart)  # raw chart (no product selected yet)
store
```

| Parameter | Values | Default | Description |
|---|---|---|---|
| `view` | `'cart'`, `'checkout'` | `'cart'` | Starting view |
| `shipping_location` | `{'country': 'NL'}` | — | Pre-fills country/state in checkout |

```python
store = chartout.Store(item, view='checkout', shipping_location={'country': 'NL'})
store
```

Add items to an open store without reopening it:

```python
store.add_item(another_item)  # syncs to the widget immediately
store.cart                    # current cart state as a list of dicts
```

## Supported chart types

| Library | Type | Status |
|---|---|---|
| [Altair](https://altair-viz.github.io) | `alt.Chart` and all chart types | supported |
| [matplotlib](https://matplotlib.org) | `Figure` (including seaborn) | supported |
| [Plotly](https://plotly.com/python/) | `go.Figure` | coming soon |
| [pyobsplot](https://juba.github.io/pyobsplot/) | `ObsplotWidget` | coming soon |
| raw image | `bytes` or `bytearray` | supported |
