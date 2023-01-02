# Rails Remix Demo

## What is this?

This is an example [rails](https://github.com/rails/rails) application using [coldwired](https://github.com/tchak/coldwired). It works in a similar way with [turbo](https://turbo.hotwired.dev/handbook/drive), but is based on [remix](https://www.npmjs.com/package/@remix-run/router) and [morphdom](https://github.com/patrick-steele-idem/morphdom). See details in [coldwired repository](https://github.com/tchak/coldwired#usage).

There is also a couple of `rails` specific things. A `rake` task `coldwired:routes` which generate a `JSON` with all the server routes and a concern with patch of `redirect_to` method to provide coldwired specific redirects.

## Run

```bash
bin/setup
yarn dev
```
