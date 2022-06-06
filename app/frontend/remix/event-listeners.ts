import type { Router } from '@remix-run/router';
import justDebounce from 'just-debounce-it';

import { submitForm, getFetcherKey } from './form';
import { shouldProcessLinkClick } from './dom';

export function registerEventListeners(router: Router) {
  const unsubscribe = [
    registerEventListener('click', (event) => onLinkClick(router, event as MouseEvent)),
    registerEventListener('submit', (event) => onSubmit(router, event as SubmitEvent)),
    registerEventListener('change', (event) => onChange(router, event)),
    registerEventListener('input', (event) => onInput(router, event)),
  ];

  return () => unsubscribe.forEach((unsubscribe) => unsubscribe());
}

function registerEventListener(event: string, callback: (event: Event) => void) {
  addEventListener(event, callback);
  return () => removeEventListener(event, callback);
}

function onLinkClick(router: Router, event: MouseEvent) {
  const target = event.target as HTMLAnchorElement;
  if (target.tagName == 'A' && willFollowLink(event, target)) {
    event.preventDefault();

    router.navigate(target.pathname);
  }
}

function onSubmit(router: Router, event: SubmitEvent) {
  const submitter = event.submitter as HTMLInputElement | undefined;
  const form = submitter?.form || (event.target as HTMLFormElement);

  if (form.tagName == 'FORM' && willSubmitForm(form, submitter)) {
    event.preventDefault();

    if (willFetch(form)) {
      submitForm(router, form, submitter, { fetcherKey: getFetcherKey(form), replace: true });
    } else {
      submitForm(router, form, submitter, { replace: true });
    }
  }
}

function onInput(_: Router, event: Event) {
  const input = event.target as HTMLInputElement;
  const form = input.form;

  if (input.matches('input, textarea') && form && willSubmitOnInput(form, input)) {
    debounce(form, () => form.requestSubmit(), 500);
  }
}

function onChange(_: Router, event: Event) {
  const input = event.target as HTMLInputElement;
  const form = input.form;

  if (input.matches('input, select') && form && willSubmitOnChange(form, input)) {
    form.requestSubmit();
  }
}

function willFollowLink(event: MouseEvent, link: HTMLAnchorElement) {
  return isEnabled(link) && shouldProcessLinkClick(event, link.target);
}

function willSubmitOnInput(form: HTMLFormElement, input: HTMLInputElement) {
  return willSubmitForm(form, input) && willSubmitOn(form, 'input');
}

function willSubmitOnChange(form: HTMLFormElement, input: HTMLInputElement) {
  return willSubmitForm(form, input) && willSubmitOn(form, 'change');
}

function willFetch(form: HTMLFormElement) {
  return !!form.dataset.fetcher;
}

function isEnabled(element: HTMLElement) {
  const container = element.closest<HTMLElement>(`[data-remix]`);
  if (container) {
    return container.dataset.remix != 'false';
  }
  return element.dataset.remix != 'false';
}

function willSubmitForm(form: HTMLFormElement, submitter?: HTMLButtonElement | HTMLInputElement) {
  if (submitter) {
    return isEnabled(submitter) || isEnabled(form);
  }
  return isEnabled(form);
}

function willSubmitOn(target: HTMLFormElement, event: string): boolean {
  if (event == 'input') {
    switch (target.type) {
      case 'checkbox':
      case 'radio':
      case 'range':
        return false;
    }
  }
  const submitOn = target.dataset.submitOn ?? '';
  const events = submitOn
    .toLowerCase()
    .split(' ')
    .map((eventName) => eventName.trim());

  return events.includes(event);
}

function debounce(target: HTMLElement, callback: () => void, wait: number) {
  const run = debounced.get(target) ?? justDebounce(callback, wait);
  debounced.set(target, run);
  run();
}
const debounced = new WeakMap<HTMLElement, () => void>();
