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
    debounce(form, () => form.requestSubmit());
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

const DEFAULT_DEBOUNCE = 500;

function debounce(target: HTMLElement, callback: () => void) {
  let run = debounced.get(target);
  if (!run) {
    const wait = parseIntOr(target.dataset.inputDebounce, DEFAULT_DEBOUNCE);
    if (wait == 0) {
      run = callback;
    } else {
      run = justDebounce(callback, wait);
    }
    debounced.set(target, run);
  }
  run();
}
const debounced = new WeakMap<HTMLElement, () => void>();

function parseIntOr(value: string | undefined, defaultValue: number) {
  return value ? parseInt(value) : defaultValue;
}
