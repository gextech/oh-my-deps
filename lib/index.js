'use strict';

window.rjs = (function() {
  var cached = {},
      modules = {};

  var head = document.getElementsByTagName('head')[0];

  function load(id) {
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

  return {
    define: function(src, id) {
      modules[id] = src;
    },
    require: function(ids, cb) {
      var stack = [];

      ids.forEach(function(id) {
        if (!cached[id]) {
          stack.push(load(id));
        }
      });

      run(stack, cb);
    }
  };
})();
