import type {
  Router,
  RouteObject,
  RouterState,
  Navigation,
  Fetcher,
  RevalidationState,
} from '@remix-run/router';
import { createBrowserRouter, matchRoutes, invariant } from '@remix-run/router';

import { registerEventListeners } from './event-listeners';
import { registerMutationObserver } from './mutation-observer';
import { renderPage } from './render';
import { getForm } from './form';
import { setupDataFunctions } from './fetcher';
import { renderStream } from './turbo-stream';
import { dispatch } from './dom';

export type RouteData =
  | { type: 'html'; content: string }
  | { type: 'turbo-stream'; content: string };

export type GetFetcher = (fetcherKey: string) => Fetcher<RouteData>;

type Context = {
  navigation?: Navigation;
  revalidation?: RevalidationState;
  fetchers: Map<string, Fetcher>;
  snapshot?: string;
};

export function createRailsRouter({ routes }: { routes: RouteObject[] }): Router {
  const context: Context = { fetchers: new Map() };

  // HACK!!!
  const getFetcher: GetFetcher = (fetcherKey: string) =>
    router.state.fetchers.get(fetcherKey) as Fetcher;
  setupDataFunctions(routes, getFetcher);

  const matches = matchRoutes(routes, location);
  const routeId = matches && matches[0].route.id;
  const loaderData = routeId
    ? { [routeId]: { type: 'html', content: document.body.outerHTML } }
    : {};

  const router = createBrowserRouter({
    routes,
    hydrationData: { loaderData },
  }).initialize();

  router.subscribe((state) => {
    onRouterStateChange(state, context);
    context.navigation = state.navigation;
    context.revalidation = state.revalidation;
  });

  const unsubscribe = [registerEventListeners(router), registerMutationObserver(router)];

  const dispose = router.dispose;
  router.dispose = () => {
    dispose.call(router);
    unsubscribe.forEach((unsubscribe) => unsubscribe());
  };

  return router;
}

function onRouterStateChange(state: RouterState, context: Context) {
  if (context.navigation?.state != state.navigation.state) {
    navigationStateChange(state.navigation);
  }

  if (context.revalidation != state.revalidation) {
    revalidationStateChange(state.revalidation);
  }

  for (const [fetcherKey, fetcher] of state.fetchers) {
    if (context.fetchers.get(fetcherKey)?.state != fetcher.state) {
      fetcherStateChange(fetcherKey, fetcher, getForm(fetcherKey));
      context.fetchers.set(fetcherKey, fetcher);
    }

    if (fetcher.state == 'idle') {
      switch (fetcher.data?.type) {
        case 'turbo-stream':
          renderStream(fetcher.data.content);
          break;
        case 'html':
          invariant(false, 'Fetcher can not return html');
      }
    }
  }

  if (state.initialized && state.navigation.state == 'idle') {
    const { loaderData } = getRouteData(state);
    switch (loaderData?.type) {
      case 'html':
        if (loaderData.content != context.snapshot) {
          renderPage(loaderData.content, state.navigation);
          context.snapshot = loaderData.content;
        }
        break;
      case 'turbo-stream':
        invariant(false, 'Navigation can not return turbo-stream');
    }
  }
}

function getRouteData(state: RouterState): {
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

function navigationStateChange(navigation: Navigation) {
  if (navigation.state != 'idle') {
    console.log(
      '[navigation state change]',
      navigation.state,
      `[${navigation.formMethod ?? 'get'}] ${navigation.location.pathname}`
    );
  }
  document.documentElement.setAttribute('data-navigation-state', navigation.state);
  dispatch('remix:navigation', { detail: { navigation } });
}

function revalidationStateChange(state: RevalidationState) {
  if (state != 'idle') {
    console.log('[revalidation state change]', state);
  }
  document.documentElement.setAttribute('data-revalidation-state', state);
  dispatch('remix:revalidation', { detail: { revalidation: state } });
}

function fetcherStateChange(fetcherKey: string, fetcher: Fetcher, form: HTMLFormElement) {
  if (fetcher.state != 'idle') {
    console.log(
      '[fetcher state change]',
      fetcherKey,
      fetcher.state,
      `[${fetcher.formMethod}] ${fetcher.formAction}`
    );
  }
  form.setAttribute('data-fetcher-state', fetcher.state);
  dispatch('remix:fetcher', { target: form, detail: { key: fetcherKey, fetcher } });
}
