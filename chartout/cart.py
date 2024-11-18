from typing import Optional
from typing import List
import msgspec
from .models import CartItemStruct, CartItem


class Cart:
    """A class to represent a shopping cart containing CartItems.

    Attributes:
        items (List[CartItemStruct | CartItem]): A list of items in the cart, which can be
        CartItemStruct instances or dictionaries conforming to CartItem.
    """

    def __init__(self, items: Optional[List[CartItem]] = None):
        """Initialize the Cart with an optional list of items.

        Args:
            items (Optional[List[CartItem]]): A list of dictionaries conforming to
            CartItem to initialize the cart with.
        """
        self.items: List[CartItemStruct | CartItem] = (
            []
        )  # Initialize an empty list of CartItemStruct
        if items is not None:
            self.add(items)  # Add the provided items to the cart

    def add(self, /, item: CartItemStruct | CartItem | List[CartItem]) -> None:
        """Add a CartItemStruct or a list of CartItemDicts to the cart.

        Args:
            item (CartItemStruct | CartItem | List[CartItem]): A CartItemStruct, a CartItem,
            or a list of CartItemDicts to be added to the cart.

        Raises:
            ValueError: If an item in the list is not a valid CartItemStruct or CartItem.
        """
        if isinstance(item, list):
            for i in item:
                if not isinstance(i, msgspec.Struct):
                    i = CartItemStruct(**i)  # Convert dict to CartItemStruct if necessary
                self.items.append(i)
        else:
            if not isinstance(item, msgspec.Struct):
                item = CartItemStruct(**item)  # Convert dict to CartItemStruct if necessary
            self.items.append(item)

    def remove(self, *, index: int) -> None:
        """Remove a CartItemStruct from the cart by its index.

        Args:
            index (int): The index of the item to be removed from the cart.

        Raises:
            IndexError: If the index is out of range.
        """
        if index < 0 or index >= len(self.items):
            raise IndexError("Index out of range.")
        del self.items[index]

    def items(self) -> List[CartItemStruct]:
        """Return the list of CartItems in the cart.

        Returns:
            List[CartItemStruct]: A list of CartItems currently in the cart.
        """
        return self.items

    def __repr__(self) -> str:
        """Return a string representation of the Cart.

        Returns:
            str: A string representation of the Cart, including item names, codes, and
            quantities.
        """
        if not self.items:
            return "Cart(empty)"
        items_repr = ", ".join(
            f"{item['name']} (Code: {item['code']}, Quantity: {item['quantity']})"
            for item in self.items
        )
        return f"Cart([{items_repr}])"
