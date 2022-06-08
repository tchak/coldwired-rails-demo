import type { Router } from '@remix-run/router';

import { submitForm, getFetcherKey } from './form';
import { shouldProcessLinkClick } from './dom';

export function registerEventListeners(router: Router) {
  const unsubscribe = [
    registerListener('click', (event) => onLinkClick(router, event as MouseEvent)),
    registerListener('submit', (event) => onSubmit(router, event as SubmitEvent)),
    registerListener('remix:delete-fetcher', (event) =>
      onDeleteFetcher(router, event as CustomEvent)
    ),
    registerListener('remix:revalidate', () => onRevalidate(router)),
  ];

  return () => unsubscribe.forEach((unsubscribe) => unsubscribe());
}

function registerListener(event: string, callback: (event: Event) => void) {
  document.documentElement.addEventListener(event, callback);
  return () => document.documentElement.removeEventListener(event, callback);
}

function onLinkClick(router: Router, event: MouseEvent) {
  const target = event.target as HTMLAnchorElement;
  if (target.tagName == 'A' && willFollowLink(event, target)) {
    event.preventDefault();

    router.navigate(target.pathname);
  }
}

function onSubmit(router: Router, event: SubmitEvent) {
  const submitter = event.submitter as HTMLInputElement | undefined;
  const form = submitter?.form || (event.target as HTMLFormElement);

  if (form.tagName == 'FORM' && willSubmitForm(form, submitter)) {
    event.preventDefault();

    submitForm(router, form, { submitter, fetcherKey: getFetcherKey(form), replace: true });
  }
}

function onDeleteFetcher(router: Router, event: CustomEvent<{ fetcherKey: string }>) {
  router.deleteFetcher(event.detail.fetcherKey);
}

function onRevalidate(router: Router) {
  router.revalidate();
}

function willFollowLink(event: MouseEvent, link: HTMLAnchorElement) {
  return isRemixEnabled(link) && shouldProcessLinkClick(event, link.target);
}

function isRemixEnabled(element: HTMLElement) {
  const container = element.closest<HTMLElement>(`[data-remix]`);
  if (container) {
    return container.dataset.remix != 'false';
  }
  return element.dataset.remix != 'false';
}

export function willSubmitForm(
  form: HTMLFormElement,
  input?: HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
) {
  if (input) {
    return isRemixEnabled(input) && isRemixEnabled(form);
  }
  return isRemixEnabled(form);
}
