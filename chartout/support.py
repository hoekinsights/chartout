from __future__ import annotations
import io
import sys
from typing import TYPE_CHECKING, Any, TypeVar, Dict, List, Optional

# Conditional imports for type checking
if TYPE_CHECKING:
    if sys.version_info >= (3, 10):
        from typing import TypeGuard
    else:
        from typing_extensions import TypeGuard
    import altair as alt
    from pyobsplot.widget import ObsplotWidget

# Import models
from .models import ActiveItem, Placement, PlacementPosition, InitViz, CartItem

# Define a new type variable for VizLike
VizLike = TypeVar("VizLike", bound=Any)


# Helper Functions
def get_altair() -> Any:
    """Get altair module (if already imported - else return None)."""
    return sys.modules.get("altair", None)


def is_altair_chart(chart: Any) -> TypeGuard[alt.typing.ChartType]:
    """Check whether `chart` is an Altair Chart without importing altair."""
    return (alt := get_altair()) is not None and alt.typing.is_chart_type(chart)

def altair_chart_to_png(chart: Any) -> bytes:
    """Save an Altair Chart to PNG bytes. Call only when is_altair_chart(chart) is True."""
    buf = io.BytesIO()
    chart.save(buf, format="png", scale_factor=2, ppi=300)
    buf.seek(0) 
    return buf.getvalue()

def get_matplotlib() -> Any:
    """Get matplotlib.figure.Figure class if matplotlib is already loaded; else None. No import of matplotlib."""
    return sys.modules.get("matplotlib", None)


def is_mpl_figure(chart: Any) -> bool:
    """True if chart is a matplotlib Figure (or seaborn figure, which is a mpl Figure). Type-based, no import of matplotlib."""
    return (mpl := get_matplotlib()) is not None and isinstance(chart, mpl.figure.Figure)


def mpl_figure_to_png(fig: Any) -> bytes:
    """Save a matplotlib Figure to PNG bytes. Call only when is_mpl_figure(fig) is True."""
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=300, bbox_inches="tight")
    buf.seek(0)
    return buf.getvalue()


def get_plotly() -> Any:
    """Get plotly module (if already imported - else return None)."""
    return sys.modules.get("plotly", None)


def is_plotly_figure(chart: Any) -> bool:
    """True if obj is a Plotly Figure. Type-based, no import of plotly."""
    return (plotly := get_plotly()) is not None and isinstance(chart, plotly.graph_objects.Figure)


def plotly_figure_to_png(fig: Any) -> bytes:
    """Save a Plotly Figure to PNG bytes. Call only when is_plotly_figure(fig) is True. Requires kaleido."""
    raise NotImplementedError("Plotly Figure cannot be converted to PNG yet.")


def get_pyobsplot() -> Any:
    """Get ObsplotWidget class from pyobsplot.widget if already loaded; else None. No import of pyobsplot."""
    return sys.modules.get("pyobsplot", None)


def is_pyobsplot_widget(chart: Any) -> TypeGuard[ObsplotWidget]:
    """Check whether obj is a pyobsplot ObsplotWidget without importing pyobsplot."""
    return (pyobs := get_pyobsplot()) is not None and isinstance(chart, pyobs.widget.ObsplotWidget)


def pyobsplot_widget_to_png(chart: Any) -> bytes:
    """Save a pyobsplot ObsplotWidget to PNG bytes. Call only when is_pyobsplot_widget(chart) is True. Requires pyobsplot."""
    raise NotImplementedError("ObsplotWidget cannot be converted to PNG yet.")


def chart_to_png(chart: Any) -> bytes:
    """Convert a VizLike chart to PNG bytes. Supports Altair, matplotlib/seaborn, Plotly, and pyobsplot plot specs."""
    if is_altair_chart(chart):
        return altair_chart_to_png(chart)
    if is_mpl_figure(chart):
        return mpl_figure_to_png(chart)
    if is_plotly_figure(chart):
        return plotly_figure_to_png(chart)
    if is_pyobsplot_widget(chart):
        return pyobsplot_widget_to_png(chart)
    msg = (
        f"The provided DataViz object is not supported. Got: {type(chart)}. "
        "Supported: Altair charts, matplotlib figures, Plotly figures and Observable Plot widgets."
    )
    raise TypeError(msg)


# Main Functions
def is_viz_like(viz: VizLike) -> TypeGuard[VizLike]:
    """True if viz is a supported chart/figure: Altair, matplotlib Figure (incl. seaborn), Plotly Figure, pyobsplot ObsplotWidget, or pyobsplot plot spec."""
    return (
        is_altair_chart(viz)
        or is_mpl_figure(viz)
        or is_plotly_figure(viz)
        or is_pyobsplot_widget(viz)
    )


def viz_to_active_item(init_viz: InitViz) -> ActiveItem:
    """Convert an InitViz item to an ActiveItem."""
    first_image_index = next(iter(init_viz.images))
    png_data = init_viz.images[first_image_index]
    return ActiveItem(
        name="Canvas",
        id="canvas_10x10",
        placements=[Placement(placement_id="default", content=png_data)],
    )


def viz_to_init_viz(viz: VizLike) -> InitViz:
    """Convert a VizLike item to an InitViz."""
    images = {0: chart_to_png(viz)}
    return InitViz(images=images)


def _parse_placements(data: Any) -> List[Dict[str, Any]]:
    """Extract placement dicts from a list. Returns only dicts with content."""
    if not data or not isinstance(data, list):
        return []
    return [p for p in data if isinstance(p, dict) and p.get("content") is not None]


def cart_item_to_active_item(cart_item: Dict[str, Any]) -> ActiveItem:
    """Convert a cart item dict (from frontend) to an ActiveItem."""
    placements_raw = _parse_placements(cart_item.get("placements"))
    placements = []
    for p in placements_raw:
        content = p.get("content")
        if content is None:
            continue
        placements.append(
            Placement(
                placement_id=p.get("id", "default"),
                content=content,
                position=p.get("user_position") or p.get("position"),
                print_size=p.get("print_size"),
                print_position=p.get("print_position"),
            )
        )
    return ActiveItem(
        id=cart_item["id"],
        name=cart_item.get("name"),
        placements=placements,
    )


_UNSUPPORTED_TEXTURE_MSG = (
    "Texture content must be image data: VizLike (Altair, matplotlib/seaborn, Plotly, pyobsplot plot spec) or bytes. "
    "If you think this type should be supported, please open an issue or contribute at the chartout repository."
)


def texture_content_to_bytes(content: Any) -> bytes:
    """Convert texture content to PNG bytes. Accepts only VizLike (e.g. alt.Chart) or bytes/bytearray (image data)."""
    if is_viz_like(content):
        return chart_to_png(content)
    if isinstance(content, (bytes, bytearray)):
        return content if isinstance(content, bytes) else bytes(content)
    raise TypeError(f"Texture content type is not supported: {type(content).__name__}. {_UNSUPPORTED_TEXTURE_MSG}")


def cart_item_to_store_dict(item: CartItem) -> Dict[str, Any]:
    """Serialize a CartItem for the Store. Placement content must be VizLike or bytes."""
    placements = []
    for p in item.placements:
        content = texture_content_to_bytes(p.content)
        pl: Dict[str, Any] = {
            "id": p.placement_id,
            "content": content,
        }
        if p.position is not None:
            up = p.position if isinstance(p.position, dict) else p.position.to_dict()
            pl["user_position"] = up
        if p.print_size is not None:
            pl["print_size"] = p.print_size
        if p.print_position is not None:
            pl["print_position"] = p.print_position
        placements.append(pl)
    return {
        "id": item.id,
        "name": item.name,
        "placements": placements,
        "quantity": item.quantity,
    }


def dict_to_cart_item(data: Dict[str, Any]) -> CartItem:
    """Build CartItem from dict with placements."""
    placements_raw = _parse_placements(data.get("placements"))
    placements = []
    for p in placements_raw:
        content = p.get("content")
        if content is None:
            continue
        placements.append(
            Placement(
                placement_id=p.get("id", "default"),
                content=content,
                position=p.get("user_position") or p.get("position"),
                print_size=p.get("print_size"),
                print_position=p.get("print_position"),
            )
        )
    return CartItem(
        id=data["id"],
        name=data.get("name"),
        placements=placements,
        quantity=data.get("quantity", 1),
    )


def cart_items_to_store_list(items: List[CartItem]) -> List[Dict[str, Any]]:
    """Serialize cart items for the Store, converting any VizLike texture content to PNG bytes."""
    return [cart_item_to_store_dict(item) for item in items]


def item(
    variant_id: str,
    content: Any,
    *,
    name: Optional[str] = None,
    quantity: int = 1,
    placement_id: str = "default",
    position: Optional[PlacementPosition] = None,
    **position_kw: Any,
) -> CartItem:
    """Create a CartItem for a single-placement variant with minimal boilerplate."""
    # Extract placement_id from kwargs if passed there (backward compat)
    if "placement_id" in position_kw:
        placement_id = position_kw.pop("placement_id")
    # Only position-related kwargs go to PlacementPosition
    position_dict: Optional[Dict[str, Any]] = None
    if position is not None or position_kw:
        pos = position or PlacementPosition(**position_kw)
        position_dict = pos.to_dict()
    placement = Placement(
        placement_id=placement_id,
        content=content,
        position=position_dict,
    )
    return CartItem(
        id=variant_id,
        name=name or variant_id,
        placements=[placement],
        quantity=quantity,
    )


def viz_to_cart_item(viz: VizLike) -> CartItem:
    """Convert a VizLike item to a CartItem."""
    png_data = chart_to_png(viz)
    placement = Placement(placement_id="default", content=png_data)
    return CartItem(
        id="canvas_10x10",
        name="VizLike Item",
        placements=[placement],
        quantity=1,
    )
