(function() {
  function main(data) {
    data.push('C');
  }

  if (typeof define === 'function') {
    define('D', function() {
      return main;
    });
  }
})();
