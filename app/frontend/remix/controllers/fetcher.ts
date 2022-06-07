import { Controller } from '@hotwired/stimulus';

import { isFormElement } from '../dom';
import { registerForm, unregisterForm } from '../form';

export class FetcherController extends Controller {
  connect() {
    if (isFormElement(this.element)) {
      registerForm(this.element);
    }
  }

  disconnect() {
    if (isFormElement(this.element)) {
      unregisterForm(this.element);
    }
  }
}
