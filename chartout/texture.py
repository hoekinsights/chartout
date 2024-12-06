from typing import Any, Dict, Union
from PIL import Image, ImageDraw
import io
from .models import Position, ProductConfig  # Import the dataclasses

product_configs: Dict[str, ProductConfig] = {
    "403-11oz-color-mug": ProductConfig(
        area_width=1342,
        area_height=1342,
        limit_to_print_area=True,
        limit_top_left=(0, 671),
        limit_bottom_right=(670, 1342),
        align_center=(167, 671),
        align_left=(0, 671),
        align_right=(335, 671),
        target_height=670
    ),
    "3-12x12-canvas": ProductConfig(
        area_width=1200,
        area_height=1200,
        limit_to_print_area=True,
        limit_top_left=(0, 0),
        limit_bottom_right=(600, 600),
        align_center=(300, 600),
        align_left=(0, 600),
        align_right=(600, 600),
        target_height=600
    ),
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


def process_image(png_data: bytes, position: Dict[str, int], product_config: ProductConfig) -> Image:
    """Process an image by resizing while maintaining aspect ratio and transposing it.

    Args:
        png_data (bytes): The PNG byte data of the image.
        position (Dict[str, int]): The position dictionary (not used for resizing).
        product_config (ProductConfig): The product configuration.

    Returns:
        Image: The processed PIL Image object.
    """
    chart_img = Image.open(io.BytesIO(png_data))
    
    # Get original aspect ratio
    original_width, original_height = chart_img.size
    aspect_ratio = original_width / original_height

    # Use target height from product config
    target_height = product_config.target_height
    # Calculate width based on aspect ratio
    target_width = int((target_height * aspect_ratio) / 2)
    
    # Resize maintaining aspect ratio
    chart_img = chart_img.resize((target_width, target_height))
    chart_img = chart_img.transpose(Image.FLIP_TOP_BOTTOM)
    return chart_img


def create_base_image(width: int, height: int, color: tuple = (255, 255, 255)) -> Image:
    """Create a base image with specified dimensions and color.

    Args:
        width (int): The width of the image.
        height (int): The height of the image.
        color (tuple): The RGB color of the image background.

    Returns:
        Image: A PIL Image object.
    """
    return Image.new("RGB", (width, height), color)


def draw_rectangle(
    image: Image, top_left: tuple, bottom_right: tuple, color: tuple = (0, 0, 0)
) -> None:
    """Draw a rectangle on the image.

    Args:
        image (Image): The image to draw on.
        top_left (tuple): The top-left corner of the rectangle.
        bottom_right (tuple): The bottom-right corner of the rectangle.
        color (tuple): The RGB color of the rectangle.
    """
    draw = ImageDraw.Draw(image)
    draw.rectangle([top_left, bottom_right], fill=color)


def png_to_texture(
    *,
    png_data: bytes,
    product="403-11oz-color-mug",
    position: Union[Position, Dict[str, int]],
    alignment: str = "center"
) -> bytes:
    """Create a texture image from PNG byte data based on the product type and dynamic position."""
    # Validate alignment
    if alignment not in ["left", "center", "right"]:
        raise ValueError("Alignment must be one of: left, center, right")

    # Validate and convert position input
    position = validate_position(position)

    # Get the configuration for the specified product
    config = product_configs.get(product)
    if not config:
        raise ValueError(f"Product '{product}' is not supported yet.")

    # Create the base image using the area dimensions
    img = create_base_image(config.area_width, config.area_height)

    # Draw a black rectangle in the specified area if limit_to_print_area is true
    #if config.limit_to_print_area:
    #    draw_rectangle(img, config.limit_top_left, config.limit_bottom_right)

    # Process the chart image with product config
    chart_img = process_image(png_data, position, config)
    chart_width = chart_img.size[0]  # Get the actual width of the processed chart

    # Get alignment position from config
    align_pos = getattr(config, f"align_{alignment}")
    if alignment == "center":
        # Calculate x position to center the chart within the print area
        print_area_width = config.limit_bottom_right[0] - config.limit_top_left[0]
        center_x = config.limit_top_left[0] + (print_area_width - chart_width) // 2
        paste_position = (center_x, align_pos[1])
    else:
        paste_position = (align_pos[0], align_pos[1])

    # Paste the chart image at the aligned position
    img.paste(chart_img, paste_position)

    # Save the final image
    output_stream = io.BytesIO()
    img.save(output_stream, format="PNG")
    output_stream.seek(0)
    return output_stream.getvalue()


def chart_to_texture(
    chart: Any,
    *,
    product="403-11oz-color-mug",
    position: Union[Position, Dict[str, int]],
    alignment: str = "center"
) -> bytes:
    """Create a texture image from a chart."""
    return png_to_texture(
        png_data=chart_to_png(chart),
        product=product,
        position=position,
        alignment=alignment
    )
