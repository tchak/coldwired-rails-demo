export { createRailsRouter } from './router';
export { FetcherController } from './controllers/fetcher';
export { SubmitOnChangeController } from './controllers/submit-on-change';

export function onLoad(callback: () => void) {
  if (document.readyState == 'loading') {
    addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
}
