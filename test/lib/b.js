function main(data) {
  data.push('B');
}

if (typeof define === 'function') {
  define(['c'], function(c) {
    return function(data) {
      main(data);
      c(data);
    };
  });
}
