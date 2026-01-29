from __future__ import annotations
import sys
import io
from typing import TYPE_CHECKING, Any, TypeVar, Dict, List, Optional

# Conditional imports for type checking
if TYPE_CHECKING:
    if sys.version_info >= (3, 10):
        from typing import TypeGuard
    else:
        from typing_extensions import TypeGuard
    import altair as alt

# Import models
from .models import ActiveItem, Texture, TexturePosition, InitViz, CartItem

# Define a new type variable for VizLike
VizLike = TypeVar("VizLike", bound=Any)


# Helper Functions
def get_altair() -> Any:
    """Get altair module (if already imported - else return None)."""
    return sys.modules.get("altair", None)


def is_altair_chart(chart: Any) -> TypeGuard[alt.typing.ChartType]:
    """Check whether `chart` is an Altair Chart without importing altair."""
    return (alt := get_altair()) is not None and alt.typing.is_chart_type(chart)


def get_mpl_figure_class() -> Any:
    """Get matplotlib.figure.Figure class if matplotlib is already loaded; else None. No import of matplotlib."""
    mpl_figure = sys.modules.get("matplotlib.figure", None)
    return getattr(mpl_figure, "Figure", None) if mpl_figure is not None else None


def is_mpl_figure(obj: Any) -> bool:
    """True if obj is a matplotlib Figure (or seaborn figure, which is a mpl Figure). Type-based, no import of matplotlib."""
    figure_cls = get_mpl_figure_class()
    return figure_cls is not None and isinstance(obj, figure_cls)


def mpl_figure_to_png(fig: Any) -> bytes:
    """Save a matplotlib Figure to PNG bytes. Call only when _is_mpl_figure(fig) is True."""
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=300, bbox_inches="tight")
    buf.seek(0)
    return buf.getvalue()


def chart_to_png(chart: Any) -> bytes:
    """Convert a VizLike chart to PNG bytes. Supports Altair charts and matplotlib/seaborn figures."""
    if is_altair_chart(chart):
        byte_stream = io.BytesIO()
        chart.save(byte_stream, format="png", scale_factor=2, ppi=300)
        byte_stream.seek(0)
        return byte_stream.getvalue()
    if is_mpl_figure(chart):
        return mpl_figure_to_png(chart)
    msg = (
        f"The provided DataViz object is not supported. Got: {type(chart)}. "
        "Supported: Altair charts, matplotlib Figure, seaborn figures (matplotlib)."
    )
    raise TypeError(msg)


# Main Functions
def is_viz_like(viz: VizLike) -> TypeGuard[VizLike]:
    """True if viz is a supported chart/figure: Altair chart or matplotlib Figure (including seaborn)."""
    return is_altair_chart(viz) or _is_mpl_figure(viz)


def viz_to_active_item(init_viz: InitViz) -> ActiveItem:
    """Convert an InitViz item to an ActiveItem."""
    # Assuming the first image in the InitViz is used for the ActiveItem
    first_image_index = next(iter(init_viz.images))
    png_data = init_viz.images[first_image_index]

    return ActiveItem(
        name="Canvas",
        id="canvas_10x10",
        textures=[
            Texture(
                id="canvas_10x10_texture",
                content=png_data
            )
        ]
    )


def viz_to_init_viz(viz: VizLike) -> InitViz:
    """Convert a VizLike item to an InitViz."""
    images = {0: chart_to_png(viz)}
    return InitViz(images=images)


def cart_item_to_active_item(cart_item: Dict[str, Any]) -> ActiveItem:
    """Convert a CartItem to an ActiveItem."""
    return ActiveItem(
        id=cart_item['id'],
        name=cart_item.get('name'),
        textures=cart_item['textures']
    )


_UNSUPPORTED_TEXTURE_MSG = (
    "Texture content must be image data: VizLike (Altair, matplotlib/seaborn) or bytes. "
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
    """Serialize a CartItem for the Store. Texture content must be VizLike or bytes (image data)."""
    textures = []
    for t in item.textures:
        content = texture_content_to_bytes(t.content)
        tex: Dict[str, Any] = {"id": t.id, "content": content}
        if getattr(t, "user_position", None) is not None:
            up = t.user_position
            tex["user_position"] = up.to_dict() if hasattr(up, "to_dict") else up
        textures.append(tex)
    return {
        "id": item.id,
        "name": item.name,
        "textures": textures,
        "quantity": item.quantity,
    }


def cart_items_to_store_list(items: List[CartItem]) -> List[Dict[str, Any]]:
    """Serialize cart items for the Store, converting any VizLike texture content to PNG bytes."""
    return [cart_item_to_store_dict(item) for item in items]


def item(
    variant_id: str,
    content: Any,
    *,
    name: Optional[str] = None,
    quantity: int = 1,
    position: Optional[TexturePosition] = None,
    **position_kw: Any,
) -> CartItem:
    """Create a CartItem for a single-texture variant with minimal boilerplate.
    Texture id is derived as ``{variant_id}_texture``. Optionally pass position
    as a TexturePosition or as keyword args (horizontal, vertical, scale, dx, dy).
    """
    if position is None and position_kw:
        position = TexturePosition(**position_kw)
    texture = Texture(
        id=f"{variant_id}_texture",
        content=content,
        user_position=position,
    )
    return CartItem(
        id=variant_id,
        name=name or variant_id,
        textures=[texture],
        quantity=quantity,
    )


def viz_to_cart_item(viz: VizLike) -> CartItem:
    """Convert a VizLike item to a CartItem.
    
    Creates a CartItem with a default variant ID (canvas_10x10) that matches
    an actual variant in the API. The frontend will validate this CartItem with full
    variant metadata when the cart is loaded in the Store widget.
    """
    # Convert the VizLike object to PNG bytes
    png_data = chart_to_png(viz)
    
    # Create a Texture instance for the CartItem
    # Use the texture ID that matches the canvas_10x10 variant
    texture = Texture(
        id="canvas_10x10_texture", 
        content=png_data
    )
    
    # Create and return a CartItem instance
    # Use canvas_10x10 as the default variant ID (matches API variant)
    return CartItem(
        id="canvas_10x10", 
        name="VizLike Item",
        textures=[texture],
        quantity=1
    )
