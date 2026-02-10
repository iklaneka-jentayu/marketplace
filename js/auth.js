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
function initLogin
