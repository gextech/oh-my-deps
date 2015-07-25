(function() {
  function main(data) {
    data.push('X');
  }

  if (typeof define === 'function') {
    define(function() {
      return main;
    });

    define('y', function() {
      return 'OK';
    });

    define(function() {
      throw new Error('this should not be allowed');
    });
  }
})();
