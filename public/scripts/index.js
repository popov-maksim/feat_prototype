// for making call
let isAlreadyCalling = false;

// for transferring remote-video to canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const remoteVideo = document.getElementById('remote-video');

// for getting localVideo
const localVideo = document.getElementById('local-video');

// for transferring video through WebRTC
const { RTCPeerConnection, RTCSessionDescription } = window;
const peerConnection = new RTCPeerConnection();
const serverAddress = "localhost:5000";

// communication with server and another clients

const socket = io.connect(serverAddress);

function switchToVideo() {
    document.getElementById("welcome").style.display = "none";
    document.getElementById("video-chat-container").style.display = "block";
}

function switchToWelcome() {
    document.getElementById("video-chat-container").style.display = "none";
    document.getElementById("welcome").style.display = "block";
}

async function callUser(socketId) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    socket.emit("call-user", {
        offer,
        to: socketId
    });
}

socket.on("connected-user", async data => {
    callUser(data.socket)
});

socket.on("disconnected-user", async data => {
    switchToWelcome();
});

socket.on("call-made", async data => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    socket.emit("make-answer", {
        answer,
        to: data.socket
    });
});

socket.on("answer-made", async data => {
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );

    if (!isAlreadyCalling) {
        callUser(data.socket);
        isAlreadyCalling = true;
    }
});

peerConnection.ontrack = function ({streams: [stream]}) {
    if (remoteVideo) {
        remoteVideo.srcObject = stream;
        remoteVideo.play();
        startDetectBody();
    }
    switchToVideo();
};

navigator.getUserMedia(
    { video: { width: 640, height: 480 }, audio: false },
    stream => {
        if (localVideo) {
            localVideo.srcObject = stream;
            localVideo.play();
        }
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    },
    error => {
        console.warn(error.message);
    }
);

