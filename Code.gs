// Google Apps Script for Global Marketplace

// Spreadsheet ID - Replace with your actual Spreadsheet ID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAMES = {
    PRODUCTS: 'Products',
    USERS: 'Users',
    ORDERS: 'Orders',
    CART: 'Cart',
    FREIGHT: 'Freight',
    PAYMENTS: 'Payments',
    LOGS: 'SystemLogs'
};

// Initialize spreadsheet on first run
function initializeSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Create Products sheet
    let sheet = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAMES.PRODUCTS);
        sheet.appendRow(['ID', 'Name_EN', 'Name_MS', 'Name_ZH', 'Price', 'Category', 'Stock', 'Image', 'Description', 'CreatedAt', 'UpdatedAt']);
    }
    
    // Create Users sheet
    sheet = ss.getSheetByName(SHEET_NAMES.USERS);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAMES.USERS);
        sheet.appendRow(['ID', 'Name', 'Email', 'Phone', 'Password', 'Role', 'RegisteredDate', 'Status']);
    }
    
    // Create Orders sheet
    sheet = ss.getSheetByName(SHEET_NAMES.ORDERS);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAMES.ORDERS);
        sheet.appendRow(['OrderID', 'CustomerEmail', 'CustomerName', 'Amount', 'Currency', 'Status', 'PaymentMethod', 'Cart', 'ShippingAddress', 'CreatedAt']);
    }
    
    // Create Payments sheet
    sheet = ss.getSheetByName(SHEET_NAMES.PAYMENTS);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAMES.PAYMENTS);
        sheet.appendRow(['PaymentID', 'OrderID', 'Amount', 'Currency', 'Status', 'ToyibPayRef', 'CustomerEmail', 'CreatedAt']);
    }
    
    // Create Logs sheet
    sheet = ss.getSheetByName(SHEET_NAMES.LOGS);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAMES.LOGS);
        sheet.appendRow(['Timestamp', 'Level', 'Message', 'User', 'Page', 'App', 'Version']);
    }
    
    // Create Freight sheet
    sheet = ss.getSheetByName(SHEET_NAMES.FREIGHT);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAMES.FREIGHT);
        sheet.appendRow(['ID', 'Type', 'BaseRate', 'PerKg', 'Zone', 'Multiplier', 'CreatedAt']);
    }
    
    return { success: true, message: 'Sheets initialized successfully' };
}

// Handle GET requests
function doGet(e) {
    const action = e.parameter.action;
    let result = {};
    
    try {
        switch(action) {
            case 'getProducts':
                result = getProducts();
                break;
            case 'getUsers':
                result = getUsers();
                break;
            case 'getOrders':
                result = getOrders();
                break;
            case 'getLogs':
                result = getLogs();
                break;
            case 'auth':
                result = authenticateUser(e.parameter.email, e.parameter.password);
                break;
            default:
                result = { error: 'Invalid action' };
        }
    } catch(error) {
        result = { error: error.toString() };
        logToSheet('ERROR', error.toString(), 'system', 'doGet');
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

// Handle POST requests
function doPost(e) {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result = {};
    
    try {
        switch(action) {
            case 'createProduct':
                result = createProduct(data.data);
                break;
            case 'updateProduct':
                result = updateProduct(data.id, data.data);
                break;
            case 'deleteProduct':
                result = deleteProduct(data.id);
                break;
            case 'createUser':
                result = createUser(data.data);
                break;
            case 'createOrder':
                result = createOrder(data.data);
                break;
            case 'log':
                result = logToSheet(data.level, data.message, data.user, data.page, data.app, data.version);
                break;
            case 'initSheet':
                result = initializeSheet();
                break;
            default:
                result = { error: 'Invalid action' };
        }
    } catch(error) {
        result = { error: error.toString() };
        logToSheet('ERROR', error.toString(), 'system', 'doPost');
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

// CRUD Operations for Products
function getProducts() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.PRODUCTS);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const products = data.map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index];
        });
        return obj;
    });
    return { success: true, data: products };
}

function createProduct(productData) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.PRODUCTS);
    productData.ID = 'PROD_' + Date.now();
    productData.CreatedAt = new Date().toISOString();
    productData.UpdatedAt = new Date().toISOString();
    
    const newRow = [
        productData.ID,
        productData.Name_EN,
        productData.Name_MS,
        productData.Name_ZH,
        productData.Price,
        productData.Category,
        productData.Stock,
        productData.Image,
        productData.Description,
        productData.CreatedAt,
        productData.UpdatedAt
    ];
    
    sheet.appendRow(newRow);
    logToSheet('INFO', `Product created: ${productData.ID}`, productData.CreatedBy || 'system', 'createProduct');
    return { success: true, data: productData };
}

function updateProduct(productId, productData) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.PRODUCTS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === productId) {
            productData.UpdatedAt = new Date().toISOString();
            const rowNumber = i + 1;
            
            // Update each column
            sheet.getRange(rowNumber, 2).setValue(productData.Name_EN || data[i][1]);
            sheet.getRange(rowNumber, 3).setValue(productData.Name_MS || data[i][2]);
            sheet.getRange(rowNumber, 4).setValue(productData.Name_ZH || data[i][3]);
            sheet.getRange(rowNumber, 5).setValue(productData.Price || data[i][4]);
            sheet.getRange(rowNumber, 6).setValue(productData.Category || data[i][5]);
            sheet.getRange(rowNumber, 7).setValue(productData.Stock || data[i][6]);
            sheet.getRange(rowNumber, 8).setValue(productData.Image || data[i][7]);
            sheet.getRange(rowNumber, 9).setValue(productData.Description || data[i][8]);
            sheet.getRange(rowNumber, 11).setValue(productData.UpdatedAt);
            
            logToSheet('INFO', `Product updated: ${productId}`, 'system', 'updateProduct');
            return { success: true, message: 'Product updated' };
        }
    }
    
    return { success: false, error: 'Product not found' };
}

function deleteProduct(productId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.PRODUCTS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === productId) {
            sheet.deleteRow(i + 1);
            logToSheet('INFO', `Product deleted: ${productId}`, 'system', 'deleteProduct');
            return { success: true, message: 'Product deleted' };
        }
    }
    
    return { success: false, error: 'Product not found' };
}

// User Management
function createUser(userData) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.USERS);
    userData.ID = 'USER_' + Date.now();
    userData.RegisteredDate = new Date().toISOString();
    userData.Role = userData.Role || 'member';
    userData.Status = 'active';
    
    const newRow = [
        userData.ID,
        userData.Name,
        userData.Email,
        userData.Phone,
        userData.Password,
        userData.Role,
        userData.RegisteredDate,
        userData.Status
    ];
    
    sheet.appendRow(newRow);
    logToSheet('INFO', `User created: ${userData.Email}`, userData.Email, 'createUser');
    return { success: true, data: userData };
}

function authenticateUser(email, password) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.USERS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][2] === email && data[i][4] === password) {
            const user = {
                id: data[i][0],
                name: data[i][1],
                email: data[i][2],
                phone: data[i][3],
                role: data[i][5],
                status: data[i][7]
            };
            logToSheet('INFO', `User authenticated: ${email}`, email, 'authenticateUser');
            return { success: true, data: user };
        }
    }
    
    logToSheet('WARNING', `Failed authentication attempt: ${email}`, 'unknown', 'authenticateUser');
    return { success: false, error: 'Invalid credentials' };
}

// Order Management
function createOrder(orderData) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.ORDERS);
    orderData.CreatedAt = new Date().toISOString();
    orderData.Status = orderData.Status || 'pending';
    
    const newRow = [
        orderData.OrderID || 'ORDER_' + Date.now(),
        orderData.CustomerEmail,
        orderData.CustomerName,
        orderData.Amount,
        orderData.Currency || 'MYR',
        orderData.Status,
        orderData.PaymentMethod || 'Toyib Pay',
        JSON.stringify(orderData.Cart || []),
        orderData.ShippingAddress || '',
        orderData.CreatedAt
    ];
    
    sheet.appendRow(newRow);
    logToSheet('INFO', `Order created: ${newRow[0]}, Amount: ${orderData.Amount}`, orderData.CustomerEmail, 'createOrder');
    return { success: true, data: orderData };
}

// Logging System
function logToSheet(level, message, user, page, app = 'Global Marketplace', version = '1.0.0') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.LOGS);
    const timestamp = new Date().toISOString();
    
    sheet.appendRow([
        timestamp,
        level,
        message,
        user || 'system',
        page || 'unknown',
        app,
        version
    ]);
    
    return { success: true, timestamp: timestamp };
}

function getLogs() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.LOGS);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const logs = data.map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index];
        });
        return obj;
    });
    return { success: true, data: logs };
}

// Freight Management
function calculateFreight(type, weight, zone = 'asia') {
    const rates = {
        local: { baseRate: 10, perKg: 2 },
        international: { baseRate: 50, perKg: 10, zones: { asia: 1.2, europe: 1.5, america: 1.8, others: 2.0 } }
    };
    
    let cost = 0;
    if (type === 'local') {
        cost = rates.local.baseRate + (weight * rates.local.perKg);
    } else {
        const multiplier = rates.international.zones[zone] || 1.5;
        cost = (rates.international.baseRate + (weight * rates.international.perKg)) * multiplier;
    }
    
    return { success: true, cost: Math.round(cost * 100) / 100 };
}

// Toyib Pay Integration
function processToyibPayPayment(paymentData) {
    // This is a mock implementation
    // In production, you would integrate with Toyib Pay API
    
    const payment = {
        PaymentID: 'PAY_' + Date.now(),
        OrderID: paymentData.orderId,
        Amount: paymentData.amount,
        Currency: paymentData.currency || 'MYR',
        Status: 'success',
        ToyibPayRef: 'TP_' + Math.random().toString(36).substr(2, 10).toUpperCase(),
        CustomerEmail: paymentData.customerEmail,
        CreatedAt: new Date().toISOString()
    };
    
    // Save payment record
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.PAYMENTS);
    sheet.appendRow([
        payment.PaymentID,
        payment.OrderID,
        payment.Amount,
        payment.Currency,
        payment.Status,
        payment.ToyibPayRef,
        payment.CustomerEmail,
        payment.CreatedAt
    ]);
    
    // Update order status
    updateOrderStatus(payment.OrderID, 'paid');
    
    logToSheet('INFO', `Payment processed: ${payment.PaymentID}, Amount: ${payment.Amount}`, payment.CustomerEmail, 'processToyibPayPayment');
    
    return payment;
}

function updateOrderStatus(orderId, status) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.ORDERS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === orderId) {
            sheet.getRange(i + 1, 6).setValue(status);
            logToSheet('INFO', `Order status updated: ${orderId} -> ${status}`, 'system', 'updateOrderStatus');
            return { success: true };
        }
    }
    
    return { success: false, error: 'Order not found' };
}

// Setup script to initialize the spreadsheet
function setupSpreadsheet() {
    const ss = SpreadsheetApp.create('GlobalMarketplace_Data');
    SpreadsheetApp.openById(ss.getId());
    
    // Set spreadsheet name
    ss.rename('GlobalMarketplace_Data');
    
    // Initialize sheets
    initializeSheet();
    
    Logger.log('Spreadsheet created with ID: ' + ss.getId());
    return ss.getId();
}