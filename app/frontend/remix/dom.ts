import type { FormEncType, FormMethod } from '@remix-run/router';
import invariant from 'tiny-invariant';

export const defaultMethod = 'get';
const defaultEncType = 'application/x-www-form-urlencoded';

export function isHtmlElement(object: any): object is HTMLElement {
  return object != null && typeof object.tagName == 'string';
}

export function isButtonElement(object: any): object is HTMLButtonElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() == 'button';
}

export function isInputElement(object: any): object is HTMLInputElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() == 'input';
}

export function isTextAreaElement(object: any): object is HTMLInputElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() == 'textarea';
}

export function isSelectElement(object: any): object is HTMLInputElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() == 'select';
}

export function isCheckboxOrRadioInputElement(object: any): object is HTMLInputElement {
  return isInputElement(object) && ['checkbox', 'radio'].includes(object.type);
}

export function isInputOrTextAreaElement(
  object: any
): object is HTMLInputElement | HTMLTextAreaElement {
  return (
    isTextAreaElement(object) ||
    (isInputElement(object) && !['button', 'checkbox', 'radio'].includes(object.type))
  );
}

export function isInputOrSelectElement(
  object: any
): object is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return isInputElement(object) || isTextAreaElement(object) || isSelectElement(object);
}

export function isFormElement(object: any): object is HTMLFormElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() == 'form';
}

type LimitedMouseEvent = Pick<MouseEvent, 'button' | 'metaKey' | 'altKey' | 'ctrlKey' | 'shiftKey'>;

function isModifiedEvent(event: LimitedMouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export function shouldProcessLinkClick(event: LimitedMouseEvent, target?: string) {
  return (
    event.button === 0 && // Ignore everything but left clicks
    (!target || target === '_self') && // Let browser handle "target=_blank" etc.
    !isModifiedEvent(event) // Ignore clicks with modifier keys
  );
}

export type ParamKeyValuePair = [string, string];

export type URLSearchParamsInit =
  | string
  | ParamKeyValuePair[]
  | Record<string, string | string[]>
  | URLSearchParams;

/**
 * Creates a URLSearchParams object using the given initializer.
 *
 * This is identical to `new URLSearchParams(init)` except it also
 * supports arrays as values in the object form of the initializer
 * instead of just strings. This is convenient when you need multiple
 * values for a given key, but don't want to use an array initializer.
 *
 * For example, instead of:
 *
 *   let searchParams = new URLSearchParams([
 *     ['sort', 'name'],
 *     ['sort', 'price']
 *   ]);
 *
 * you can do:
 *
 *   let searchParams = createSearchParams({
 *     sort: ['name', 'price']
 *   });
 */
export function createSearchParams(init: URLSearchParamsInit = ''): URLSearchParams {
  return new URLSearchParams(
    typeof init === 'string' || Array.isArray(init) || init instanceof URLSearchParams
      ? init
      : Object.keys(init).reduce((memo, key) => {
          const value = init[key];
          return memo.concat(Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]);
        }, [] as ParamKeyValuePair[])
  );
}

export function getSearchParamsForLocation(
  locationSearch: string,
  defaultSearchParams: URLSearchParams
) {
  let searchParams = createSearchParams(locationSearch);

  for (let key of defaultSearchParams.keys()) {
    if (!searchParams.has(key)) {
      defaultSearchParams.getAll(key).forEach((value) => {
        searchParams.append(key, value);
      });
    }
  }

  return searchParams;
}

export interface SubmitOptions {
  /**
   * The HTTP method used to submit the form. Overrides `<form method>`.
   * Defaults to "GET".
   */
  method?: FormMethod;

  /**
   * The action URL path used to submit the form. Overrides `<form action>`.
   * Defaults to the path of the current route.
   *
   * Note: It is assumed the path is already resolved.
   */
  action?: string;

  /**
   * The action URL used to submit the form. Overrides `<form encType>`.
   * Defaults to "application/x-www-form-urlencoded".
   */
  encType?: FormEncType;

  /**
   */
  submitter?: HTMLButtonElement | HTMLInputElement;
}

export function getFormSubmissionInfo(
  target:
    | HTMLFormElement
    | HTMLButtonElement
    | HTMLInputElement
    | FormData
    | URLSearchParams
    | { [name: string]: string }
    | null,
  defaultAction: string,
  options: SubmitOptions
): {
  url: URL;
  method: string;
  encType: string;
  formData: FormData;
} {
  let method: string;
  let action: string;
  let encType: string;
  let formData: FormData;

  if (isFormElement(target)) {
    const submitter = options.submitter;

    method = options.method || target.getAttribute('method') || defaultMethod;
    action = options.action || target.getAttribute('action') || defaultAction;
    encType = options.encType || target.getAttribute('enctype') || defaultEncType;

    formData = new FormData(target);

    if (submitter && submitter.name) {
      formData.append(submitter.name, submitter.value);
    }
  } else if (
    isButtonElement(target) ||
    (isInputElement(target) && (target.type === 'submit' || target.type === 'image'))
  ) {
    const form = target.form;

    invariant(form, 'Cannot submit a <button> or <input type="submit"> without a <form>');

    // <button>/<input type="submit"> may override attributes of <form>

    method =
      options.method ||
      target.getAttribute('formmethod') ||
      form.getAttribute('method') ||
      defaultMethod;
    action =
      options.action ||
      target.getAttribute('formaction') ||
      form.getAttribute('action') ||
      defaultAction;
    encType =
      options.encType ||
      target.getAttribute('formenctype') ||
      form.getAttribute('enctype') ||
      defaultEncType;

    formData = new FormData(form);

    // Include name + value from a <button>
    if (target.name) {
      formData.set(target.name, target.value);
    }
  } else if (isHtmlElement(target)) {
    invariant(
      false,
      'Cannot submit element that is not <form>, <button>, or <input type="submit|image">'
    );
  } else {
    method = options.method || defaultMethod;
    action = options.action || defaultAction;
    encType = options.encType || defaultEncType;

    if (target instanceof FormData) {
      formData = target;
    } else {
      formData = new FormData();

      if (target instanceof URLSearchParams) {
        for (const [name, value] of target) {
          formData.append(name, value);
        }
      } else if (target != null) {
        for (const [name, value] of Object.entries(target)) {
          formData.append(name, value);
        }
      }
    }
  }

  const { protocol, host } = window.location;
  const url = new URL(action, `${protocol}//${host}`);

  return { url, method, encType, formData };
}

export type DispatchOptions<T> = {
  target: EventTarget;
  cancelable: boolean;
  detail: T;
};

export function dispatch<T>(
  eventName: string,
  { target, cancelable, detail }: Partial<DispatchOptions<T>> = {}
) {
  const event = new CustomEvent(eventName, {
    cancelable,
    bubbles: true,
    detail,
  });

  if (target && (target as Element).isConnected) {
    target.dispatchEvent(event);
  } else {
    document.documentElement.dispatchEvent(event);
  }

  return event;
}
