# Oh my deps!

[![Build Status](https://api.travis-ci.org/gextech/oh-my-deps.png?branch=master)](https://travis-ci.org/gextech/oh-my-deps?branch=master) [![NPM version](https://badge.fury.io/js/oh-my-deps.png)](http://badge.fury.io/js/oh-my-deps)

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

- OMD was designed for working with existing libraries in the Bower registry.
- Most of them are namespaced or their globals are not enough harmful.
- Calling `oh.require()` will load all scripts in sequence.
- This script loader has no support for AMD.
- Under development. &infin;
