import json
import urllib.request
from enum import StrEnum
from typing import Any, Dict, Optional, TypedDict, Union

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


class Theme(TypedDict, total=False):
    """Optional widget theme. Every field maps to a ``--chartout-*`` CSS variable.

    Pass to ``Store(theme=...)``. Omitted fields fall back to the built-in
    defaults. All values are CSS strings (e.g. ``"#db2777"``, ``"12px"``,
    ``"'Inter', system-ui, sans-serif"``).

    Fields (default):
        font: Base font family (``system-ui, sans-serif``).
        accent: Primary button / active colour (``#4f46e5``).
        accent_hover: Primary button hover colour (``#4338ca``).
        accent_fg: Text colour on accent background (``#ffffff``).
        border_color: Borders / dividers (``#e0e0e0``).
        border_width: Outer widget border width (``1px``).
        radius: Outer widget corner radius (``8px``).
        shadow: Outer widget box-shadow (``none``).
        surface: Panel / card background (``#f8f9fa``).
        viewer_bg: 3-D viewer canvas background (``#f5f5f5``).
        fg: Primary text colour (``#374151``).
        fg_muted: Secondary / muted text colour (``#6b7280``).
        font_size: Base body text size (``14px``).
        font_size_heading: Section heading size (``16px``).
        font_size_status: Status / helper / label size (``12px``).
        font_size_button: Button text size (``14px``).
        font_weight: Body font weight (``400``).
        font_weight_heading: Heading font weight (``600``).
        line_height: Base line height (``1.4``).

    Example:
        >>> import chartout
        >>> chartout.Store(theme={"accent": "#db2777", "radius": "12px"})
    """

    font: str
    accent: str
    accent_hover: str
    accent_fg: str
    border_color: str
    border_width: str
    radius: str
    shadow: str
    surface: str
    viewer_bg: str
    fg: str
    fg_muted: str
    font_size: str
    font_size_heading: str
    font_size_status: str
    font_size_button: str
    font_weight: str
    font_weight_heading: str
    line_height: str


# Allowed theme keys, mirrors Theme above; used to reject typos at runtime.
_THEME_KEYS = frozenset(Theme.__annotations__)


def _theme_to_css(theme: Optional[Theme]) -> str:
    """Build a scoped CSS rule overriding `--chartout-*` vars from a Theme dict.

    Targets `[data-chartout-widget]` (the widget container) so the overrides win
    over the runtime `:root` defaults and stay scoped to this widget.
    """
    if not theme:
        return ""
    unknown = set(theme) - _THEME_KEYS
    if unknown:
        raise ValueError(
            f"Unknown theme key(s): {sorted(unknown)}. "
            f"Valid keys: {sorted(_THEME_KEYS)}."
        )
    decls = "".join(
        f"  --chartout-{key.replace('_', '-')}: {value};\n"
        for key, value in theme.items()
    )
    return f"[data-chartout-widget] {{\n{decls}}}\n"


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
    _css = ""

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


    def __init__(
        self,
        item: Optional[Union[Cart, CartItem, VizLike]] = None,
        *,
        view: Union[StoreView, str] = StoreView.CART,
        shipping_location: Optional[Dict[str, str]] = None,
        theme: Optional[Theme] = None,
        **kwargs,
    ):
        """Initialize the Store widget.

        Args:
            item: Cart, CartItem, or VizLike (chart/figure) to display.
            view: Initial view, either `'cart'` (default) or `'checkout'`.
            shipping_location: Pre-fills country/state in checkout,
                e.g. `{'country': 'NL'}` or `{'country': 'US', 'state': 'CA'}`.
            theme: Optional look-and-feel overrides. Each key maps to a
                `--chartout-*` CSS variable, e.g.
                `{'accent': '#db2777', 'radius': '12px'}`. See `Theme`.
        """
        super().__init__(**kwargs)
        if theme is not None:
            self._css = _theme_to_css(theme)
        # Open checkout URL from kernel-side
        self.on_msg(self._handle_frontend_msg)
        self.view = view
        if shipping_location is not None:
            self.shipping_location = shipping_location
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

    def _handle_frontend_msg(self, _widget: Any, content: Any, _buffers: Any) -> None:
        """Handle messages sent from the widget front-end via model.send()."""
        if not isinstance(content, dict):
            return
        # Open checkout URL from kernel-side
        if content.get("type") == "open_url":
            url = content.get("url")
            if isinstance(url, str) and url.startswith(("https://")):
                import webbrowser

                webbrowser.open(url)

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


def products(*, store: Optional[str] = None) -> list[dict]:
    """Return available products from the ChartOut API.

    Args:
        store: Override the default API URL. Defaults to the ChartOut product catalogue.

    Result is cached per URL.
    """
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
