import { Controller } from '@hotwired/stimulus';
import justDebounce from 'just-debounce-it';

import { willSubmitForm } from '../event-listeners';

export class SubmitOnChangeController extends Controller {
  connect() {
    this.element.addEventListener('input', onInput);
    this.element.addEventListener('change', onChange);
  }

  disconnect() {
    this.element.removeEventListener('input', onInput);
    this.element.removeEventListener('change', onChange);
  }
}

function onInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const form = input.form;

  if (
    form &&
    input.matches('input, textarea') &&
    willSubmitForm(form, input) &&
    isTextInput(input)
  ) {
    debounce(form, () => form.requestSubmit(), 500);
  }
}

function onChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const form = input.form;

  if (form && input.matches('input, select') && willSubmitForm(form, input)) {
    form.requestSubmit();
  }
}

function isTextInput(input: HTMLInputElement | HTMLTextAreaElement) {
  switch (input.type) {
    case 'checkbox':
    case 'radio':
    case 'range':
      return false;
  }

  return true;
}

function debounce(target: HTMLElement, callback: () => void, wait: number) {
  const run = debounced.get(target) ?? justDebounce(callback, wait);
  debounced.set(target, run);
  run();
}
const debounced = new WeakMap<HTMLElement, () => void>();
