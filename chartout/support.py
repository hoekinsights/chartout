from __future__ import annotations
import sys
import io
from typing import TYPE_CHECKING, Any, TypeVar, Dict, List

# Conditional imports for type checking
if TYPE_CHECKING:
    if sys.version_info >= (3, 10):
        from typing import TypeGuard
    else:
        from typing_extensions import TypeGuard
    import altair as alt

# Import models
from .models import ActiveItem, Texture, InitViz, CartItem

# Define a new type variable for VizLike
VizLike = TypeVar("VizLike", bound=Any)


# Helper Functions
def get_altair() -> Any:
    """Get altair module (if already imported - else return None)."""
    return sys.modules.get("altair", None)


def is_altair_chart(chart: Any) -> TypeGuard[alt.typing.ChartType]:
    """Check whether `chart` is an Altair Chart without importing altair."""
    return (alt := get_altair()) is not None and alt.typing.is_chart_type(chart)


def chart_to_png(chart: Any) -> bytes:
    """Convert an Altair chart to PNG byte data."""
    if is_altair_chart(chart):
        byte_stream = io.BytesIO()
        chart.save(byte_stream, format="png", scale_factor=2, ppi=300)
        byte_stream.seek(0)
        return byte_stream.getvalue()
    else:
        msg = f"The provided DataViz object is not supported. Got: {type(chart)}"
        raise TypeError(msg)


# Main Functions
def is_viz_like(viz: VizLike) -> TypeGuard[VizLike]:
    """Check whether `viz` is a valid Altair chart."""
    return is_altair_chart(viz)


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
    "Texture content must be image data: VizLike (e.g. Altair chart) or bytes. "
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
