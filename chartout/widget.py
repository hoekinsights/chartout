from typing import TypedDict, Optional, List
import anywidget
import traitlets
import pathlib


class CartItem(TypedDict):
    name: str
    code: str
    image: str  # base64 string
    quantity: int


class ActiveItem(TypedDict):
    name: str
    code: str
    image: str  # base64 string
    texture: Optional[str]  # Holds the texture value, can be None


class Store(anywidget.AnyWidget):

    # Paths for JavaScript and CSS
    _esm = pathlib.Path("../chartout-app/bundle/Widget.js")
    _css = pathlib.Path("../chartout-app/bundle/styles.css")

    # Traitlets
    cart = traitlets.List(
        trait=traitlets.Dict(
            key_trait=traitlets.Unicode(),  # Key names must be strings
            value_trait=traitlets.Union(  # Value type enforcement for CartItem structure
                [
                    traitlets.Unicode(),  # For 'name', 'code', 'image'
                    traitlets.Int(),  # For 'quantity'
                ]
            ),
        ),
        allow_none=True,  # Allow the cart to be None
        default_value=None,
    ).tag(sync=True)

    active = traitlets.Dict(
        key_trait=traitlets.Unicode(),
        value_trait=traitlets.Union(
            [
                traitlets.Unicode(),  # For 'name', 'code', 'image', 'texture'
            ]
        ),
        allow_none=True,  # Allows `None` in addition to the dictionary
    ).tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Explicit type annotations for internal state
        self.cart: Optional[List[CartItem]] = None  # Allow `None` for the cart
        self.active: Optional[ActiveItem] = None  # Allow `None` for the active item

    def to_json(self):
        """Serialize the widget's state to a JSON-compatible dictionary."""
        return {"cart": self.cart, "active": self.active}

    # Additional methods and logic here
