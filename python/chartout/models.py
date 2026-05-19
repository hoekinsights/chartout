from dataclasses import dataclass, field, asdict
from enum import StrEnum
from typing import List, Union, Optional, Dict, Any


class Horizontal(StrEnum):
    """Allowed horizontal alignment for placement position."""
    left = "left"
    center = "center"
    right = "right"


class Vertical(StrEnum):
    """Allowed vertical alignment for placement position."""
    top = "top"
    middle = "middle"
    bottom = "bottom"


# Data Classes
@dataclass
class Placement:
    """A placement (print area) with id and content. Optional position for cart.

    Use co.products() to get placement id and print_ratio (e.g. "16:9", "1:1") per product.
    """
    placement_id: str  # e.g. "default"
    content: Union[str, bytes, Any]
    position: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {"id": self.placement_id, "content": self.content}
        if self.position is not None:
            out["user_position"] = self.position
        return out

    def __repr__(self) -> str:
        if self.position is None:
            return self.placement_id
        pos = self.position
        if hasattr(pos, "horizontal"):
            v, h = pos.vertical, pos.horizontal
            extra = [f"scale={pos.scale}"] if pos.scale is not None else []
            if pos.dx is not None: extra.append(f"dx={pos.dx}")
            if pos.dy is not None: extra.append(f"dy={pos.dy}")
        else:
            align = pos.get("alignment") or {}
            v, h = align.get("vertical", "middle"), align.get("horizontal", "center")
            extra = [f"scale={pos['scale']}"] if pos.get("scale") is not None else []
            if pos.get("dx") is not None: extra.append(f"dx={pos['dx']}")
            if pos.get("dy") is not None: extra.append(f"dy={pos['dy']}")
        return f"{self.placement_id} ({v}, {h}" + (", " + ", ".join(extra) if extra else "") + ")"


@dataclass
class PlacementPosition:
    """Position of a texture on the product. Use Horizontal and Vertical enums (or valid strings). Optional scale, dx, dy."""
    horizontal: Union[Horizontal, str] = "center"
    vertical: Union[Vertical, str] = "middle"
    scale: Optional[float] = None
    dx: Optional[float] = None
    dy: Optional[float] = None

    def __post_init__(self) -> None:
        if isinstance(self.horizontal, str):
            try:
                self.horizontal = Horizontal(self.horizontal)
            except ValueError:
                raise ValueError(
                    f"horizontal must be one of {[e.value for e in Horizontal]}, got {self.horizontal!r}"
                ) from None
        if isinstance(self.vertical, str):
            try:
                self.vertical = Vertical(self.vertical)
            except ValueError:
                raise ValueError(
                    f"vertical must be one of {[e.value for e in Vertical]}, got {self.vertical!r}"
                ) from None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to frontend position shape: alignment + optional scale, dx, dy."""
        out: Dict[str, Any] = {
            "alignment": {
                "horizontal": self.horizontal.value,
                "vertical": self.vertical.value,
            }
        }
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

    def __post_init__(self) -> None:
        if not isinstance(self.quantity, int):
            raise TypeError(
                f"quantity must be an int, got {type(self.quantity).__name__!r}"
            ) from None
        if self.quantity < 1:
            raise ValueError(
                f"quantity must be a positive integer, got {self.quantity}"
            ) from None

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

