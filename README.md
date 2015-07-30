# Oh my deps!

![TravisCI](https://img.shields.io/travis/gextech/oh-my-deps/master.svg) ![NPM](https://img.shields.io/npm/v/oh-my-deps.svg) ![Bower](https://img.shields.io/bower/v/oh-my-deps.svg)

We want to do this:

```coffeescript
oh.define 'dummy', ->
  (data) ->
    console.log 'DUMMY OUTPUT', data

oh.define 'moment', '/vendor/moment/moment.js'
oh.define 'moment/locale/es', '/vendor/moment/locale/es.js'
```

and then:

```coffeescript
oh.require ['dummy', 'moment', 'moment/locale/es'], (dummy) ->
  dummy moment('19870610', 'YYYYMMDD').fromNow()
```

Consider the following constraints:

- Calling `oh.require()` will load all scripts in sequence.
- This script loader has no support for AMD/UMD.
- This is not an RequireJS implementation.
- Under development. &infin;

OMD was designed for working with existing libraries in the Bower registry.

Most of them are in their own namespaces or their globals are not enough harmful.
