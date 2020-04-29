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

window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function drawBody(personSegmentation)
{
    ctx.drawImage(remoteVideo, 0, 0);
    const remotePixels = ctx.getImageData(0,0, remoteVideo.width, remoteVideo.height).data;

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = localVideo.width
    tempCanvas.height = localVideo.height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.drawImage(localVideo, 0, 0, localVideo.width, localVideo.height);
    const imageData = tempCtx.getImageData(0,0, localVideo.width, localVideo.height);
    const pixels = imageData.data;
    for (let p = 0; p < pixels.length; p += 4)
    {
        if (personSegmentation.data[p / 4] === 0) {
            // pixels[p + 3] = 0;
            pixels[p] = remotePixels[p];
            pixels[p + 1] = remotePixels[p + 1];
            pixels[p + 2] = remotePixels[p + 2];
            console.log("LOOK HERE", remotePixels[p], pixels[p]);
        }
    }

    ctx.imageSmoothingEnabled = true;
    ctx.putImageData(imageData, 0, 0);
}