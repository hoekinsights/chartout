# chartout

**Print Your Insights, Anytime, Anywhere**

<sub><sup>With every purchase, we donate 10% to NumFOCUS to support open-source scientific software.</sup></sub>

Chartout is the Python gateway for turning your data visualizations into beautiful, printed products. This library allows you to create, customize, and purchase printed products featuring your Vega-Altair charts directly from your Jupyter notebook or other Python environments.

## Installation

Install the Chartout package with:

```bash
pip install chartout
```

## Basic Usage

### Steps to Create and Purchase Your Printed Visualization

1. **Create**: Start by defining your Vega-Altair visualization chart. This will be the visualization you’ll print.
2. **Preview**: Open the Chartout Store widget and view how your visualization looks on various products, in 3D.
3. **Customize and Add to Cart**: Select your preferred product, customize it with your chart, and add it to your cart.
4. **Checkout**: When ready, proceed to checkout to securely complete your purchase.

To launch the Chartout Store widget in a Jupyter notebook, Visual Studio Code, or Google Colab, use the following code:

```python
import chartout

# Assuming `chart` is your Vega-Altair chart object
chartout.Store(chart)
```

This will open an interactive interface where you can explore and customize how your chart appears on available products, preview the items in 3D, and add your selection to the cart. A separate browser page will open for secure checkout once you're ready.

## Advanced Usage

### Programmatically Building Your Cart

If you prefer to build your cart programmatically, follow these steps:

1. **Retrieve Customizable Products**: Get a list of products that can be customized with your chart.
2. **Assign Your Visualization**: Apply your chart to the desired product(s).
3. **Add to Cart**: Define a Chartout cart and add your customized items.
4. **Inspect and Purchase**: Open the Chartout Store with your cart for a final 3D inspection, then proceed to checkout.

#### Example Code

```python
import chartout

# Step 1: Retrieve available customizable products
products = chartout.customizables()

# Step 2: Select a product and apply your chart
selected_product = products[0]  # For example, selecting the first available product
selected_product.apply_chart(chart)

# Step 3: Define the Cart and add the customized product
cart = chartout.Cart()
cart.add(selected_product)

# Step 4: Open the store with the preloaded cart for final inspection and checkout
chartout.Store(cart)
```

This code creates a cart, adds your customized product, and opens the Chartout Store, where you can inspect each item in 3D. When satisfied, you can proceed to checkout via a secure browser page.
