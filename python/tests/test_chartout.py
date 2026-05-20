import pytest
import chartout


def test_store_instantiates():
    store = chartout.Store()
    assert store.cart == []
    assert store.active_item is None


def test_store_with_cart_item():
    png_bytes = (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
        b'\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00'
        b'\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18'
        b'\xd8N\x00\x00\x00\x00IEND\xaeB`\x82'
    )
    item = chartout.CartItem(
        id='canvas_10x10',
        name='Canvas (10″×10″)',
        quantity=1,
        placements=[chartout.Placement(placement_id='default', content=png_bytes)],
    )
    store = chartout.Store(chartout.Cart([item]))
    assert len(store.cart) == 1
    assert store.cart[0]['id'] == 'canvas_10x10'


def test_placement_position_defaults():
    pos = chartout.PlacementPosition()
    assert pos.scale is None
    assert pos.horizontal == chartout.Horizontal.center
    assert pos.vertical == chartout.Vertical.middle


def test_cart_item_model():
    item = chartout.CartItem(id='mug_black_11oz', name='Mug', quantity=2)
    assert item.quantity == 2


def test_public_api():
    """Ensure expected symbols are exported and dev helpers are not."""
    assert hasattr(chartout, 'Store')
    assert hasattr(chartout, 'Cart')
    assert hasattr(chartout, 'CartItem')
    assert hasattr(chartout, 'Placement')
    assert hasattr(chartout, 'PlacementPosition')
    assert hasattr(chartout, 'VizLike')
    assert not hasattr(chartout, 'altair_comet')
    assert not hasattr(chartout, 'altair_heatmap')
    assert not hasattr(chartout, 'altair_map_selection')
