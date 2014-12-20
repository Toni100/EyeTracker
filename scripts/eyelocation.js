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

function findEyes(imageData, callback) {
  var i, j, eyes = [];
  for (i = 15; i < imageData.width - 15; i += 1) {
    for (j = 15; j < imageData.height - 15; j += 1) {
      if (isEye(imageData, i, j, 2) || isEye(imageData, i, j, 3) || isEye(imageData, i, j, 4)) {
        eyes.push({x : i / imageData.width, y : j / imageData.height});
      }
    }
  }
  callback(eyes);
}

self.onmessage = function (event) {
  findEyes(new ImageData(
    new Uint8ClampedArray(event.data.buffer),
    event.data.width,
    event.data.height
  ), self.postMessage);
};
