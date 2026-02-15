from dataclasses import dataclass, field, asdict
from typing import List, Union, Optional, Dict, Any

# Data Classes
@dataclass
class Placement:
    """A placement (print area) with id and content. Optional position/print metadata for cart."""
    placement_id: str  # e.g. "default"
    content: Union[str, bytes, Any]
    position: Optional[Dict[str, Any]] = None
    print_size: Optional[Dict[str, Any]] = None
    print_position: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {"id": self.placement_id, "content": self.content}
        if self.position is not None:
            out["user_position"] = self.position
        if self.print_size is not None:
            out["print_size"] = self.print_size
        if self.print_position is not None:
            out["print_position"] = self.print_position
        return out


@dataclass
class PlacementPosition:
    """Position of a texture on the product. horizontal: 'left' | 'center' | 'right'; vertical: 'top' | 'middle' | 'bottom'. Optional scale, dx, dy."""
    horizontal: str = "center"
    vertical: str = "middle"
    scale: Optional[float] = None
    dx: Optional[float] = None
    dy: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to frontend position shape: alignment + optional scale, dx, dy."""
        out: Dict[str, Any] = {"alignment": {"horizontal": self.horizontal, "vertical": self.vertical}}
        if self.scale is not None:
            out["scale"] = self.scale
        if self.dx is not None:
            out["dx"] = self.dx
        if self.dy is not None:
            out["dy"] = self.dy
        return out




@dataclass
class CartItem:
    id: str
    name: Optional[str] = None
    placements: List[Placement] = field(default_factory=list)
    quantity: int = 1

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "placements": [
                p.to_dict() if hasattr(p, "to_dict") else p for p in self.placements
            ],
            "quantity": self.quantity,
        }


@dataclass
class ActiveItem:
    id: str
    name: Optional[str] = None
    placements: List[Placement] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "placements": [
                p.to_dict() if hasattr(p, "to_dict") else p for p in self.placements
            ],
        }

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
