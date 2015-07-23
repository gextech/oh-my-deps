'use strict';

window.rjs = (function() {
  var stack = [];

  var cached = {},
      modules = {},
      registry = {};

  var head = document.getElementsByTagName('head')[0];

  var loaded = false;

  function ready(next) {
    if (loaded || ['complete', 'loaded'].indexOf(window.document.readyState) > -1) {
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

  function push(queue, id) {
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

      stack.push([queue, id]);
    };
  }

  function load(queue, deps) {
    deps.forEach(function(dep) {
      if (!cached[dep]) {
        queue.push(push(queue, dep));
      }
    });
  }

  function call(fn, deps) {
    return fn.apply(null, deps.map(function(dep) {
      return modules[dep];
    }));
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

      var fixed = [];

      deps.forEach(function(dep) {
        if (typeof dep === 'function') {
          queue.push(function(next) {
            if (dep.length) {
              dep(next);
            } else {
              var retval = dep();

              if (retval && typeof retval.then === 'function') {
                retval.then(function() {
                  next();
                });
              } else {
                next();
              }
            }
          });
        } else {
          fixed.push(dep);
        }
      });

      load(queue, fixed);

      run(queue, function() {
        call(fn, fixed);
      });
    }
  };

  // not standard yet!
  window.define = function(id, deps, factory) {
    var params = stack.shift(),
        queue = params[0],
        main = params[1];

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
      modules[main] = factory();
      alias(main, id);
      return;
    }

    load(queue, deps);

    queue.push(function(next) {
      modules[main] = call(factory, deps);
      alias(main, id);
      next();
    });
  };

  window.define.amd = true;

  return rjs;
})();
