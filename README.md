# Rails Remix Demo

## What is this?

This is an example [rails](https://github.com/rails/rails) application using [remix-router-turbo](https://github.com/tchak/remix-router-turbo). It works by adding a `data-controller="turbo"` to `<body>` element of your page and optionally annotate some forms with `data-controller="fetcher"`. There is also a couple of `rails` specific things. A `rake` task `remix:routes` which generate a `JSON` with all the server routes. And a patch of `redirect_to` method to provide remix specific redirects.

## Run

```bash
bin/setup
yarn dev
```
