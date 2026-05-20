/**
 * Type declaration for the 'chartout/render' subpath export.
 *
 * widgetRender is the anywidget render function that mounts the full
 * chartout React widget. It is built with React, ReactDOM, and
 * @anywidget/react externalized, so consumers must provide them.
 */
declare module 'chartout/render' {
  const widgetRender: (args: {
    model: unknown;
    el: HTMLElement;
    experimental: unknown;
  }) => void | (() => void) | Promise<void | (() => void)>;
  export { widgetRender };
}
