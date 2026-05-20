import './polyfills'; // must be first — patches SharedArrayBuffer before @nick/resvg loads
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);
