# Chartout

**Print Your Insights, Anytime, Anywhere**

<sub><sup>With every purchase, we donate 10% to NumFOCUS to support open-source scientific software.</sup></sub>

Chartout is a system for turning data visualizations into beautiful, printed products. It consists of three separate repositories that work together:

## Repository Structure

```
hoekinsights/
├── chartout/           # Python package for Jupyter integration
├── chartout-api/       # Backend API service
└── chartout-app/       # Frontend application and widget
```

### Components

1. **[chartout](https://github.com/hoekinsights/chartout)** (This Repository)
   - The main Python package
   - Provides Jupyter notebook integration
   - Handles chart-to-product conversion
   - Requires both the API and frontend to be running

2. **[chartout-api](https://github.com/hoekinsights/chartout-api)**
   - FastAPI backend service
   - Manages products, orders, and payments
   - Provides REST API endpoints
   - Future: Will be deployed to Azure

3. **[chartout-app](https://github.com/hoekinsights/chartout-app)**
   - React-based frontend application
   - Provides 3D product preview
   - Handles product customization
   - Serves the widget bundle
   - Future: Will be deployed to NPM

## System Requirements

The chartout package requires two additional services to be running:

1. **Backend API** (`chartout-api`):
   - Provides REST API endpoints for product information and order processing
   - Must be running locally during development
   - Future: will be deployed to Azure in production
   - Repository: https://github.com/hoekinsights/chartout-api

2. **Frontend Application** (`chartout-app`):
   - Provides the interactive 3D product preview and customization interface
   - Must be running locally during development
   - Serves the widget bundle that is loaded by the Python package
   - Future: will be deployed to NPM in production
   - Repository: https://github.com/hoekinsights/chartout-app

## Development Setup

To set up the complete development environment:

1. **Create a directory and clone all repositories**:
   ```bash
   # Create a new directory
   mkdir hoekinsights
   cd hoekinsights

   # Clone all repositories
   git clone https://github.com/hoekinsights/chartout.git
   git clone https://github.com/hoekinsights/chartout-api.git
   git clone https://github.com/hoekinsights/chartout-app.git
   ```

2. **Set up the backend API**:
   ```bash
   cd chartout-api
   pixi install
   pixi run start
   ```

3. **Set up the frontend application**:
   ```bash
   cd chartout-app
   pixi install
   pixi run npm-install
   pixi run npm-dev
   ```

4. **Set up the Python package**:
   ```bash
   cd chartout
   pixi install
   pixi run lab
   ```

### Using pip

Alternatively, you can install the package with pip:

```bash
pip install chartout
```

Note: When using pip, you still need to ensure the backend API and frontend application are running.

## Usage Example

Once all services are running, you can use the Python package in a Jupyter notebook, that you started through the last command (`pixi run lab`):

```python
import chartout

# Create an example chart
chart = chartout.altair_comet()
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

## Development Workflow

1. **Backend Development**:
   - Work in the `chartout-api` repository
   - Use `pixi run start` for development
   - API will be available at http://127.0.0.1:8000

2. **Frontend Development**:
   - Work in the `chartout-app` repository
   - Use `pixi run npm-dev` for development
   - Widget will be served from the bundle directory

3. **Python Package Development**:
   - Work in the `chartout` repository
   - Use `pixi run lab` for development
   - Test changes in Jupyter notebooks

### Pixi Tasks

The project uses Pixi for dependency management and development tasks:

- `pixi run lab`: Start Jupyter Lab for development
- `pixi run test`: Run the test suite

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
