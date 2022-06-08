import { Controller } from '@hotwired/stimulus';
import justDebounce from 'just-debounce-it';

import { willSubmitForm } from '../event-listeners';
import { isInputOrTextAreaElement, isInputOrSelectElement } from '../dom';

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
  const input = event.target as { form?: HTMLFormElement };
  const form = input.form;

  if (form && isInputOrTextAreaElement(input) && willSubmitForm(form, input)) {
    debounce(form, () => form.requestSubmit());
  }
}

function onChange(event: Event) {
  const input = event.target as { form?: HTMLFormElement };
  const form = input.form;

  if (form && isInputOrSelectElement(input) && willSubmitForm(form, input)) {
    form.requestSubmit();
  }
}

const DEFAULT_DEBOUNCE = 500;

function debounce(target: HTMLElement, callback: () => void) {
  let run = debounced.get(target);
  if (!run) {
    const wait = parseIntOr(target.dataset.debounceWait, DEFAULT_DEBOUNCE);
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
