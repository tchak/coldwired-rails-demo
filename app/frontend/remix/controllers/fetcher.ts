import { Controller } from '@hotwired/stimulus';
import invariant from 'tiny-invariant';

import { isFormElement } from '../dom';
import { registerForm, unregisterForm } from '../form';

export class FetcherController extends Controller {
  connect() {
    invariant(isFormElement(this.element), '"fetcher" can only be registerd on form elements');
    registerForm(this.element);
  }

  disconnect() {
    if (isFormElement(this.element)) {
      unregisterForm(this.element);
    }
  }
}
