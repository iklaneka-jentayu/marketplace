// Global Marketplace Main Script

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadCategories();
    loadProducts();
    setupEventListeners();
    updateCartCount();
    initializeLanguage();
    logSystemEvent('App initialized', 'INFO');
});

// Initialize Application
function initializeApp() {
    // Initialize local storage if not exists
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    if (!localStorage.getItem('products')) {
        initializeDefaultProducts();
    }
    if (!localStorage.getItem('categories')) {
        initializeDefaultCategories();
    }
}

// Initialize Default Categories
function initializeDefaultCategories() {
    const categories = [
        { id: 1, name: 'Electronics', icon: 'fa-mobile-alt', name_ms: 'Elektronik', name_zh: '电子产品' },
        { id: 2, name: 'Fashion', icon: 'fa-tshirt', name_ms: 'Fesyen', name_zh: '时尚' },
        { id: 3, name: 'Home & Living', icon: 'fa-home', name_ms: 'Rumah & Kehidupan', name_zh: '家居生活' },
        { id: 4, name: 'Sports', icon: 'fa-futbol', name_ms: 'Sukan', name_zh: '体育' },
        { id: 5, name: 'Books', icon: 'fa-book', name_ms: 'Buku', name_zh: '图书' },
        { id: 6, name: 'Toys', icon: 'fa-gamepad', name_ms: 'Mainan', name_zh: '玩具' }
    ];
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Initialize Default Products
function initializeDefaultProducts() {
    const products = [
        {
            id: 1,
            name: 'Smartphone X',
            name_ms: 'Telefon Pintar X',
            name_zh: '智能手机X',
            price: 2999,
            category: 'Electronics',
            image: 'https://via.placeholder.com/300x200',
            stock: 50
        },
        {
            id: 2,
            name: 'Designer Watch',
            name_ms: 'Jam Tangan Designer',
            name_zh: '设计师手表',
            price: 599,
            category: 'Fashion',
            image: 'https://via.placeholder.com/300x200',
            stock: 30
        },
        {
            id: 3,
            name: 'Coffee Maker',
            name_ms: 'Pembuat Kopi',
            name_zh: '咖啡机',
            price: 899,
            category: 'Home & Living',
            image: 'https://via.placeholder.com/300x200',
            stock: 25
        },
        {
            id: 4,
            name: 'Yoga Mat',
            name_ms: 'Tilam Yoga',
            name_zh: '瑜伽垫',
            price: 129,
            category: 'Sports',
            image: 'https://via.placeholder.com/300x200',
            stock: 100
        }
    ];
    localStorage.setItem('products', JSON.stringify(products));
}

// Load Categories
function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const categoryGrid = document.getElementById('categoryGrid');
    const currentLang = localStorage.getItem('language') || 'en';

    if (categoryGrid) {
        categoryGrid.innerHTML = categories.map(cat => `
            <div class="category-card" onclick="filterByCategory('${cat.name}')">
                <i class="fas ${cat.icon}"></i>
                <h3>${cat[`name_${currentLang}`] || cat.name}</h3>
            </div>
        `).join('');
    }
}

// Load Products
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productGrid = document.getElementById('productGrid');
    const currentLang = localStorage.getItem('language') || 'en';

    if (productGrid) {
        productGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product[`name_${currentLang}`] || product.name}</h3>
                    <p class="product-price">RM ${product.price.toFixed(2)}</p>
                    <button class="btn-add-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> ${getTranslation('add_to_cart')}
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Add to Cart
function addToCart(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product && product.stock > 0) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification('Product added to cart!', 'success');
        logSystemEvent(`Product ${productId} added to cart`, 'INFO');
    }
}

// Update Cart Count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Calculate Freight
function calculateFreight() {
    const type = document.getElementById('freightType').value;
    const weight = parseFloat(document.getElementById('freightWeight').value);
    
    if (!weight || weight <= 0) {
        showNotification('Please enter valid weight', 'error');
        return;
    }
    
    let cost = 0;
    if (type === 'local') {
        cost = CONFIG.FREIGHT_RATES.LOCAL.baseRate + (weight * CONFIG.FREIGHT_RATES.LOCAL.perKg);
    } else {
        cost = CONFIG.FREIGHT_RATES.INTERNATIONAL.baseRate + (weight * CONFIG.FREIGHT_RATES.INTERNATIONAL.perKg);
    }
    
    const result = document.getElementById('freightResult');
    const currentLang = localStorage.getItem('language') || 'en';
    const translation = TRANSLATIONS[currentLang];
    
    result.innerHTML = `
        <div class="freight-result">
            <h4>${translation.freight_cost}: RM ${cost.toFixed(2)}</h4>
            <p>${type === 'local' ? translation.local_delivery : translation.international_delivery}</p>
        </div>
    `;
    
    logSystemEvent(`Freight calculated: ${type}, ${weight}kg, RM${cost}`, 'INFO');
}

// Language Management
function initializeLanguage() {
    const savedLang = localStorage.getItem('language') || 'en';
    const languageSelect = document.getElementById('languageSelect');
    
    if (languageSelect) {
        languageSelect.value = savedLang;
        languageSelect.addEventListener('change', function(e) {
            const lang = e.target.value;
            localStorage.setItem('language', lang);
            updatePageLanguage(lang);
        });
    }
    
    updatePageLanguage(savedLang);
}

function updatePageLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            element.textContent = TRANSLATIONS[lang][key];
        }
    });
    
    // Reload dynamic content
    loadCategories();
    loadProducts();
}

function getTranslation(key) {
    const lang = localStorage.getItem('language') || 'en';
    return TRANSLATIONS[lang][key] || key;
}

// Search Products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.name_ms.toLowerCase().includes(searchTerm) ||
        p.name_zh.toLowerCase().includes(searchTerm)
    );
    
    displayProducts(filtered);
    logSystemEvent(`Search performed: ${searchTerm}`, 'INFO');
}

// Filter by Category
function filterByCategory(category) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const filtered = products.filter(p => p.category === category);
    displayProducts(filtered);
}

function displayProducts(products) {
    const productGrid = document.getElementById('productGrid');
    const currentLang = localStorage.getItem('language') || 'en';
    
    if (productGrid) {
        productGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product[`name_${currentLang}`] || product.name}</h3>
                    <p class="product-price">RM ${product.price.toFixed(2)}</p>
                    <button class="btn-add-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> ${getTranslation('add_to_cart')}
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 4px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Log System Event to Google Sheets
function logSystemEvent(message, level = 'INFO') {
    const logData = {
        action: 'log',
        timestamp: new Date().toISOString(),
        level: level,
        message: message,
        user: localStorage.getItem('currentUser') || 'anonymous',
        page: window.location.pathname,
        app: CONFIG.APP_NAME,
        version: CONFIG.VERSION
    };
    
    // Send to Google Sheets via fetch
    fetch(`${CONFIG.GAS_URL}?action=log`, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData)
    }).catch(error => console.log('Log saved to local storage:', error));
    
    // Also save to local storage as backup
    const logs = JSON.parse(localStorage.getItem('systemLogs')) || [];
    logs.push(logData);
    localStorage.setItem('systemLogs', JSON.stringify(logs.slice(-100))); // Keep last 100 logs
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Search button
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchProducts);
    }
    
    // Search input (enter key)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
    
    // Freight calculator
    const calculateBtn = document.getElementById('calculateFreight');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateFreight);
    }
}

// Initialize the application
logSystemEvent('Application started', 'INFO');