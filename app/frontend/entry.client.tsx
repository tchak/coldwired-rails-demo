import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { RemixBrowser } from 'remix';

hydrateRoot(
  document,
  <StrictMode>
    <RemixBrowser />
  </StrictMode>
);
