'use strict';

window.rjs = (function() {
  var stack = [];

  var cached = {},
      modules = {},
      registry = {};

  var head = document.getElementsByTagName('head')[0];

  var loaded = false;

  function ready(next) {
    if (loaded || (loaded = ['complete', 'loaded'].indexOf(window.document.readyState) > -1)) {
      next();
    } else {
      window.document.addEventListener('DOMContentLoaded', function() {
        loaded = true;
        next();
      }, false);
    }
  }

  function alias(module, id) {
    if (id && !modules[id]) {
      modules[id] = modules[module];
      cached[id] = true;
    }
  }

  function push(set, id) {
    if (!registry[id]) {
      throw new Error('missing definition for `' + id + '`');
    }

    return function(next) {
      var script = document.createElement('script');

      script.type = 'text/javascript';
      script.src = registry[id];
      script.async = true;

      head.appendChild(script);

      script.onreadystatechange = script.onload = function() {
        head.removeChild(script);
        cached[id] = true;
        next();
      };

      set.push(id);
    };
  }

  function load(set, deps) {
    deps.forEach(function(dep) {
      if (!cached[dep]) {
        set[0].push(push(set, dep));
      }
    });
  }

  function call(fn, deps, extra) {
    return fn.apply(null, (deps || []).map(function(dep) {
      return modules[dep];
    }).concat(extra || []));
  }

  function run(all, done) {
    function next() {
      var task = all.shift();

      if (!task) {
        return done();
      }

      task(next);
    }

    next();
  }

  var rjs = {
    define: function(src, id) {
      registry[id] = src;
    },
    require: function(deps, fn) {
      var queue = [ready];

      var fixed = [],
          extra = [];

      function append(data) {
        if (data) {
          extra.push(data);
        }
      }

      deps.forEach(function(dep) {
        if (typeof dep === 'function') {
          queue.push(function(next) {
            if (dep.length) {
              dep(function(data) {
                append(data);
                next();
              });
            } else {
              var retval = dep();

              if (retval && typeof retval.then === 'function') {
                retval.then(function(data) {
                  append(data);
                  next();
                });
              } else {
                append(retval);
                next();
              }
            }
          });
        } else {
          fixed.push(dep);
        }
      });

      var set = [queue];

      stack.push(set);

      load(set, fixed);

      run(queue, function() {
        call(fn, fixed, extra, stack.shift());
      });
    }
  };

  // not standard yet!
  window.define = function(id, deps, factory) {
    var current = stack[0],
        queue = current[0];

    var ref = current.splice(1, 1)[0];

    if (typeof id === 'function') {
      factory = id;
      id = null;
    }

    if (Array.isArray(id)) {
      factory = deps;
      deps = id;
      id = null;
    }

    if (typeof deps === 'function') {
      factory = deps;
      deps = null;
    }

    if (!(deps && deps.length)) {
      modules[ref] = call(factory);
      alias(ref, id);
      return;
    }

    load(current, deps);

    queue.push(function(next) {
      modules[ref] = call(factory, deps);
      alias(ref, id);
      next();
    });
  };

  window.define.amd = true;

  return rjs;
})();
