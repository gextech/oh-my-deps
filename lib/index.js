'use strict';

window.rjs = (function() {
  var stack = [],
      modules = {},
      registry = {};

  var head = document.getElementsByTagName('head')[0];

  function loadScript(id) {
    if (!cached[id]) {
      var script = document.createElement('script');

      script.src = registry[id].source;
      script.type = 'text/javascript';
      script.async = false;

      head.appendChild(script);

      script.onreadystatechange = script.onload = function() {
        head.removeChild(script);
        cached[id] = true;
      };
    }
  }

  function resolve(deps) {
    if (!deps.length) {
      return true;
    }

    for (var key in deps) {
      if (modules[deps[key]]) {
        continue;
      }

      if (!resolve(registry[deps[key]].require)) {
        return false;
      }

      modules[deps[key]] = call(registry[deps[key]]);
    }

    return true;
  }

  function shadow(fn) {
    return function() {
      return fn.apply(null, arguments);
    };
  }

  function call(it) {
    return it.callback.apply(null, it.require.map(function(id) {
      return modules[id];
    }));
  }

  function load() {
    resolve(Object.keys(registry));

    stack.forEach(function(params, index) {
      if (resolve(params.require)) {
        stack.splice(index, 1);
        call(params);
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
    } else if (factory) {
      registry[id] = {
        resolved: !deps.length,
        callback: factory,
        require: deps
      };
    }

    load();
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
