'use strict';

window.oh = (function() {
  var stack = [];

  var cached = {},
      modules = {},
      registry = {};

  var delayed_resolve;

  var head = document.getElementsByTagName('head')[0];

  function initialize(dep) {
    var args = [];

    dep.require.forEach(function(id) {
      if (modules[id]) {
        args.push(modules[id]);
      }
    });

    if (typeof dep.callback === 'function') {
      return dep.callback.apply(null, args);
    }
  }

  function loadScript(id, dep, next) {
    if (cached[id]) {
      return;
    }

    var script = document.createElement('script');

    script.src = dep.source;
    script.type = 'text/javascript';

    // TODO: some dependencies MUST be loaded synchronously,
    // but most of them should be loaded in parallel...
    script.async = false;

    cached[id] = true;

    head.appendChild(script);

    script.onreadystatechange = script.onload = function() {
      registry[id].resolved = true;
      head.removeChild(script);
      next();
    };

    script.onerror = function() {
      if (typeof registry[id].failed === 'undefined') {
        registry[id].failed = 0;
      }

      next();
    };
  }

  function resolveModules(deps, next) {
    if (!(deps && deps.length)) {
      return true;
    }

    for (var key in deps) {
      var id = deps[key],
          dep = registry[id];

      if (!dep || modules[id]) {
        continue;
      }

      if (typeof registry[id].failed !== 'undefined') {
        registry[id].failed += 1;

        if (registry[id].failed > 5) {
          delete registry[id];
        }

        return false;
      }

      if (!dep.resolved && dep.source) {
        loadScript(id, dep, next);
        return false;
      }

      if (!resolveModules(dep.require, next)) {
        return false;
      }

      if (dep.callback) {
        modules[id] = initialize(dep);
      }
    }

    return true;
  }

  function resolveStack() {
    stack.forEach(function(params, index) {
      if (resolveModules(params.require, resolveStack)) {
        stack.splice(index, 1);
        initialize(params);
      }
    });

    clearTimeout(delayed_resolve);

    delayed_resolve = setTimeout(function() {
      if (stack.length) {
        resolveStack();
      }
    }, 50);
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
  }

  function req(deps, cb) {
    deps.forEach(function(id) {
      if (!registry[id]) {
        throw new Error('missing definition for `' + id + '`');
      }
    });

    stack.push({
      require: deps,
      callback: cb
    });

    resolveModules(deps, resolveStack);
    resolveStack();
  }

  function _(fn) {
    return function() {
      return fn.apply(null, arguments);
    };
  }

  return {
    define: _(def),
    require: _(req)
  };
})();
