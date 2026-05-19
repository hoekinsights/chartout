import { useEffect, useRef } from 'react';
import type { ChartoutModel } from './model';

// The chartout npm package exports a single render function that mounts
// the widget into a DOM element and binds it to a model.
import chartout from 'chartout';

interface Props {
  model: ChartoutModel;
  style?: React.CSSProperties;
}

/**
 * Mounts the chartout widget into a DOM element.
 *
 * The widget reads cart and active_item from the model.
 * It writes active_texture back to the model as the user interacts
 * (e.g. when switching variants, the new composite texture is rendered
 * and stored in active_texture).
 *
 * Pass `model` from createModel() and subscribe to active_texture
 * changes on the model to receive the rendered texture.
 */
export function ChartoutWidget({ model, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // render() returns a cleanup function that unmounts the widget
    const cleanup = chartout.render({ model, el: ref.current, experimental: {} });
    return () => cleanup?.();
  }, [model]);

  return <div ref={ref} style={{ width: '100%', height: '100%', ...style }} />;
}
