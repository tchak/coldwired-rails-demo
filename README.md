# Rails Remix Demo

## What is this?

This is an example [rails](https://github.com/rails/rails) application using [remix-router-turbo](https://github.com/tchak/remix-router-turbo). It works in a similar way with [turbo](https://turbo.hotwired.dev/handbook/drive), but all fonctionality is implemented as several [stimulus](https://stimulus.hotwired.dev) controllers. See details in [remix-router-turbo repository](https://github.com/tchak/remix-router-turbo#usage).

There is also a couple of `rails` specific things. A `rake` task `remix:routes` which generate a `JSON` with all the server routes and a patch of `redirect_to` method to provide remix specific redirects.

## Run

```bash
bin/setup
yarn dev
```
