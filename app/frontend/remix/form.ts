import type { Router, FormMethod } from '@remix-run/router';
import { invariant } from '@remix-run/router';
import { nanoid } from 'nanoid';

import { getFormSubmissionInfo, isHtmlElement, isFormElement } from './dom';

type SubmitOptions = {
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
  submitter?: HTMLInputElement,
  { fetcherKey, replace = false }: SubmitOptions = {}
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

export function getForm(fetcherKey: string): HTMLFormElement {
  const form = forms.get(fetcherKey);
  invariant(form, `No form found for fetcher key: ${fetcherKey}`);
  return form;
}

export function getFetcherKey(form: HTMLFormElement): string {
  const fetcherKey = fetcherKeys.get(form);
  invariant(fetcherKey, 'No fetcher key found for form');
  return fetcherKey;
}

export function registerForms(node: Node, router: Router) {
  if (isFormElement(node)) {
    registerForm(node, router);
  } else if (isHtmlElement(node)) {
    node
      .querySelectorAll<HTMLFormElement>('form[data-fetcher]')
      .forEach((form) => registerForm(form, router));
  }
}

export function unregisterForms(node: Node, router: Router) {
  if (isFormElement(node)) {
    unregisterForm(node, router);
  } else if (isHtmlElement(node)) {
    node.querySelectorAll('form').forEach((form) => unregisterForm(form, router));
  }
}

function registerForm(form: HTMLFormElement, _: Router) {
  const auto = form.dataset.fetcher == 'auto';
  const fetcherKey = auto ? generateFetcherKey(form) : (form.dataset.fetcher as string);
  forms.set(fetcherKey, form);
  fetcherKeys.set(form, fetcherKey);
}

function unregisterForm(form: HTMLFormElement, router: Router) {
  const fetcherKey = fetcherKeys.get(form);
  if (fetcherKey) {
    forms.delete(fetcherKey);
    fetcherKeys.delete(form);
    router.deleteFetcher(fetcherKey);
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
