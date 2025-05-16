# chartout

**Print Your Insights, Anytime, Anywhere**

<sub><sup>With every purchase, we donate 10% to NumFOCUS to support open-source scientific software.</sup></sub>

Chartout is the Python gateway for turning your data visualizations into beautiful, printed products. This library allows you to create, customize, and purchase printed products featuring your Vega-Altair charts directly from your Jupyter notebook or other Python environments.

## System Requirements

The chartout package requires two additional services to be running:

1. **Backend API** (`chartout-api`):
   - Provides REST API endpoints for product information and order processing
   - Must be running locally during development
   - Future: will be deployed to Azure in production

2. **Frontend Application** (`chartout-app`):
   - Provides the interactive 3D product preview and customization interface
   - Must be running locally during development
   - Serves the widget bundle that is loaded by the Python package
   - Future: will be deployed to NPM in production

## Installation

### Using Pixi (Recommended)

The recommended way to install and develop chartout is using Pixi:

```bash
# Clone the repository
git clone https://github.com/hoekinsights/chartout.git
cd chartout

# Install dependencies and create environment
pixi install

# Start Jupyter Lab
pixi run lab
```

### Required Services Setup

Before using the chartout package, ensure both required services are running:

1. Start the backend API:
```bash
cd ../chartout-api
pixi install
pixi run start
```

2. Start the frontend application:
```bash
cd ../chartout-app
pixi install
pixi run npm-install
pixi run npm-dev
```

### Using pip

Alternatively, you can install the package with pip:

```bash
pip install chartout
```

Note: When using pip, you still need to ensure the backend API and frontend application are running.

## Basic Usage

### Steps to Create and Purchase Your Printed Visualization

1. **Create**: Start by defining your Vega-Altair visualization chart.
2. **Preview**: Open the Chartout Store widget and view how your visualization looks on various products, in 3D.
3. **Customize and Add to Cart**: Select your preferred product, customize it with your chart, and add it to your cart.
4. **Checkout**: When ready, proceed to checkout to securely complete your purchase.

Here's a complete example:

```python
import chartout

# Create an example chart
chart = chartout.altair_comet()  # example chart
chart

# Launch the store widget
store = chartout.Store(chart)
store

# After adding to cart in the application (React state), it's synchronized to Python
store.cart  # synchronized

# Inspect texture of active cart item in application
from IPython.display import Image as IPythonImage
texture_data = store.active_texture['texture']
IPythonImage(texture_data, width=300)
```

## Development

### Pixi Tasks

The project uses Pixi for dependency management and development tasks:

- `pixi run lab`: Start Jupyter Lab for development
- `pixi run test`: Run the test suite

### Development Workflow

1. **Setup Development Environment**:
   - Start all required services (API and frontend)
   - Start Jupyter Lab with `pixi run lab`
   - Create a new notebook for testing

2. **Testing the Widget**:
   - Import the chartout package
   - Create a test chart using `chartout.altair_comet()` or your own chart
   - Create a Store instance to launch the widget
   - Test widget interactions and state synchronization
   - Verify cart updates and texture generation

3. **Debugging**:
   - Use the browser's developer tools to inspect the widget
   - Check the Python console for backend errors
   - Monitor the API logs for request/response issues

### Dependencies

The project uses the following key dependencies:
- `altair` for visualization
- `anywidget` for Jupyter widgets
- `numpy` for numerical operations
- `pillow` for image processing
- `pandas` for data manipulation
- `vega_datasets` for example datasets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
