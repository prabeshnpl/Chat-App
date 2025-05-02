const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
if(id){
let userInput = document.getElementById('user');
const user = userInput ? userInput.dataset.user : null;
const roomIdElement = document.getElementById('roomCode');
const room_code = roomIdElement ? roomIdElement.dataset.roomCode : null; 
if(room_code){
    console.log(room_code);

    let socket = new WebSocket(`wss://${window.location.host}/ws/groupchat/${room_code}/`);
    const uniqueId = `chat-alert-${Date.now()}`;
    chatContent.insertAdjacentHTML('beforeend',
        `<div id='${uniqueId}'' style="width:100%;height:25px;display:flex;justify-content:center;">
            <p class="alert-success" style="text-align:center; border-radius:5px;width:70%">Connecting....</p><br>
        </div>`
    )

    socket.onopen = () =>{
        document.getElementById(uniqueId).style.display = 'none';
        chatContent.insertAdjacentHTML(
            'beforeend',
            `<div id='chat-alert' style="width:100%;height:25px;display:flex;justify-content:center;">
                <p class="alert-success" style="text-align:center; border-radius:5px;width:70%">Connected Successfully</p><br>
            </div>`
        );
        chatContent.scrollTop = chatContent.scrollHeight;

        setTimeout(()=>{
            document.getElementById('chat-alert').style.display = 'none';
        },2000);
    }


    socket.onmessage = (e)=>{
        data = JSON.parse(e.data);
        const chatContent = document.getElementById('chatContent');
        console.log(`Message received:`,data);
        if(data.type=='groupchat'){
            let divClass = 'received';
            if(data.username == `${user}`){
                divClass ='sent';
            }
            
            chatContent.insertAdjacentHTML(
            'beforeend',
            `<div class="message ${divClass}">
            <div>[ ${data.sender_first_name.toUpperCase()} ${data.sender_last_name.toUpperCase()}]</div><br>
            ${data.message}
            <div class="message-time-wrapper">
                <span class="message-time">now</span>
            </div>
            </div>`
            );
            // To auto scroll when new div is added!!
            chatContent.scrollTop = chatContent.scrollHeight;
        }
        if(data.type == 'user_joined'){
            chatContent.insertAdjacentHTML(
            'beforeend',
            `<div style="width:100%;height:50px;">
            <p>${data.message}</p><br>
            </div>`
            );
            // To auto scroll when new div is added!!
            chatContent.scrollTop = chatContent.scrollHeight;
        }
        if(data.type == 'connection' ){
        if(data.message == 'connected'){
            chatContent.insertAdjacentHTML('beforeend',
                `<div id='chat-alert' style="width:100%;height:25px;display:flex;justify-content:center;">
                    <p class="alert-success" style="text-align:center; border-radius:5px;width:70%">Connected Successfully</p><br>
                </div>`                       
            );
            chatContent.scrollTop = chatContent.scrollHeight;

        };
        setTimeout(()=>{
            document.getElementById('chat-alert').style.display = 'none';
        },2000)

    }
    }

    socket.onclose = (event) =>{
        console.log('message',event);
        const chatContent = document.getElementById('chatContent');
        document.getElementById(uniqueId).style.display = 'none';
        
        chatContent.insertAdjacentHTML(
            'beforeend',
            `<div id='chat-alert' style="width:100%;display:flex;justify-content:center;align-items:center;">
                <p class='alert-error' style="text-align:center; border-radius:5px;width:70%">Disconnected. Please check your internet connection and try again.</p><br>
            </div>`
        );
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = e.target.message.value;

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


    socket.send(JSON.stringify({message:message,receiverId:id}));     
    e.target.reset();               
    });
    }
}