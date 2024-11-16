from typing import Any, TypedDict, List, Optional, Union
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
    # _esm = "https://chartout.io/bundle/Widget.js"
    # _css = "https://chartout.io/bundle/styles.css"

    _esm = pathlib.Path("../chartout-app/bundle/Widget.js")
    _css = pathlib.Path("../chartout-app/bundle/styles.css")

    value = traitlets.Int(0).tag(sync=True)
    cart = traitlets.List(
        traitlets.Dict(
            key_trait=traitlets.Unicode(),
            value_trait=traitlets.Union([
                traitlets.Unicode(),  # For 'name', 'code', 'image'
                traitlets.Int()       # For 'quantity'
            ])
        ),
        allow_none=True,  # Allow this traitlet to be None
        default_value=None  # Default to None to indicate it's optional
    ).tag(sync=True)

    active = traitlets.Union([
        traitlets.Dict(
            key_trait=traitlets.Unicode(),
            value_trait=traitlets.Union([
                traitlets.Unicode(),  # For 'name', 'code', 'image'
                traitlets.Unicode(),  # For 'texture'
            ])
        ),
        traitlets.Any()  # Allow None as a valid value
    ]).tag(sync=True)

    # Optionally, you can add type hints for the traitlets
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.cart: Optional[List[CartItem]] = None
        self.active: Optional[ActiveItem] = None
