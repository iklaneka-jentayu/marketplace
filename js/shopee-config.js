// Shopee API Configuration
const SHOPEE_CONFIG = {
    // API Endpoints
    API_BASE_URL: 'https://partner.shopeemobile.com/api/v2',
    SANDBOX_API_URL: 'https://partner.test-stable.shopeemobile.com/api/v2',
    
    // Your Shopee Partner credentials (from Shopee Open Platform)
    PARTNER_ID: 'YOUR_PARTNER_ID', // Replace with actual Partner ID
    PARTNER_KEY: 'YOUR_PARTNER_KEY', // Replace with actual Partner Key
    
    // Shop information
    SHOP_ID: 'YOUR_SHOP_ID', // Replace with actual Shop ID
    
    // OAuth redirect URL (your callback endpoint)
    REDIRECT_URL: window.location.origin + '/shopee-callback.html',
    
    // Integration settings
    SYNC_INTERVAL: 30, // minutes between auto-sync
    MAX_PRODUCTS_PER_PAGE: 100,
    DEFAULT_CURRENCY: 'MYR',
    
    // Supported Shopee regions
    REGIONS: {
        'MY': 'Malaysia',
        'SG': 'Singapore',
        'TH': 'Thailand',
        'VN': 'Vietnam',
        'PH': 'Philippines',
        'ID': 'Indonesia',
        'TW': 'Taiwan',
        'BR': 'Brazil',
        'MX': 'Mexico',
        'CO': 'Colombia',
        'CL': 'Chile',
        'PL': 'Poland',
        'ES': 'Spain'
    },
    
    // Category mapping (map Shopee categories to your local categories)
    CATEGORY_MAPPING: {
        // Electronics
        '100001': 'electronics', // Mobile & Gadgets
        '100002': 'electronics', // Computers & Laptops
        '100003': 'electronics', // Cameras
        '100004': 'electronics', // Audio
        
        // Fashion
        '200001': 'fashion', // Men's Fashion
        '200002': 'fashion', // Women's Fashion
        '200003': 'fashion', // Kids' Fashion
        '200004': 'fashion', // Accessories
        
        // Home & Living
        '300001': 'home', // Furniture
        '300002': 'home', // Home Appliances
        '300003': 'home', // Kitchen & Dining
        '300004': 'home', // Bedding & Bath
        
        // Sports & Outdoors
        '400001': 'sports', // Sports Equipment
        '400002': 'sports', // Fitness
        '400003': 'sports', // Outdoor Gear
        
        // Books & Stationery
        '500001': 'books', // Books
        '500002': 'books', // Stationery
        '500003': 'books', // Magazines
        
        // Beauty & Health
        '600001': 'beauty', // Skincare
        '600002': 'beauty', // Makeup
        '600003': 'beauty', // Health & Wellness
        
        // Toys & Hobbies
        '700001': 'toys', // Toys
        '700002': 'toys', // Hobbies
        '700003': 'toys', // Collectibles
        
        // Automotive
        '800001': 'automotive', // Car Accessories
        '800002': 'automotive', // Motorcycle Parts
        '800003': 'automotive'  // Tools
    }
};