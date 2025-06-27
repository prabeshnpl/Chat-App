document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const switchTabLinks = document.querySelectorAll('.switch-tab');
    

    function switchTab(tabId) {
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        tabContents.forEach(content => {
            if (content.id === tabId + '-tab') {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    switchTabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('bi-eye-slash');
                this.classList.add('bi-eye');
            } else {
                passwordInput.type = 'password';
                this.classList.remove('bi-eye');
                this.classList.add('bi-eye-slash');
            }
        });
    });
    
    // Password strength meter
    const passwordInput = document.getElementById('register-password');
    const strengthMeter = document.querySelector('.password-strength-meter');
    const strengthText = document.getElementById('strength-text');
    
    passwordInput.addEventListener('input', function() {
        const value = this.value;
        let strength = 0;
        let color = '';
        let text = '';
        
        if (value.length >= 8) strength += 25;
        if (value.match(/[A-Z]/)) strength += 25;
        if (value.match(/[0-9]/)) strength += 25;
        if (value.match(/[^A-Za-z0-9]/)) strength += 25;
        
        if (strength <= 25) {
            color = '#e74c3c';
            text = 'Weak';
        } else if (strength <= 50) {
            color = '#f39c12';
            text = 'Medium';
        } else if (strength <= 75) {
            color = '#3498db';
            text = 'Good';
        } else {
            color = '#2ecc71';
            text = 'Strong';
        }
        
        strengthMeter.style.width = strength + '%';
        strengthMeter.style.backgroundColor = color;
        strengthText.textContent = text;
    });
    
    // Form validation
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // These functions can be used if decided to send data through js request through ajax fetch etc

    loginForm.addEventListener('submit', function(e) {
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        // Reset validation errors
        document.querySelectorAll('.validation-error').forEach(error => {
            error.style.display = 'none';
        });
        
        // Username validation
        if (username.trim() === '') {
            document.getElementById('login-username-error').style.display = 'block';
        }
        
        // Password validation
        if (password.trim() === '') {
            document.getElementById('login-password-error').style.display = 'block';
        }
        
    });
    
    registerForm.addEventListener('submit', function(e) {
        
        const firstName = document.getElementById('register-first-name').value;
        const lastName = document.getElementById('register-last-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const terms = document.getElementById('terms').checked;
        
        // Reset validation errors
        document.querySelectorAll('.validation-error').forEach(error => {
            error.style.display = 'none';
        });
        
        // First name validation
        if (firstName.trim() === '') {
            document.getElementById('first-name-error').style.display = 'block';
        }
        
        // Last name validation
        if (lastName.trim() === '') {
            document.getElementById('last-name-error').style.display = 'block';
        }
        
        // Email validation
        if (!validateEmail(email)) {
            document.getElementById('email-error').style.display = 'block';
        }
        
        // Password validation
        if (password.length < 8) {
            document.getElementById('password-error').style.display = 'block';
        }
        
        // Confirm password validation
        if (password !== confirmPassword) {
            document.getElementById('confirm-password-error').style.display = 'block';
        }
        
        // Terms validation
        if (!terms) {
            document.getElementById('terms-error').style.display = 'block';
        }
    });
    
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
    }
    
});