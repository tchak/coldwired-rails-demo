import routes from '../routes.json';
import { createRailsRouter, onLoad } from '../remix';

onLoad(() => createRailsRouter({ routes }));
