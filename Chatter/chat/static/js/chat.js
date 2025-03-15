// Toggle between chat list and chat content on mobile
document.querySelectorAll('.chat-card').forEach(card => {
    card.addEventListener('click', function() {
        if (window.innerWidth < 768) {
            document.body.classList.add('show-chat');
        }
        
        // Remove active class from all cards
        document.querySelectorAll('.chat-card').forEach(c => {
            c.classList.remove('active');
        });
        
        // Add active class to clicked card
        this.classList.add('active');
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
    document.getElementById('overlay').classList.add('active');
});

document.getElementById('closeNav').addEventListener('click', function() {
    document.getElementById('toggleNav').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
});

document.getElementById('overlay').addEventListener('click', function() {
    document.getElementById('toggleNav').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
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

document.getElementById('popupOverlay').addEventListener('click', function() {
    document.getElementById('addFriendPopup').style.display = 'none';
    document.getElementById('popupOverlay').style.display = 'none';
});

// Handle Add-Friend Submission from frontend if necessary!!!
// document.getElementById('addFriendSubmit').addEventListener('click', function() {
//     const username = document.getElementById('friendUsername').value;
//     if (username.trim()) {
//         alert(`Friend request sent to ${username}`);
//         document.getElementById('addFriendPopup').style.display = 'none';
//         document.getElementById('popupOverlay').style.display = 'none';
//     } else {
//         alert('Please enter a username.');
//     }
// });