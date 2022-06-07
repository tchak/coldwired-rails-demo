import type {
  RouterState,
  LoaderFunction as DataFunction,
  RouteObject,
  ShouldRevalidateFunction,
} from '@remix-run/router';
import { json, redirect } from '@remix-run/router';

type RouteData = { format: 'html'; content: string } | { format: 'turbo-stream'; content: string };

enum ContentType {
  TurboStream = 'text/vnd.turbo-stream.html',
  HTML = 'text/html, application/xhtml+xml',
}

export function getRouteData(state: RouterState): {
  loaderData?: RouteData;
  actionData?: RouteData;
  errors?: RouteData;
} {
  const leafRoute = state.matches.at(-1)?.route;

  if (leafRoute) {
    const actionData = state.actionData && state.actionData[leafRoute.id];
    const loaderData = state.loaderData[leafRoute.id];
    const errors = state.errors && state.errors[leafRoute.id];

    return { loaderData, actionData, errors };
  }
  return {};
}

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
  if ((args.actionResult as any as RouteData)?.format == 'turbo-stream') {
    return false;
  }
  return args.defaultShouldRevalidate;
};

const dataFunctionHandler = (response: Response) => onFetchResponse(response);
const dataFunction: DataFunction = ({ request, signal }) =>
  fetch(onFetchRequest(request), { signal }).then(dataFunctionHandler);

function onFetchRequest(request: Request) {
  request.headers.set('x-remix', 'true');
  request.headers.set('accept', [ContentType.TurboStream, ContentType.HTML].join(', '));
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
  return !!response.headers.get('content-type')?.startsWith(ContentType.TurboStream);
}

function processResponse(response: Response, content: string) {
  if (isTurboStream(response)) {
    return json<RouteData>({ format: 'turbo-stream', content });
  } else if (response.status == 204) {
    return json(null);
  }
  return json<RouteData>({ format: 'html', content });
}
