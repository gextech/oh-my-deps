(function() {
  function main(data) {
    data.push('A');
  }

  if (typeof define === 'function') {
    define(function() {
      return main;
    });
  }
})();
