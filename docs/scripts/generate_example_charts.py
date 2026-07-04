"""Generate the penguin chart SVGs used on the Python example-usage docs page.

Each chart is rendered by the *real* library (Altair via vl_convert, matplotlib
via its SVG backend) so the docs previews and the store textures show authentic
output, not browser approximations. Sizes follow the product print ratios:

    scatter  → canvas   (1:1)
    andrews  → mug       (18:7, wide)
    heatmap  → mousepad  (6:5, near-square)

Run from the docs repo root:  pixi run python scripts/generate_example_charts.py
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import altair as alt
from altair.datasets import data

OUT = Path(__file__).resolve().parent.parent / "public" / "charts"
OUT.mkdir(parents=True, exist_ok=True)

CLASS = "Species"
COLS = [
    "Beak Length (mm)",
    "Beak Depth (mm)",
    "Flipper Length (mm)",
    "Body Mass (g)",
]

penguins = data.penguins().dropna(subset=[*COLS, CLASS])


# ── Altair ──────────────────────────────────────────────────────────────────────
def altair_scatter() -> alt.Chart:
    """Square scatter → canvas (1:1)."""
    return (
        alt.Chart(penguins)
        .mark_circle(opacity=0.7, size=28)
        .encode(
            alt.X("Flipper Length (mm):Q").scale(zero=False),
            alt.Y("Body Mass (g):Q").scale(zero=False),
            alt.Color(f"{CLASS}:N", legend=None),
        )
        .properties(width=240, height=240, background="white")
    )


def altair_andrews() -> alt.Chart:
    """Andrews curves → mug (18:7, wide)."""
    samples = 100
    frame = penguins.groupby(CLASS, observed=True).head(15).reset_index(drop=True)

    t = np.linspace(-np.pi, np.pi, samples)
    values = frame[COLS].to_numpy(dtype=float)
    values = (values - values.min(axis=0)) / (values.max(axis=0) - values.min(axis=0))
    values = values.T

    curves = np.outer(values[0], np.ones_like(t)) / np.sqrt(2)
    for i in range(1, len(values)):
        fn = np.sin if i % 2 else np.cos
        curves += np.outer(values[i], fn(((i + 1) // 2) * t))

    rows = len(frame)
    plot_data = pd.DataFrame(
        {
            "t": np.tile(t, rows),
            "value": curves.ravel(),
            "sample": np.repeat(np.arange(rows), samples),
            CLASS: np.repeat(frame[CLASS].to_numpy(), samples),
        }
    )
    return (
        alt.Chart(plot_data)
        .mark_line()
        .encode(
            x=alt.X("t:Q").title(None),
            y=alt.Y("value:Q").title(None),
            color=alt.Color(f"{CLASS}:N", legend=None),
            detail="sample:N",
            opacity=alt.value(0.5),
        )
        .properties(width=468, height=182, background="white")
    )


def altair_heatmap() -> alt.Chart:
    """Binned density → mousepad (6:5, near-square)."""
    return (
        alt.Chart(penguins)
        .mark_rect()
        .encode(
            alt.X("Beak Length (mm):Q").bin(maxbins=20),
            alt.Y("Beak Depth (mm):Q").bin(maxbins=20),
            alt.Color("count():Q", legend=None).scale(scheme="blues"),
        )
        .properties(width=252, height=210, background="white")
    )


# ── matplotlib ──────────────────────────────────────────────────────────────────
def _mpl():
    import matplotlib

    matplotlib.use("svg")
    import matplotlib.pyplot as plt

    # Embed glyphs as paths so the SVG rasterises without a font dependency.
    plt.rcParams["svg.fonttype"] = "path"
    return plt


def matplotlib_scatter(plt) -> "plt.Figure":
    fig, ax = plt.subplots(figsize=(3, 3))
    for species, grp in penguins.groupby(CLASS, observed=True):
        ax.scatter(grp["Flipper Length (mm)"], grp["Body Mass (g)"], s=12, alpha=0.7, label=species)
    ax.set(xlabel="Flipper Length (mm)", ylabel="Body Mass (g)")
    fig.tight_layout()
    return fig


def matplotlib_andrews(plt) -> "plt.Figure":
    from pandas.plotting import andrews_curves

    frame = penguins.groupby(CLASS, observed=True).head(15).reset_index(drop=True)
    fig, ax = plt.subplots(figsize=(6.0, 2.33))
    andrews_curves(frame[[*COLS, CLASS]], CLASS, ax=ax)
    if ax.get_legend():
        ax.get_legend().remove()
    ax.set(xlabel=None)
    fig.tight_layout()
    return fig


def matplotlib_heatmap(plt) -> "plt.Figure":
    fig, ax = plt.subplots(figsize=(3.0, 2.5))
    ax.hist2d(penguins["Beak Length (mm)"], penguins["Beak Depth (mm)"], bins=20, cmap="Blues")
    ax.set(xlabel="Beak Length (mm)", ylabel="Beak Depth (mm)")
    fig.tight_layout()
    return fig


def main() -> None:
    for name, chart in [
        ("penguins-altair-scatter", altair_scatter()),
        ("penguins-altair-andrews", altair_andrews()),
        ("penguins-altair-heatmap", altair_heatmap()),
    ]:
        path = OUT / f"{name}.svg"
        chart.save(str(path))
        print(f"wrote {path.relative_to(OUT.parent.parent)} ({path.stat().st_size // 1024} KB)")

    plt = _mpl()
    for name, fig in [
        ("penguins-matplotlib-scatter", matplotlib_scatter(plt)),
        ("penguins-matplotlib-andrews", matplotlib_andrews(plt)),
        ("penguins-matplotlib-heatmap", matplotlib_heatmap(plt)),
    ]:
        path = OUT / f"{name}.svg"
        fig.savefig(str(path), format="svg", bbox_inches="tight")
        plt.close(fig)
        print(f"wrote {path.relative_to(OUT.parent.parent)} ({path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
