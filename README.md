# tiny-rjs.

[![Build Status](https://api.travis-ci.org/gextech/tiny-rjs.png?branch=master)](https://travis-ci.org/gextech/tiny-rjs?branch=master) [![NPM version](https://badge.fury.io/js/tiny-rjs.png)](http://badge.fury.io/js/tiny-rjs)

> Q: Yet Another RequireJS/AMD Implementation?
>
> A: Nope.

We want to do this:

```javascript
rjs.define('/vendor/jquery/dist/jquery.js', 'jquery');
rjs.define('/vendor/moment/moment.js', 'moment');
rjs.define('/vendor/moment/locale/es.js', 'moment/locale/es');
```

and then:

```coffeescript
rjs.require ['jquery', 'moment', 'moment/locale/es'], ->
  # $ and moment are globals
  $('.date-decorator').each ->
    $el = $(this)
    $el.text moment($el.data('date'), 'YYYYMMDD').fromNow()
```

## AMD Support

This script loader has no support for AMD.

However you can still load simple `define()` functions:

```coffee
# scripts/event-bus.coffee
define 'event-bus', ->
  EE2 = require 'eventemitter2'
  new EE2
```

Later you can require this chunk of code:

```coffee
rjs.require ['event-bus'], (e) ->
  e.on 'some-event', ->
```

The main advantage of this is encapsulating code rather that organizing your code application.

Consider the following constraints:

- TinyRJS was designed for working with existing libraries in the Bower registry.
- Most of them are namespaced or their globals are not enough harmful.
- Calling `rjs.require()` will load all scripts in sequence.

## Issues

Under development. &infin;
