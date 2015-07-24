'use strict';

window.rjs = (function() {
  var keys = [],
      stack = [];

  var modules = {},
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

  function fetch(id, ref) {
    if (!modules[id]) {
      modules[id] = ref[2].apply(null, ref[1].map(function(dep) {
        return modules[dep];
      }));
    }

    if (ref[0]) {
      modules[ref[0]] = modules[id];
    }
  }

  function push(id) {
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
        next();
      };
    };
  }

  function load(deps) {
    deps.forEach(function(dep) {
      if (!modules[dep]) {
        stack.push(push(dep));
        keys.push(dep);
      }
    });
  }

  function call(fn, deps, extra) {
    return fn.apply(null, deps.map(function(dep) {
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

  // not standard yet!
  window.define = function(id, deps, factory) {
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

    var ref = keys.shift();

    if (!deps) {
      return fetch(ref, [id, [], factory]);
    }

    load(deps);

    stack.push(function(next) {
      fetch(ref, [id, deps, factory]);
      next();
    });
  };

  window.define.amd = true;

  return {
    define: function(src, id) {
      registry[id] = src;
    },
    require: function(deps, fn) {
      if (!loaded) {
        stack.unshift(ready);
      }

      var fixed = [],
          extra = [];

      function append(data) {
        if (data) {
          extra.push(data);
        }
      }

      deps.forEach(function(dep) {
        if (typeof dep === 'function') {
          stack.push(function(next) {
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

      load(fixed);

      run(stack, function() {
        call(fn, fixed, extra);
      });
    }
  };
})();
