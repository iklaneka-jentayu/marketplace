// Configuration File
const CONFIG = {
    APP_NAME: 'Global Marketplace',
    VERSION: '1.0.0',
    
    // Google Apps Script Web App URL - Replace with your deployed URL
    GAS_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    
    // Google Spreadsheet Name
    SPREADSHEET_NAME: 'GlobalMarketplace_Data',
    
    // Table Names
    TABLES: {
        PRODUCTS: 'Products',
        USERS: 'Users',
        ORDERS: 'Orders',
        CART: 'Cart',
        FREIGHT: 'Freight',
        PAYMENTS: 'Payments',
        LOGS: 'SystemLogs'
    },
    
    // Freight Rates
    FREIGHT_RATES: {
        LOCAL: {
            baseRate: 10,
            perKg: 2,
            freeShippingThreshold: 100
        },
        INTERNATIONAL: {
            baseRate: 50,
            perKg: 10,
            zones: {
                asia: 1.2,
                europe: 1.5,
                america: 1.8,
                others: 2.0
            }
        }
    },
    
    // Toyib Pay Configuration
    TOYIB_PAY: {
        apiKey: 'YOUR_TOYIB_PAY_API_KEY',
        merchantId: 'YOUR_MERCHANT_ID',
        environment: 'sandbox' // sandbox or production
    }
};

// Multi-language Support
const TRANSLATIONS = {
    en: {
        home: 'Home',
        categories: 'Categories',
        products: 'Products',
        freight: 'Freight',
        login: 'Login',
        register: 'Register',
        shop_now: 'Shop Now',
        hero_title: 'Shop Global, Save Local',
        hero_desc: 'Discover millions of products with international shipping and local delivery',
        categories_title: 'Shop by Categories',
        featured_products: 'Featured Products',
        freight_calculator: 'Freight Calculator',
        local_delivery: 'Local Delivery',
        international_delivery: 'International Delivery',
        calculate: 'Calculate',
        free_shipping: 'Free Shipping',
        free_shipping_desc: 'On orders over RM100',
        secure_payment: 'Secure Payment',
        secure_payment_desc: '100% secure transactions',
        free_returns: 'Free Returns',
        free_returns_desc: '30-day return policy',
        about_us: 'About Us',
        about_text: 'Global Marketplace is your premier destination for online and offline shopping, connecting buyers and sellers worldwide.',
        quick_links: 'Quick Links',
        payment_methods: 'Payment Methods',
        all_rights: 'All rights reserved.',
        contact: 'Contact',
        add_to_cart: 'Add to Cart',
        out_of_stock: 'Out of Stock',
        checkout: 'Checkout',
        total: 'Total',
        empty_cart: 'Your cart is empty',
        continue_shopping: 'Continue Shopping',
        freight_cost: 'Freight Cost',
        delivery_address: 'Delivery Address',
        payment_method: 'Payment Method',
        place_order: 'Place Order'
    },
    ms: {
        home: 'Utama',
        categories: 'Kategori',
        products: 'Produk',
        freight: 'Pengangkutan',
        login: 'Log Masuk',
        register: 'Daftar',
        shop_now: 'Beli Sekarang',
        hero_title: 'Beli Global, Jimat Tempatan',
        hero_desc: 'Temui jutaan produk dengan penghantaran antarabangsa dan penghantaran tempatan',
        categories_title: 'Beli mengikut Kategori',
        featured_products: 'Produk Pilihan',
        freight_calculator: 'Kalkulator Pengangkutan',
        local_delivery: 'Penghantaran Tempatan',
        international_delivery: 'Penghantaran Antarabangsa',
        calculate: 'Kira',
        free_shipping: 'Penghantaran Percuma',
        free_shipping_desc: 'Untuk pesanan melebihi RM100',
        secure_payment: 'Pembayaran Selamat',
        secure_payment_desc: 'Transaksi 100% selamat',
        free_returns: 'Pulangan Percuma',
        free_returns_desc: 'Dasar pulangan 30 hari',
        about_us: 'Tentang Kami',
        about_text: 'Global Marketplace adalah destinasi utama anda untuk membeli-belah dalam talian dan luar talian, menghubungkan pembeli dan penjual di seluruh dunia.',
        quick_links: 'Pautan Pantas',
        payment_methods: 'Kaedah Pembayaran',
        all_rights: 'Hak cipta terpelihara.',
        contact: 'Hubungi',
        add_to_cart: 'Tambah ke Troli',
        out_of_stock: 'Stok Habis',
        checkout: 'Buat Pesanan',
        total: 'Jumlah',
        empty_cart: 'Troli anda kosong',
        continue_shopping: 'Teruskan Membeli-belah',
        freight_cost: 'Kos Pengangkutan',
        delivery_address: 'Alamat Penghantaran',
        payment_method: 'Kaedah Pembayaran',
        place_order: 'Pesan Sekarang'
    },
    zh: {
        home: '主页',
        categories: '分类',
        products: '产品',
        freight: '货运',
        login: '登录',
        register: '注册',
        shop_now: '立即购买',
        hero_title: '全球购物，本地优惠',
        hero_desc: '发现数百万种产品，提供国际运输和本地配送',
        categories_title: '按类别购物',
        featured_products: '精选产品',
        freight_calculator: '运费计算器',
        local_delivery: '本地配送',
        international_delivery: '国际运输',
        calculate: '计算',
        free_shipping: '免运费',
        free_shipping_desc: '订单满RM100',
        secure_payment: '安全支付',
        secure_payment_desc: '100%安全交易',
        free_returns: '免费退货',
        free_returns_desc: '30天退货政策',
        about_us: '关于我们',
        about_text: '全球市场是您在线和离线购物的首选目的地，连接全球买家和卖家。',
        quick_links: '快速链接',
        payment_methods: '支付方式',
        all_rights: '版权所有。',
        contact: '联系我们',
        add_to_cart: '加入购物车',
        out_of_stock: '缺货',
        checkout: '结算',
        total: '总计',
        empty_cart: '您的购物车是空的',
        continue_shopping: '继续购物',
        freight_cost: '运费',
        delivery_address: '送货地址',
        payment_method: '支付方式',
        place_order: '下单'
    }
};