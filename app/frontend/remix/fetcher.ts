import type {
  LoaderFunction as DataFunction,
  RouteObject,
  ShouldRevalidateFunction,
} from '@remix-run/router';
import { json, redirect } from '@remix-run/router';

import type { GetFetcher, RouteData } from './router';

export function setupDataFunctions(routes: RouteObject[], getFetcher: GetFetcher): void {
  const dataFunction = createDataFunction();
  const shouldRevalidate = createShouldRevalidateFunction(getFetcher);

  for (const route of routes) {
    setupDataFunction(route, shouldRevalidate, dataFunction);
  }
  routes.push({ id: 'not_found', path: '*', loader: dataFunction, action: dataFunction });
}

function setupDataFunction(
  route: RouteObject,
  shouldRevalidate: ShouldRevalidateFunction,
  dataFunction: DataFunction
) {
  if (route.handle?._loader) {
    route.loader = dataFunction;
  }
  if (route.handle?._action) {
    route.action = dataFunction;
  }
  route.shouldRevalidate = shouldRevalidate;
}

function createShouldRevalidateFunction(getFetcher: GetFetcher): ShouldRevalidateFunction {
  return (args) => {
    // HACK!!!
    if (args.formData && !args.actionResult) {
      const fetcherKey = args.formData.get('__fetcher_key');
      if (fetcherKey) {
        args.actionResult = getFetcher(fetcherKey as string)?.data as any;
      }
    }

    if ((args.actionResult as any)?.type == 'turbo-stream') {
      return false;
    }
    return args.defaultShouldRevalidate;
  };
}

function createDataFunction(): DataFunction {
  const handler = (response: Response) => onFetchResponse(response);

  return ({ request, signal }) => {
    return fetch(onFetchRequest(request), { signal }).then(handler);
  };
}

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
