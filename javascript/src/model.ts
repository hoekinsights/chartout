/**
 * Creates a standalone anywidget-compatible model.
 *
 * The chartout widget uses the anywidget model protocol to sync state —
 * the same protocol used by Jupyter widgets. This function creates a
 * standalone model that implements that protocol, so the widget can be
 * embedded in any JavaScript application without Jupyter.
 *
 * State flows:
 *   → cart              set by you — list of cart items to show
 *   → active_item       set by you — item currently shown in the viewer; placements carry PNG content
 *   → view              set by you — "cart" | "checkout"
 *   → shipping_location set by you — pre-fills checkout country/state selector
 *   ← active_texture    written by the widget — the rendered composite texture
 *
 * Reference: https://anywidget.dev/en/afm/
 */

import type { CartItem, ActiveItem, ActiveTexture, StoreView, ShippingLocation } from 'chartout';

export interface ChartoutState {
  cart: CartItem[];
  active_item: ActiveItem | null;
  active_texture: ActiveTexture | null;
  view: StoreView;
  shipping_location: ShippingLocation;
}

export interface ChartoutModel {
  get<K extends keyof ChartoutState>(key: K): ChartoutState[K];
  set<K extends keyof ChartoutState>(key: K, value: ChartoutState[K]): void;
  save_changes(): void;
  send(): void;
  on(event: string, callback: () => void): void;
  off(event?: string | null, callback?: (() => void) | null): void;
}

export function createModel(initialState: Partial<ChartoutState> = {}): ChartoutModel {
  const state: ChartoutState = {
    cart: [],
    active_item: null,
    active_texture: null,
    view: 'cart',
    shipping_location: { country: '', state: '' },
    ...initialState,
  };

  const listeners: Record<string, Set<() => void>> = {};

  return {
    get(key) {
      return state[key];
    },
    set(key, value) {
      (state as any)[key] = value;
      listeners[`change:${key}`]?.forEach(cb => cb());
    },
    save_changes() {},
    send() {},
    on(event, callback) {
      listeners[event] ??= new Set();
      listeners[event].add(callback);
    },
    off(event, callback) {
      if (!event) {
        Object.keys(listeners).forEach(k => delete listeners[k]);
        return;
      }
      if (!callback) {
        delete listeners[event];
        return;
      }
      listeners[event]?.delete(callback);
    },
  };
}
