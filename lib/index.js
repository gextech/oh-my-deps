'use strict';

window.rjs = (function() {
  var stack = [];

  var cached = {},
      modules = {},
      registry = {};

  var head = document.getElementsByTagName('head')[0];

  function loadScript(id, solve) {
    if (cached[id]) {
      return;
    }

    var script = document.createElement('script');

    script.src = registry[id].source;
    script.type = 'text/javascript';
    script.async = false;

    cached[id] = true;

    head.appendChild(script);

    script.onreadystatechange = script.onload = function() {
      registry[id].resolved = true;
      head.removeChild(script);
      solve();
    };
  }

  function callback(it) {
    var args = [];

    it.require.forEach(function(id) {
      if (modules[id]) {
        args.push(modules[id]);
      }
    });

    return it.callback.apply(null, args);
  }

  function resolve(deps) {
    if (!(deps && deps.length)) {
      return true;
    }

    for (var key in deps) {
      var id = deps[key],
          mod = registry[id];

      if (!mod || modules[id]) {
        continue;
      }

      if (!mod.resolved && mod.source) {
        return false;
      }

      if (!resolve(mod.require)) {
        return false;
      }

      if (mod.callback) {
        modules[id] = callback(mod);
      }
    }

    return true;
  }

  function shadow(fn) {
    return function() {
      return fn.apply(null, arguments);
    };
  }

  function load() {
    resolve(Object.keys(registry));

    stack.forEach(function(params, index) {
      if (resolve(params.require)) {
        stack.splice(index, 1);
        callback(params);
      }
    });
  }

  function def(id, deps, factory) {
    if (typeof deps === 'function') {
      factory = deps;
      deps = [];
    }

    if (typeof deps === 'string') {
      registry[id] = { source: deps };
      loadScript(id, load);
    } else if (factory) {
      registry[id] = {
        resolved: !deps.length,
        callback: factory,
        require: deps
      };

      load();
    }
  }

  function req(deps, callback) {
    stack.push({
      require: deps,
      callback: callback
    });

    load();
  }

  return {
    define: shadow(def),
    require: shadow(req)
  };
})();
