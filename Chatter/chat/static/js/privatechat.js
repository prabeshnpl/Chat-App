document.addEventListener('DOMContentLoaded',()=>{

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

if(id){

    const roomIdElement = document.getElementById('roomCode');
    const chatContent = document.getElementById('chatContent');
    const room_code = roomIdElement ? roomIdElement.dataset.roomCode : null;

    let userInput = document.getElementById('user');
    const user = userInput ? userInput.dataset.user : null;

    if (room_code) {
        console.log(room_code)

        // creating web socket connection
        let socket = new WebSocket(`ws://${window.location.host}/ws/chat/${room_code}/`);

        // Sucess message when connected
        const uniqueId = `chat-alert-${Date.now()}`;
        chatContent.insertAdjacentHTML('beforeend',
            `<div id='${uniqueId}' style="width:100%;height:25px;display:flex;justify-content:center;">
                <p class="alert-success" style="text-align:center; border-radius:5px;width:70%">Connecting....</p><br>
            </div>`
        )

        // Handling socket event onopen
        socket.onopen = () =>{
            document.getElementById(uniqueId).style.display = 'none';
            chatContent.insertAdjacentHTML(
                'beforeend',
                `<div id='chat-alert' style="width:100%;height:25px;display:flex;justify-content:center;">
                    <p class="alert-success" style="text-align:center; border-radius:5px;width:70%">Connected Successfully</p><br>
                </div>`
            );
            setTimeout(() => {
                const chatAlert = document.getElementById('chat-alert');
                if (chatAlert) {
                    chatAlert.style.display = 'none';
                }
            }, 4000);
            chatContent.scrollTop = chatContent.scrollHeight;
            
        }
        
        // Handling socket event onmessage
        socket.onmessage = async (e)=>{
            
            data = JSON.parse(e.data);
            console.log(`Message received:`,data);
            if(data.type=='chat'){
                let divClass = 'received';

                if(data.sender == `${user}`){
                    divClass ='sent';
                };
                
                chatContent.insertAdjacentHTML(
                'beforeend',
                `<div class="message ${divClass}">
                ${data.message}
                <div class="message-time-wrapper">
                    <span class="message-time">now</span>
                </div>
                </div>`
                );
                // To auto scroll when new div is added!!
                chatContent.scrollTop = chatContent.scrollHeight;
            }
            else if(data.type=='vmessage'){
                let divClass = data.sender == user ? 'sent':'received';
                chatContent.insertAdjacentHTML(
                'beforeend',
                `<div class="message ${divClass}">
                    <audio controls style="max-width:100%; width:100%;">
                        <source src="${data.vmessage}" type="audio/webm">
                        Your browser does not support the audio element.
                    </audio>
                </div>`
                );
                // To auto scroll when new div is added!!
                chatContent.scrollTop = chatContent.scrollHeight;
            }
            else if(data.type == 'user_joined'){
                chatContent.insertAdjacentHTML(
                    'beforeend',
                    `<div style="width:100%;height:50px;">
                    <p>${data.message}</p><br>
                    </div>`
                    );
                    // To auto scroll when new div is added!!
                    chatContent.scrollTop = chatContent.scrollHeight;
            }
            else if (data.offer) {

                const popup = document.getElementById("incomingCallBox");
                const acceptBtn = document.getElementById("acceptBtn");
                const rejectBtn = document.getElementById("rejectBtn");
                const overlay = document.getElementById("overlay2");

                popup.getElementById("caller").innerText = callerName;
                popup.classList.remove("hidden");
                overlay.classList.remove("hidden");

                acceptBtn.onclick = () => {
                    popup.classList.add("hidden");
                    const popup = document.getElementById("callBox");
                    popup.classList.remove("hidden");
                    handleOffer(data.offer);
                    // Optionally send an acceptance signal
                    socket.send(JSON.stringify({ type: "call_accepted",message: "Call accepted" }));                    
                };

                rejectBtn.onclick = () => {
                    popup.classList.add("hidden");
                    endCall();
                    document.getElementById('remoteAudio').srcObject = null;
                    // Optionally send a rejection signal
                    socket.send(JSON.stringify({ type: "call_ended", message: "Call rejected" }));
                };

                async function handleOffer(offer) {
                    localConnection = new RTCPeerConnection({
                        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
                    });

                    localConnection.ontrack = (event) => {
                        document.getElementById('remoteAudio').srcObject = event.streams[0];
                    };

                    localConnection.onicecandidate = (event) => {
                        if (event.candidate) {
                            socket.send(JSON.stringify({ candidate: event.candidate }));
                        }
                    };

                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(track => localConnection.addTrack(track, stream));

                    await localConnection.setRemoteDescription(offer);
                    const answer = await localConnection.createAnswer();
                    await localConnection.setLocalDescription(answer);
                    socket.send(JSON.stringify({ answer: answer }));
                }                
            }
            else if (data.answer) {
                await localConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
                const popup = document.getElementById("callBox");
                popup.classList.remove("hidden");
            }
            else if (data.candidate) {
                await localConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
            else if (data.type === 'call_ended') {
                document.getElementById('remoteAudio').srcObject = null;
                alert(data.message || 'Call ended');
                const popup = document.getElementById("incomingCallBox");
                const overlay = document.getElementById("overlay2");
                popup.classList.add("hidden");
                overlay.classList.add("hidden");
            }
            else {
                console.error('Unknown message type:', data);
            }
        }

        // Handling socket event onclose
        socket.onclose = (event) =>{
            console.log('Socket Closed:',event);
            const chatContent = document.getElementById('chatContent');
            // document.getElementById('chat-alert').style.display = 'none';
            document.getElementById(uniqueId).style.display = 'none';
            chatContent.insertAdjacentHTML(
                'beforeend',
                `<div id='chat-alert' style="width:100%;display:flex;justify-content:center;align-items:center;">
                    <p class='alert-error' style="text-align:center; border-radius:5px;width:70%">Disconnected. Please check your internet connection and try again.</p><br>
                </div>`
            );
            chatContent.scrollTop = chatContent.scrollHeight;
        }

        // Event listener for the message submit
        chatForm.addEventListener('submit', (e) => {

                e.preventDefault();
                voiceMessage= document.getElementById('voice-message');
                attachFile = document.getElementById('attach-file');
                document.getElementById('send-icon').style.display = 'none';
                voiceMessage.style.display = 'flex';
                attachFile.style.display = 'flex';

                setTimeout(() => {
                    voiceMessage.style.opacity = '0'; // Start with opacity 0
                    attachFile.style.opacity = '0'; // Start with opacity 0

                    setTimeout(() => {
                        voiceMessage.style.opacity = '1'; // Fade in
                        attachFile.style.opacity = '1'; // Fade in
                    }, 10);
                }, 0); // Match the transition duration

                const message = e.target.message.value;
                socket.send(JSON.stringify({message:message,receiverId:id,vmessage:''}));     
                e.target.reset();     

        });

        // For voice message
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
                        const reader = new FileReader();

                        reader.onload = () =>{
                            const base64Audio = reader.result.split(',')[1];
                            console.log('Before sending...');
                            socket.send(JSON.stringify({
                                vmessage: base64Audio,
                                receiverId: id,
                                message: ''
                            }));
                            console.log('After sending...');
                        }
                        reader.readAsDataURL(audioBlob);
                    
                        // Reset button icon
                        voiceMessageButton.innerHTML = '<i class="bi bi-mic-fill"></i>';
                        alert('Voice message sent!');

                    };
                } else if (mediaRecorder.state === 'recording') {
                    // Stop recording when the button is clicked again
                    mediaRecorder.stop();
                }
            });
        } 
        else {
            alert('Your browser does not support audio recording.');
        }

        let localConnection = null;
        let localStream = null;
        // Function to start a call
        async function startCall(){

            // Create a new RTCPeerConnection
            let localConnection = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            // Provide permission to use microphone
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } 
            catch (e) {
                alert("Your device isn't supported for voice call.");
            }
            // Add the voice to the connection
            stream.getTracks().forEach(track => localConnection.addTrack(track, stream));

            // Handle Ice candidates
            localConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.send(JSON.stringify({ candidate: event.candidate }));
                }
            };

            // Send offer to the server
            const offer = await localConnection.createOffer();
            await localConnection.setLocalDescription(offer);
            socket.send(JSON.stringify({ offer: offer, receiverId: id }));
            
            // Handle incoming tracks
            localConnection.ontrack = (event) => {
                document.getElementById('remoteAudio').srcObject = event.streams[0];
            };
        }

        // End call function
        function endCall() {
            if (localConnection) {
                localConnection.close();
                localConnection = null;
            }
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                localStream = null;
            }
            socket.send(JSON.stringify({ type: "call_ended" , message: "Call Ended"}));
        }
    }
}
})

