const voiceMessageButton = document.getElementById('voice-message');
let mediaRecorder;
let audioChunks = [];

// Check if the browser supports audio recording
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    voiceMessageButton.addEventListener('click', async () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);

            // Start recording
            mediaRecorder.start();
            audioChunks = [];
            voiceMessageButton.innerHTML = '<i class="bi bi-stop-fill"></i>'; // Change icon to "stop"

            // Collect audio data
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            // Stop recording after 10 seconds (optional)
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 10000);

            // Handle recording stop
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);

                // Send the audio blob to the server
                const formData = new FormData();
                formData.append('voice_message', audioBlob);

                await fetch('/upload_voice_message/', {
                    method: 'POST',
                    body: formData,
                });

                // Reset button icon
                voiceMessageButton.innerHTML = '<i class="bi bi-mic-fill"></i>';
                alert('Voice message sent!');

            };
        } else if (mediaRecorder.state === 'recording') {
            // Stop recording when the button is clicked again
            mediaRecorder.stop();
        }
    });
} else {
    alert('Your browser does not support audio recording.');
}