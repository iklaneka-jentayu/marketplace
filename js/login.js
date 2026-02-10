// Login Page Specific JavaScript

// Initialize login page
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
});

function initializeLoginPage() {
    // Check if we're on the login page
    if (!window.location.pathname.includes('login.html')) {
        return;
    }
    
    // Initialize login form (handled by auth.js)
    
    // Add custom event listeners for login page
    addLoginPageEventListeners();
    
    // Check for redirect parameter
    checkRedirectParameter();
    
    // Add social login handlers
    initSocialLogin();
    
    // Add guest checkout option
    addGuestCheckoutOption();
}

function addLoginPageEventListeners() {
    // Add animation to form inputs
    const formInputs = document.querySelectorAll('.auth-form input');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.dispatchEvent(new Event('submit'));
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        }
    });
    
    // Add visual feedback for form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function() {
            // Add submission animation
            this.classList.add('submitting');
            
            // Remove animation class after submission
            setTimeout(() => {
                this.classList.remove('submitting');
            }, 1500);
        });
    }
}

function checkRedirectParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect');
    
    if (redirectTo) {
        // Store redirect destination for after login
        sessionStorage.setItem('loginRedirect', redirectTo);
        
        // Show message if needed
        const authHeader = document.querySelector('.auth-header p');
        if (authHeader && redirectTo === 'checkout') {
            authHeader.textContent += ' You need to login to proceed with checkout.';
        }
    }
}

function initSocialLogin() {
    const socialButtons = document.querySelectorAll('.social-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const provider = this.title.toLowerCase();
            
            // Show loading state
            const originalContent = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            this.style.pointerEvents = 'none';
            
            // Simulate social login (replace with real OAuth in production)
            setTimeout(() => {
                // Reset button
                this.innerHTML = originalContent;
                this.style.pointerEvents = 'auto';
                
                // Show message
                showNotification(`${provider} login is not implemented in this demo`, 'info');
                
                // Log social login attempt
                logToSheet('SOCIAL_LOGIN_ATTEMPT', `Attempted ${provider} login`);
            }, 1000);
        });
    });
}

function addGuestCheckoutOption() {
    // Check if we're redirecting to checkout
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect');
    
    if (redirectTo === 'checkout') {
        // Add guest checkout option
        const authFooter = document.querySelector('.auth-footer');
        if (authFooter) {
            const guestCheckout = document.createElement('div');
            guestCheckout.className = 'guest-checkout mt-4';
            guestCheckout.innerHTML = `
                <p class="text-center text-sm text-gray-600 mb-2">Or continue as guest</p>
                <a href="checkout.html?guest=true" class="btn btn-outline btn-block">
                    <i class="fas fa-user-clock"></i> Guest Checkout
                </a>
            `;
            authFooter.parentNode.insertBefore(guestCheckout, authFooter);
        }
    }
}

// Enhanced form validation for login page
function validateLoginFormEnhanced() {
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    let isValid = true;
    
    // Enhanced email validation
    if (!email.value.trim()) {
        showEnhancedFieldError(email, 'Email is required');
        isValid = false;
    } else if (!validateEmail(email.value.trim())) {
        showEnhancedFieldError(email, 'Please enter a valid email address');
        isValid = false;
    } else {
        showEnhancedFieldSuccess(email);
    }
    
    // Enhanced password validation
    if (!password.value.trim()) {
        showEnhancedFieldError(password, 'Password is required');
        isValid = false;
    } else if (password.value.length < 6) {
        showEnhancedFieldError(password, 'Password must be at least 6 characters');
        isValid = false;
    } else {
        showEnhancedFieldSuccess(password);
    }
    
    return isValid;
}

function showEnhancedFieldError(field, message) {
    const parent = field.closest('.form-group');
    
    // Add error class
    field.classList.add('error');
    field.classList.remove('success');
    
    // Add or update error message
    let errorElement = parent.querySelector('.enhanced-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'enhanced-error text-sm text-red-600 mt-1';
        parent.appendChild(errorElement);
    }
    errorElement.textContent = message;
    
    // Add error icon
    let errorIcon = parent.querySelector('.error-icon');
    if (!errorIcon) {
        errorIcon = document.createElement('span');
        errorIcon.className = 'error-icon absolute right-3 top-1/2 transform -translate-y-1/2';
        errorIcon.innerHTML = '<i class="fas fa-exclamation-circle text-red-500"></i>';
        
        const inputContainer = field.closest('.input-with-icon');
        if (inputContainer) {
            inputContainer.appendChild(errorIcon);
        }
    }
    
    // Remove success icon if exists
    const successIcon = parent.querySelector('.success-icon');
    if (successIcon) {
        successIcon.remove();
    }
}

function showEnhancedFieldSuccess(field) {
    const parent = field.closest('.form-group');
    
    // Add success class
    field.classList.add('success');
    field.classList.remove('error');
    
    // Remove error message
    const errorElement = parent.querySelector('.enhanced-error');
    if (errorElement) {
        errorElement.remove();
    }
    
    // Remove error icon
    const errorIcon = parent.querySelector('.error-icon');
    if (errorIcon) {
        errorIcon.remove();
    }
    
    // Add success icon
    let successIcon = parent.querySelector('.success-icon');
    if (!successIcon) {
        successIcon = document.createElement('span');
        successIcon.className = 'success-icon absolute right-3 top-1/2 transform -translate-y-1/2';
        successIcon.innerHTML = '<i class="fas fa-check-circle text-green-500"></i>';
        
        const inputContainer = field.closest('.input-with-icon');
        if (inputContainer) {
            inputContainer.appendChild(successIcon);
        }
    }
}

// Password strength indicator for registration page
function initPasswordStrengthIndicator() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;
    
    const strengthIndicator = document.createElement('div');
    strengthIndicator.className = 'password-strength-indicator mt-2';
    strengthIndicator.innerHTML = `
        <div class="strength-meter">
            <div class="strength-bar"></div>
        </div>
        <div class="strength-text text-xs mt-1"></div>
        <div class="requirements text-xs mt-2 space-y-1">
            <div class="requirement length"><i class="fas fa-circle text-gray-300 mr-1"></i> At least 6 characters</div>
            <div class="requirement uppercase"><i class="fas fa-circle text-gray-300 mr-1"></i> One uppercase letter</div>
            <div class="requirement lowercase"><i class="fas fa-circle text-gray-300 mr-1"></i> One lowercase letter</div>
            <div class="requirement number"><i class="fas fa-circle text-gray-300 mr-1"></i> One number</div>
            <div class="requirement special"><i class="fas fa-circle text-gray-300 mr-1"></i> One special character</div>
        </div>
    `;
    
    passwordInput.parentNode.appendChild(strengthIndicator);
    
    passwordInput.addEventListener('input', function() {
        updatePasswordStrengthIndicator(this.value);
    });
}

function updatePasswordStrengthIndicator(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    const requirements = document.querySelectorAll('.requirement');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let color = '#ef4444'; // red
    let text = 'Very Weak';
    
    // Check requirements
    const checks = {
        length: password.length >= 6,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
    
    // Update requirement icons
    requirements.forEach(req => {
        const type = req.classList[1];
        const icon = req.querySelector('i');
        
        if (checks[type]) {
            icon.className = 'fas fa-check-circle text-green-500 mr-1';
            strength++;
        } else {
            icon.className = 'fas fa-circle text-gray-300 mr-1';
        }
    });
    
    // Determine strength level
    switch (strength) {
        case 0:
        case 1:
            color = '#ef4444';
            text = 'Very Weak';
            break;
        case 2:
            color = '#f59e0b';
            text = 'Weak';
            break;
        case 3:
            color = '#fbbf24';
            text = 'Fair';
            break;
        case 4:
            color = '#10b981';
            text = 'Good';
            break;
        case 5:
            color = '#059669';
            text = 'Strong';
            break;
    }
    
    // Update UI
    strengthBar.style.width = `${(strength / 5) * 100}%`;
    strengthBar.style.backgroundColor = color;
    strengthBar.style.height = '4px';
    strengthBar.style.borderRadius = '2px';
    strengthBar.style.transition = 'all 0.3s ease';
    
    strengthText.textContent = text;
    strengthText.style.color = color;
    strengthText.style.fontWeight = '600';
}

// Session timeout warning
function initSessionTimeoutWarning() {
    let warningShown = false;
    
    function checkSessionTimeout() {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
        
        if (user && user.sessionExpires) {
            const timeLeft = user.sessionExpires - Date.now();
            const warningThreshold = 5 * 60 * 1000; // 5 minutes
            
            if (timeLeft <= warningThreshold && !warningShown) {
                showSessionWarning(timeLeft);
                warningShown = true;
            }
        }
    }
    
    function showSessionWarning(timeLeft) {
        const minutesLeft = Math.ceil(timeLeft / (60 * 1000));
        const warning = document.createElement('div');
        warning.className = 'session-warning fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm z-50';
        warning.innerHTML = `
            <div class="flex items-start">
                <i class="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3"></i>
                <div>
                    <h4 class="font-semibold text-yellow-800">Session Expiring Soon</h4>
                    <p class="text-yellow-700 text-sm mt-1">Your session will expire in ${minutesLeft} minutes. Do you want