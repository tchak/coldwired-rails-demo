import { createBrowserTurboRouter } from 'remix-router-turbo';

import routes from '../routes.json';

createBrowserTurboRouter({ routes, debug: true });
