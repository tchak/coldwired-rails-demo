import { DateTime } from 'luxon';
import { isHotkey } from 'is-hotkey';

export const isEnterKey = isHotkey('enter');
export const isBackspaceKey = isHotkey('backspace');
export const isEscapeKey = isHotkey('escape');

function cursorPosition(input: HTMLInputElement): number {
  return (
    (input.selectionDirection == 'backward'
      ? input.selectionStart
      : input.selectionEnd) ?? 0
  );
}

export function cursorAtStart(input: HTMLInputElement): boolean {
  return cursorPosition(input) == 0;
}

export function cursorAtEnd(input: HTMLInputElement): boolean {
  return cursorPosition(input) == input.value.length;
}

export function nbsp(str: string) {
  return str.replace(/\s/g, '\xa0');
}

export function yearsFromNow(years: number) {
  return DateTime.utc().plus({ years }).toJSDate();
}

export function isPresent<T>(value: T | undefined | null | void): value is T {
  if (value == null) {
    return false;
  }
  if (typeof value == 'boolean') {
    return value;
  } else if (typeof value == 'string') {
    return value.trim().length > 0;
  } else if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

export function getEnv(name: string, defaultValue?: string): string {
  let value: string | undefined;
  if ('process' in globalThis) {
    value = globalThis.process.env[name];
  } else if (name in globalThis) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value = (globalThis as any)[name];
  }
  if (!value) {
    if (defaultValue != null) {
      return defaultValue;
    }
    throw new Error(`Missing ${name} env`);
  }
  return value;
}
