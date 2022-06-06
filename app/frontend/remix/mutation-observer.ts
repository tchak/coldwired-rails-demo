import type { Router } from '@remix-run/router';

import { registerForms, unregisterForms } from './form';

export function registerMutationObserver(router: Router) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type == 'childList') {
        for (const node of mutation.addedNodes) {
          registerForms(node, router);
        }
        for (const node of mutation.removedNodes) {
          unregisterForms(node, router);
        }
      }
    }
  });

  registerForms(document.body, router);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}
