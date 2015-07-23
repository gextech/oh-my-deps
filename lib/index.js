'use strict';

window.rjs = (function() {
  var stack = [];

  var cached = {},
      modules = {},
      resolved = {};

  var head = document.getElementsByTagName('head')[0];

  function load(id) {
    stack.push(id);

    return function(next) {
      var script = document.createElement('script');

      script.type = 'text/javascript';
      script.src = modules[id];
      script.async = true;

      head.appendChild(script);

      script.onreadystatechange = script.onload = function() {
        head.removeChild(script);
        cached[id] = true;
        next();
      };
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
      modules[id] = src;
    },
    require: function(ids, cb) {
      var set = [];

      ids.forEach(function(id) {
        if (!cached[id]) {
          set.push(load(id));
        }
      });

      run(set, function() {
        console.log('>>>', resolved, ids);

        var args = ids.map(function(id) {
          return resolved[id] || modules[id];
        });

        cb.apply(null, args);
      });
    }
  };

  // not standard yet!
  window.define = function(id, deps, module) {
    var main = stack.shift();

    if (typeof id === 'function') {
      module = id;
      id = null;
    }

    if (Array.isArray(id)) {
      module = deps;
      deps = id;
      id = null;
    }

    if (typeof deps === 'function') {
      module = deps;
      deps = null;
    }

    rjs.require(deps || [], function() {
      resolved[main] = module.apply(null, arguments);

      if (id) {
        cached[id] = true;
        resolved[id] = resolved[main];
      }
    });
  };

  window.define.amd = true;

  return rjs;
})();
