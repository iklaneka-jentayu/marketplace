// Shopee API Integration Module

class ShopeeAPI {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.isInitialized = false;
        this.useSandbox = true; // Set to false for production
    }

    // Initialize the Shopee API module
    async initialize() {
        try {
            // Load saved tokens from storage
            await this.loadTokens();
            
            // Check if token needs refresh
            if (this.accessToken && this.tokenExpiry) {
                const now = new Date();
                const expiry = new Date(this.tokenExpiry);
                
                // Refresh if token expires in less than 1 hour
                if (expiry - now < 3600000) {
                    await this.refreshAccessToken();
                }
            }
            
            this.isInitialized = true;
            console.log('Shopee API initialized successfully');
            
            // Log initialization
            await this.logToSheet('SHOPEE_API_INIT', 'Shopee API module initialized');
            
        } catch (error) {
            console.error('Error initializing Shopee API:', error);
            throw error;
        }
    }

    // Load tokens from storage
    async loadTokens() {
        const stored = localStorage.getItem('shopee_tokens');
        if (stored) {
            const tokens = JSON.parse(stored);
            this.accessToken = tokens.accessToken;
            this.refreshToken = tokens.refreshToken;
            this.tokenExpiry = tokens.tokenExpiry;
        }
    }

    // Save tokens to storage
    saveTokens(accessToken, refreshToken, expiresIn) {
        const expiry = new Date();
        expiry.setSeconds(expiry.getSeconds() + expiresIn);
        
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiry = expiry.toISOString();
        
        localStorage.setItem('shopee_tokens', JSON.stringify({
            accessToken,
            refreshToken,
            tokenExpiry: this.tokenExpiry
        }));
    }

    // Get authorization URL for OAuth flow
    getAuthorizationUrl() {
        const baseUrl = this.useSandbox 
            ? 'https://partner.test-stable.shopeemobile.com/api/v2/shop/auth_partner'
            : 'https://partner.shopeemobile.com/api/v2/shop/auth_partner';
        
        // Generate signature
        const timestamp = Math.floor(Date.now() / 1000);
        const signatureBase = `${SHOPEE_CONFIG.PARTNER_ID}${SHOPEE_CONFIG.REDIRECT_URL}`;
        const signature = this.generateSignature(signatureBase);
        
        const params = new URLSearchParams({
            id: SHOPEE_CONFIG.PARTNER_ID,
            token: signature,
            redirect: SHOPEE_CONFIG.REDIRECT_URL
        });
        
        return `${baseUrl}?${params.toString()}`;
    }

    // Handle OAuth callback and get access token
    async handleAuthCallback(code, shopId) {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            
            const requestBody = {
                partner_id: parseInt(SHOPEE_CONFIG.PARTNER_ID),
                shop_id: parseInt(shopId),
                code: code,
                timestamp: timestamp
            };
            
            const signature = this.generateApiSignature('/api/v2/auth/token/get', requestBody);
            
            const response = await fetch(`${this.getBaseUrl()}/auth/token/get`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': signature
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(`Shopee API error: ${data.message}`);
            }
            
            // Save tokens
            this.saveTokens(
                data.access_token,
                data.refresh_token,
                data.expires_in
            );
            
            // Save shop info
            localStorage.setItem('shopee_shop_id', shopId);
            
            // Log successful authorization
            await this.logToSheet('SHOPEE_AUTH_SUCCESS', `Shop ${shopId} authorized successfully`);
            
            return data;
            
        } catch (error) {
            console.error('Error in auth callback:', error);
            await this.logToSheet('SHOPEE_AUTH_ERROR', error.toString());
            throw error;
        }
    }

    // Refresh access token
    async refreshAccessToken() {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            
            const requestBody = {
                partner_id: parseInt(SHOPEE_CONFIG.PARTNER_ID),
                shop_id: parseInt(localStorage.getItem('shopee_shop_id')),
                refresh_token: this.refreshToken,
                timestamp: timestamp
            };
            
            const signature = this.generateApiSignature('/api/v2/auth/access_token/get', requestBody);
            
            const response = await fetch(`${this.getBaseUrl()}/auth/access_token/get`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': signature
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(`Token refresh failed: ${data.message}`);
            }
            
            // Update tokens
            this.saveTokens(
                data.access_token,
                data.refresh_token,
                data.expires_in
            );
            
            return data;
            
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw error;
        }
    }

    // Generate signature for OAuth
    generateSignature(data) {
        const crypto = window.crypto || window.msCrypto;
        if (!crypto) {
            throw new Error('Crypto not supported');
        }
        
        // This is a simplified version - in production, use proper SHA256
        // You may need to include a crypto library for this
        return this.sha256(data);
    }

    // Generate API request signature
    generateApiSignature(path, body) {
        const baseString = `${this.getBaseUrl()}${path}|${JSON.stringify(body)}`;
        return this.sha256(baseString);
    }

    // Simple SHA256 implementation (for demo - use proper crypto in production)
    sha256(str) {
        // This is a placeholder - in production, use Web Crypto API or a library
        // For demo purposes, we'll return a mock signature
        return 'mock_signature_' + Date.now();
    }

    // Get base URL based on environment
    getBaseUrl() {
        return this.useSandbox ? SHOPEE_CONFIG.SANDBOX_API_URL : SHOPEE_CONFIG.API_BASE_URL;
    }

    // Fetch products from Shopee
    async fetchProducts(options = {}) {
        try {
            await this.ensureValidToken();
            
            const timestamp = Math.floor(Date.now() / 1000);
            const shopId = localStorage.getItem('shopee_shop_id');
            
            const requestBody = {
                partner_id: parseInt(SHOPEE_CONFIG.PARTNER_ID),
                shopid: parseInt(shopId),
                timestamp: timestamp,
                pagination_offset: options.offset || 0,
                pagination_entries_per_page: options.limit || SHOPEE_CONFIG.MAX_PRODUCTS_PER_PAGE,
                update_time_from: options.updateFrom || null,
                update_time_to: options.updateTo || null
            };
            
            const signature = this.generateApiSignature('/api/v2/product/get_item_list', requestBody);
            
            const response = await fetch(`${this.getBaseUrl()}/product/get_item_list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': signature
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(`Failed to fetch products: ${data.message}`);
            }
            
            // Fetch detailed info for each product
            const products = [];
            for (const item of data.item_list || []) {
                const details = await this.getProductDetails(item.item_id);
                products.push(this.formatProduct(details));
            }
            
            await this.logToSheet('SHOPEE_FETCH_PRODUCTS', `Fetched ${products.length} products`);
            
            return {
                products,
                total: data.total_count,
                hasMore: data.more
            };
            
        } catch (error) {
            console.error('Error fetching Shopee products:', error);
            await this.logToSheet('SHOPEE_FETCH_ERROR', error.toString());
            throw error;
        }
    }

    // Get detailed product information
    async getProductDetails(itemId) {
        try {
            await this.ensureValidToken();
            
            const timestamp = Math.floor(Date.now() / 1000);
            const shopId = localStorage.getItem('shopee_shop_id');
            
            const requestBody = {
                partner_id: parseInt(SHOPEE_CONFIG.PARTNER_ID),
                shopid: parseInt(shopId),
                timestamp: timestamp,
                item_id: parseInt(itemId)
            };
            
            const signature = this.generateApiSignature('/api/v2/product/get_item_base_info', requestBody);
            
            const response = await fetch(`${this.getBaseUrl()}/product/get_item_base_info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': signature
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(`Failed to get product details: ${data.message}`);
            }
            
            return data.item;
            
        } catch (error) {
            console.error('Error getting product details:', error);
            throw error;
        }
    }

    // Search products by keyword
    async searchProducts(keyword, options = {}) {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            
            const requestBody = {
                partner_id: parseInt(SHOPEE_CONFIG.PARTNER_ID),
                timestamp: timestamp,
                keyword: keyword,
                pagination_offset: options.offset || 0,
                pagination_entries_per_page: options.limit || 20,
                sort_type: options.sort || 1 // 1: relevance, 2: price low to high, 3: price high to low
            };
            
            // Public search endpoint doesn't require shop authorization
            const response = await fetch(`${this.getBaseUrl()}/product/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(`Search failed: ${data.message}`);
            }
            
            return {
                products: data.items || [],
                total: data.total_count
            };
            
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    // Format product data for your system
    formatProduct(shopeeProduct) {
        // Map Shopee category to your category
        const category = this.mapCategory(shopeeProduct.category_id);
        
        // Extract main image
        const mainImage = shopeeProduct.images && shopeeProduct.images.length > 0 
            ? shopeeProduct.images[0] 
            : 'https://via.placeholder.com/300x200?text=No+Image';
        
        // Format price
        const price = shopeeProduct.price / 100000; // Shopee price is in smallest currency unit
        
        return {
            id: `shopee_${shopeeProduct.item_id}`,
            shopee_id: shopeeProduct.item_id,
            name: shopeeProduct.item_name,
            description: shopeeProduct.description || 'No description available',
            price: price,
            original_price: shopeeProduct.price_before_discount ? shopeeProduct.price_before_discount / 100000 : price,
            category: category,
            category_id: shopeeProduct.category_id,
            image: mainImage,
            images: shopeeProduct.images || [],
            stock: shopeeProduct.stock || 0,
            sold: shopeeProduct.sold || 0,
            rating: shopeeProduct.item_rating?.rating_star || 0,
            review_count: shopeeProduct.item_rating?.rating_count || 0,
            attributes: shopeeProduct.attributes || {},
            variants: this.formatVariants(shopeeProduct.models),
            shop_id: shopeeProduct.shop_id,
            shop_name: shopeeProduct.shop_name,
            shop_location: shopeeProduct.shop_location,
            source: 'shopee',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    // Format product variants
    formatVariants(models) {
        if (!models || !models.length) return [];
        
        return models.map(model => ({
            id: model.model_id,
            name: model.name,
            price: model.price / 100000,
            stock: model.stock,
            sku: model.model_sku
        }));
    }

    // Map Shopee category to local category
    mapCategory(shopeeCategoryId) {
        return SHOPEE_CONFIG.CATEGORY_MAPPING[shopeeCategoryId.toString()] || 'uncategorized';
    }

    // Ensure valid token before API calls
    async ensureValidToken() {
        if (!this.accessToken) {
            throw new Error('Not authorized. Please connect your Shopee account first.');
        }
        
        const now = new Date();
        const expiry = new Date(this.tokenExpiry);
        
        if (now >= expiry) {
            await this.refreshAccessToken();
        }
    }

    // Check if Shopee is connected
    isConnected() {
        return !!(this.accessToken && this.tokenExpiry);
    }

    // Disconnect Shopee
    disconnect() {
        localStorage.removeItem('shopee_tokens');
        localStorage.removeItem('shopee_shop_id');
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        
        this.logToSheet('SHOPEE_DISCONNECT', 'Shopee disconnected');
    }

    // Get Shopee categories
    async getCategories() {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            
            const requestBody = {
                partner_id: parseInt(SHOPEE_CONFIG.PARTNER_ID),
                timestamp: timestamp,
                language: 'en'
            };
            
            const signature = this.generateApiSignature('/api/v2/product/get_category', requestBody);
            
            const response = await fetch(`${this.getBaseUrl()}/product/get_category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': signature
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(`Failed to get categories: ${data.message}`);
            }
            
            return data.category_list || [];
            
        } catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    }

    // Get shop information
    async getShopInfo() {
        try {
            await this.ensureValidToken();
            
            const timestamp = Math.floor(Date.now() / 1000);
            const shopId = localStorage.getItem('shopee_shop_id');
            
            const requestBody = {
                partner_id: parseInt(SHOPEE_CONFIG.PARTNER_ID),
                shopid: parseInt(shopId),
                timestamp: timestamp
            };
            
            const signature = this.generateApiSignature('/api/v2/shop/get_shop_info', requestBody);
            
            const response = await fetch(`${this.getBaseUrl()}/shop/get_shop_info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': signature
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(`Failed to get shop info: ${data.message}`);
            }
            
            return data.shop;
            
        } catch (error) {
            console.error('Error getting shop info:', error);
            throw error;
        }
    }

    // Log to Google Sheets
    async logToSheet(action, message) {
        try {
            const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
            
            const logData = {
                action: action,
                message: message,
                userId: 'system',
                module: 'shopee',
                timestamp: new Date().toISOString()
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
}

// Create global instance
const shopeeAPI = new ShopeeAPI();