'use strict';

window.rjs = (function() {
  var stack = [];

  var cached = {},
      modules = {},
      registry = {};

  var head = document.getElementsByTagName('head')[0];

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
    require: function(deps, cb) {
      var queue = [];

      deps.forEach(function(dep) {
        if (!cached[dep]) {
          queue.push(push(queue, dep));
        }
      });

      run(queue, function() {
        var args = deps.map(function(dep) {
          return modules[dep];
        });

        cb.apply(null, args);
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
      return;
    }

    deps.forEach(function(dep) {
      if (!cached[dep]) {
        queue.push(push(queue, dep));
      }
    });

    queue.push(function(next) {
      var args = deps.map(function(dep) {
        return modules[dep];
      });

      modules[main] = factory.apply(null, args);

      next();
    });
  };

  window.define.amd = true;

  return rjs;
})();
