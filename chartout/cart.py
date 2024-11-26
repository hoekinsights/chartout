from typing import Optional, List
from .models import CartItem


class Cart:
    """A class to represent a shopping cart containing CartItems.

    Attributes:
        items (List[CartItem]): A list of items in the cart, which can be
        CartItem instances.
    """

    def __init__(self, items: Optional[List[CartItem]] = None):
        """Initialize the Cart with an optional list of items.

        Args:
            items (Optional[List[CartItem]]): A list of dictionaries conforming to
            CartItem to initialize the cart with.
        """
        self.items: List[CartItem] = []
        if items is not None:
            self.add(items)

    def add(self, item: CartItem | List[CartItem]) -> None:
        """Add a CartItem or a list of CartItems to the cart.

        Args:
            item (CartItem | List[CartItem]): A CartItem, or a list of CartItemDicts to be added to the cart.

        Raises:
            ValueError: If an item in the list is not a valid CartItem or CartItem.
        """
        if isinstance(item, list):
            for i in item:
                if isinstance(i, dict):
                    i = CartItem(**i)  # Convert dict to CartItem if necessary
                self.items.append(i)
        else:
            if isinstance(item, dict):
                item = CartItem(**item)  # Convert dict to CartItem if necessary
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
        """Return a string representation of the Cart.

        Returns:
            str: A string representation of the Cart, including item names, codes, and
            quantities.
        """
        if not self.items:
            return "Cart(empty)"
        items_repr = ", ".join(
            f"{item.name} (Code: {item.code}, Quantity: {item.quantity})"
            for item in self.items
        )
        return f"Cart([{items_repr}])"
