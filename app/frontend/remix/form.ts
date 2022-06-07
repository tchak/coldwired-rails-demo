import type { Router, FormMethod } from '@remix-run/router';
import invariant from 'tiny-invariant';
import { nanoid } from 'nanoid';

import { getFormSubmissionInfo, dispatch } from './dom';

type SubmitOptions = {
  /** */
  submitter?: HTMLInputElement;

  /** */
  fetcherKey?: string;

  /**
   * Set `true` to replace the current entry in the browser's history stack
   * instead of creating a new one (i.e. stay on "the same page"). Defaults
   * to `false`.
   */
  replace?: boolean;
};

export function submitForm(
  router: Router,
  form: HTMLFormElement,
  { submitter, fetcherKey, replace = false }: SubmitOptions = {}
) {
  const { url, method, formData } = getFormSubmissionInfo(form, location.pathname, { submitter });
  const action = url.pathname;
  const formMethod = parseFormMethod(method);
  const navigationOptions = { formMethod, formData, replace };

  if (fetcherKey) {
    // HACK!!!
    formData.set('__fetcher_key', fetcherKey);

    router.fetch(fetcherKey, action, navigationOptions);
  } else {
    router.navigate(action, navigationOptions);
  }
}

export function getFetcherKey(form: HTMLFormElement) {
  return fetcherKeys.get(form);
}

export function getFetcherForm(fetcherKey: string) {
  const form = forms.get(fetcherKey);
  invariant(form, `No form found for fetcher key: ${fetcherKey}`);
  return form;
}

export function registerForm(form: HTMLFormElement) {
  const fetcherKey = generateFetcherKey(form);
  fetcherKeys.set(form, fetcherKey);
  forms.set(fetcherKey, form);
}

export function unregisterForm(form: HTMLFormElement) {
  const fetcherKey = fetcherKeys.get(form);
  if (fetcherKey) {
    forms.delete(fetcherKey);
    fetcherKeys.delete(form);
    dispatch('remix:delete-fetcher', { detail: { fetcherKey } });
  }
}

function parseFormMethod(method?: string, fallback: FormMethod = 'get'): FormMethod {
  switch (method?.toLowerCase()) {
    case 'get':
      return 'get';
    case 'post':
      return 'post';
    case 'put':
      return 'put';
    case 'patch':
      return 'patch';
    case 'delete':
      return 'delete';
    default:
      return fallback;
  }
}

function generateFetcherKey(element: HTMLElement) {
  return element.id ?? nanoid();
}

const forms = new Map<string, HTMLFormElement>();
const fetcherKeys = new WeakMap<HTMLFormElement, string>();
