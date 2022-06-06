import invariant from 'tiny-invariant';

import { renderElement } from './render';

type ActionFunction = (targetElements: HTMLElement[], templateContent: HTMLElement) => void;

export function renderStream(html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;
  document.importNode(template, true);
  for (const stream of template.content.querySelectorAll<HTMLElement>('turbo-stream')) {
    renderStreamElement(stream);
  }
}

const StreamActions: {
  [action: string]: ActionFunction;
} = {
  after(targetElements, templateContent) {
    targetElements.forEach((element) =>
      element.parentElement?.insertBefore(templateContent, element.nextSibling)
    );
  },

  append(targetElements, templateContent) {
    removeDuplicateTargetChildren(targetElements, templateContent);
    targetElements.forEach((element) => element.append(templateContent));
  },

  before(targetElements, templateContent) {
    targetElements.forEach((element) =>
      element.parentElement?.insertBefore(templateContent, element)
    );
  },

  prepend(targetElements, templateContent) {
    removeDuplicateTargetChildren(targetElements, templateContent);
    targetElements.forEach((element) => element.prepend(templateContent));
  },

  remove(targetElements) {
    targetElements.forEach((element) => element.remove());
  },

  replace(targetElements, templateContent) {
    targetElements.forEach((element) => renderElement(element, templateContent));
  },

  update(targetElements, templateContent) {
    targetElements.forEach((element) => renderElement(element, templateContent, true));
  },
};

function renderStreamElement(stream: HTMLElement): void {
  invariant(stream.tagName == 'TURBO-STREAM', '[turbo-stream] element must be a <turbo-stream>');

  const action = stream.getAttribute('action') as keyof typeof StreamActions;
  const actionFunction = StreamActions[action];
  invariant(actionFunction, `[turbo-stream] action "${action}" is not supported`);

  const templateContent =
    actionFunction.length == 2 ? getTemplateContent(stream) : ({} as HTMLElement);
  const performAction = () => {
    const targetElements = getTargetElements(stream);
    requestAnimationFrame(() => actionFunction(targetElements, templateContent));
  };
  const delay = stream.getAttribute('delay');

  if (delay) {
    setTimeout(performAction, parseInt(delay));
  } else {
    performAction();
  }
}

function getTemplateContent(stream: HTMLElement): HTMLElement {
  const templateElement = stream.firstElementChild;
  invariant(
    templateElement && templateElement instanceof HTMLTemplateElement,
    '[turbo-stream] first child element must be a <template> element'
  );
  return templateElement.content.cloneNode(true) as HTMLElement;
}

function getTargetElements(stream: HTMLElement): HTMLElement[] {
  const target = stream.getAttribute('target');
  const targets = stream.getAttribute('targets');

  if (target) {
    return targetElementsById(stream, target);
  } else if (targets) {
    return targetElementsByQuery(stream, targets);
  }

  invariant(false, '[turbo-stream] "target" or "targets" attribute is missing');
}

function targetElementsById(stream: HTMLElement, target: string) {
  const element = document.getElementById(target);

  if (element != null) {
    return [element];
  } else {
    return [];
  }
}

function targetElementsByQuery(stream: HTMLElement, targets: string) {
  const elements = document.querySelectorAll<HTMLElement>(targets);

  if (elements.length != 0) {
    return [...elements];
  } else {
    return [];
  }
}

function removeDuplicateTargetChildren(
  targetElements: HTMLElement[],
  templateContent: HTMLElement
) {
  duplicateChildren(targetElements, templateContent).forEach((c) => c.remove());
}

function duplicateChildren(targetElements: HTMLElement[], templateContent: HTMLElement) {
  const existingChildren = targetElements.flatMap((e) => [...e.children]).filter((c) => !!c.id);
  const newChildrenIds = [...(templateContent?.children || [])]
    .filter((c) => !!c.id)
    .map((c) => c.id);

  return existingChildren.filter((c) => newChildrenIds.includes(c.id));
}
