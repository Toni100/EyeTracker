function isClusterMember(arr, el, maxDist, df) {
  'use strict';
  return arr.some(function (e) {
    return df(el, e) <= maxDist;
  });
}

function cluster(list, maxDist, df) {
  'use strict';
  var clusters = [],
    l = Array.from(list),
    c,
    running,
    i;
  while (l.length > 0) {
    c = [l.pop()];
    running = true;
    while (running && l.length) {
      for (i = 0; i < l.length; i += 1) {
        if (isClusterMember(c, l[i], maxDist, df)) {
          c.push(l.splice(i, 1)[0]);
          i = -1;
        } else if (i === l.length - 1) {
          running = false;
        }
      }
    }
    clusters.push(c);
  }
  return clusters;
}

// console.log(cluster([1, 5, 3, 20, 19, 15, 18, 2, 16, 4], 1, function (x, y) {
//   return Math.abs(x - y);
// }).map(function (c) { return c.join(':'); }).join(', '));

// console.log(cluster(
//   [[1, 1], [1, 2], [4, 9], [2, 3], [4, 8], [1, 3], [5, 8]],
//   2,
//   function (x, y) {
//     return Math.sqrt(Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2));
//   }
// ).map(function (c) {
//   return c.map(function (d) { return d.join(', '); }).join(' | ');
// }).join(' --- '));
