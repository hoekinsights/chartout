/**
 * Polyfill SharedArrayBuffer as ArrayBuffer for environments where it's
 * unavailable (e.g. pages without Cross-Origin-Opener-Policy headers).
 *
 * @nick/resvg's brocha.js brotli decompressor references SharedArrayBuffer
 * for type-checking only. The underlying resvg WASM binary uses a plain
 * ArrayBuffer for its linear memory, so actual cross-thread sharing is never
 * needed. Aliasing SharedArrayBuffer → ArrayBuffer is safe here.
 */
if (typeof globalThis.SharedArrayBuffer === 'undefined') {
  (globalThis as unknown as Record<string, unknown>).SharedArrayBuffer =
    globalThis.ArrayBuffer;
}
