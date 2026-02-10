// Authentication Module for GlobalMart

// Configuration
const AUTH_CONFIG = {
    SHEET_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MIN_PASSWORD_LENGTH: 6,
    PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
};

// Initialize authentication module
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    // Check if we're on an auth page
    const isAuthPage = window.location.pathname.includes('login.html') || 
                      window.location.pathname.includes('register.html');
    
    if (isAuthPage) {
        initAuthForms();
        initPasswordToggles();
        initAuthModals();
        checkExistingSession();
    }
}

// Initialize authentication forms
function initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    if (loginForm) {
        initLoginForm(loginForm);
    }
    
    if (registerForm) {
        initRegisterForm(registerForm);
    }
    
    if (resetPasswordForm) {
        initResetPasswordForm(resetPasswordForm);
    }
    
    if (adminLoginForm) {
        initAdminLoginForm(adminLoginForm);
    }
}

// Initialize login form
function initLoginForm(form) {
    const emailInput = form.querySelector('#loginEmail');
    const passwordInput = form.querySelector('#loginPassword');
    const rememberMe = form.querySelector('#rememberMe');
    
    // Real-time validation
    if (emailInput) {
        emailInput.addEventListener('blur', validateEmailField);
        emailInput.addEventListener('input', clearFieldError);
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', clearFieldError);
    }
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateLoginForm()) {
            return;
        }
        
        await handleLogin({
            email: emailInput.value.trim(),
            password: passwordInput.value,
            remember: rememberMe ? rememberMe.checked : false
        });
    });
}

// Initialize registration form
function initRegisterForm(form) {
    const fullNameInput = form.querySelector('#fullName');
    const emailInput = form.querySelector('#email');
    const phoneInput = form.querySelector('#phone');
    const passwordInput = form.querySelector('#password');
    const confirmPasswordInput = form.querySelector('#confirmPassword');
    const termsCheckbox = form.querySelector('#terms');
    
    // Real-time validation
    [fullNameInput, emailInput, phoneInput, passwordInput, confirmPasswordInput].forEach(input => {
        if (input) {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        }
    });
    
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateRegistrationForm()) {
            return;
        }
        
        await handleRegistration({
            fullName: fullNameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            password: passwordInput.value,
            termsAccepted: termsCheckbox.checked
        });
    });
}

// Initialize password toggle functionality
function initPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });
}

// Initialize authentication modals
function initAuthModals() {
    // Forgot password modal
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    
    if (forgotPasswordLink && forgotPasswordModal) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showModal(forgotPasswordModal);
        });
    }
    
    // Admin login modal
    const adminLoginLink = document.getElementById('adminLoginLink');
    const adminLoginModal = document.getElementById('adminLoginModal');
    
    if (adminLoginLink && adminLoginModal) {
        adminLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showModal(adminLoginModal);
        });
    }
    
    // Close modals when clicking close button or outside
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal);
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(this);
            }
        });
    });
}

// Form validation
function validateLoginForm() {
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    let isValid = true;
    
    // Validate email
    if (!validateEmail(email.value.trim())) {
        showFieldError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate password
    if (!password.value.trim()) {
        showFieldError(password, 'Please enter your password');
        isValid = false;
    } else if (password.value.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) {
        showFieldError(password, `Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters long`);
        isValid = false;
    }
    
    return isValid;
}

function validateRegistrationForm() {
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const terms = document.getElementById('terms');
    let isValid = true;
    
    // Validate full name
    if (!fullName.value.trim()) {
        showFieldError(fullName, 'Please enter your full name');
        isValid = false;
    }
    
    // Validate email
    if (!validateEmail(email.value.trim())) {
        showFieldError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone number
    if (!validatePhoneNumber(phone.value.trim())) {
        showFieldError(phone, 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Validate password
    if (!password.value.trim()) {
        showFieldError(password, 'Please enter a password');
        isValid = false;
    } else if (password.value.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) {
        showFieldError(password, `Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters long`);
        isValid = false;
    } else if (!AUTH_CONFIG.PASSWORD_REGEX.test(password.value)) {
        showFieldError(password, 'Password must contain uppercase, lowercase, number, and special character');
        isValid = false;
    }
    
    // Validate password confirmation
    if (password.value !== confirmPassword.value) {
        showFieldError(confirmPassword, 'Passwords do not match');
        isValid = false;
    }
    
    // Validate terms acceptance
    if (!terms.checked) {
        showFieldError(terms, 'You must accept the terms and conditions');
        isValid = false;
    }
    
    return isValid;
}

// Field validation helpers
function validateEmailField() {
    const field = this;
    if (!validateEmail(field.value.trim())) {
        showFieldError(field, 'Please enter a valid email address');
    } else {
        clearFieldError.call(field);
    }
}

function validateField() {
    const field = this;
    const value = field.value.trim();
    
    switch (field.type) {
        case 'text':
            if (field.id === 'fullName' && !value) {
                showFieldError(field, 'Please enter your full name');
            }
            break;
        case 'email':
            if (!validateEmail(value)) {
                showFieldError(field, 'Please enter a valid email address');
            }
            break;
        case 'tel':
            if (!validatePhoneNumber(value)) {
                showFieldError(field, 'Please enter a valid phone number');
            }
            break;
        case 'password':
            if (field.id === 'password') {
                if (!value) {
                    showFieldError(field, 'Please enter a password');
                } else if (value.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) {
                    showFieldError(field, `Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters long`);
                } else if (!AUTH_CONFIG.PASSWORD_REGEX.test(value)) {
                    showFieldError(field, 'Password must contain uppercase, lowercase, number, and special character');
                }
            } else if (field.id === 'confirmPassword') {
                const password = document.getElementById('password');
                if (value !== password.value) {
                    showFieldError(field, 'Passwords do not match');
                }
            }
            break;
    }
}

function clearFieldError() {
    const field = this;
    const parent = field.closest('.form-group') || field.parentElement;
    
    // Remove error class
    if (field.classList.contains('error')) {
        field.classList.remove('error');
    }
    
    // Remove error message
    const errorMessage = parent.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    
    // Remove validation icon
    const validationIcon = parent.querySelector('.validation-icon');
    if (validationIcon) {
        validationIcon.remove();
    }
}

function showFieldError(field, message) {
    const parent = field.closest('.form-group') || field.parentElement;
    
    // Add error class
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = parent.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorMessage = document.createElement('span');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    parent.appendChild(errorMessage);
    
    // Add validation icon
    const validationIcon = document.createElement('span');
    validationIcon.className = 'validation-icon invalid';
    validationIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    if (field.parentElement.classList.contains('input-with-icon')) {
        field.parentElement.appendChild(validationIcon);
    } else {
        parent.appendChild(validationIcon);
    }
}

// Validation helpers
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhoneNumber(phone) {
    // Basic phone validation - adjust for your needs
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Password strength indicator
function updatePasswordStrength() {
    const password = this.value;
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let text = 'Very Weak';
    
    // Check password strength
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Update UI
    switch (strength) {
        case 0:
        case 1:
            strengthBar.className = 'strength-fill weak';
            text = 'Very Weak';
            break;
        case 2:
            strengthBar.className = 'strength-fill weak';
            text = 'Weak';
            break;
        case 3:
            strengthBar.className = 'strength-fill medium';
            text = 'Medium';
            break;
        case 4:
            strengthBar.className = 'strength-fill strong';
            text = 'Strong';
            break;
        case 5:
            strengthBar.className = 'strength-fill strong';
            text = 'Very Strong';
            break;
    }
    
    strengthBar.style.width = `${(strength / 5) * 100}%`;
    strengthText.textContent = text;
}

// Authentication handlers
async function handleLogin(credentials) {
    const loginBtn = document.getElementById('loginBtn');
    const loginSpinner = document.getElementById('loginSpinner');
    
    // Show loading state
    setButtonLoading(loginBtn, loginSpinner, true);
    
    try {
        // Log login attempt
        await logToSheet('LOGIN_ATTEMPT', `Login attempt for: ${credentials.email}`);
        
        // Validate credentials
        const user = await authenticateUser(credentials);
        
        if (user) {
            // Create user session
            const sessionData = {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                role: user.role || 'member',
                lastLogin: new Date().toISOString(),
                sessionExpires: Date.now() + AUTH_CONFIG.SESSION_TIMEOUT
            };
            
            // Save session based on remember preference
            if (credentials.remember) {
                localStorage.setItem('user', JSON.stringify(sessionData));
            } else {
                sessionStorage.setItem('user', JSON.stringify(sessionData));
            }
            
            // Log successful login
            await logToSheet('LOGIN_SUCCESS', `User logged in: ${credentials.email}`, user.id);
            
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect based on role
            setTimeout(() => {
                const redirectTo = getRedirectUrl();
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = redirectTo || 'index.html';
                }
            }, 1500);
            
        } else {
            throw new Error('Invalid credentials');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Log failed login attempt
        await logToSheet('LOGIN_FAILED', `Failed login attempt for: ${credentials.email}`);
        
        showNotification(error.message || 'Invalid email or password', 'error');
        
        // Reset button state
        setButtonLoading(loginBtn, loginSpinner, false);
    }
}

async function handleRegistration(userData) {
    const registerBtn = document.getElementById('registerBtn');
    const registerSpinner = document.getElementById('registerSpinner');
    
    // Show loading state
    setButtonLoading(registerBtn, registerSpinner, true);
    
    try {
        // Check if user already exists
        const existingUser = await checkUserExists(userData.email);
        
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        
        // Register user
        const registeredUser = await registerUser(userData);
        
        if (registeredUser) {
            // Auto-login after registration
            const sessionData = {
                id: registeredUser.id,
                email: registeredUser.email,
                fullName: registeredUser.fullName,
                phone: registeredUser.phone,
                role: 'member',
                lastLogin: new Date().toISOString(),
                sessionExpires: Date.now() + AUTH_CONFIG.SESSION_TIMEOUT
            };
            
            localStorage.setItem('user', JSON.stringify(sessionData));
            
            // Show success message
            showNotification('Registration successful! Welcome to GlobalMart.', 'success');
            
            // Log registration
            await logToSheet('REGISTRATION_SUCCESS', `New user registered: ${userData.email}`, registeredUser.id);
            
            // Show success modal
            const successModal = document.getElementById('successModal');
            if (successModal) {
                showModal(successModal);
                
                // Handle continue button
                const continueBtn = document.getElementById('continueShopping');
                if (continueBtn) {
                    continueBtn.addEventListener('click', function() {
                        window.location.href = 'index.html';
                    });
                }
                
                // Auto redirect after 5 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 5000);
            }
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // Log registration error
        await logToSheet('REGISTRATION_ERROR', error.toString());
        
        showNotification(error.message || 'Registration failed. Please try again.', 'error');
        
        // Reset button state
        setButtonLoading(registerBtn, registerSpinner, false);
    }
}

// Authentication API calls
async function authenticateUser(credentials) {
    try {
        // For demo purposes, simulate API call
        // In production, this would be a real API call
        
        // Check against local storage first (for demo)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => 
            u.email === credentials.email && 
            u.password === btoa(credentials.password) // Simple base64 encoding for demo
        );
        
        if (user) {
            return user;
        }
        
        // Fallback to Google Sheets
        const response = await fetch(`${AUTH_CONFIG.SHEET_URL}/authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        
        if (response.ok) {
            return await response.json();
        }
        
        throw new Error('Invalid credentials');
        
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}

async function checkUserExists(email) {
    try {
        // Check local storage (for demo)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.email === email)) {
            return true;
        }
        
        // Check Google Sheets
        const response = await fetch(`${AUTH_CONFIG.SHEET_URL}/checkUser?email=${encodeURIComponent(email)}`);
        if (response.ok) {
            const result = await response.json();
            return result.exists;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error checking user:', error);
        return false;
    }
}

async function registerUser(userData) {
    try {
        // Prepare user data
        const userToRegister = {
            id: generateUserId(),
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            password: btoa(userData.password), // Simple encoding for demo
            role: 'member',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            emailVerified: false,
            lastLogin: null
        };
        
        // Save to local storage (for demo)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(userToRegister);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Save to Google Sheets
        const response = await fetch(`${AUTH_CONFIG.SHEET_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userToRegister)
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                return userToRegister;
            }
        }
        
        throw new Error('Registration failed');
        
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Helper functions
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function setButtonLoading(button, spinner, isLoading) {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        if (spinner) {
            spinner.style.display = 'inline-block';
        }
        button.innerHTML = button.innerHTML.replace('Login', 'Logging in...')
                                   .replace('Create Account', 'Creating Account...');
    } else {
        button.disabled = false;
        if (spinner) {
            spinner.style.display = 'none';
        }
        button.innerHTML = button.innerHTML.replace('Logging in...', 'Login')
                                   .replace('Creating Account...', 'Create Account');
    }
}

function showModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function checkExistingSession() {
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
    
    if (user) {
        // Check if session is expired
        if (user.sessionExpires && Date.now() > user.sessionExpires) {
            // Session expired, clear it
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            return;
        }
        
        // User is already logged in, show message
        showNotification('You are already logged in. Redirecting...', 'info');
        
        // Redirect based on role
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 2000);
    }
}

function getRedirectUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect');
}

// Initialize reset password form
function initResetPasswordForm(form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const emailInput = form.querySelector('#resetEmail');
        const email = emailInput.value.trim();
        
        if (!validateEmail(email)) {
            showFieldError(emailInput, 'Please enter a valid email address');
            return;
        }
        
        await handleResetPassword(email);
    });
}

async function handleResetPassword(email) {
    try {
        // Simulate sending reset email
        // In production, this would be a real API call
        
        showNotification('Password reset link has been sent to your email!', 'success');
        
        // Log the action
        await logToSheet('PASSWORD_RESET_REQUEST', `Password reset requested for: ${email}`);
        
        // Close modal
        const modal = document.getElementById('forgotPasswordModal');
        hideModal(modal);
        
        // Reset form
        const form = document.getElementById('resetPasswordForm');
        if (form) {
            form.reset();
        }
        
    } catch (error) {
        console.error('Reset password error:', error);
        showNotification('Error sending reset email. Please try again.', 'error');
    }
}

// Initialize admin login form
function initAdminLoginForm(form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = form.querySelector('#adminEmail').value.trim();
        const password = form.querySelector('#adminPassword').value;
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid admin email', 'error');
            return;
        }
        
        if (!password) {
            showNotification('Please enter admin password', 'error');
            return;
        }
        
        await handleAdminLogin(email, password);
    });
}

async function handleAdminLogin(email, password) {
    try {
        // For demo purposes, use hardcoded admin credentials
        // In production, this would be a real API call
        
        const adminCredentials = {
            email: 'admin@globalmart.com',
            password: 'Admin@123' // In production, use proper hashing
        };
        
        if (email === adminCredentials.email && password === adminCredentials.password) {
            // Create admin session
            const sessionData = {
                id: 'admin001',
                email: email,
                fullName: 'GlobalMart Admin',
                role: 'admin',
                lastLogin: new Date().toISOString(),
                sessionExpires: Date.now() + AUTH_CONFIG.SESSION_TIMEOUT
            };
            
            localStorage.setItem('user', JSON.stringify(sessionData));
            
            // Show success message
            showNotification('Admin login successful! Redirecting...', 'success');
            
            // Log admin login
            await logToSheet('ADMIN_LOGIN', `Admin logged in: ${email}`, 'admin001');
            
            // Redirect to admin page
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
            
        } else {
            throw new Error('Invalid admin credentials');
        }
        
    } catch (error) {
        console.error('Admin login error:', error);
        showNotification('Invalid admin credentials', 'error');
    }
}

// Logging function (shared with main.js)
async function logToSheet(action, message, userId = 'guest') {
    try {
        const logData = {
            action: action,
            message: message,
            userId: userId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            page: window.location.pathname
        };
        
        const response = await fetch(AUTH_CONFIG.SHEET_URL + '/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logData)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error logging to sheet:', error);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        validatePhoneNumber,
        showFieldError,
        clearFieldError
    };
}
