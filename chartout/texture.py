from typing import Any, Dict, Union, List
from PIL import Image, ImageDraw
import io
from .models import Position
from .store import customizables
from .support import is_viz_like


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
        byte_stream.seek(0)
        return byte_stream.getvalue()
    else:
        msg = f"The provided DataViz object is not supported. Got: {type(chart)}"
        raise TypeError(msg)


def process_image_for_source_size(img, source_size):
    """Resize image to fit within source_size while maintaining aspect ratio and alignment."""
    orig_width, orig_height = img.size
    aspect_ratio = orig_width / orig_height

    # Determine new dimensions while maintaining aspect ratio
    if source_size["width"] / aspect_ratio <= source_size["height"]:
        new_width = source_size["width"]
        new_height = int(new_width / aspect_ratio)
    else:
        new_height = source_size["height"]
        new_width = int(new_height * aspect_ratio)

    resized_img = img.resize((new_width, new_height))

    # Create a new canvas for the source size
    source_canvas = Image.new(
        "RGB", (source_size["width"], source_size["height"]), (255, 255, 255)
    )

    # Determine alignment
    alignment = source_size.get(
        "alignment", {"horizontal": "center", "vertical": "middle"}
    )
    if alignment["horizontal"] == "left":
        x_pos = 0
    elif alignment["horizontal"] == "right":
        x_pos = source_size["width"] - new_width
    else:  # center
        x_pos = (source_size["width"] - new_width) // 2

    if alignment["vertical"] == "top":
        y_pos = 0
    elif alignment["vertical"] == "bottom":
        y_pos = source_size["height"] - new_height
    else:  # middle
        y_pos = (source_size["height"] - new_height) // 2

    # Paste the resized image onto the source canvas
    source_canvas.paste(resized_img, (x_pos, y_pos))
    return source_canvas


def position_image_on_canvas(resized_img, canvas_position, user_modifications):
    """Position the resized image on the canvas using user modifications."""
    # Scale to fit within canvas_position
    scale_width = canvas_position["width"] / resized_img.width
    scale_height = canvas_position["height"] / resized_img.height
    scale = min(scale_width, scale_height)

    final_width = int(resized_img.width * scale)
    final_height = int(resized_img.height * scale)
    final_img = resized_img.resize(
        (canvas_position["width"], canvas_position["height"])
    )

    # Create a tile canvas
    tile_canvas = Image.new(
        "RGB", (canvas_position["width"], canvas_position["height"]), (255, 255, 255)
    )

    # Determine alignment
    alignment = user_modifications.get(
        "alignment", {"horizontal": "center", "vertical": "middle"}
    )
    if alignment["horizontal"] == "left":
        x_pos = 0
    elif alignment["horizontal"] == "right":
        x_pos = canvas_position["width"] - final_width
    else:  # center
        x_pos = (canvas_position["width"] - final_width) // 2

    if alignment["vertical"] == "top":
        y_pos = 0
    elif alignment["vertical"] == "bottom":
        y_pos = canvas_position["height"] - final_height
    else:  # middle
        y_pos = (canvas_position["height"] - final_height) // 2

    tile_canvas.paste(final_img, (x_pos, y_pos))
    return tile_canvas


def create_tiled_image(variant):
    # Create a blank canvas
    canvas_size = variant["canvas_size"]
    canvas = Image.new("RGB", (canvas_size, canvas_size), (255, 255, 255))

    for texture in variant["textures"]:
        if texture["type"] == "image":

            try:
                # Check if content is a byte stream
                if isinstance(texture["content"], bytes):
                    img = Image.open(io.BytesIO(texture["content"]))
                else:
                    # Assume content is a file path
                    img = Image.open(texture["content"])

                # Ensure the image is loaded
                img.load()
            except Exception as e:
                print(f"Error loading image for texture ID {texture['id']}: {e}")
                continue

            # Process image for source size
            resized_img = process_image_for_source_size(img, texture["source_size"])

            # Apply user modifications and position on canvas
            user_modifications = texture.get("user_modifications", {})
            tile_canvas = position_image_on_canvas(
                resized_img, texture["canvas_position"], user_modifications
            )

            # Calculate position on the main canvas
            x = texture["canvas_position"]["x"]
            y = texture["canvas_position"]["y"]

            # Paste the processed image onto the main canvas
            canvas.paste(tile_canvas, (x, y))

        elif texture["type"] == "color":
            # Create a colored rectangle
            color = texture["content"]
            x = texture["canvas_position"]["x"]
            y = texture["canvas_position"]["y"]
            width = texture["canvas_position"]["width"]
            height = texture["canvas_position"]["height"]
            draw = ImageDraw.Draw(canvas)
            draw.rectangle([x, y, x + width, y + height], fill=color)

    # Flip the image
    canvas = canvas.transpose(Image.FLIP_TOP_BOTTOM)
    # Save or display the image
    output = io.BytesIO()
    canvas.save(output, format="PNG")
    output.seek(0)
    return output.getvalue()


def variant_to_texture(id_variant: str, textures: List[Dict[str, Any]]) -> bytes:
    """Create texture data image using the given variant ID and textures."""
    # Retrieve product configurations from the API
    products_json = customizables(debug=True)
    my_variant = next(
        (v for v in products_json["variants"] if v["id"] == id_variant), None
    )

    if not my_variant:
        raise ValueError(f"Variant with ID {id_variant} not found in variants.")

    # Update the variant's textures with the provided textures
    for texture in textures:
        for variant_texture in my_variant["textures"]:
            if variant_texture["id"] == texture["id"]:
                if variant_texture["type"] == "image" and is_viz_like(
                    texture["content"]
                ):
                    # Convert chart to PNG if content is a chart
                    variant_texture["content"] = chart_to_png(texture["content"])
                else:
                    # Directly assign content for non-chart textures
                    variant_texture["content"] = texture["content"]
                # Update other properties if needed
                variant_texture["user_modifications"] = texture.get(
                    "user_modifications", variant_texture.get("user_modifications", {})
                )

    # Create the tiled image using the updated variant
    texture_data = create_tiled_image(my_variant)
    return texture_data
