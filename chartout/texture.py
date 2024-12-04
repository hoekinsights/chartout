from typing import Any, Dict, Union
from PIL import Image, ImageDraw
import io
from .models import Position, ProductConfig  # Import the dataclasses

product_configs: Dict[str, ProductConfig] = {
    "403-11oz-color-mug": ProductConfig(area_width=1342, area_height=1342, limit_to_print_area=True),
    "3-12x12-canvas": ProductConfig(area_width=1200, area_height=1200, limit_to_print_area=True),
    # Add more products here as needed
}

def validate_position(position: Union[Position, Dict[str, int]]) -> Position:
    """Validate and convert position input to a Position instance.
    
    Args:
        position (Union[Position, Dict[str, int]]): The position input to validate.

    Returns:
        Position: A Position instance.

    Raises:
        ValueError: If the input is invalid.
    """
    if isinstance(position, Position):
        return position.__dict__  # Already a Position instance

    if isinstance(position, dict):
        required_keys = {"width", "height", "top", "left"}
        if not required_keys.issubset(position.keys()):
            raise ValueError(f"Position dictionary must contain keys: {required_keys}")

        # Validate that all values are integers
        for key in required_keys:
            if not isinstance(position[key], int):
                raise ValueError(f"Position '{key}' must be an integer.")

        # Create Position instance from dictionary
        position_instance = Position(**position)  # Create Position instance
        return position_instance.__dict__  # Return as a dictionary

    raise ValueError("Position must be either a Position instance or a dictionary.")

def chart_to_png(chart: Any) -> bytes:
    """Convert an Altair chart to PNG byte data."""
    from .support import is_altair_chart  # Move import here to avoid circular import

    if is_altair_chart(chart):
        byte_stream = io.BytesIO()
        chart.save(byte_stream, format="png", scale_factor=1.5)
        byte_stream.seek(0)  # Move to the beginning of the stream
        return byte_stream.getvalue()  # Return the byte content of the PNG
    else:
        msg = f"The provided DataViz object is not supported. Got: {type(chart)}"
        raise TypeError(msg)

def png_to_texture(
    *, png_data: bytes, product="403-11oz-color-mug", position: Union[Position, Dict[str, int]]
) -> bytes:
    """Create a texture image from PNG byte data based on the product type and dynamic position."""
    # Validate and convert position input
    position = validate_position(position)  # Now returns a dict

    # Get the configuration for the specified product
    config = product_configs.get(product)
    if not config:
        raise ValueError(f"Product '{product}' is not supported yet.")

    # Create the base image using the area dimensions from the product configuration
    img = Image.new(
        "RGB", (config.area_width, config.area_height), (255, 255, 255)
    )

    # Draw a black rectangle in the specified area if limit_to_print_area is true
    draw = ImageDraw.Draw(img)
    if config.limit_to_print_area:
        draw.rectangle(
            [
                position['left'],  # Accessing left attribute from dict
                position['top'],   # Accessing top attribute from dict
                position['left'] + position['width'],  # Accessing width attribute from dict
                position['top'] + position['height'],   # Accessing height attribute from dict
            ],
            fill=(0, 0, 0),
        )

    # Open the chart image from the PNG byte data, resize and transpose
    chart_img = Image.open(io.BytesIO(png_data))
    chart_img = chart_img.resize(
        (position['width'], position['height'])  # Accessing width and height attributes from dict
    )  # Resize to fit the specified dimensions
    chart_img = chart_img.transpose(Image.FLIP_TOP_BOTTOM)

    # Paste the chart image at the specified position
    img.paste(chart_img, (position['left'], position['top']))  # Accessing left and top attributes from dict

    # Save the final image to a byte stream instead of a file
    output_stream = io.BytesIO()
    img.save(output_stream, format="PNG")
    output_stream.seek(0)  # Move to the beginning of the stream
    return output_stream.getvalue()  # Return the byte content of the final image

def chart_to_texture(
    chart: Any, *, product="403-11oz-color-mug", position: Union[Position, Dict[str, int]]
) -> bytes:
    """Create a texture image from a chart."""
    return png_to_texture(
        png_data=chart_to_png(chart), product=product, position=position
    )
