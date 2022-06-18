/* eslint-disable react-hooks/rules-of-hooks */
import { createBrowserTurboRouter, classList } from 'remix-router-turbo';
import { Application, Controller } from '@hotwired/stimulus';

import routes from '../routes.json';

const application = new Application();

class ToggleController extends Controller {
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
      classList(element).toggle('hidden');
      const input = element.querySelector<HTMLInputElement>('input[autofocus]');
      if (input && !element.classList.contains('hidden')) {
        this.focusInput(input);
      }
    }
  }

  private focusInput(input: HTMLInputElement) {
    const length = input.value.length;
    input.focus();
    input.setSelectionRange(length, length);
  }

  private focusButton() {
    this.element.querySelector<HTMLButtonElement>('button[data-toggle-target="toggle"]')?.focus();
  }
}

application.register('toggle', ToggleController);

createBrowserTurboRouter({ routes, application, debug: true });
