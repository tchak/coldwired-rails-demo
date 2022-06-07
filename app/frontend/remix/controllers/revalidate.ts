import { Controller } from '@hotwired/stimulus';

import { dispatch } from '../dom';

const DEFAULT_MIN_TIMEOUT = 15_000; // 15 sec
const DEFAULT_MAX_TIMEOUT = 60_000; // 60 sec
const DEFAULT_FACTOR = 2;

export class RevalidateController extends Controller {
  #attempt = 0;
  #unsubscribe?: () => void;

  connect() {
    this.delay();
  }

  disconnect() {
    this.#unsubscribe?.();
  }

  private delay() {
    const timeout = createTimeout(this.#attempt, {
      minTimeout: this.minTimeout,
      maxTimeout: this.maxTimeout,
      factor: this.factor,
    });
    this.#unsubscribe = delay(() => this.revalidate(), timeout);
  }

  private revalidate() {
    dispatch('remix:revalidate');
    this.#attempt++;
    this.delay();
  }

  private get minTimeout() {
    const value = this.element.getAttribute('data-revalidate-min-timeout');
    return parseIntOr(value, DEFAULT_MIN_TIMEOUT);
  }

  private get maxTimeout() {
    const value = this.element.getAttribute('data-revalidate-max-timeout');
    return parseIntOr(value, DEFAULT_MAX_TIMEOUT);
  }

  private get factor() {
    const value = this.element.getAttribute('data-revalidate-factor');
    return parseIntOr(value, DEFAULT_FACTOR);
  }
}

function delay(fn: () => void, delay: number) {
  const timer = setTimeout(fn, delay);
  return () => clearTimeout(timer);
}

type TimeoutOptions = {
  minTimeout?: number;
  maxTimeout?: number;
  factor?: number;
};

function createTimeout(attempt: number, options?: TimeoutOptions) {
  const {
    minTimeout = DEFAULT_MIN_TIMEOUT,
    maxTimeout = DEFAULT_MAX_TIMEOUT,
    factor = DEFAULT_FACTOR,
  } = options ?? {};
  const timeout = Math.round(Math.max(minTimeout, 1) * Math.pow(factor, attempt));
  return Math.min(timeout, maxTimeout);
}

function parseIntOr(value: string | undefined | null, defaultValue: number) {
  return value ? parseInt(value) : defaultValue;
}
