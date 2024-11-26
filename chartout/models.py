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
class ActiveItem(StoreItem):
    position: Optional[Position] = None
    texture: Optional[str] = None

@dataclass
class InitItem(StoreItem):
    position: Optional[Position] = None
    texture: Optional[str] = None

@dataclass
class ProductConfig:
    area_width: int
    area_height: int
    limit_to_print_area: bool
