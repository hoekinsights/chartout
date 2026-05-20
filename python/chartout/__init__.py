__version__ = "1.0.0"

from .models import CartItem, Horizontal, Placement, PlacementPosition, Vertical
from .store import DEFAULT_STORE_URL, products, Store, StoreView
from .cart import Cart
from .support import VizLike, viz_to_active_item, item

# Hide submodules from public namespace (co.<tab> / dir(co)) to avoid
# confusion with same-named classes (e.g. co.cart vs co.Cart).
del models, store, cart, support

__all__ = [
    "DEFAULT_STORE_URL",
    "products",
    "Store",
    "StoreView",
    "CartItem",
    "Horizontal",
    "Placement",
    "PlacementPosition",
    "Vertical",
    "Cart",
    "VizLike",
    "viz_to_active_item",
    "item",
]
