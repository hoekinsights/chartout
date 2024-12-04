from dataclasses import dataclass, asdict
from typing import Optional, Dict

@dataclass
class StoreItem:
    name: str
    code: str
    image: str

    def to_dict(self):
        return asdict(self)

@dataclass
class CartItem(StoreItem):
    quantity: int
    position: Optional[Dict[str, int]] = None
    texture: Optional[str] = None

    def to_dict(self):
        return asdict(self)

@dataclass
class Position:
    width: int
    height: int
    top: int
    left: int

    def validate(self):
        if not (0 <= self.width <= 1000 and 0 <= self.height <= 1000):
            raise ValueError("Width and height must be between 0 and 1000")
        if not (0 <= self.top <= 1000 and 0 <= self.left <= 1000):
            raise ValueError("Top and left must be between 0 and 1000")

    def to_dict(self):
        return asdict(self)

@dataclass
class ActiveTexture:
    texture: bytes  # PNG byte stream

    def to_dict(self):
        return asdict(self)

@dataclass
class ActiveItem(StoreItem):
    position: Optional[Position] = None

    def to_dict(self):
        return asdict(self)

@dataclass
class InitItem(StoreItem):
    position: Optional[Position] = None
    texture: Optional[str] = None

    def to_dict(self):
        return asdict(self)

@dataclass
class ProductConfig:
    area_width: int
    area_height: int
    limit_to_print_area: bool

    def to_dict(self):
        return asdict(self)
