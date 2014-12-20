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

function getImageData() {
  var video = document.getElementById('video'),
    canvas = document.createElement('canvas'),
    context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function highlightEyes(eyes) {
  var overlay = document.getElementById('overlay'),
    context = overlay.getContext('2d');
  context.clearRect(0, 0, overlay.width, overlay.height);
  context.lineWidth = 2;
  eyes.forEach(function (eye) {
    context.beginPath();
    context.strokeStyle = 'rgba(255, 0, 0, 0.6)';
    context.arc(eye.x * overlay.width, eye.y * overlay.height, 6, 0, 2 * Math.PI, true);
    context.stroke();
    context.beginPath();
    context.strokeStyle = 'rgba(0, 100, 255, 0.3)';
    context.arc(eye.x * overlay.width, eye.y * overlay.height, 5, 0, 2 * Math.PI, true);
    context.stroke();
  });
}

function startTracking() {
  setInterval(function () {
    findEyes(getImageData(), function (eyes) {
      requestAnimationFrame(function () {
        highlightEyes(eyes);
      });
    });
  }, 400);
}

function setOverlaySize(callback) {
  var video = document.getElementById('video'),
    overlay = document.getElementById('overlay'),
    w = parseInt(window.getComputedStyle(video).width, 10);
  if (video.videoWidth) {
    overlay.width = w;
    overlay.height = w * video.videoHeight / video.videoWidth;
    if (callback) { callback(); }
  } else {
    setTimeout(function () { setOverlaySize(callback); }, 200);
  }
}

window.addEventListener('load', function () {
  navigator.mozGetUserMedia({video: true}, function (stream) {
    document.getElementById('video').mozSrcObject = stream;
    setOverlaySize(startTracking);
  }, function (error) { console.log(error); });
});
