__version__ = "0.0.1dev"

from .develop import altair_heatmap, altair_map_selection, altair_comet
from .models import CartItem, Placement, PlacementPosition
from .store import products, Store
from .cart import Cart
from .support import VizLike, viz_to_active_item, item

# Hide submodules from public namespace (co.<tab> / dir(co)) to avoid
# confusion with same-named classes (e.g. co.cart vs co.Cart).
del develop, models, store, cart, support

__all__ = [
    "altair_heatmap",
    "altair_map_selection",
    "altair_comet",
    "products",
    "Store",
    "CartItem",
    "Placement",
    "PlacementPosition",
    "Cart",
    "VizLike",
    "viz_to_active_item",
    "item",
]
