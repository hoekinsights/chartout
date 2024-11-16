from PIL import Image, ImageDraw
import io
from typing import Any
from .dependencies import is_altair_chart


def chart_to_png(chart: Any) -> bytes:

    # altair chart
    if is_altair_chart(chart):
        byte_stream = io.BytesIO()
        chart.save(byte_stream, format="PNG", scale_factor=1.5)
        byte_stream.seek(0)  # Move to the beginning of the stream
        return byte_stream.getvalue()  # Return the byte content of the PNG
    else:
        msg = f"The provided DataViz object is not supported. Got: {type(chart)}"
        raise TypeError(msg)


def png_to_texture(png_data: bytes, product="403-11oz-color-mug") -> bytes:
    """Create a texture image from PNG byte data."""

    # Start with a square white image
    img = Image.new("RGB", (1342, 1342), (255, 255, 255))

    # Add black rectangle in top-left corner
    draw = ImageDraw.Draw(img)
    top_left = (0, 0)
    bottom_right = (670, 670)
    draw.rectangle([top_left, bottom_right], fill=(0, 0, 0))

    # Open the chart image from the byte stream, resize and transpose
    chart_img = Image.open(io.BytesIO(png_data))
    chart_img = chart_img.resize((335, 670))
    chart_img = chart_img.transpose(Image.FLIP_TOP_BOTTOM)

    # Add to the user-defined location on product ('center')
    paste_position = (167, 671)
    img.paste(chart_img, paste_position)

    # Save the final image to a byte stream instead of a file
    output_stream = io.BytesIO()
    img.save(output_stream, format="PNG")
    output_stream.seek(0)  # Move to the beginning of the stream
    return output_stream.getvalue()  # Return the byte content of the final image


def chart_to_texture(chart: Any, product="403-11oz-color-mug") -> bytes:
    """Create a texture image from a chart."""
    return png_to_texture(chart_to_png(chart), product)
