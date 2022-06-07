import { Application } from '@hotwired/stimulus';

import routes from '../routes.json';
import { createRailsRouter, onLoad, SubmitOnChangeController, FetcherController } from '../remix';

const app = Application.start();
app.register('submit-on-change', SubmitOnChangeController);
app.register('fetcher', FetcherController);

onLoad(() => createRailsRouter({ routes }));
