from dataclasses import dataclass, field
from typing import List, Union, Optional, Dict, Any


@dataclass
class Texture:
    id: str
    content: Union[str, Any]  # 'Any' can be used for alt.Chart or other types


@dataclass
class StoreItem:
    id: str
    name: Optional[str] = None
    textures: List[Texture] = field(default_factory=list)


@dataclass
class CartItem(StoreItem):
    quantity: int = 1


@dataclass
class ActiveItem(StoreItem):
    textures: List[Any] = field(default_factory=list)


@dataclass
class ActiveTexture:
    texture: bytes  # Equivalent to Uint8Array in TypeScript
