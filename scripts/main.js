var eyelocation = new Worker('scripts/eyelocation.js');

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

eyelocation.onmessage = function (event) {
  requestAnimationFrame(function () {
    highlightEyes(event.data);
  });
};

function getImageData() {
  var video = document.getElementById('video'),
    canvas = document.createElement('canvas'),
    context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function startTracking() {
  setInterval(function () {
    var imageData = getImageData();
    eyelocation.postMessage({
      buffer: imageData.data.buffer,
      width: imageData.width,
      height: imageData.height
    }, [imageData.data.buffer]);
  }, 250);
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
