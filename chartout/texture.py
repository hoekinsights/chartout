import sys

if sys.version_info >= (3, 14):
    from typing import TypedDict
else:
    from typing_extensions import TypedDict
from typing import Any
from PIL import Image, ImageDraw
import io
from .support import is_altair_chart


class Position(TypedDict):
    width: int
    height: int
    top: int
    left: int


class ProductConfig(TypedDict):
    area_width: int
    area_height: int
    limit_to_print_area: bool


product_configs: dict[str, ProductConfig] = {
    "403-11oz-color-mug": {
        "area_width": 1342,
        "area_height": 1342,
        "limit_to_print_area": True,
    },
    "3-12x12-canvas": {
        "area_width": 1200,
        "area_height": 1200,
        "limit_to_print_area": True,
    },
    # Add more products here as needed
}


def chart_to_png(chart: Any) -> bytes:

    # altair chart
    if is_altair_chart(chart):
        byte_stream = io.BytesIO()
        chart.save(byte_stream, format="png", scale_factor=1.5)
        byte_stream.seek(0)  # Move to the beginning of the stream
        return byte_stream.getvalue()  # Return the byte content of the PNG
    else:
        msg = f"The provided DataViz object is not supported. Got: {type(chart)}"
        raise TypeError(msg)


def png_to_texture(
    *, png_data: bytes, product="403-11oz-color-mug", position: Position
) -> bytes:
    """Create a texture image from PNG byte data based on the product type and dynamic position."""

    # Get the configuration for the specified product
    config = product_configs.get(product)
    if not config:
        raise ValueError(f"Product '{product}' is not supported yet.")

    # Create the base image using the area dimensions from the product configuration
    img = Image.new(
        "RGB", (config["area_width"], config["area_height"]), (255, 255, 255)
    )

    # Draw a black rectangle in the specified area if limit_to_print_area is true
    draw = ImageDraw.Draw(img)
    if config["limit_to_print_area"]:
        draw.rectangle(
            [
                position["left"],
                position["top"],
                position["left"] + position["width"],
                position["top"] + position["height"],
            ],
            fill=(0, 0, 0),
        )

    # Open the chart image from the PNG byte data, resize and transpose
    chart_img = Image.open(io.BytesIO(png_data))
    chart_img = chart_img.resize(
        (position["width"], position["height"])
    )  # Resize to fit the specified dimensions
    chart_img = chart_img.transpose(Image.FLIP_TOP_BOTTOM)

    # Paste the chart image at the specified position
    img.paste(chart_img, (position["left"], position["top"]))

    # Save the final image to a byte stream instead of a file
    output_stream = io.BytesIO()
    img.save(output_stream, format="PNG")
    output_stream.seek(0)  # Move to the beginning of the stream
    return output_stream.getvalue()  # Return the byte content of the final image


def chart_to_texture(
    chart: Any, *, product="403-11oz-color-mug", position: Position
) -> bytes:
    """Create a texture image from a chart."""
    return png_to_texture(
        png_data=chart_to_png(chart), product=product, position=position
    )
