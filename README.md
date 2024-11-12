# chartout

Print your Insights, Anytime. Anywhere.

<sub><sup>With every purchase, we donate 10% to NumFOCUS to support open-source scientific software.</sup></sub>

This directory contains the Python library for chartout.
The goal of chartout is to be the Python gateway for printed data viz. 

## Installation

The package can be installed as such:

```cmd
import pip install chartout
```

## Basic Usage

Procedure:
1. You have defined your Vega-Altair vizualization. It is a great vizualization and you like to share it. Printed.
2. Open your Veg-Altair Chart in the Chartout Store and insepect how your vizualization will look on on the products available. In 3D.
3. Add your product of interest including your visuzalization on it to Your Cart.
4. Click the button Proceed to Checkout to safely purchase the product(s).

Open the store as a Widget in a notebook within Jupyter, Visual Studio Code or Google Colab.

```python
import chartout

chartout.Store(chart)
```
This will open an intuitive user-interface in wich you can explore how your chart can be added on the selected products available.
The selected product can be inspected in a 3D before adding it to your cart after which you can safely checkout the product(s).

The checkout will open a separate page in your browser.

## Advanced Usage

With the approach it is possible to build up your cart programitically before inspecting and purchasing it in the store.

Procedure:
1. Retrieve the available products from the Chartout Store.
2. Assign your vizualization to a product of interest.
3. Define a Chartout Cart and add the item(s).
4. Open the Chartout Store with your cart.
5. Inspect the items in 3D and click the button Proceed to Checkout to safely purchase the product(s).

products = chartout.available_products()

cart = chartout.Cart()

with chartout.Cart() as cart:
    cart.add
