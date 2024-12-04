import pytest
from chartout import chart_to_template_png, chart_to_shop

def test_chart_to_template_png():
    # Mock chart object
    chart = ...  # Create a mock or fixture for the chart
    result = chart_to_template_png(chart)
    assert result.endswith(".png")

def test_chart_to_shop():
    # Mock chart object
    chart = ...  # Create a mock or fixture for the chart
    page = chart_to_shop(chart)
    assert page is not None


'''
import solara
import pyvista as pv
from PIL import Image, ImageDraw


def chart_to_template_png(chart, product="mug"):
    # save chart
    chart.save("chart.png", scale_factor=1.5)

    # start with an square white image
    img = Image.new("RGB", (1342, 1342), (255, 255, 255))

    # add black rectangle in top-left corner
    draw = ImageDraw.Draw(img)
    top_left = (0, 0)
    bottom_right = (670, 670)
    draw.rectangle([top_left, bottom_right], fill=(0, 0, 0))

    # open the chart image, resize and transpose
    chart_img = Image.open("chart.png")
    chart_img = chart_img.resize((335, 670))
    chart_img = chart_img.transpose(Image.FLIP_TOP_BOTTOM)

    # add to the use-defined location on product ('center')
    paste_position = (167, 671)
    img.paste(chart_img, paste_position)

    # img.show()
    fname = f"template_{product}.png"
    img.save(fname, "PNG")
    return fname


def chart_to_shop(chart, product="mug"):
    fname = chart_to_template_png(chart)
    variant = solara.reactive(product)
    template_product = solara.reactive(fname)

    @solara.component
    def Page():
        products = {
            "mug": {
                "mesh_file": "api/static/403-11oz-color-mug.glb",
                "texture_file": "chart_mug_texture_T.png",
                "texture_id": "2.0.0",
            },
            "canvas": {
                "mesh_file": "api/static/3-12x12-canvas.glb",
                "texture_file": "chart_canvas_texture_T.png",
                "texture_id": "0.1.0.0",
            },
        }

        def construct_id_prefix(prefix, index):
            return f"{prefix}.{index}" if prefix is not None else f"{index}"

        def assign_ids(dataset, id_prefix=None, part_ids=None):
            if part_ids is None:
                part_ids = {}
            if isinstance(dataset, pv.MultiBlock):
                for i in range(dataset.n_blocks):
                    new_id_prefix = construct_id_prefix(id_prefix, i)
                    assign_ids(dataset[i], new_id_prefix, part_ids)
            else:
                part_ids[id_prefix] = dataset
            return part_ids

        def add_parts_with_texture(pl, part_ids, texture_part_id, texture):
            for part_id, part in part_ids.items():
                if part_id == texture_part_id:
                    pl.add_mesh(
                        part, texture=texture, diffuse=0.5, specular=0.2, ambient=0.4
                    )
                else:
                    pl.add_mesh(part, diffuse=0.5, specular=0.2, ambient=0.4)

        def show_product(product):
            ds = pv.read(product["mesh_file"])
            # tex = pv.read_texture(product['texture_file'])
            tex = pv.read_texture(template_product.value)
            part_ids = assign_ids(ds)

            pl = pv.Plotter(lighting="three lights")
            add_parts_with_texture(pl, part_ids, product["texture_id"], tex)
            pl.show(cpos="xy", jupyter_backend="html", return_viewer=False)  #'client' )
            # return viewer

        with solara.Card():  # "Altair-Goodies 🎉"
            with solara.Column():
                solara.Select(
                    label="Product",
                    values=["mug", "canvas"],
                ).connect(variant)

            with solara.Columns([8, 4]):
                with solara.Column():
                    # product = products['canvas']
                    product = products[variant.value]
                    show_product(product)
                    # ds = pv.read('mug.ply')
                    # tex = pv.read_texture(template_product.value)
                    # pl = pv.Plotter(lighting='three lights')
                    # pl.add_mesh(ds, texture=tex, diffuse=0.5, specular=0.2, ambient=0.4, color='w')
                    # pl.camera.zoom('tight')
                    # #pl.show(cpos='xy', jupyter_backend='client')
                    # pl.show(cpos='xy', jupyter_backend='html')
                with solara.Column():
                    solara.Image("payment-mockup.png")

    return Page()
'''