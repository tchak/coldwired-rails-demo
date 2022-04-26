import type { LoaderFunction } from 'remix';

export const loader: LoaderFunction = ({ request }) => proxy(request);
export const action: LoaderFunction = async ({ request }) => proxy(request);

type RequestInit = NonNullable<Parameters<typeof fetch>[1]>;

export async function proxy(request: Request, port = 3001) {
  const url = new URL(request.url);
  url.port = `${port}`;
  const init: RequestInit = {
    method: request.method,
    headers: request.headers,
    redirect: 'manual',
  };
  const method = request.method.toLowerCase();
  if (!['get', 'head', 'delete'].includes(method)) {
    init.body = await request.blob();
  }

  return fetch(url.href, init);
}
