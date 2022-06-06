import type { NavigationStates, Navigation } from '@remix-run/router';
import morphdom from 'morphdom';

import { dispatch, isCheckableInputElement, isTextInputElement } from './dom';

export function renderPage(html: string, navigation: NavigationStates['Idle']) {
  try {
    const doc = parseHTML(html);
    beforeRender(navigation, doc.body);
    document.head.title = doc.head.title;
    renderElement(document.body, doc.body);
    afterRender(navigation);
  } catch (error) {
    renderError(navigation, error as Error);
  }
}

export function renderElement(from: HTMLElement, to: HTMLElement, childrenOnly = false) {
  morphdom(from, to, {
    childrenOnly,
    onBeforeElUpdated(fromEl, toEl) {
      if (document.activeElement == fromEl) {
        if (isCheckableInputElement(fromEl) && isCheckableInputElement(toEl)) {
          toEl.checked = fromEl.checked;
        } else if (isTextInputElement(fromEl) && isTextInputElement(toEl)) {
          toEl.value = fromEl.value;
        }
      }
      return true;
    },
  });
}

function parseHTML(html: string) {
  return new DOMParser().parseFromString(html, 'text/html');
}

function beforeRender(navigation: Navigation, element: HTMLElement) {
  dispatch('remix:before-render', { detail: { navigation, element } });
}

function afterRender(navigation: Navigation) {
  dispatch('remix:render', { detail: { navigation } });
}

function renderError(navigation: Navigation, error: Error) {
  console.error('[render error]', navigation.location, error.message);
  dispatch('remix:render-error', { detail: { navigation, error } });
}
