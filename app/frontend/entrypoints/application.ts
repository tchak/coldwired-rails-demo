import type { Fetcher } from 'remix-router-turbo';
import { createBrowserTurboRouter, Application } from 'remix-router-turbo';
import { Application as Stimulus, Controller } from '@hotwired/stimulus';

import routes from '../routes.json';

const router = createBrowserTurboRouter({ routes });
const application = new Application({ router });
const stimulus = new Stimulus();

class TodoController extends Controller {
  static targets = ['toggle'];
  declare readonly toggleTargets: HTMLInputElement[];

  close(event: KeyboardEvent) {
    if (event.key == 'Escape' || event.key == 'Enter') {
      if (event.target instanceof HTMLInputElement) {
        event.target.blur();
        requestAnimationFrame(() => this.focusButton());
      }
    }
  }

  toggle() {
    for (const element of this.toggleTargets) {
      element.setAttribute('data-turbo-permanent', 'client');
      element.classList.toggle('hidden');
      const input = element.querySelector<HTMLInputElement>('input[autofocus]');
      if (input && !element.classList.contains('hidden')) {
        this.focusInput(input);
      }
    }
  }

  update(event: CustomEvent<{ fetcher: Fetcher }>) {
    const fetcher = event.detail.fetcher;
    if (fetcher.state == 'submitting') {
      const title = fetcher.formData.get('todo[title]');
      const label = (event.target as Element).querySelector('.label');
      if (label) {
        label.textContent = String(title);
      }
    }
  }

  private focusInput(input: HTMLInputElement) {
    const length = input.value.length;
    input.focus();
    input.setSelectionRange(length, length);
  }

  private focusButton() {
    this.element.querySelector<HTMLButtonElement>('button[data-todo-target="toggle"]')?.focus();
  }
}

stimulus.register('todo', TodoController);

application.start();
stimulus.start();
