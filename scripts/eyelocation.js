importScripts('cluster.js');

function isDark(imageData, i, j) {
  var red = (i + j * imageData.width) * 4,
    total = imageData.data[red] + imageData.data[red + 1] + imageData.data[red + 2];
  return total < 140;
}

function isBright(imageData, i, j) {
  var red = (i + j * imageData.width) * 4,
    total = imageData.data[red] + imageData.data[red + 1] + imageData.data[red + 2];
  return total > 280;
}

function isEye(imageData, i, j, size) {
  return isBright(imageData, i, j) &&
    (
      isBright(imageData, i + 1, j + 1) || isBright(imageData, i + 1, j - 1) ||
      isBright(imageData, i - 1, j + 1) || isBright(imageData, i - 1, j - 1)
    ) &&
    [
      isDark(imageData, i + size, j + size),
      isDark(imageData, i + size, j - size),
      isDark(imageData, i - size, j + size),
      isDark(imageData, i - size, j - size)
    ].filter(function (e) { return e; }).length > 2 &&
    [
      isBright(imageData, i + 3 * size, j + 3 * size),
      isBright(imageData, i + 3 * size, j - 3 * size),
      isBright(imageData, i - 3 * size, j + 3 * size),
      isBright(imageData, i - 3 * size, j - 3 * size)
    ].filter(function (e) { return e; }).length > 1;
}

function findEyes(imageData) {
  var i, j, eyes = [];
  for (i = 15; i < imageData.width - 15; i += 1) {
    for (j = 15; j < imageData.height - 15; j += 1) {
      if (isEye(imageData, i, j, 2) || isEye(imageData, i, j, 3) || isEye(imageData, i, j, 4)) {
        eyes.push({x : i / imageData.width, y : j / imageData.height});
      }
    }
  }
  return eyes;
}

self.onmessage = function (event) {
  self.postMessage(
    cluster(
      findEyes(
        new ImageData(
          new Uint8ClampedArray(event.data.buffer),
          event.data.width,
          event.data.height
        )
      ),
      0.05,
      function (a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
      }
    ).filter(function (c) {
      return Math.abs(
        Math.max.apply(null, c.map(function (e) { return e.x; })) -
          Math.min.apply(null, c.map(function (e) { return e.x; }))
      ) < 0.1 && Math.abs(
        Math.max.apply(null, c.map(function (e) { return e.y; })) -
          Math.min.apply(null, c.map(function (e) { return e.y; }))
      ) < 0.1;
    }).map(function (c) {
      return c.reduce(function (sum, eye) {
        return {
          x: sum.x + eye.x / c.length,
          y: sum.y + eye.y / c.length
        };
      }, {x: 0, y: 0});
    })
  );
};
