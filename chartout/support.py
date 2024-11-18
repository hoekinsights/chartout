from __future__ import annotations
import sys
from typing import TYPE_CHECKING
from typing import Any
from typing import TypeVar

if TYPE_CHECKING:
    if sys.version_info >= (3, 10):
        from typing import TypeGuard
    else:
        from typing_extensions import TypeGuard
    import altair as alt

# Define a new type variable for VizLike
VizLike = TypeVar('VizLike', bound=Any)

def get_altair() -> Any:
    """Get altair module (if already imported - else return None)."""
    return sys.modules.get("altair", None)


def is_altair_chart(chart: Any) -> TypeGuard[alt.typing.ChartType]:
    """Check whether `chart` is a altair Chart without importing altair."""
    return (alt := get_altair()) is not None and alt.typing.is_chart_type(chart)

def is_viz_like(viz: Any) -> TypeGuard[VizLike]:
    """Check whether `viz` is a valid Altair chart."""
    return is_altair_chart(viz)
