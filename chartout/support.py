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

from .models import ActiveItem, Texture

# Define a new type variable for VizLike
VizLike = TypeVar('VizLike', bound=Any)

def get_altair() -> Any:
    """Get altair module (if already imported - else return None)."""
    return sys.modules.get("altair", None)

def is_altair_chart(chart: Any) -> TypeGuard[alt.typing.ChartType]:
    """Check whether `chart` is an Altair Chart without importing altair."""
    return (alt := get_altair()) is not None and alt.typing.is_chart_type(chart)

def is_viz_like(viz: VizLike) -> TypeGuard[VizLike]:
    """Check whether `viz` is a valid Altair chart."""
    return is_altair_chart(viz)

def viz_to_active_item(viz: VizLike) -> ActiveItem:
    """Convert a VizLike item to an ActiveItem."""
    from .texture import chart_to_png
    png_data = chart_to_png(viz)

    return ActiveItem(
        name="Canvas",
        id="my_canvas_id",
        textures=[
            Texture(
                id="my_canvas_texture",
                content=png_data
            )
        ]
    )
