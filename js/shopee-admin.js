// Shopee Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeShopeeAdmin();
});

async function initializeShopeeAdmin() {
    try {
        // Initialize Shopee API
        await shopeeAPI.initialize();
        
        // Update connection status
        updateConnectionStatus();
        
        // Load imported products
        await loadImportedProducts();
        
        // Load sync logs
        await loadSyncLogs();
        
        // Load categories for filter
        await loadFilterCategories();
        
        // Add event listeners
        addShopeeEventListeners();
        
    } catch (error) {
        console.error('Error initializing Shopee admin:', error);
        showNotification('Error initializing Shopee integration', 'error');
    }
}

function addShopeeEventListeners() {
    // Connection buttons
    document.getElementById('connectShopeeBtn').addEventListener('click', connectShopee);
    document.getElementById('disconnectShopeeBtn').addEventListener('click', disconnectShopee);
    document.getElementById('refreshTokenBtn').addEventListener('click', refreshToken);
    
    // Import controls
    document.getElementById('importMethod').addEventListener('change', handleImportMethodChange);
    document.getElementById('importProductsBtn').addEventListener('click', previewProducts);
    document.getElementById('previewProductsBtn').addEventListener('click', previewProducts);
    document.getElementById('cancelImportBtn').addEventListener('click', cancelImport);
    
    // Preview controls
    document.getElementById('selectAllBtn').addEventListener('click', selectAllPreview);
    document.getElementById('deselectAllBtn').addEventListener('click', deselectAllPreview);
    document.getElementById('confirmImportBtn').addEventListener('click', confirmImport);
    document.getElementById('cancelPreviewBtn').addEventListener('click', cancelPreview);
    
    // Product list controls
    document.getElementById('refreshListBtn').addEventListener('click', loadImportedProducts);
    document.getElementById('syncAllBtn').addEventListener('click', syncAllProducts);
    document.getElementById('filterProducts').addEventListener('input', filterProducts);
    document.getElementById('filterCategory').addEventListener('change', filterProducts);
    document.getElementById('filterStatus').addEventListener('change', filterProducts);
    
    // Search
    document.getElementById('shopeeSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchShopeeProducts(this.value);
        }
    });
}

function updateConnectionStatus() {
    const isConnected = shopeeAPI.isConnected();
    const statusEl = document.getElementById('integrationStatus');
    const connectBtn = document.getElementById('connectShopeeBtn');
    const disconnectBtn = document.getElementById('disconnectShopeeBtn');
    const refreshBtn = document.getElementById('refreshTokenBtn');
    const importBtn = document.getElementById('importProductsBtn');
    
    if (isConnected) {
        statusEl.innerHTML = '<span class="status-badge connected">Connected</span>';
        connectBtn.style.display = 'none';
        disconnectBtn.style.display = 'inline-block';
        refreshBtn.style.display = 'inline-block';
        importBtn.disabled = false;
        previewProductsBtn.disabled = false;
        
        // Load shop info
        loadShopInfo();
    } else {
        statusEl.innerHTML = '<span class="status-badge disconnected">Not Connected</span>';
        connectBtn.style.display = 'inline-block';
        disconnectBtn.style.display = 'none';
        refreshBtn.style.display = 'none';
        importBtn.disabled = true;
        previewProductsBtn.disabled = true;
        document.getElementById('shopInfo').style.display = 'none';
    }
}

async function connectShopee() {
    try {
        const authUrl = shopeeAPI.getAuthorizationUrl();
        
        // Open authorization window
        const authWindow = window.open(authUrl, 'Shopee Authorization', 
            'width=600,height=700,scrollbars=yes');
        
        // Listen for callback
        window.addEventListener('message', async function(event) {
            if (event.data.type === 'shopee_auth') {
                const { code, shop_id } = event.data;
                
                showLoading('Authorizing Shopee account...');
                
                await shopeeAPI.handleAuthCallback(code, shop_id);
                
                hideLoading();
                updateConnectionStatus();
                showNotification('Shopee account connected successfully!', 'success');
            }
        });
        
    } catch (error) {
        console.error('Error connecting Shopee:', error);
        showNotification('Failed to connect Shopee account', 'error');
    }
}

async function disconnectShopee() {
    try {
        if (confirm('Are you sure you want to disconnect your Shopee account?')) {
            shopeeAPI.disconnect();
            updateConnectionStatus();
            showNotification('Shopee account disconnected', 'info');
        }
    } catch (error) {
        console.error('Error disconnecting:', error);
    }
}

async function refreshToken() {
    try {
        showLoading('Refreshing token...');
        await shopeeAPI.refreshAccessToken();
        hideLoading();
        showNotification('Token refreshed successfully', 'success');
    } catch (error) {
        hideLoading();
        showNotification('Failed to refresh token', 'error');
    }
}

async function loadShopInfo() {
    try {
        const shopInfo = await shopeeAPI.getShopInfo();
        
        document.getElementById('shopInfo').style.display = 'block';
        document.getElementById('shopName').textContent = shopInfo.shop_name || 'N/A';
        document.getElementById('shopId').textContent = shopInfo.shop_id || 'N/A';
        document.getElementById('shopCountry').textContent = shopInfo.country || 'N/A';
        document.getElementById('shopStatus').textContent = shopInfo.status || 'Active';
        document.getElementById('shopProducts').textContent = shopInfo.item_count || '0';
        document.getElementById('lastSync').textContent = localStorage.getItem('shopee_last_sync') || 'Never';
        
    } catch (error) {
        console.error('Error loading shop info:', error);
    }
}

async function loadCategories() {
    try {
        const categories = await shopeeAPI.getCategories();
        const select = document.getElementById('shopeeCategory');
        
        select.innerHTML = '<option value="">Select Category</option>';
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.category_id;
            option.textContent = cat.category_name;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function handleImportMethodChange() {
    const method = document.getElementById('importMethod').value;
    
    document.getElementById('categorySelector').style.display = 
        method === 'category' ? 'block' : 'none';
    document.getElementById('searchInput').style.display = 
        method === 'search' ? 'block' : 'none';
    
    if (method === 'category') {
        loadCategories();
    }
}

async function previewProducts() {
    try {
        if (!shopeeAPI.isConnected()) {
            showNotification('Please connect your Shopee account first', 'warning');
            return;
        }
        
        const method = document.getElementById('importMethod').value;
        
        showLoading('Fetching products from Shopee...');
        
        let result;
        
        switch (method) {
            case 'all':
                result = await shopeeAPI.fetchProducts({ limit: 50 });
                break;
            case 'category':
                const categoryId = document.getElementById('shopeeCategory').value;
                if (!categoryId) {
                    showNotification('Please select a category', 'warning');
                    return;
                }
                result = await shopeeAPI.fetchProducts({ category_id: categoryId, limit: 50 });
                break;
            case 'search':
                const keyword = document.getElementById('searchKeyword').value;
                if (!keyword) {
                    showNotification('Please enter a search keyword', 'warning');
                    return;
                }
                result = await shopeeAPI.searchProducts(keyword, { limit: 50 });
                break;
            case 'update':
                result = await shopeeAPI.fetchProducts({ 
                    updateFrom: getLastSyncTime(),
                    limit: 50 
                });
                break;
        }
        
        hideLoading();
        
        if (result.products && result.products.length > 0) {
            displayProductPreview(result.products);
            document.getElementById('previewPanel').style.display = 'block';
            document.getElementById('cancelImportBtn').style.display = 'inline-block';
        } else {
            showNotification('No products found', 'info');
        }
        
    } catch (error) {
        hideLoading();
        console.error('Error previewing products:', error);
        showNotification('Failed to fetch products', 'error');
    }
}

function displayProductPreview(products) {
    const container = document.getElementById('productPreview');
    const totalCount = document.getElementById('totalCount');
    
    container.innerHTML = '';
    totalCount.textContent = products.length;
    
    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-preview-card';
        card.innerHTML = `
            <div class="preview-checkbox">
                <input type="checkbox" class="product-select" data-index="${index}" checked>
            </div>
            <div class="preview-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'">
            </div>
            <div class="preview-details">
                <h4 class="preview-title">${product.name}</h4>
                <p class="preview-price">RM ${product.price.toFixed(2)}</p>
                <p class="preview-stock">Stock: ${product.stock}</p>
                <p class="preview-source">Shopee ID: ${product.shopee_id}</p>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Store products in session for import
    sessionStorage.setItem('shopee_preview_products', JSON.stringify(products));
    
    updateSelectedCount();
    
    // Add checkbox event listeners
    document.querySelectorAll('.product-select').forEach(cb => {
        cb.addEventListener('change', updateSelectedCount);
    });
}

function updateSelectedCount() {
    const selected = document.querySelectorAll('.product-select:checked').length;
    const total = document.querySelectorAll('.product-select').length;
    document.getElementById('selectedCount').textContent = selected;
}

function selectAllPreview() {
    document.querySelectorAll('.product-select').forEach(cb => {
        cb.checked = true;
    });
    updateSelectedCount();
}

function deselectAllPreview() {
    document.querySelectorAll('.product-select').forEach(cb => {
        cb.checked = false;
    });
    updateSelectedCount();
}

async function confirmImport() {
    try {
        const selected = [];
        document.querySelectorAll('.product-select:checked').forEach(cb => {
            const index = parseInt(cb.getAttribute('data-index'));
            const products = JSON.parse(sessionStorage.getItem('shopee_preview_products'));
            selected.push(products[index]);
        });
        
        if (selected.length === 0) {
            showNotification('Please select at least one product', 'warning');
            return;
        }
        
        const importOptions = {
            images: document.getElementById('importImages').checked,
            variants: document.getElementById('importVariants').checked,
            overwrite: document.getElementById('overwriteExisting').checked,
            autoSync: document.getElementById('autoSync').checked
        };
        
        document.getElementById('importProgress').style.display = 'block';
        document.getElementById('cancelImportBtn').style.display = 'none';
        document.getElementById('previewPanel').style.display = 'none';
        
        await importProducts(selected, importOptions);
        
    } catch (error) {
        console.error('Error confirming import:', error);
        showNotification('Failed to import products', 'error');
        document.getElementById('importProgress').style.display = 'none';
    }
}

async function importProducts(products, options) {
    let imported = 0;
    const total = products.length;
    
    for (const product of products) {
        try {
            // Update progress
            const percent = Math.round((imported / total) * 100);
            document.getElementById('progressFill').style.width = percent + '%';
            document.getElementById('progressStatus').textContent = 
                `Importing ${imported + 1} of ${total}...`;
            document.getElementById('progressPercent').textContent = percent + '%';
            
            // Check if product already exists
            const existing = await checkProductExists(product.shopee_id);
            
            if (existing && !options.overwrite) {
                imported++;
                continue;
            }
            
            // Save to Google Sheets
            await saveProductToSheet(product);
            
            imported++;
            
        } catch (error) {
            console.error('Error importing product:', error);
            // Log error but continue
            await logToSheet('SHOPEE_IMPORT_ERROR', `Failed to import product ${product.shopee_id}: ${error}`);
        }
    }
    
    // Hide progress
    document.getElementById('importProgress').style.display = 'none';
    
    // Clear preview
    sessionStorage.removeItem('shopee_preview_products');
    
    // Update last sync time
    const now = new Date().toISOString();
    localStorage.setItem('shopee_last_sync', now);
    document.getElementById('lastSync').textContent = new Date(now).toLocaleString();
    
    // Reload product list
    await loadImportedProducts();
    
    // Add sync log
    await addSyncLog('import', total, 'success', `Imported ${total} products`);
    
    showNotification(`Successfully imported ${imported} products!`, 'success');
}

async function saveProductToSheet(product) {
    try {
        const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
        
        const response = await fetch(SHEET_URL + '/saveShopeeProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message);
        }
        
        return result;
        
    } catch (error) {
        console.error('Error saving product:', error);
        throw error;
    }
}

async function checkProductExists(shopeeId) {
    try {
        const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
        
        const response = await fetch(`${SHEET_URL}/checkShopeeProduct?shopee_id=${shopeeId}`);
        const result = await response.json();
        
        return result.exists;
        
    } catch (error) {
        console.error('Error checking product:', error);
        return false;
    }
}

async function loadImportedProducts() {
    try {
        const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
        
        const response = await fetch(`${SHEET_URL}/getShopeeProducts`);
        const products = await response.json();
        
        displayImportedProducts(products);
        
    } catch (error) {
        console.error('Error loading imported products:', error);
    }
}

function displayImportedProducts(products) {
    const tbody = document.querySelector('#importedProductsTable tbody');
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    No imported products found. Connect your Shopee account and import products.
                </td>
            </tr>
        `;
        return;
    }
    
    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${product.image}" alt="${product.name}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            </td>
            <td>${product.name}</td>
            <td>${product.shopee_id}</td>
            <td>RM ${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>${product.category}</td>
            <td>
                <span class="status-badge ${product.stock > 0 ? 'active' : 'out_of_stock'}">
                    ${product.stock > 0 ? 'Active' : 'Out of Stock'}
                </span>
            </td>
            <td class="table-actions">
                <button class="action-btn view" onclick="viewProduct('${product.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn sync" onclick="syncProduct('${product.shopee_id}')">
                    <i class="fas fa-sync"></i>
                </button>
                <button class="action-btn delete" onclick="deleteImportedProduct('${product.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadFilterCategories() {
    try {
        const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
        
        const response = await fetch(`${SHEET_URL}/getShopeeCategories`);
        const categories = await response.json();
        
        const select = document.getElementById('filterCategory');
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading filter categories:', error);
    }
}

async function loadSyncLogs() {
    try {
        const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
        
        const response = await fetch(`${SHEET_URL}/getShopeeSyncLogs`);
        const logs = await response.json();
        
        const tbody = document.querySelector('#syncLogsTable tbody');
        tbody.innerHTML = '';
        
        if (logs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        No sync logs available
                    </td>
                </tr>
            `;
            return;
        }
        
        logs.slice(0, 10).forEach(log => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.action}</td>
                <td>${log.products}</td>
                <td>
                    <span class="status-badge ${log.status}">
                        ${log.status}
                    </span>
                </td>
                <td>${log.details}</td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (error) {
        console.error('Error loading sync logs:', error);
    }
}

async function addSyncLog(action, products, status, details) {
    try {
        const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
        
        const logData = {
            action: action,
            products: products,
            status: status,
            details: details,
            timestamp: new Date().toISOString()
        };
        
        await fetch(SHEET_URL + '/addShopeeSyncLog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logData)
        });
        
        // Reload logs
        await loadSyncLogs();
        
    } catch (error) {
        console.error('Error adding sync log:', error);
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('filterProducts').value.toLowerCase();
    const category = document.getElementById('filterCategory').value;
    const status = document.getElementById('filterStatus').value;
    
    const rows = document.querySelectorAll('#importedProductsTable tbody tr');
    
    rows.forEach(row => {
        let show = true;
        
        if (searchTerm) {
            const name = row.cells[1].textContent.toLowerCase();
            if (!name.includes(searchTerm)) show = false;
        }
        
        if (category && show) {
            const rowCategory = row.cells[5].textContent;
            if (rowCategory !== category) show = false;
        }
        
        if (status && show) {
            const rowStatus = row.cells[6].textContent.toLowerCase();
            if (!rowStatus.includes(status)) show = false;
        }
        
        row.style.display = show ? '' : 'none';
    });
}

async function syncAllProducts() {
    try {
        showLoading('Syncing all products...');
        
        const result = await shopeeAPI.fetchProducts({ limit: 100 });
        
        if (result.products && result.products.length > 0) {
            await importProducts(result.products, { overwrite: true });
        }
        
        hideLoading();
        showNotification('Sync completed successfully!', 'success');
        
    } catch (error) {
        hideLoading();
        console.error('Error syncing products:', error);
        showNotification('Failed to sync products', 'error');
    }
}

async function syncProduct(shopeeId) {
    try {
        showLoading('Syncing product...');
        
        const details = await shopeeAPI.getProductDetails(shopeeId);
        const product = shopeeAPI.formatProduct(details);
        
        await saveProductToSheet(product);
        
        hideLoading();
        showNotification('Product synced successfully!', 'success');
        
        // Reload product list
        await loadImportedProducts();
        
    } catch (error) {
        hideLoading();
        console.error('Error syncing product:', error);
        showNotification('Failed to sync product', 'error');
    }
}

async function deleteImportedProduct(id) {
    if (!confirm('Are you sure you want to delete this imported product?')) {
        return;
    }
    
    try {
        const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
        
        await fetch(SHEET_URL + '/deleteShopeeProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id })
        });
        
        showNotification('Product deleted successfully', 'success');
        await loadImportedProducts();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', 'error');
    }
}

function cancelImport() {
    if (confirm('Cancel import?')) {
        document.getElementById('previewPanel').style.display = 'none';
        document.getElementById('cancelImportBtn').style.display = 'none';
        sessionStorage.removeItem('shopee_preview_products');
    }
}

function cancelPreview() {
    document.getElementById('previewPanel').style.display = 'none';
    sessionStorage.removeItem('shopee_preview_products');
}

function getLastSyncTime() {
    const lastSync = localStorage.getItem('shopee_last_sync');
    if (lastSync) {
        const date = new Date(lastSync);
        return Math.floor(date.getTime() / 1000);
    }
    return null;
}

function showLoading(message = 'Loading...') {
    const loading = document.createElement('div');
    loading.id = 'shopeeLoading';
    loading.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
    loading.innerHTML = `
        <div class="bg-white rounded-lg p-6 flex flex-col items-center">
            <div class="loader w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p class="text-gray-700">${message}</p>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('shopeeLoading');
    if (loading) {
        loading.remove();
    }
}

function showNotification(message, type = 'info') {
    // Use existing notification system
    if (window.showNotification) {
        window.showNotification(message, type);
    } else {
        alert(message);
    }
}

async function logToSheet(action, message) {
    try {
        const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
        
        const logData = {
            action: action,
            message: message,
            userId: 'system',
            module: 'shopee',
            timestamp: new Date().toISOString()
        };
        
        await fetch(SHEET_URL + '/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logData)
        });
        
    } catch (error) {
        console.error('Error logging:', error);
    }
}

// Add CSS for shopee admin
const style = document.createElement('style');
style.textContent = `
    .integration-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .connection-status {
        padding: 20px;
        background-color: #f9fafb;
        border-radius: 8px;
        margin: 20px 0;
    }
    
    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 20px;
    }
    
    .info-item {
        padding: 10px;
        background-color: #f9fafb;
        border-radius: 6px;
    }
    
    .info-item label {
        display: block;
        font-size: 0.8rem;
        color: #6b7280;
        margin-bottom: 4px;
    }
    
    .info-item span {
        font-weight: 600;
        color: #374151;
    }
    
    .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .checkbox-group label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }
    
    .checkbox-group input[type="checkbox"] {
        width: 16px;
        height: 16px;
    }
    
    .import-progress {
        margin-top: 20px;
        padding: 20px;
        background-color: #f9fafb;
        border-radius: 8px;
    }
    
    .progress-bar {
        height: 8px;
        background-color: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 10px;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #10b981);
        transition: width 0.3s ease;
    }
    
    .progress-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        color: #374151;
    }
    
    .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    
    .preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
        margin: 20px 0;
        max-height: 500px;
        overflow-y: auto;
    }
    
    .product-preview-card {
        display: flex;
        gap: 10px;
        padding: 10px;
        background-color: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
    }
    
    .preview-checkbox {
        margin-right: 5px;
    }
    
    .preview-image {
        width: 60px;
        height: 60px;
        flex-shrink: 0;
    }
    
    .preview-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
    }
    
    .preview-details {
        flex: 1;
    }
    
    .preview-title {
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 5px;
        color: #374151;
    }
    
    .preview-price {
        font-size: 0.8rem;
        color: #3b82f6;
        font-weight: 600;
    }
    
    .preview-stock {
        font-size: 0.7rem;
        color: #6b7280;
    }
    
    .preview-source {
        font-size: 0.7rem;
        color: #9ca3af;
    }
    
    .preview-footer {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
    
    .filter-bar {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .filter-bar input,
    .filter-bar select {
        padding: 8px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font-size: 0.9rem;
        min-width: 200px;
    }
    
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .action-btn.sync {
        background-color: #8b5cf6;
        color: white;
    }
    
    .action-btn.sync:hover {
        background-color: #7c3aed;
    }
    
    .status-badge.connected {
        background-color: #d1fae5;
        color: #065f46;
    }
    
    .status-badge.disconnected {
        background-color: #fee2e2;
        color: #991b1b;
    }
    
    .status-badge.success {
        background-color: #d1fae5;
        color: #065f46;
    }
    
    .status-badge.failed {
        background-color: #fee2e2;
        color: #991b1b;
    }
`;
document.head.appendChild(style);