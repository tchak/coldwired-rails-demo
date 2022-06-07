# Rails Remix DEMO

# Why?

At work we have a reasonably old reasonably big rails app. It powers quite a successful service while being run by a minimal team. It's an old school, server rendered rails app. The team is not interested at all in migrating to a JavaScript framework. But we do have some pieces of the app that requires dynamic components. Recently we introduced [hotwired/turbo](https://hotwired.dev) into our code base and it is quite a success. The team likes a lot the minimal JavaScript API surface. But turbo has problems. Those problems are very similar to the ones solved by @remix-run/router. The main one is coordinating multiple submitting forms on one page without full reloads.

# How ?

This is a first attempt to replace [turbo-drive](https://turbo.hotwired.dev/handbook/drive) with remix based router. It does several things:
 - rake task to generate `@remix-run/router` compatible routes config
 - intercepts `click` and `submit` events to navigate with client router
 - use [morphdom](https://github.com/patrick-steele-idem/morphdom) to render pages
 - bypass remix routing if `data-remix="false"` is set on links and forms
 - provide [stimulus](https://stimulus.hotwired.dev) controller to register fetchers (`data-controller="fetcher"`)
 - provide [stimulus](https://stimulus.hotwired.dev) controller to submit forms on changes (`data-controller="submit-on-change"`)
 - in fetcher responses accepts [turbo-stream](https://turbo.hotwired.dev/handbook/streams) format and bypass revalidation in those cases

To run the demo:

```bash
bin/setup
yarn dev
```
