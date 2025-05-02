document.addEventListener('DOMContentLoaded', () => {
    const blankContentContainer = document.getElementById('blank-content-container');
    const rightContent = document.getElementById('right-content');
    const selectUserBar = document.getElementById('select-user-bar');
    const receiverIdElement = document.getElementsByClassName('active')[0];
    const receiverId = receiverIdElement ? receiverIdElement.dataset.slug : null;
    const chatContent = document.querySelector('.chat-content');
    let page=1;
    let loading=false;
    
    const chatType = document.getElementById('chatType').dataset.chatType 
    const messages = document.getElementById('messages')
    if(messages){
        setTimeout(() => {
            messages.style.display = 'none'; // Hide the messages after 3-4 seconds
        }, 2000);
    }

    const texting = document.getElementById('text-message');
    const voiceMessage = document.getElementById('voice-message');
    const attachFile = document.getElementById('attach-file');
    const sendIcon = document.getElementById('send-icon');
    if(texting){
        texting.addEventListener('input', () => {    

            // Hide voice message and attach file with fade-out effect
            voiceMessage.style.opacity = '0';
            attachFile.style.opacity = '0';
    
            setTimeout(() => {
                voiceMessage.style.display = 'none';
                attachFile.style.display = 'none';
    
                // Show send icon with fade-in effect
                sendIcon.style.display = 'flex';
                sendIcon.style.opacity = '0'; // Start with opacity 0
                setTimeout(() => {
                    sendIcon.style.opacity = '1'; // Fade in
                }, 10);
            }, 300); // Match the transition duration
        });
    
        texting.addEventListener('blur', () => {
            if (texting.value.trim() === '') {
                // Show voice message and attach file with fade-in effect
                sendIcon.style.opacity = '0';
                voiceMessage.style.display = 'flex';
                attachFile.style.display = 'flex';
                
                setTimeout(() => {
                    sendIcon.style.display = 'none';
                    voiceMessage.style.opacity = '0'; // Start with opacity 0
                    attachFile.style.opacity = '0'; // Start with opacity 0
    
                    setTimeout(() => {
                        voiceMessage.style.opacity = '1'; // Fade in
                        attachFile.style.opacity = '1'; // Fade in
                    }, 10);
                }, 0); // Match the transition duration
            }
        });
    }
    
    
    const loadMessages = () => {
        
        if(loading) return;
        loading = true;
        const baseUrl = window.location.origin;
        let fetchUrl = '';
        let userDetailDiv = '';
        if(chatType == 'solo_chat'){
            fetchUrl = `${baseUrl}/?id=${receiverId}&page=${page}`;
        }
        else if(chatType == 'group_chat'){
            fetchUrl = `${baseUrl}/group/?id=${receiverId}&page=${page}`;
        }
        if(receiverId){            
            fetch(fetchUrl,{
                headers:{
                    'X-Requested-With':'XMLHttpRequest',
                },
            })
            .then(response => response.json())
            .then(data => {
                if(data.messages){
                    data.messages.forEach(chat => {
                        
                        username = document.getElementById('user').dataset.user;
                        let type = username == chat.sender ? "sent":"received";
                        
                        if(chatType == 'group_chat'){
                            userDetailDiv = `<div><strong>${chat.sender_first_name.toUpperCase()} ${chat.sender_last_name.toUpperCase()}</strong></div>`
                        }

                        if(chat.message){
                        chatContent.insertAdjacentHTML(
                            'afterbegin',
                            `
                            <div class="message ${type}">
                                ${userDetailDiv}
                                ${chat.message}
                                <div class="message-time-wrapper">
                                    <span class="message-time">${chat.timestamp}</span>
                                </div>
                            </div>
                            `
                        );}

                        else {
                        chatContent.insertAdjacentHTML(
                            'afterbegin',
                            `
                            <div class="message ${type}">
                                ${userDetailDiv}
                                <audio controls>
                                    <source src="${chat.voiceMessage}" type="audio/webm">
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                            `
                        );

                        }
                    });
                    chatContent.scrollTop = chatContent.scrollHeight;
                    if (!data.has_next) {
                        chatContent.removeEventListener('scroll', handleScroll);
                    }else{
                        page++; // Increment the page number for the next page
                    }
                }

            })
            .catch(error => {
                console.log('error fetching messages: ',error);
            });
            
        }
        loading=false;
    }

    loadMessages();
    

    const loadOldMessages = () => {
        if (loading) return;
        loading = true;
        const baseUrl = window.location.origin;
        let fetchUrl = '';
        let userDetailDiv = '';
        if(chatType == 'solo_chat'){
            fetchUrl = `${baseUrl}/?id=${receiverId}&page=${page}`;
        }
        else if(chatType == 'group_chat'){
            fetchUrl = `${baseUrl}/group/?id=${receiverId}&page=${page}`;
        }
        if (receiverId) {
            fetch(fetchUrl, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.messages) {
                    const previousScrollHeight = chatContent.scrollHeight;
    
                    data.messages.forEach(chat => {
                        let type = '';
                        username = document.getElementById('user').dataset.user;
                        if (username == chat.sender) {
                            type = "sent";
                        } else {
                            type = "received";
                        }
                        if(chatType == 'group_chat'){
                            userDetailDiv = `<div>${chat.sender_first_name} ${ chat.sender_last_name}</div>`
                        }
                        chatContent.insertAdjacentHTML(
                            'afterbegin', // Prepend older messages to the top
                            `
                            <div class="message ${type}">
                                ${userDetailDiv}<br>
                                ${chat.message}
                                <div class="message-time-wrapper">
                                    <span class="message-time">${chat.timestamp}</span>
                                </div>
                            </div>
                            `
                        );
                    });
    
                    // Maintain the scroll position after prepending messages
                    chatContent.scrollTop = chatContent.scrollHeight - previousScrollHeight;
    
                    // Check if there are more messages to load
                    if (!data.has_next) {
                        chatContent.removeEventListener('scroll', handleScroll);
                    }else{
                        page++; // Increment the page number for the next page
                    }
                }
                loading = false;
            })
            .catch(error => {
                console.error('Error fetching old messages:', error);
                loading = false;
            });
        }
    };
    
    

    const handleScroll = () => {
        if (chatContent.scrollTop === 0 && !loading) {
            loadOldMessages(); // Fetch older messages
        }
    }
    if (chatContent) {
        setTimeout(() => {
        chatContent.addEventListener('scroll',handleScroll);
        }, 0);
    }
    

    function adjustLayout(){
        if (window.innerWidth > 768) {
            if (blankContentContainer) {
                if(receiverId)
                    blankContentContainer.style.display = 'none';
                else
                    blankContentContainer.style.display = 'block';
            }
            if (rightContent) {
                rightContent.style.display = 'flex';
            }
            if (selectUserBar) {
                selectUserBar.style.display = 'flex';
            }
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('id')) {
                if (rightContent) {
                    rightContent.style.display = 'flex';
                }
                if (selectUserBar) {
                    selectUserBar.style.display = 'none';
                }
            } else {
                if (rightContent) {
                    rightContent.style.display = 'none';
                }
                if (selectUserBar) {
                    selectUserBar.style.display = 'flex';
                }
            }
        }
    }
    // Initial layout adjustment
    adjustLayout();            
    // Adjust layout on window resize
    window.addEventListener('resize', adjustLayout);

    

    // select the user to chat 
    document.querySelectorAll('.chat-card').forEach(card => {
        card.addEventListener('click', function() {
            const id = new URLSearchParams({
                id: this.dataset.slug,
            });
            window.location.href = (`?${id.toString()}`);

            // Remove active class from all cards
            document.querySelectorAll('.chat-card').forEach(c => {
                c.classList.remove('active');
            });

            // Add active class to clicked card
            this.classList.add('active');

            if (window.innerWidth < 768) {
                document.getElementById('right-content').style.display = 'flex';
                document.getElementById('select-user-bar').style.display = 'none';
            }
        });
    });
    // Get the current URL and path
    const currentPath = window.location.pathname;
    if(currentPath == '/'){
        document.getElementById('navfriend').classList.add('active');
    }
    else if(currentPath == '/group/'){
        document.getElementById('navgroup').classList.add('active');
    }

    // Toggle navigation bar
    document.querySelector('.nav').addEventListener('click', function() {
        document.getElementById('toggleNav').classList.add('active');
        document.getElementById('nav-overlay').classList.add('active');
    });

    document.getElementById('closeNav').addEventListener('click', function() {
        document.getElementById('toggleNav').classList.remove('active');
        document.getElementById('nav-overlay').classList.remove('active');
    });

    document.getElementById('nav-overlay').addEventListener('click', function() {
        document.getElementById('toggleNav').classList.remove('active');
        document.getElementById('nav-overlay').classList.remove('active');
    });

    // Show Add Friend Popup
    document.getElementById('addFriendBtn').addEventListener('click', function() {
        document.getElementById('addFriendPopup').style.display = 'flex';
        document.getElementById('popupOverlay').style.display = 'block';
    });

    // Close Add Friend Popup
    document.getElementById('closeAddFriendPopup').addEventListener('click', function() {
        document.getElementById('addFriendPopup').style.display = 'none';
        document.getElementById('popupOverlay').style.display = 'none';
    });

    //Show Remove Friend Popup
    document.getElementById('removeFriendBtn').addEventListener('click',()=>{
        document.getElementById('deleteFriendPopup').style.display = 'flex';
        document.getElementById('popupOverlay').style.display = 'block';
    })

    //Close Remove Friend Popup
    document.getElementById('closeDeleteFriendPopup').addEventListener('click',()=>{
        document.getElementById('popupOverlay').style.display = 'none';
        document.getElementById('deleteFriendPopup').style.display = 'none';
    })

    //Show Add Group Popup
    document.getElementById('addGroupBtn').addEventListener('click', function() {
        document.getElementById('addGroupPopup').style.display = 'flex';
        document.getElementById('popupOverlay').style.display = 'block';
    });

    // Close Add Group Popup
    document.getElementById('closeAddGroupPopup').addEventListener('click', function() {
        document.getElementById('addGroupPopup').style.display = 'none';
        document.getElementById('popupOverlay').style.display = 'none';
    });

    //Show Join Group Popup
    document.getElementById('joinGroupBtn').addEventListener('click', function() {
        document.getElementById('joinGroupPopup').style.display = 'flex';
        document.getElementById('popupOverlay').style.display = 'block';
    });

    // Close Join Group Popup
    document.getElementById('closeJoinGroupPopup').addEventListener('click', function() {
        document.getElementById('joinGroupPopup').style.display = 'none';
        document.getElementById('popupOverlay').style.display = 'none';
    });



    // Close both if clicked outside
    document.getElementById('popupOverlay').addEventListener('click', function() {
        document.getElementById('addFriendPopup').style.display = 'none';
        document.getElementById('popupOverlay').style.display = 'none';
        document.getElementById('deleteFriendPopup').style.display = 'none';
        document.getElementById('addGroupPopup').style.display = 'none';
        document.getElementById('joinGroupPopup').style.display = 'none';
    });

    // Handle back button for small devices

    document.getElementById('back-button').addEventListener('click',()=>{
        window.location.href = '/';
    })


});



