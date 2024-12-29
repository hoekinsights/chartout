from dataclasses import dataclass, field, asdict
from typing import List, Union, Optional, Dict, Any


@dataclass
class Texture:
    id: str
    content: Union[str, Any]  # 'Any' can be used for alt.Chart or other types

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class StoreItem:
    id: str
    name: Optional[str] = None
    textures: List[Texture] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CartItem(StoreItem):
    quantity: int = 1

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ActiveItem(StoreItem):
    textures: List[Texture] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ActiveTexture:
    texture: bytes  # Equivalent to Uint8Array in TypeScript

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
