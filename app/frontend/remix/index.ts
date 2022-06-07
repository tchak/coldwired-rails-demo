export { createRailsRouter } from './router';

export function onLoad(callback: () => void) {
  if (document.readyState == 'loading') {
    addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
}
