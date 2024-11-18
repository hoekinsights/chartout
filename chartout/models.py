import msgspec
from typing import Optional, Dict
from typing_extensions import TypedDict

# Define TypedDicts for input validation
class StoreItem(TypedDict):
    name: str
    code: str
    image: str

class CartItem(StoreItem, TypedDict):
    quantity: int
    position: Optional[Dict[str, int]]
    texture: Optional[str]

# Define Msgspec models for validation
class StoreItemStruct(msgspec.Struct):
    name: str
    code: str
    image: str

class Position(TypedDict):
    width: int
    height: int
    top: int
    left: int

class PositionStruct(msgspec.Struct):
    width: int
    height: int
    top: int
    left: int

class CartItemStruct(StoreItemStruct):
    quantity: int
    position: Optional[PositionStruct | Position] = None
    texture: Optional[str] = None

    @classmethod
    def from_typed_dict(cls, data: CartItem) -> 'CartItemStruct':
        # Validate quantity
        if data['quantity'] <= 0:
            raise ValueError("Quantity must be greater than 0")
        
        # Convert position dictionary to Position instance if provided
        if data.get('position') is not None:
            if not isinstance(data['position'], msgspec.Struct):
                data['position'] = PositionStruct(**data['position'])
        
        return cls(**data)

class ActiveItemStruct(StoreItemStruct):
    position: Optional[PositionStruct] = None
    texture: Optional[str] = None

class InitItemStruct(StoreItemStruct):
    position: Optional[PositionStruct] = None
    texture: Optional[str] = None


class ProductConfigStruct(msgspec.Struct):
    area_width: int
    area_height: int
    limit_to_print_area: bool

# Example usage
if __name__ == "__main__":
    store_item_data: StoreItem = {
        "name": "Mug",
        "code": "403-11oz-color-mug",
        "image": "base64string"
    }
    
    cart_item_data: CartItem = {
        "name": "Mug",
        "code": "403-11oz-color-mug",
        "image": "base64string",
        "quantity": 2,
        "position": {
            "width": 10,
            "height": 20,
            "top": 5,
            "left": 5
        },
        "texture": "smooth"
    }

    store_item = StoreItemStruct(**store_item_data)
    cart_item = CartItemStruct.from_typed_dict(cart_item_data)

    print(store_item)
    print(cart_item)
