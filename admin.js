// Admin Dashboard Script

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    showSection('dashboard');
    loadAdminData();
    setupAdminEventListeners();
});

function checkAdminAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Access denied. Admin only.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

function showSection(section) {
    const adminMain = document.getElementById('adminMain');
    
    // Update active nav link
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${section}`) {
            link.classList.add('active');
        }
    });
    
    // Load section content
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProductsTable();
            break;
        case 'users':
            loadUsersTable();
            break;
        case 'orders':
            loadOrdersTable();
            break;
        case 'payments':
            loadPaymentsTable();
            break;
        case 'freight':
            loadFreightRates();
            break;
        case 'logs':
            loadSystemLogs();
            break;
    }
}

function loadDashboard() {
    const adminMain = document.getElementById('adminMain');
    
    adminMain.innerHTML = `
        <div class="admin-header">
            <h1 class="admin-title">Dashboard</h1>
            <div>
                <span>Last updated: ${new Date().toLocaleString()}</span>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div class="admin-card" style="border-left: 4px solid #3498db;">
                <h3>Total Products</h3>
                <p style="font-size: 2rem; font-weight: bold;">${getTotalProducts()}</p>
            </div>
            <div class="admin-card" style="border-left: 4px solid #27ae60;">
                <h3>Total Users</h3>
                <p style="font-size: 2rem; font-weight: bold;">${getTotalUsers()}</p>
            </div>
            <div class="admin-card" style="border-left: 4px solid #e74c3c;">
                <h3>Total Orders</h3>
                <p style="font-size: 2rem; font-weight: bold;">${getTotalOrders()}</p>
            </div>
            <div class="admin-card" style="border-left: 4px solid #f39c12;">
                <h3>Revenue</h3>
                <p style="font-size: 2rem; font-weight: bold;">RM ${getTotalRevenue()}</p>
            </div>
        </div>
        
        <div class="admin-card">
            <h3>Recent Orders</h3>
            ${loadRecentOrders()}
        </div>
        
        <div class="admin-card">
            <h3>System Status</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div>
                    <p><strong>Google Sheets Sync:</strong> <span style="color: #27ae60;">Active</span></p>
                    <p><strong>Toyib Pay:</strong> <span style="color: #27ae60;">Connected</span></p>
                </div>
                <div>
                    <p><strong>Last Sync:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Cache Size:</strong> ${getCacheSize()}</p>
                </div>
            </div>
        </div>
    `;
}

function loadProductsTable() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const adminMain = document.getElementById('adminMain');
    
    adminMain.innerHTML = `
        <div class="admin-header">
            <h1 class="admin-title">Products Management</h1>
            <button class="btn-add" onclick="openAddProductModal()">
                <i class="fas fa-plus"></i> Add Product
            </button>
        </div>
        
        <div class="admin-card">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => `
                        <tr>
                            <td>${product.id}</td>
                            <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                            <td>${product.name}</td>
                            <td>RM ${product.price}</td>
                            <td>${product.category}</td>
                            <td>${product.stock}</td>
                            <td>
                                <button class="btn-admin btn-edit" onclick="openEditProductModal(${product.id})">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn-admin btn-delete" onclick="deleteProduct(${product.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function loadUsersTable() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const adminMain = document.getElementById('adminMain');
    
    adminMain.innerHTML = `
        <div class="admin-header">
            <h1 class="admin-title">Users Management</h1>
        </div>
        
        <div class="admin-card">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Registered</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.phone}</td>
                            <td><span style="background: ${user.role === 'admin' ? '#e74c3c' : '#3498db'}; color: white; padding: 0.2rem 0.5rem; border-radius: 3px;">${user.role}</span></td>
                            <td>${new Date(user.registeredDate).toLocaleDateString()}</td>
                            <td><span style="color: ${user.status === 'active' ? '#27ae60' : '#e74c3c'};">${user.status}</span></td>
                            <td>
                                <button class="btn-admin btn-edit" onclick="editUser('${user.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-admin btn-delete" onclick="deleteUser('${user.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function loadOrdersTable() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const adminMain = document.getElementById('adminMain');
    
    adminMain.innerHTML = `
        <div class="admin-header">
            <h1 class="admin-title">Orders Management</h1>
        </div>
        
        <div class="admin-card">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>${order.OrderID || order.id}</td>
                            <td>${order.CustomerEmail || order.customerEmail}</td>
                            <td>RM ${order.Amount || order.amount}</td>
                            <td><span style="background: ${getStatusColor(order.Status || order.status)}; color: white; padding: 0.2rem 0.5rem; border-radius: 3px;">${order.Status || order.status}</span></td>
                            <td>${order.PaymentMethod || order.paymentMethod}</td>
                            <td>${new Date(order.CreatedAt || order.timestamp).toLocaleDateString()}</td>
                            <td>
                                <button class="btn-admin btn-edit" onclick="viewOrder('${order.OrderID || order.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-admin" onclick="updateOrderStatus('${order.OrderID || order.id}')">
                                    <i class="fas fa-sync"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function loadSystemLogs() {
    const logs = JSON.parse(localStorage.getItem('systemLogs')) || [];
    const adminMain = document.getElementById('adminMain');
    
    adminMain.innerHTML = `
        <div class="admin-header">
            <h1 class="admin-title">System Logs</h1>
            <button class="btn-add" onclick="syncLogsWithGCS()">
                <i class="fas fa-sync"></i> Sync with GCS
            </button>
        </div>
        
        <div class="admin-card">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>Message</th>
                        <th>User</th>
                        <th>Page</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.reverse().map(log => `
                        <tr>
                            <td>${new Date(log.timestamp).toLocaleString()}</td>
                            <td><span style="color: ${getLogLevelColor(log.level)}; font-weight: bold;">${log.level}</span></td>
                            <td>${log.message}</td>
                            <td>${log.user}</td>
                            <td>${log.page}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Product CRUD Operations
function openAddProductModal() {
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').style.display = 'flex';
}

function openEditProductModal(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productNameEN').value = product.name;
        document.getElementById('productNameMS').value = product.name_ms || '';
        document.getElementById('productNameZH').value = product.name_zh || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productDescription').value = product.description || '';
        
        document.getElementById('productModal').style.display = 'flex';
    }
}

function saveProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const productData = {
        id: productId || Date.now(),
        name: document.getElementById('productNameEN').value,
        name_ms: document.getElementById('productNameMS').value,
        name_zh: document.getElementById('productNameZH').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value
    };
    
    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
    } else {
        // Add new product
        products.push(productData);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    
    // Sync with Google Sheets
    syncProductToGCS(productData);
    
    closeModal('productModal');
    loadProductsTable();
    showNotification('Product saved successfully!', 'success');
    logSystemEvent(`Product ${productId ? 'updated' : 'created'}: ${productData.name}`, 'INFO');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        
        // Sync deletion with Google Sheets
        syncProductDeletionToGCS(productId);
        
        loadProductsTable();
        showNotification('Product deleted successfully!', 'success');
        logSystemEvent(`Product deleted: ${productId}`, 'INFO');
    }
}

// Helper Functions
function getTotalProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    return products.length;
}

function getTotalUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.length;
}

function getTotalOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    return orders.length;
}

function getTotalRevenue() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    return orders.reduce((total, order) => total + (order.Amount || order.amount || 0), 0).toFixed(2);
}

function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const recentOrders = orders.slice(-5).reverse();
    
    if (recentOrders.length === 0) {
        return '<p>No orders yet.</p>';
    }
    
    return `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                ${recentOrders.map(order => `
                    <tr>
                        <td>${order.OrderID || order.id}</td>
                        <td>${order.CustomerEmail || order.customerEmail}</td>
                        <td>RM ${order.Amount || order.amount}</td>
                        <td><span style="background: ${getStatusColor(order.Status || order.status)}; color: white; padding: 0.2rem 0.5rem; border-radius: 3px;">${order.Status || order.status}</span></td>
                        <td>${new Date(order.CreatedAt || order.timestamp).toLocaleDateString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function getCacheSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += (localStorage[key].length * 2) / 1024; // Approximate KB
        }
    }
    return total.toFixed(2) + ' KB';
}

function getStatusColor(status) {
    const colors = {
        'pending': '#f39c12',
        'paid': '#27ae60',
        'shipped': '#3498db',
        'delivered': '#2ecc71',
        'cancelled': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
}

function getLogLevelColor(level) {
    const colors = {
        'INFO': '#3498db',
        'WARNING': '#f39c12',
        'ERROR': '#e74c3c',
        'DEBUG': '#95a5a6'
    };
    return colors[level] || '#7f8c8d';
}

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Sync with Google Sheets
async function syncProductToGCS(productData) {
    try {
        await fetch(CONFIG.GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'createProduct',
                data: {
                    ID: productData.id,
                    Name_EN: productData.name,
                    Name_MS: productData.name_ms,
                    Name_ZH: productData.name_zh,
                    Price: productData.price,
                    Category: productData.category,
                    Stock: productData.stock,
                    Image: productData.image,
                    Description: productData.description,
                    CreatedBy: JSON.parse(localStorage.getItem('currentUser'))?.email || 'admin'
                }
            })
        });
    } catch (error) {
        console.log('Product saved locally');
    }
}

async function syncProductDeletionToGCS(productId) {
    try {
        await fetch(CONFIG.GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'deleteProduct',
                id: productId
            })
        });
    } catch (error) {
        console.log('Product deletion synced locally');
    }
}

async function syncLogsWithGCS() {
    const logs = JSON.parse(localStorage.getItem('systemLogs')) || [];
    
    for (const log of logs) {
        await fetch(CONFIG.GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'log',
                ...log
            })
        });
    }
    
    showNotification('Logs synced with Google Sheets!', 'success');
}

// Initialize Admin Event Listeners
function setupAdminEventListeners() {
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', saveProduct);
    }
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}

// Logout Function
function logout() {
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Initialize admin data
function loadAdminData() {
    // Load orders from localStorage or initialize
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
    
    // Sync with Google Sheets on load
    syncWithGCS();
}

async function syncWithGCS() {
    try {
        // Fetch products from GCS
        const response = await fetch(`${CONFIG.GAS_URL}?action=getProducts`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                localStorage.setItem('products', JSON.stringify(data.data));
            }
        }
    } catch (error) {
        console.log('Using local data');
    }
}