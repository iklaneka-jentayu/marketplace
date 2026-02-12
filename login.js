// Login Page Script

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
    updateCartCount();
    initializeLanguage();
});

function initializeLoginPage() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        authenticateUser(email, password);
    });
}

function authenticateUser(email, password) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Set current user
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'member'
        }));
        
        logSystemEvent(`User logged in: ${email}`, 'INFO');
        showNotification('Login successful!', 'success');
        
        // Redirect based on role
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    } else {
        showNotification('Invalid email or password', 'error');
        logSystemEvent(`Failed login attempt: ${email}`, 'WARNING');
    }
}

// Google Sheets Authentication Check
async function checkAuthWithGCS(email, password) {
    try {
        const response = await fetch(`${CONFIG.GAS_URL}?action=auth&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Using local authentication');
        return null;
    }
}