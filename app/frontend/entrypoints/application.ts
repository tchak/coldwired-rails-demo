import { Application } from '@hotwired/stimulus';

import routes from '../routes.json';
import { createRailsRouter, onLoad } from '../remix';

onLoad(() => {
  const application = Application.start();
  createRailsRouter({ routes, application });
});
