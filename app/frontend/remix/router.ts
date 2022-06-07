import type {
  Router,
  RouteObject,
  RouterState,
  Navigation,
  Fetcher,
  RevalidationState,
  RouteData,
} from '@remix-run/router';
import { createBrowserRouter, matchRoutes } from '@remix-run/router';
import invariant from 'tiny-invariant';
import type { Application } from '@hotwired/stimulus';

import { registerEventListeners } from './event-listeners';
import { renderPage } from './render';
import { setupDataFunctions, getRouteData } from './loader';
import { renderStream } from './turbo-stream';
import { dispatch } from './dom';
import { getFetcherForm } from './form';
import { FetcherController } from './controllers/fetcher';
import { SubmitOnChangeController } from './controllers/submit-on-change';

type Context = { state?: RouterState; snapshot?: string };

export function createRailsRouter({
  routes,
  application,
}: {
  routes: RouteObject[];
  application?: Application;
}): Router {
  const context: Context = {};

  setupDataFunctions(routes);

  const matches = matchRoutes(routes, location);
  const routeId = matches && matches[0].route.id;
  const loaderData: RouteData = routeId
    ? { [routeId]: { format: 'html', content: document.body.outerHTML } }
    : {};

  const router = createBrowserRouter({
    routes,
    hydrationData: { loaderData },
  }).initialize();

  router.subscribe((state) => {
    onRouterStateChange(state, context);
    context.state = state;
  });

  const unsubscribe = registerEventListeners(router);

  const dispose = router.dispose;
  router.dispose = () => {
    dispose.call(router);
    unsubscribe();
  };

  if (application) {
    application.register('submit-on-change', SubmitOnChangeController);
    application.register('fetcher', FetcherController);
  }

  return router;
}

function onRouterStateChange(state: RouterState, context: Context) {
  if (context.state?.navigation?.state != state.navigation.state) {
    navigationStateChange(state.navigation);
  }

  if (context.state?.revalidation != state.revalidation) {
    revalidationStateChange(state.revalidation);
  }

  for (const [fetcherKey, fetcher] of state.fetchers) {
    if (context.state?.fetchers.get(fetcherKey)?.state != fetcher.state) {
      const form = getFetcherForm(fetcherKey);
      fetcherStateChange(fetcherKey, fetcher, form);
    }

    if (fetcher.state == 'idle') {
      switch (fetcher.data?.format) {
        case 'turbo-stream':
          renderStream(fetcher.data.content);
          break;
        case 'html':
          invariant(false, 'Fetcher can not return html');
      }
    }
  }

  if (state.initialized && state.navigation.state == 'idle') {
    const { loaderData, actionData } = getRouteData(state);
    const routeData = actionData ?? loaderData;
    switch (routeData?.format) {
      case 'html':
        if (routeData.content != context.snapshot) {
          renderPage(routeData.content, state.navigation);
          context.snapshot = routeData.content;
        }
        break;
      case 'turbo-stream':
        invariant(false, 'Navigation can not return turbo-stream');
    }
  }
}

function navigationStateChange(navigation: Navigation) {
  if (navigation.state != 'idle') {
    console.log(
      '[navigation state change]',
      `[${navigation.formMethod ?? 'get'}] ${navigation.location.pathname}`,
      navigation.state
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
      `[${fetcher.formMethod}] ${fetcher.formAction}`,
      fetcher.state
    );
  }
  form.setAttribute('data-fetcher-state', fetcher.state);
  dispatch('remix:fetcher', { target: form, detail: { key: fetcherKey, fetcher } });
}
