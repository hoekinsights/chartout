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


class Cart:
    def __init__(self):
        self.items: List[CartItem] = []  # Initialize an empty list of CartItem

    def add(self, /, item: CartItem) -> None:
        """
        Add a CartItem to the cart.

        Args:
            item (CartItem): A dictionary conforming to the CartItem structure.
                             Must contain 'name', 'code', 'image', and 'quantity'.
        
        Raises:
            ValueError: If the item does not conform to the CartItem structure.
        """
        # Validate the TypedDict structure 
        # TODO: implement this, but run currently into this error:
        # TypeError: TypedDict does not support instance and class checks

        # if not isinstance(item, CartItem):
        #     raise ValueError("Item must conform to the CartItem structure.")
        
        # For now, validate the item structure
        required_keys = {'name', 'code', 'image', 'quantity'}
        if not isinstance(item, dict) or not required_keys.issubset(item.keys()):
            raise ValueError("Item must be a dictionary with keys: 'name', 'code', 'image', and 'quantity'.")


        if not isinstance(item['quantity'], int) or item['quantity'] < 0:
            raise ValueError("Quantity must be a non-negative integer.")

        self.items.append(item)

    def remove(self, *, index: int) -> None:
        """Remove a CartItem from the cart by its index."""
        if index < 0 or index >= len(self.items):
            raise IndexError("Index out of range.")
        del self.items[index]

    def items(self) -> List[CartItem]:
        """Return the list of CartItems in the cart."""
        return self.items

    def __repr__(self) -> str:
        """Return a string representation of the Cart."""
        if not self.items:
            return "Cart(empty)"
        items_repr = ', '.join(f"{item['name']} (Code: {item['code']}, Quantity: {item['quantity']})" for item in self.items)
        return f"Cart([{items_repr}])"
