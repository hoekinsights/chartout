import { useEffect, useRef } from 'react';
import type { ChartoutModel } from 'chartout';
// widgetRender mounts the full chartout React widget.
// Requires @anywidget/react as a peer (provided by this package).
import { widgetRender } from 'chartout/render';

interface Props {
  model: ChartoutModel;
  style?: React.CSSProperties;
}

/**
 * React component that mounts the chartout widget into the DOM.
 *
 * Use this when embedding the widget in a React application outside Jupyter.
 * The widget reads cart and active_item from the model and writes
 * active_texture back as the user interacts.
 *
 * @example
 *   import { createChartoutModel } from 'chartout';
 *   import { ChartoutWidget } from './ChartoutWidget';
 *
 *   const model = createChartoutModel({});
 *   model.set('active_item', { id: 'canvas_10x10', ... });
 *
 *   <ChartoutWidget model={model} />
 */
export function ChartoutWidget({ model, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // widgetRender expects anywidget's full AnyModel; ChartoutModel is a compatible
    // subset at runtime. Cast to any to satisfy the stricter static types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = widgetRender({ model: model as any, el: ref.current, experimental: {} as any });
    // createRender may return void, a sync cleanup fn, or a Promise resolving to one.
    let syncCleanup: (() => void) | undefined;
    if (typeof result === 'function') {
      syncCleanup = result as () => void;
    } else if (result instanceof Promise) {
      result.then(fn => { if (typeof fn === 'function') syncCleanup = fn as () => void; });
    }
    return () => syncCleanup?.();
  }, [model]);

  return <div ref={ref} style={{ width: '100%', height: '100%', ...style }} />;
}
