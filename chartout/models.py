from dataclasses import dataclass
from typing import Optional, Dict

@dataclass
class StoreItem:
    name: str
    code: str
    image: str

@dataclass
class CartItem(StoreItem):
    quantity: int
    position: Optional[Dict[str, int]] = None
    texture: Optional[str] = None

@dataclass
class Position:
    width: int
    height: int
    top: int
    left: int

@dataclass
class ActiveTexture:
    texture_data: bytes  # PNG byte stream

@dataclass
class ActiveItem(StoreItem):
    position: Optional[Position] = None

    def __getitem__(self, key):
        return getattr(self, key)

@dataclass
class InitItem(StoreItem):
    position: Optional[Position] = None
    texture: Optional[str] = None

@dataclass
class ProductConfig:
    area_width: int
    area_height: int
    limit_to_print_area: bool
