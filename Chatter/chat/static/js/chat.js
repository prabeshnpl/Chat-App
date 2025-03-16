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
// Back button functionality for mobile
document.querySelector('.back-button').addEventListener('click', function() {
    document.body.classList.remove('show-chat');
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth >= 768) {
        document.body.classList.remove('show-chat');
    }
});

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

// Close both if clicked outside
document.getElementById('popupOverlay').addEventListener('click', function() {
    document.getElementById('addFriendPopup').style.display = 'none';
    document.getElementById('popupOverlay').style.display = 'none';
    document.getElementById('deleteFriendPopup').style.display = 'none';
});

// Handle back button for small devices

document.getElementById('back-button').addEventListener('click',()=>{
    window.location.href = '/';
})

