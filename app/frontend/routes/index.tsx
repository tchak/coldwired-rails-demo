import type { MetaFunction } from 'remix';
import {
  useFetcher,
  useLoaderData,
  useTransition,
  Link,
  Form,
} from '@remix-run/react';
import { z } from 'zod';
import { useEffect, useRef } from 'react';

import { Button } from '~/components/Button';

export { loader } from './$';

export const meta: MetaFunction = () => ({ title: 'Remix Template' });
export const handle = { hydrate: true };

const Todo = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
});
type Todo = z.infer<typeof Todo>;

const LoaderData = z.object({
  todos: z.array(Todo),
  csrf: z.string(),
  errors: z.string().array().nullable(),
});

export default function IndexRoute() {
  const transition = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const isAdding =
    transition.state == 'submitting' &&
    !transition.submission.formData.has('_method');
  const data = useLoaderData();
  const { todos, csrf, errors } = LoaderData.parse(data);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  }, [isAdding]);

  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <nav>
        <Link to="/">Todos</Link> | <a href="/about">About</a>
      </nav>

      <Flash errors={errors} />

      <h1 className="my-3">Todos</h1>

      <ul>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} csrf={csrf} />
        ))}
      </ul>

      <Form action="/todos" method="post" className="mt-4" ref={formRef}>
        <input type="hidden" name="authenticity_token" value={csrf} />
        <input
          name="todo[title]"
          type="text"
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
        />
        <Button type="submit" className="ml-2" primary>
          Add
        </Button>
      </Form>
    </div>
  );
}

function TodoItem({ todo, csrf }: { todo: Todo; csrf: string }) {
  const fetcher = useFetcher();
  const action = `/todos/${todo.id}`;
  return (
    <li className="flex items-center mb-2">
      <label className="w-56">
        <input
          type="checkbox"
          defaultChecked={todo.completed}
          onChange={(event) =>
            fetcher.submit(
              {
                'todo[completed]': event.target.checked + '',
                authenticity_token: csrf,
              },
              { action, method: 'patch' }
            )
          }
          className="mr-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <span>{todo.title}</span>
      </label>
      <Form action={action} method="post">
        <input type="hidden" name="authenticity_token" value={csrf} />
        <input type="hidden" name="_method" value="delete" />
        <Button type="submit" className="ml-2" size="sm">
          Delete
        </Button>
      </Form>
    </li>
  );
}

function Flash({ errors }: { errors: string[] | null }) {
  if (!errors) return null;

  return (
    <ul className="my-2 bg-red-600 text-white">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}
