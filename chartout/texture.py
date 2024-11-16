from PIL import Image, ImageDraw


def chart_to_texture(chart, product="403-11oz-color-mug"):
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
    fname = f"texture_{product}.png"
    img.save(fname, "PNG")
    return fname
