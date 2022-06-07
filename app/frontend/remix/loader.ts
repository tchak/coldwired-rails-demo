import type {
  LoaderFunction as DataFunction,
  RouteObject,
  ShouldRevalidateFunction,
} from '@remix-run/router';
import { json, redirect } from '@remix-run/router';

import type { RouteData } from './router';

export function setupDataFunctions(routes: RouteObject[]): void {
  for (const route of routes) {
    if (route.handle?._loader) {
      route.loader = dataFunction;
    }
    if (route.handle?._action) {
      route.action = dataFunction;
    }
    route.shouldRevalidate = shouldRevalidate;
  }
  routes.push({ id: 'not_found', path: '*', loader: dataFunction, action: dataFunction });
}

const shouldRevalidate: ShouldRevalidateFunction = (args) => {
  // FIXME: actionResult type is wrong
  if ((args.actionResult as any)?.type == 'turbo-stream') {
    return false;
  }
  return args.defaultShouldRevalidate;
};

const dataFunctionHandler = (response: Response) => onFetchResponse(response);
const dataFunction: DataFunction = ({ request, signal }) =>
  fetch(onFetchRequest(request), { signal }).then(dataFunctionHandler);

function onFetchRequest(request: Request) {
  request.headers.set('x-remix', 'true');
  return request;
}

function onFetchResponse(response: Response) {
  if (response.ok) {
    const url = response.headers.get('x-remix-redirect');
    if (url) {
      return redirect(url);
    }
  }
  return response.text().then((content) => processResponse(response, content));
}

function isTurboStream(response: Response) {
  return !!response.headers.get('content-type')?.match('text/vnd.turbo-stream.html');
}

function processResponse(response: Response, content: string) {
  if (isTurboStream(response)) {
    return json<RouteData>({ type: 'turbo-stream', content });
  } else if (response.status == 204) {
    return json(null);
  }
  return json<RouteData>({ type: 'html', content });
}
