import type { NavigationStates, Navigation } from '@remix-run/router';
import morphdom from 'morphdom';

import { dispatch } from './dom';

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
      if (document.activeElement?.isSameNode(fromEl) && isFormInput(fromEl)) {
        mergeFocusedInput(fromEl, toEl as HTMLInputElement);
        return false;
      }
      return true;
    },
  });
}

function parseHTML(html: string) {
  return new DOMParser().parseFromString(html, 'text/html');
}

type HTMLFormInputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type HTMLTextualInputElement = HTMLInputElement | HTMLTextAreaElement;

function mergeFocusedInput(target: HTMLFormInputElement, source: HTMLFormInputElement) {
  if (target.tagName != 'SELECT') {
    mergeAttrs(target, source, ['value', 'checked']);
  }
  if ('readOnly' in source && source.readOnly) {
    target.setAttribute('readonly', 'readonly');
  } else {
    target.removeAttribute('readonly');
  }
  if (isTextualInput(target)) {
    target.value = source.value;
  }
  if (isCheckableInput(target) && isCheckableInput(source)) {
    target.checked = source.checked;
  }
}

function mergeAttrs(target: HTMLElement, source: HTMLElement, exclude: string[] = []) {
  for (const { name } of source.attributes) {
    if (!exclude.includes(name)) {
      target.setAttribute(name, source.getAttribute(name) ?? '');
    }
  }

  for (const { name } of target.attributes) {
    if (!source.hasAttribute(name)) {
      target.removeAttribute(name);
    }
  }
}

function isFormInput(element: HTMLElement & { type?: string }): element is HTMLFormInputElement {
  return /^(?:input|select|textarea)$/i.test(element.tagName) && element.type != 'button';
}

function isTextualInput(
  element: HTMLElement & { type?: string }
): element is HTMLTextualInputElement {
  return 'type' in element && FOCUSABLE_INPUTS.includes(element.type ?? '');
}

function isCheckableInput(element: HTMLElement & { type?: string }): element is HTMLInputElement {
  return 'type' in element && CHECKABLE_INPUTS.includes(element.type ?? '');
}

const FOCUSABLE_INPUTS = [
  'text',
  'textarea',
  'number',
  'email',
  'password',
  'search',
  'tel',
  'url',
  'date',
  'time',
  'datetime-local',
  'color',
  'range',
];
const CHECKABLE_INPUTS = ['checkbox', 'radio'];

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
