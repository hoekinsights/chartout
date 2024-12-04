from __future__ import annotations
import sys
from typing import TYPE_CHECKING
from typing import Any
from typing import TypeVar
from typing import Optional, Dict

if TYPE_CHECKING:
    if sys.version_info >= (3, 10):
        from typing import TypeGuard
    else:
        from typing_extensions import TypeGuard
    import altair as alt

from .models import ActiveItem, ActiveTexture, Position  # Import ActiveItem, ActiveTexture, and Position from models

# Define a new type variable for VizLike
VizLike = TypeVar('VizLike', bound=Any)

def get_altair() -> Any:
    """Get altair module (if already imported - else return None)."""
    return sys.modules.get("altair", None)

def is_altair_chart(chart: Any) -> TypeGuard[alt.typing.ChartType]:
    """Check whether `chart` is an Altair Chart without importing altair."""
    return (alt := get_altair()) is not None and alt.typing.is_chart_type(chart)

def is_viz_like(viz: Any) -> TypeGuard[VizLike]:
    """Check whether `viz` is a valid Altair chart."""
    return is_altair_chart(viz)

def viz_to_active_item(viz: Any) -> ActiveItem:
    """Convert a VizLike item to an ActiveItem."""
    # Assuming you have a way to determine the position from the viz object
    position = Position(width=100, height=100, top=0, left=0).__dict__  # Replace with actual logic to determine position

    return ActiveItem(
        name="403-11oz-color-mug",
        code="403-11oz-color-mug",
        image="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAwYBAUQAAAABAAEA8IhZAAAAAElFTkSuQmCC",
        position=position,  # Set position based on the Position class
    )

def viz_to_texture(viz: Any, active_item: Dict[str, Any]) -> Optional[ActiveTexture]:
    """Convert a VizLike item to its texture representation as an ActiveTexture."""
    from .texture import chart_to_texture  # Move import here to avoid circular import

    # Get product name and position from ActiveItem
    product_name = active_item['name']
    position = active_item['position']  # Assuming position is set in ActiveItem

    # Ensure position is defined before calling chart_to_texture
    if position is not None:
        # Call chart_to_texture with the chart and position
        png_data = chart_to_texture(viz, product=product_name, position=position)
        return ActiveTexture(texture_data=png_data)  # Create ActiveTexture instance with PNG data

    return None  # Return None if position is not defined
