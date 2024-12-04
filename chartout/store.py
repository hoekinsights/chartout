import json
import pathlib
import urllib.request

import anywidget 
import traitlets

from typing import Any, Dict, Optional, Union

from .cart import Cart
from .models import ActiveItem, InitItem, CartItem
from .support import VizLike, is_viz_like, viz_to_active_item, viz_to_texture

def customizables(category: str) -> Any:
    """Retrieve a JSON object from the Chartout API for customizables based on category.

    Args:
        category (str): The category to filter the customizables.

    Returns:
        Any: The JSON response containing customizables for the specified category.
    """
    # TODO: Add category to the URL and provide support for categories in the backend
    # url = f"https://chartout.io/api/v1/products/?category={category}"  # Append category to the URL
    url = "https://chartout.io/api/v1/products/"
    with urllib.request.urlopen(url) as response:
        if response.status != 200:
            raise Exception(f"Error fetching data: {response.status}")
        data = response.read()  # Read the response data
        return json.loads(data)  # Parse and return the JSON response

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

    # Paths for JavaScript and CSS
    _esm = pathlib.Path("../chartout-app/bundle/Widget.js")
    _css = pathlib.Path("../chartout-app/bundle/styles.css")

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
        key_trait=traitlets.Unicode(), value_trait=traitlets.Bytes(), allow_none=True
    ).tag(sync=True)

    init = traitlets.Dict(
        key_trait=traitlets.Unicode(), value_trait=traitlets.Any(), allow_none=True
    ).tag(sync=True)

    def __init__(self, item: Optional[Union[Cart, VizLike]] = None, **kwargs):
        """Initialize the Store with an optional cart or a valid Altair chart.

        Args:
            item (Optional[Union[Cart, VizLike]]): An instance of the Cart class
                or an object that adheres to the VizLike type.
            **kwargs: Additional keyword arguments to be passed to the parent
                class constructor.
        """
        super().__init__(**kwargs)
        if isinstance(item, Cart):
            self.cart = [i.__dict__ for i in item.items]
            self.active_item = item.items[0].__dict__ if item.items else None  # Set active to first item in cart
            self.active_texture = None
            self.init_item = item.items[0].__dict__ if item.items else None  # Set init to first item in cart
        elif is_viz_like(item):
            self.active_item = viz_to_active_item(item).__dict__  # Convert item to ActiveItem
            self.active_texture = viz_to_texture(item, self.active_item).__dict__  # Convert item to texture
            self.init_item = None  # TODO:viz_to_init_item(item)  # Convert item to ActiveItem for init
            self.cart = None  # No cart if viz is provided
        elif item is not None:  # Check if item is neither Cart nor VizLike
            raise TypeError("item must be of type Cart or VizLike.")
        else:
            self.cart = Cart().items
            self.active_item = None
            self.active_texture = None
            self.init_item = None

    def to_json(self):
        """Serialize the widget's state to a JSON-compatible dictionary.

        Returns:
            Dict[str, Any]: A dictionary representation of the store's state,
            including the cart, active item, and initial state.
        """
        return {
            "cart": [item.__dict__ for item in self.cart.items] if self.cart else None,
            "active_item": self.active_item.__dict__ if self.active_item else None,
            "init_item": self.init_item.__dict__ if self.init_item else None,
        }

    def from_json(self, data: Dict[str, Any]):
        """Deserialize JSON data into the Store.

        This method populates the store's cart, active item, and initial state
        based on the provided JSON data.

        Args:
            data (Dict[str, Any]): A dictionary containing the serialized state
            of the store, including cart items, active item, and initial state.
        """
        if "cart" in data:
            self.cart = Cart()  # Initialize a new Cart instance
            self.cart.items = [CartItem(**item) for item in data["cart"]]
        if "active" in data:
            self.active_item = ActiveItem(**data["active"])
        if "init" in data:
            self.init_item = InitItem(**data["init"])
