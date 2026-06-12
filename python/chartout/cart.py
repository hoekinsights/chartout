from dataclasses import dataclass, asdict
from typing import Optional, List
from .models import CartItem
from .support import viz_to_cart_item, dict_to_cart_item, VizLike, is_viz_like


@dataclass
class Cart:
    """A class to represent a shopping cart containing CartItems.

    Attributes:
        items (List[CartItem]): A list of items in the cart, which can be
        CartItem instances.
    """

    items: List[CartItem]

    def __init__(self, items: Optional[List[CartItem]] = None):
        """Initialize the Cart with an optional list of items.

        Args:
            items: List of CartItem instances to initialize the cart with.
        """
        self.items: List[CartItem] = []
        if items is not None:
            self.add(items)

    def add(self, item: CartItem | List[CartItem] | VizLike) -> None:
        """Add a CartItem, a list of CartItems, or a VizLike to the cart.

        Args:
            item: A CartItem, list of CartItems, or VizLike to add.

        Raises:
            ValueError: If an item in the list is not a valid CartItem or VizLike.
        """
        if is_viz_like(item):
            # Convert VizLike to CartItem
            item = viz_to_cart_item(item)
            self.items.append(item)
        elif isinstance(item, list):
            for i in item:
                if is_viz_like(i):
                    i = viz_to_cart_item(i)
                elif isinstance(i, dict):
                    i = dict_to_cart_item(i)
                self.items.append(i)
        else:
            if isinstance(item, dict):
                item = dict_to_cart_item(item)
            self.items.append(item)

    def remove(self, *, index: int) -> None:
        """Remove a CartItem from the cart by its index.

        Args:
            index (int): The index of the item to be removed from the cart.

        Raises:
            IndexError: If the index is out of range.
        """
        if index < 0 or index >= len(self.items):
            raise IndexError("Index out of range.")
        del self.items[index]

    def __repr__(self) -> str:
        if not self.items:
            return "Cart(empty)"
        lines = (
            f"  - ID: {item.id}\n"
            f"    Name: {item.name or 'Unnamed'}\n"
            f"    Quantity: {item.quantity}\n"
            f"    Placements: [{', '.join(repr(p) for p in item.placements)}]"
            for item in self.items
        )
        return "Cart:\n" + "\n".join(lines)

    def to_dict(self):
        return asdict(self)
