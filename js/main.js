// Main JavaScript for GlobalMart E-commerce

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
    
    // Load products
    loadProducts();
    
    // Initialize cart
    updateCartCount();
    
    // Initialize freight calculator
    initFreightCalculator();
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.main-nav') && !event.target.closest('.mobile-menu-btn')) {
            mainNav.classList.remove('active');
        }
    });
});

// Product data
const products = [
    {
        id: 1,
        name: "Smartphone X10 Pro",
        description: "Latest smartphone with advanced camera features",
        price: 1299.99,
        category: "electronics",
        image: "https://via.placeholder.com/300x200?text=Smartphone",
        rating: 4.5
    },
    {
        id: 2,
        name: "Wireless Headphones",
        description: "Noise cancelling wireless headphones",
        price: 199.99,
        category: "electronics",
        image: "https://via.placeholder.com/300x200?text=Headphones",
        rating: 4.2
    },
    {
        id: 3,
        name: "Designer T-Shirt",
        description: "Premium cotton designer t-shirt",
        price: 49.99,
        category: "fashion",
        image: "https://via.placeholder.com/300x200?text=T-Shirt",
        rating: 4.7
    },
    {
        id: 4,
        name: "Coffee Maker",
        description: "Automatic coffee maker with timer",
        price: 89.99,
        category: "home",
        image: "https://via.placeholder.com/300x200?text=Coffee+Maker",
        rating: 4.3
    },
    {
        id: 5,
        name: "Running Shoes",
        description: "Lightweight running shoes for athletes",
        price: 129.99,
        category: "sports",
        image: "https://via.placeholder.com/300x200?text=Shoes",
        rating: 4.6
    },
    {
        id: 6,
        name: "Smart Watch",
        description: "Fitness tracking smart watch",
        price: 299.99,
        category: "electronics",
        image: "https://via.placeholder.com/300x200?text=Smart+Watch",
        rating: 4.4
    }
];

function loadProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                </div>
                <p class="product-price">RM ${product.price.toFixed(2)}</p>
                <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        `;
        
        productGrid.appendChild(productCard);
    });
    
    // Add event listeners to add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show notification
    showNotification('Product added to cart!');
    
    // Log to Google Sheets
    logToSheet('CART_ADD', `Product ${productId} added to cart`);
}

function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #10b981;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Freight Calculator
function initFreightCalculator() {
    const calculateBtn = document.getElementById('calculateFreight');
    if (!calculateBtn) return;
    
    calculateBtn.addEventListener('click', calculateFreight);
}

function calculateFreight() {
    const deliveryType = document.getElementById('deliveryType').value;
    const country = document.getElementById('countrySelect').value;
    const weight = parseFloat(document.getElementById('weight').value);
    
    if (!weight || weight <= 0) {
        showNotification('Please enter a valid weight');
        return;
    }
    
    let cost = 0;
    let currency = 'RM';
    
    if (deliveryType === 'local') {
        cost = 5 + (weight * 2); // Base RM5 + RM2 per kg
        currency = 'RM';
    } else {
        cost = 15 + (weight * 5); // Base USD15 + USD5 per kg
        currency = 'USD';
        
        // Add surcharge for certain countries
        if (country === 'US') cost += 10;
    }
    
    const resultDiv = document.getElementById('freightResult');
    resultDiv.innerHTML = `
        Estimated shipping cost: <strong>${currency} ${cost.toFixed(2)}</strong><br>
        Delivery type: ${deliveryType === 'local' ? 'Local' : 'International'}<br>
        Destination: ${country}<br>
        Weight: ${weight} kg
    `;
    
    // Log to Google Sheets
    logToSheet('FREIGHT_CALC', `Calculated freight: ${currency}${cost.toFixed(2)} for ${weight}kg to ${country}`);
}

// Google Sheets Integration
const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL'; // Replace with your web app URL

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
        
        const response = await fetch(SHEET_URL + '/log', {
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

// Initialize animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
