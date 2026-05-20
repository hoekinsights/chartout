import json
import urllib.request
from enum import StrEnum
from typing import Any, Dict, Optional, Union

import anywidget
import traitlets
from traitlets import TraitType

from .cart import Cart
from .models import CartItem
from .support import (
    VizLike,
    is_viz_like,
    viz_to_active_item,
    cart_item_to_active_item,
    cart_items_to_store_list,
)


class StoreView(StrEnum):
    CART = "cart"
    CHECKOUT = "checkout"


# Helper Classes
class MemoryViewTrait(TraitType):
    """A trait type that accepts memoryview objects and converts them to bytes."""

    def validate(self, obj, value):
        if isinstance(value, memoryview):
            return bytes(value)
        elif isinstance(value, (bytes, bytearray)):
            return value
        else:
            self.error(obj, value)


# Main Classes
class Store(anywidget.AnyWidget):
    """A class representing a store widget for managing cart items.

    This class provides functionality to manage the state of a shopping cart,
    including adding, removing, and serializing cart items. It uses traitlets
    for automatic syncing with the front-end and supports JSON serialization
    for easy data interchange.

    Attributes:
        cart (Cart): An instance of the Cart class containing items currently in the cart.
        active (Dict[str, Any]): A dictionary representing the active item state.
        init (Dict[str, Any]): A read-only dictionary representing the initial
            state of the store.
    """

    _esm = "https://cdn.jsdelivr.net/npm/chartout@1/bundle/Widget.js"

    cart = traitlets.List(
        trait=traitlets.Dict(
            key_trait=traitlets.Unicode(), value_trait=traitlets.Any()
        ),
        allow_none=True,
        default_value=None,
    ).tag(sync=True)

    active_item = traitlets.Dict(
        key_trait=traitlets.Unicode(), value_trait=traitlets.Any(), allow_none=True
    ).tag(sync=True)

    active_texture = traitlets.Dict(
        key_trait=traitlets.Unicode(),
        value_trait=MemoryViewTrait(),
        allow_none=True,
        default_value=None,
        read_only=False,
    ).tag(sync=True)

    view = traitlets.Enum(
        list(StoreView), default_value=StoreView.CART
    ).tag(sync=True)

    shipping_location = traitlets.Dict(
        key_trait=traitlets.Unicode(),
        value_trait=traitlets.Unicode(),
        default_value={"country": "", "state": ""},
    ).tag(sync=True)


    def __init__(self, item: Optional[Union[Cart, CartItem, VizLike]] = None, **kwargs):
        """Initialize the Store with an optional Cart, CartItem, or VizLike (chart)."""
        super().__init__(**kwargs)
        self.active_texture = None
        if isinstance(item, Cart):
            # Serialize cart items with VizLike texture content converted to PNG bytes
            self.cart = cart_items_to_store_list(item.items)
            self.active_item = (
                cart_item_to_active_item(self.cart[0]).to_dict() if len(self.cart) > 0 else None
            )
        elif isinstance(item, CartItem):
            self.cart = cart_items_to_store_list([item])
            self.active_item = cart_item_to_active_item(self.cart[0]).to_dict()
        elif is_viz_like(item):
            self.cart = []
            self.active_item = viz_to_active_item(item).to_dict()
        elif item is not None:
            raise TypeError("item must be of type Cart, CartItem, or VizLike.")
        else:
            self.cart = []
            self.active_item = None

    def add_item(self, item: CartItem) -> None:
        """Add a CartItem to the cart, triggering a widget sync.

        Reassigns the full cart list so anywidget picks up the change.
        If the cart was empty, also sets active_item to the new entry.
        """
        if not isinstance(item, CartItem):
            raise TypeError("item must be a CartItem. Use chartout.item() to create one.")
        serialized = cart_items_to_store_list([item])
        was_empty = not self.cart
        self.cart = list(self.cart or []) + serialized
        if was_empty:
            self.active_item = cart_item_to_active_item(self.cart[0]).to_dict()

    def to_json(self):
        """Serialize the widget's state to a JSON-compatible dictionary."""
        return {
            "cart": self.cart,
            "active_item": self.active_item,
            "view": self.view,
            "shipping_location": self.shipping_location,
        }

    def from_json(self, data: Dict[str, Any]):
        """Deserialize JSON data into the Store."""
        if "cart" in data:
            from .support import dict_to_cart_item
            self.cart = Cart()
            self.cart.items = [dict_to_cart_item(item) for item in data["cart"]]
        if "active_item" in data:
            from .support import cart_item_to_active_item
            active_data = data.get("active_item")
            self.active_item = cart_item_to_active_item(active_data).to_dict()
        if "view" in data:
            self.view = data["view"]
        if "shipping_location" in data:
            self.shipping_location = data["shipping_location"]


# Functions
DEFAULT_STORE_URL = "https://api.chartout.io/v1/products/"

# Single cache: store URL -> full products response (shared by products() and ID lookups).
_products_cache: Dict[str, Any] = {}


def products(**kwargs: Any) -> Any:
    """Retrieve a JSON object from the Chartout API for products.

    Pass store=<url> in kwargs to use a different products API base URL.
    Result is cached per URL.
    """
    store = kwargs.pop("store", None)
    url = store if store is not None else DEFAULT_STORE_URL
    if url in _products_cache:
        return _products_cache[url]
    try:
        with urllib.request.urlopen(url) as response:
            if response.status != 200:
                raise Exception(f"Error fetching data: {response.status}")
            data = response.read()
            out = json.loads(data)
            _products_cache[url] = out
            return out
    except urllib.error.URLError as e:
        raise ConnectionError(f"Failed to connect to {url}: {e.reason}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON response: {e.msg}")
