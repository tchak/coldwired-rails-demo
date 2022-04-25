import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useMatches,
} from 'remix';
import type { LinksFunction, ThrownResponse, MetaFunction } from 'remix';

import tailwind from '~/styles/tailwind.css';

export const meta: MetaFunction = () => ({
  'theme-color': '#ffffff',
  description: 'Rails Remix Demo',
});

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: tailwind },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
  ];
};

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return <ErrorMessage title="There was an error" message={error.message} />;
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <ErrorMessage
      title={`${caught.status}: ${caught.statusText}`}
      message={caughtMessage(caught)}
    />
  );
}

function Document({
  children,
  title,
  lang = 'en',
}: {
  children: React.ReactNode;
  title?: string;
  lang?: string;
}) {
  const matches = useMatches();
  const includeScripts = matches.some((match) => match.handle?.hydrate);

  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        {includeScripts ? <Scripts /> : null}
        <LiveReload />
      </body>
    </html>
  );
}

function ErrorMessage({ title, message }: { title: string; message: string }) {
  return (
    <Document title={title}>
      <div>
        <h1 className="py-6">{title}</h1>
        <p>{message}</p>
      </div>
    </Document>
  );
}

function caughtMessage(caught: ThrownResponse) {
  switch (caught.status) {
    case 401:
      return 'Oops! Looks like you tried to visit a page that you do not have access to.';
    case 404:
      return 'Oops! Looks like you tried to visit a page that does not exist.';
    default:
      throw new Error(caught.data || caught.statusText);
  }
}
