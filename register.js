// Registration Page Script

document.addEventListener('DOMContentLoaded', function() {
    initializeRegistrationPage();
    updateCartCount();
    initializeLanguage();
});

function initializeRegistrationPage() {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters long', 'error');
            return;
        }
        
        registerUser(name, email, phone, password);
    });
}

function registerUser(name, email, phone, password) {
    // Get existing users
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if user already exists
    const userExists = users.some(u => u.email === email);
    
    if (userExists) {
        showNotification('Email already registered!', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateUserId(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        role: 'member',
        registeredDate: new Date().toISOString(),
        status: 'active'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Sync with Google Sheets
    syncUserToGCS(newUser);
    
    showNotification('Registration successful! Please login.', 'success');
    logSystemEvent(`New user registered: ${email}`, 'INFO');
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function checkPasswordStrength(password) {
    const strengthDiv = document.getElementById('passwordStrength');
    
    if (!password) {
        strengthDiv.className = 'password-strength';
        return;
    }
    
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    
    if (strength < 2) {
        strengthDiv.className = 'password-strength weak';
        strengthDiv.title = 'Weak password';
    } else if (strength < 4) {
        strengthDiv.className = 'password-strength medium';
        strengthDiv.title = 'Medium password';
    } else {
        strengthDiv.className = 'password-strength strong';
        strengthDiv.title = 'Strong password';
    }
}

async function syncUserToGCS(userData) {
    try {
        const response = await fetch(CONFIG.GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'createUser',
                table: CONFIG.TABLES.USERS,
                data: userData
            })
        });
    } catch (error) {
        console.log('User saved locally');
    }
}