from dataclasses import dataclass, field, asdict
from typing import List, Union, Optional, Dict, Any

# Data Classes
@dataclass
class TexturePosition:
    """Position of a texture on the product. horizontal: 'left' | 'center' | 'right'; vertical: 'top' | 'middle' | 'bottom'. Optional scale, dx, dy."""
    horizontal: str = "center"
    vertical: str = "middle"
    scale: Optional[float] = None
    dx: Optional[float] = None
    dy: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to frontend user_position shape: alignment + optional scale, dx, dy."""
        out: Dict[str, Any] = {"alignment": {"horizontal": self.horizontal, "vertical": self.vertical}}
        if self.scale is not None:
            out["scale"] = self.scale
        if self.dx is not None:
            out["dx"] = self.dx
        if self.dy is not None:
            out["dy"] = self.dy
        return out


@dataclass
class Texture:
    """A texture with an id and content. Content can be bytes, a URL string, or VizLike (e.g. alt.Chart); VizLike is converted to PNG bytes when the cart is serialized for the Store.
    Optional user_position (TexturePosition) controls placement on the product.
    """
    id: str
    content: Union[str, bytes, Any]  # bytes, URL string, or VizLike (alt.Chart etc.)
    user_position: Optional[TexturePosition] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert the Texture instance to a dictionary."""
        return asdict(self)

@dataclass
class StoreItem:
    id: str
    name: Optional[str] = None
    textures: List[Texture] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert the StoreItem instance to a dictionary."""
        return asdict(self)

@dataclass
class CartItem(StoreItem):
    quantity: int = 1

    def to_dict(self) -> Dict[str, Any]:
        """Convert the CartItem instance to a dictionary."""
        return asdict(self)

@dataclass
class ActiveItem(StoreItem):
    textures: List[Texture] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert the ActiveItem instance to a dictionary."""
        return asdict(self)

@dataclass
class ActiveTexture:
    texture: bytes  # Equivalent to Uint8Array in TypeScript

    def to_dict(self) -> Dict[str, Any]:
        """Convert the ActiveTexture instance to a dictionary."""
        return asdict(self)

@dataclass
class InitViz:
    images: Dict[int, bytes] = field(default_factory=dict)

    def to_dict(self) -> Dict[int, bytes]:
        """Convert the InitViz instance to a dictionary."""
        return self.images
