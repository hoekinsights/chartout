import json
import pathlib
import urllib.request

import anywidget 
import msgspec
import traitlets

from typing import Any, Dict, Optional, Union

from .cart import Cart
from .models import ActiveItemStruct, InitItemStruct
from .support import VizLike

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

    active = traitlets.Dict(
        key_trait=traitlets.Unicode(), value_trait=traitlets.Any(), allow_none=True
    ).tag(sync=True, read_only=True)

    init = traitlets.Dict(
        key_trait=traitlets.Unicode(), value_trait=traitlets.Any(), allow_none=True
    ).tag(sync=True, read_only=True)

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
            self.cart: Optional[Cart] = item  # Initialize cart
            self.active = self.cart[0] if self.cart else None  # Set active to first item in cart
            self.init = self.cart[0] if self.cart else None  # Set init to first item in cart
        elif isinstance(item, VizLike):
            self.active: Optional[ActiveItemStruct] = item  # Set active to the VizLike item
            self.init: Optional[InitItemStruct] = item  # Set init to the VizLike item
            self.cart: Optional[Cart] = None  # No cart if viz is provided
        else:
            self.cart: Optional[Cart] = None
            self.active: Optional[ActiveItemStruct] = None
            self.init: Optional[InitItemStruct] = None

    def to_json(self):
        """Serialize the widget's state to a JSON-compatible dictionary.

        Returns:
            Dict[str, Any]: A dictionary representation of the store's state,
            including the cart, active item, and initial state.
        """
        return {
            "cart": self.cart.to_json() if self.cart else None,
            "active": msgspec.encode(self.active) if self.active else None,
            "init": msgspec.encode(self.init) if self.init else None,
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
            self.cart.from_json(data["cart"])  # Populate the cart from JSON
        if "active" in data:
            self.active = msgspec.decode(ActiveItemStruct, data["active"])
        if "init" in data:
            self.init = msgspec.decode(InitItemStruct, data["init"])
