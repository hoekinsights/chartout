from dataclasses import dataclass
from typing import Union, Dict, Tuple, Optional, Literal
from PIL import Image
import io

@dataclass
class TilePosition:
    """Position and size configuration for a tile within the canvas."""
    x: int  # Top-left x coordinate
    y: int  # Top-left y coordinate
    width: int  # Tile width
    height: int  # Tile height

@dataclass
class TileSourceSize:
    """Configuration for the source size of a tile."""
    width: int
    height: int
    alignment: Literal["left", "center", "right"] = "center"

@dataclass
class TileConfig:
    """Configuration for a single tile in the grid."""
    content: Union[str, Tuple[int, int, int]]  # Either path to PNG or RGB color tuple
    position: TilePosition  # Position and size within canvas - must come before optional params
    is_image: bool = False  # True if content is a path to PNG, False if it's a color
    source_size: Optional[TileSourceSize] = None  # Required for images, ignored for colors

@dataclass
class GridConfig:
    """Configuration for the entire canvas."""
    canvas_size: int  # Width/height of the square canvas

def process_image_for_tile(image: Image.Image, source_size: TileSourceSize) -> Image.Image:
    """Process an image maintaining aspect ratio and handling alignment."""
    orig_width, orig_height = image.size
    aspect_ratio = orig_width / orig_height
    
    new_height = source_size.height
    new_width = int(new_height * aspect_ratio)
    
    resized_img = image.resize((new_width, new_height))
    canvas = Image.new('RGB', (source_size.width, source_size.height), (255, 255, 255))
    
    if source_size.alignment == "left":
        x_pos = 0
    elif source_size.alignment == "right":
        x_pos = source_size.width - new_width
    else:  # center
        x_pos = (source_size.width - new_width) // 2
        
    canvas.paste(resized_img, (x_pos, 0))
    return canvas

def create_tiled_image(config: GridConfig, tiles: Dict[int, TileConfig]) -> bytes:
    """Create a tiled image based on configuration."""
    # Create base image
    img = Image.new('RGB', (config.canvas_size, config.canvas_size), (255, 255, 255))
    
    # Process each tile
    for idx, tile_config in tiles.items():
        if idx not in range(4):
            raise ValueError(f"Invalid tile index: {idx}. Must be 0-3.")
        
        if tile_config.is_image:
            if not tile_config.source_size:
                raise ValueError(f"Source size must be specified for image tile at index {idx}")
                
            # Load and process PNG
            with Image.open(tile_config.content) as tile_img:
                # Process image to source size with alignment
                processed_img = process_image_for_tile(tile_img, tile_config.source_size)
                # Resize to final tile size
                processed_img = processed_img.resize(
                    (tile_config.position.width, tile_config.position.height)
                )
                img.paste(processed_img, (tile_config.position.x, tile_config.position.y))
        else:
            # Fill with color
            color_tile = Image.new(
                'RGB', 
                (tile_config.position.width, tile_config.position.height), 
                tile_config.content
            )
            img.paste(color_tile, (tile_config.position.x, tile_config.position.y))
    
    output = io.BytesIO()
    img.save(output, format='PNG')
    output.seek(0)
    return output.getvalue() 