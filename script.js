const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const statusText = document.getElementById('status');
const meshCount = document.getElementById('mesh-count');

function onResults(results) {
    // Bersihkan canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Gambar frame video
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiFaceLandmarks) {
        statusText.innerText = "Tracking Active";
        statusText.classList.add('text-green-400');
        meshCount.innerText = "468 Nodes";

        for (const landmarks of results.multiFaceLandmarks) {
            // Gambar "Saraf" Wajah dengan warna neon
            drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
                {color: '#00f2fe44', lineWidth: 0.5});
            
            // Gambar garis kontur utama
            drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#3b82f6'});
            drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#3b82f6'});
            drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#06b6d4', lineWidth: 2});
            drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#22d3ee'});
        }
    } else {
        statusText.innerText = "Searching...";
        statusText.classList.remove('text-green-400');
        meshCount.innerText = "0 Nodes";
    }
    canvasCtx.restore();
}

// Inisialisasi MediaPipe FaceMesh
const faceMesh = new FaceMesh({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

faceMesh.onResults(onResults);

// Inisialisasi Kamera
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await faceMesh.send({image: videoElement});
    },
    width: 640,
    height: 480
});

camera.start();
