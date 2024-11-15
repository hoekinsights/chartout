__version__ = "0.0.1dev"

# __all__ = ["store", "session", "cart"]

from typing import Any
import anywidget
import traitlets
import pathlib


class ChartoutWidget(anywidget.AnyWidget):
    # _esm = "https://chartout.io/bundle/Widget.js"
    # _css = "https://chartout.io/bundle/styles.css"

    _esm = pathlib.Path("../app/bundle/Widget.js")
    _css = pathlib.Path("../app/bundle/styles.css")

    value = traitlets.Int(0).tag(sync=True)
