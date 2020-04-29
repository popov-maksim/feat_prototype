const multiplier = 0.75;
let net;
let cameraFrame

function startDetectBody() {
    bodyPix.load(multiplier)
        .catch(error => {
            console.log(error);
        })
        .then(objNet => {
            net = objNet;
            cameraFrame = detectBody();
        });
}

const outputStride = 16;
const segmentationThreshold = 0.5;

function detectBody() {
    net.estimatePersonSegmentation(localVideo, outputStride, segmentationThreshold)
        .catch(error => {
            console.log(error);
        })
        .then(personSegmentation => {
            drawBody(personSegmentation);
        });
    cameraFrame = requestAnimFrame(detectBody);
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function drawBody(personSegmentation) {
    ctx.drawImage(remoteVideo, 0, 0);
    let remoteImageData = ctx.getImageData(0, 0, remoteVideo.width, remoteVideo.height);
    let remotePixels = remoteImageData.data;

    let tempCanvas = document.createElement('canvas')
    tempCanvas.width = localVideo.width
    tempCanvas.height = localVideo.height
    let tempCtx = tempCanvas.getContext('2d')

    tempCtx.drawImage(localVideo, 0, 0, localVideo.width, localVideo.height);
    let imageData = tempCtx.getImageData(0, 0, localVideo.width, localVideo.height);
    let pixels = imageData.data;

    for (let p = 0; p < pixels.length; p += 4) {
        if (personSegmentation.data[p / 4] !== 0) {
            remotePixels[p] = pixels[p];
            remotePixels[p + 1] = pixels[p + 1];
            remotePixels[p + 2] = pixels[p + 2];
        }
    }

    ctx.putImageData(remoteImageData, 0, 0);
}