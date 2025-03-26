document.addEventListener('DOMContentLoaded', () => {
    const blankContentContainer = document.getElementById('blank-content-container');
    const rightContent = document.getElementById('right-content');
    const selectUserBar = document.getElementById('select-user-bar');
    const receiverIdElement = document.getElementsByClassName('active')[0];
    const receiverId = receiverIdElement ? receiverIdElement.dataset.slug : null;

    // Scroll to the bottom of the chat-content to show the latest message. Also addes timeout to make sure
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) {
        setTimeout(() => {
            chatContent.scrollTop = chatContent.scrollHeight;
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
        document.getElementById('addFriendPopup').style.display = 'block';
        document.getElementById('popupOverlay').style.display = 'block';
    });

    // Close Add Friend Popup
    document.getElementById('closeAddFriendPopup').addEventListener('click', function() {
        document.getElementById('addFriendPopup').style.display = 'none';
        document.getElementById('popupOverlay').style.display = 'none';
    });

    //Show Remove Friend Popup
    document.getElementById('removeFriendBtn').addEventListener('click',()=>{
        document.getElementById('deleteFriendPopup').style.display = 'block';
        document.getElementById('popupOverlay').style.display = 'block';
    })

    //Close Remove Friend Popup
    document.getElementById('closeDeleteFriendPopup').addEventListener('click',()=>{
        document.getElementById('popupOverlay').style.display = 'none';
        document.getElementById('deleteFriendPopup').style.display = 'none';
    })

    //Show Add Group Popup
    document.getElementById('addGroupBtn').addEventListener('click', function() {
        document.getElementById('addGroupPopup').style.display = 'block';
        document.getElementById('popupOverlay').style.display = 'block';
    });

    // Close Add Group Popup
    document.getElementById('closeAddGroupPopup').addEventListener('click', function() {
        document.getElementById('addGroupPopup').style.display = 'none';
        document.getElementById('popupOverlay').style.display = 'none';
    });

    //Show Join Group Popup
    document.getElementById('joinGroupBtn').addEventListener('click', function() {
        document.getElementById('joinGroupPopup').style.display = 'block';
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



