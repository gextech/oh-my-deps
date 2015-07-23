# tiny-rjs.

[![Build Status](https://api.travis-ci.org/gextech/tiny-rjs.png?branch=master)](https://travis-ci.org/gextech/tiny-rjs?branch=master) [![NPM version](https://badge.fury.io/js/tiny-rjs.png)](http://badge.fury.io/js/tiny-rjs)

> Q: Yet Another RequireJS Implementation?
> A: Nope.

We want to do this:

```javascript
rjs.define('/vendor/jquery/dist/jquery.js', 'jquery');
rjs.define('/vendor/moment/moment.js', 'moment');
rjs.define('/vendor/moment/locale/es.js', 'moment/locale/es');
```

and then:

```coffeescript
rjs.require ['jquery', 'moment', 'moment/locale/es'], ($, m) ->
  $('.date-decorator').each ->
    $el = $(this)
    $el.text m($el.data('date'), 'YYYYMMDD').fromNow()
```

TODO
