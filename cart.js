// Shopping Cart Script

document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    updateCartCount();
    initializeLanguage();
    setupCartEventListeners();
});

function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const cartContent = document.getElementById('cartContent');
    const currentLang = localStorage.getItem('language') || 'en';
    
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3 data-i18n="empty_cart">Your cart is empty</h3>
                <p>Start shopping to add items to your cart</p>
                <a href="index.html" class="btn-primary" style="margin-top: 1rem;" data-i18n="continue_shopping">Continue Shopping</a>
            </div>
        `;
        return;
    }
    
    let subtotal = 0;
    let cartHTML = '<div class="cart-items">';
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            
            cartHTML += `
                <div class="cart-item" data-product-id="${item.id}">
                    <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${product[`name_${currentLang}`] || product.name}</h3>
                        <p class="cart-item-price">RM ${product.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <div class="cart-item-subtotal">
                        RM ${itemTotal.toFixed(2)}
                    </div>
                    <i class="fas fa-trash remove-item" onclick="removeFromCart(${item.id})"></i>
                </div>
            `;
        }
    });
    
    cartHTML += '</div>';
    
    // Add summary
    const shipping = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.06;
    const total = subtotal + shipping + tax;
    
    cartHTML += `
        <div class="cart-summary">
            <h3 data-i18n="order_summary">Order Summary</h3>
            <div class="summary-row">
                <span data-i18n="subtotal">Subtotal</span>
                <span>RM ${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span data-i18n="shipping">Shipping</span>
                <span>RM ${shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span data-i18n="tax">Tax (6%)</span>
                <span>RM ${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row summary-total">
                <span data-i18n="total">Total</span>
                <span>RM ${total.toFixed(2)}</span>
            </div>
            <button class="btn-checkout" onclick="checkoutWithToyibPay()">
                <i class="fas fa-lock"></i> Checkout with Toyib Pay
            </button>
        </div>
    `;
    
    cartContent.innerHTML = cartHTML;
}

function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartItems();
        updateCartCount();
        logSystemEvent(`Cart updated: Product ${productId}, quantity change: ${change}`, 'INFO');
    }
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartItems();
    updateCartCount();
    showNotification('Item removed from cart', 'success');
}

async function checkoutWithToyibPay() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showNotification('Please login to checkout', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Calculate total
    const products = JSON.parse(localStorage.getItem('products')) || [];
    let total = 0;
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            total += product.price * item.quantity;
        }
    });
    
    // Toyib Pay payment data
    const paymentData = {
        merchantId: CONFIG.TOYIB_PAY.merchantId,
        amount: total,
        currency: 'MYR',
        description: 'Global Marketplace Order',
        customerEmail: currentUser.email,
        customerName: currentUser.name,
        callbackUrl: window.location.origin + '/payment-callback.html',
        orderId: 'ORDER_' + Date.now()
    };
    
    try {
        // Simulate Toyib Pay API call
        showNotification('Redirecting to Toyib Pay...', 'info');
        
        // In production, this would be a real API call
        console.log('Toyib Pay Payment:', paymentData);
        
        // Save order to Google Sheets
        saveOrderToGCS({
            ...paymentData,
            cart: cart,
            status: 'pending',
            timestamp: new Date().toISOString()
        });
        
        // For demo purposes, simulate successful payment
        setTimeout(() => {
            showNotification('Payment successful! Thank you for your order.', 'success');
            localStorage.setItem('cart', JSON.stringify([]));
            loadCartItems();
            updateCartCount();
            logSystemEvent(`Order placed: ${paymentData.orderId}, Amount: RM${total}`, 'INFO');
        }, 3000);
        
    } catch (error) {
        showNotification('Payment failed. Please try again.', 'error');
        logSystemEvent(`Payment failed: ${error.message}`, 'ERROR');
    }
}

async function saveOrderToGCS(orderData) {
    try {
        await fetch(CONFIG.GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'createOrder',
                table: CONFIG.TABLES.ORDERS,
                data: orderData
            })
        });
    } catch (error) {
        console.log('Order saved locally');
    }
}

function setupCartEventListeners() {
    // Add any cart-specific event listeners here
}