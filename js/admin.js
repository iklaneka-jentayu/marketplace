// Admin Panel JavaScript for GlobalMart

document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    checkAdminAuth();
    
    // Initialize admin navigation
    initAdminNavigation();
    
    // Load admin data
    loadAdminDashboard();
    loadProductsTable();
    loadOrdersTable();
    loadUsersTable();
    loadSystemLogs();
    
    // Initialize modals
    initModals();
    
    // Initialize freight settings
    initFreightSettings();
    
    // Initialize logout
    document.getElementById('logoutAdmin')?.addEventListener('click', handleAdminLogout);
});

function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
    
    if (!user || user.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
}

function initAdminNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav a');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get target section id
            const targetId = this.getAttribute('href').substring(1);
            
            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });
}

async function loadAdminDashboard() {
    try {
        // Fetch stats from Google Sheets
        const [orders, users, products] = await Promise.all([
            fetchDataFromSheet('orders'),
            fetchDataFromSheet('users'),
            fetchDataFromSheet('products')
        ]);
        
        // Calculate totals
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0);
        const totalUsers = users.filter(u => u.role === 'member').length;
        const totalProducts = products.length;
        
        // Update UI
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalRevenue').textContent = `RM ${totalRevenue.toFixed(2)}`;
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalProducts').textContent = totalProducts;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadProductsTable() {
    try {
        const products = await fetchDataFromSheet('products');
        const tableBody = document.querySelector('#productsTable tbody');
        
        tableBody.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>RM ${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.stock}</td>
                <td class="table-actions">
                    <button class="action-btn edit" data-id="${product.id}">Edit</button>
                    <button class="action-btn delete" data-id="${product.id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('#productsTable .edit').forEach(button => {
            button.addEventListener('click', function() {
                editProduct(parseInt(this.getAttribute('data-id')));
            });
        });
        
        document.querySelectorAll('#productsTable .delete').forEach(button => {
            button.addEventListener('click', function() {
                deleteProduct(parseInt(this.getAttribute('data-id')));
            });
        });
        
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadOrdersTable() {
    try {
        const orders = await fetchDataFromSheet('orders');
        const tableBody = document.querySelector('#ordersTable tbody');
        
        tableBody.innerHTML = '';
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.customerName}</td>
                <td>RM ${parseFloat(order.amount).toFixed(2)}</td>
                <td><span class="status-badge ${order.status}">${order.status}</span></td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td class="table-actions">
                    <button class="action-btn view" data-id="${order.id}">View</button>
                    <button class="action-btn edit" data-id="${order.id}">Update Status</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function loadUsersTable() {
    try {
        const users = await fetchDataFromSheet('users');
        const tableBody = document.querySelector('#usersTable tbody');
        
        tableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                <td class="table-actions">
                    <button class="action-btn edit" data-id="${user.id}">Edit</button>
                    <button class="action-btn delete" data-id="${user.id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadSystemLogs() {
    try {
        const logs = await fetchDataFromSheet('logs');
        const tableBody = document.querySelector('#logsTable tbody');
        
        tableBody.innerHTML = '';
        
        // Sort logs by timestamp (newest first)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        logs.slice(0, 50).forEach(log => { // Show only latest 50 logs
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td><span class="log-type ${log.action}">${log.action}</span></td>
                <td>${log.module || 'N/A'}</td>
                <td>${log.message}</td>
                <td>${log.userId || 'guest'}</td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

function initModals() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close-modal');
    const addProductBtn = document.getElementById('addProductBtn');
    
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            openProductModal();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Handle product form submission
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
}

function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (product) {
        // Edit mode
        modalTitle.textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDesc').value = product.description;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productImage').value = product.image || '';
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Product';
        form.reset();
        document.getElementById('productId').value = '';
    }
    
    modal.style.display = 'flex';
}

async function editProduct(productId) {
    try {
        const products = await fetchDataFromSheet('products');
        const product = products.find(p => p.id == productId);
        
        if (product) {
            openProductModal(product);
        }
    } catch (error) {
        console.error('Error editing product:', error);
        showNotification('Error loading product data', 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(SHEET_URL + '/deleteProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: productId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Product deleted successfully', 'success');
            loadProductsTable();
            loadAdminDashboard();
        } else {
            showNotification('Error deleting product', 'error');
        }
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product', 'error');
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productData = {
        id: document.getElementById('productId').value || Date.now().toString(),
        name: document.getElementById('productName').value,
        description: document.getElementById('productDesc').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value,
        updatedAt: new Date().toISOString()
    };
    
    try {
        const isEdit = !!document.getElementById('productId').value;
        const endpoint = isEdit ? '/updateProduct' : '/addProduct';
        
        const response = await fetch(SHEET_URL + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`Product ${isEdit ? 'updated' : 'added'} successfully`, 'success');
            
            // Close modal
            document.getElementById('productModal').style.display = 'none';
            
            // Refresh data
            loadProductsTable();
            loadAdminDashboard();
        } else {
            showNotification('Error saving product', 'error');
        }
        
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Error saving product', 'error');
    }
}

function initFreightSettings() {
    const saveLocalBtn = document.getElementById('saveLocalRates');
    const saveIntlBtn = document.getElementById('saveIntlRates');
    
    if (saveLocalBtn) {
        saveLocalBtn.addEventListener('click', saveFreightSettings);
    }
    
    if (saveIntlBtn) {
        saveIntlBtn.addEventListener('click', saveFreightSettings);
    }
    
    // Load existing settings
    loadFreightSettings();
}

async function loadFreightSettings() {
    try {
        const response = await fetch(SHEET_URL + '/getSettings?type=freight');
        const settings = await response.json();
        
        if (settings.local) {
            document.getElementById('localBaseRate').value = settings.local.baseRate || 5.00;
            document.getElementById('localRatePerKg').value = settings.local.ratePerKg || 2.00;
        }
        
        if (settings.international) {
            document.getElementById('intlBaseRate').value = settings.intl.baseRate || 15.00;
            document.getElementById('intlRatePerKg').value = settings.intl.ratePerKg || 5.00;
        }
        
    } catch (error) {
        console.error('Error loading freight settings:', error);
    }
}

async function saveFreightSettings(e) {
    const isLocal = e.target.id === 'saveLocalRates';
    
    const settings = {
        type: isLocal ? 'local' : 'international',
        baseRate: parseFloat(document.getElementById(isLocal ? 'localBaseRate' : 'intlBaseRate').value),
        ratePerKg: parseFloat(document.getElementById(isLocal ? 'localRatePerKg' : 'intlRatePerKg').value),
        updatedAt: new Date().toISOString()
    };
    
    try {
        const response = await fetch(SHEET_URL + '/saveFreightSettings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Freight settings saved successfully', 'success');
        } else {
            showNotification('Error saving settings', 'error');
        }
        
    } catch (error) {
        console.error('Error saving freight settings:', error);
        showNotification('Error saving settings', 'error');
    }
}

async function fetchDataFromSheet(sheetName) {
    try {
        const response = await fetch(`${SHEET_URL}/getData?sheet=${sheetName}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${sheetName}:`, error);
        return [];
    }
}

function handleAdminLogout() {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Add CSS for badges
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-badge.pending {
        background-color: #fef3c7;
        color: #92400e;
    }
    
    .status-badge.processing {
        background-color: #dbeafe;
        color: #1e40af;
    }
    
    .status-badge.completed {
        background-color: #d1fae5;
        color: #065f46;
    }
    
    .status-badge.cancelled {
        background-color: #fee2e2;
        color: #991b1b;
    }
    
    .role-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .role-badge.admin {
        background-color: #f3e8ff;
        color: #6b21a8;
    }
    
    .role-badge.member {
        background-color: #f0f9ff;
        color: #0369a1;
    }
    
    .log-type {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        background-color: #f3f4f6;
        color: #374151;
    }
`;
document.head.appendChild(style);
