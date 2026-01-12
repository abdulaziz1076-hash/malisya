// shared-storage.js
// نظام التخزين المشترك بين الصفحتين

const STORAGE_KEYS = {
    PRODUCTS: 'goldenMalaysiaProducts',
    ORDERS: 'goldenMalaysiaOrders',
    SETTINGS: 'goldenMalaysiaSettings',
    LAST_UPDATE: 'goldenMalaysiaLastUpdate'
};

class SharedStorage {
    constructor() {
        this.initDefaultData();
    }

    // تهيئة بيانات افتراضية إذا لم تكن موجودة
    initDefaultData() {
        if (!this.getProducts().length) {
            this.setProducts(this.getDefaultProducts());
        }
        
        if (!this.getSettings()) {
            this.setSettings(this.getDefaultSettings());
        }
        
        if (!this.getOrders().length) {
            this.setOrders(this.getDefaultOrders());
        }
    }

    // المنتجات الافتراضية
    getDefaultProducts() {
        return [
            {
                id: 1,
                name: "قهوة الجانوديرما الفاخرة",
                brand: "DXN",
                price: 95,
                originalPrice: 120,
                description: "خلطة فريدة من فطر الجانوديرما النادر مع أجود أنواع البن الماليزي. تعزز المناعة وتزيد الطاقة.",
                image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: ["popular", "energy", "health"],
                stock: 50,
                available: true,
                isNew: false,
                isPopular: true,
                createdAt: "2024-01-15"
            },
            {
                id: 2,
                name: "عسل المانوكا الأصلي",
                brand: "DXN",
                price: 120,
                originalPrice: 150,
                description: "عسل مانوكا طبيعي 100% من ماليزيا، غني بمضادات الأكسدة والعناصر الغذائية الأساسية.",
                image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: ["health", "new"],
                stock: 30,
                available: true,
                isNew: true,
                isPopular: false,
                createdAt: "2024-03-01"
            },
            {
                id: 3,
                name: "شاي أخضر ماليزي عضوي",
                brand: "DXN",
                price: 45,
                originalPrice: 60,
                description: "شاي أخضر عالي الجودة من مزارع ماليزيا العضوية، يساعد على تحسين الهضم وإنقاص الوزن.",
                image: "https://images.unsplash.com/photo-1561047029-3000c68339ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: ["health", "detox"],
                stock: 80,
                available: true,
                isNew: false,
                isPopular: true,
                createdAt: "2024-02-10"
            },
            {
                id: 4,
                name: "زيت جوز الهند البكر",
                brand: "DXN",
                price: 65,
                originalPrice: 85,
                description: "زيت جوز الهند البكر الماليزي، مثالي للطهي الصحي والعناية بالبشرة والشعر.",
                image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: ["health", "beauty"],
                stock: 0,
                available: false,
                isNew: false,
                isPopular: false,
                createdAt: "2024-01-20"
            },
            {
                id: 5,
                name: "مكمل سبيرولينا الغذائي",
                brand: "DXN",
                price: 95,
                originalPrice: 120,
                description: "مكمل غذائي طبيعي من طحالب السبيرولينا، غني بالبروتين والفيتامينات والمعادن.",
                image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: ["health", "supplement", "popular"],
                stock: 25,
                available: true,
                isNew: false,
                isPopular: true,
                createdAt: "2024-02-25"
            },
            {
                id: 6,
                name: "قهوة لينزي التقليدية",
                brand: "DXN",
                price: 75,
                originalPrice: 95,
                description: "قهوة ماليزية تقليدية مع خلطة أعشاب طبيعية، نكهة مميزة وفريدة.",
                image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: ["energy", "traditional"],
                stock: 40,
                available: true,
                isNew: true,
                isPopular: false,
                createdAt: "2024-03-10"
            }
        ];
    }

    // الإعدادات الافتراضية
    getDefaultSettings() {
        return {
            deliveryFee: 30,
            deliveryAreas: "abu-dhabi",
            deliveryTime: "24 ساعة كحد أقصى",
            whatsappNumber: "+971501234567",
            instagramLink: "@malaysian_products",
            welcomeMessage: "اكتشف مجموعة مختارة من أفضل المنتجات الماليزية الصحية والعالية الجودة، توصيل سريع خلال 24 ساعة في أبوظبي",
            siteTitle: "ماليزيا الذهبية - منتجات DXN الصحية",
            siteDescription: "نخبة المنتجات الصحية الماليزية المستوردة مباشرة من مصانع DXN",
            freeShippingThreshold: 300,
            currency: "درهم"
        };
    }

    // الطلبات الافتراضية
    getDefaultOrders() {
        return [
            {
                id: 1,
                orderNumber: "ORD-2024-001",
                customerName: "أحمد محمد",
                customerPhone: "+971501112233",
                customerLocation: { lat: 24.4539, lng: 54.3773 },
                products: [
                    { id: 1, name: "قهوة الجانوديرما الفاخرة", quantity: 2, price: 95 },
                    { id: 3, name: "شاي أخضر ماليزي عضوي", quantity: 1, price: 45 }
                ],
                subtotal: 235,
                deliveryFee: 30,
                total: 265,
                paymentMethod: "cash",
                status: "new",
                orderDate: "2024-03-15T10:30:00Z",
                notes: "يرجى الاتصال قبل التوصيل"
            },
            {
                id: 2,
                orderNumber: "ORD-2024-002",
                customerName: "فاطمة عبدالله",
                customerPhone: "+971502223344",
                customerLocation: { lat: 24.4667, lng: 54.3667 },
                products: [
                    { id: 2, name: "عسل المانوكا الأصلي", quantity: 1, price: 120 }
                ],
                subtotal: 120,
                deliveryFee: 30,
                total: 150,
                paymentMethod: "cash",
                status: "completed",
                orderDate: "2024-03-14T14:20:00Z",
                notes: ""
            },
            {
                id: 3,
                orderNumber: "ORD-2024-003",
                customerName: "خالد سعيد",
                customerPhone: "+971503334455",
                customerLocation: { lat: 24.4300, lng: 54.4333 },
                products: [
                    { id: 5, name: "مكمل سبيرولينا الغذائي", quantity: 1, price: 95 },
                    { id: 6, name: "قهوة لينزي التقليدية", quantity: 2, price: 75 }
                ],
                subtotal: 245,
                deliveryFee: 30,
                total: 275,
                paymentMethod: "cash",
                status: "processing",
                orderDate: "2024-03-13T09:15:00Z",
                notes: "العميل يفضل التوصيل في المساء"
            }
        ];
    }

    // === وظائف GET ===
    getProducts() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || [];
    }

    getProduct(id) {
        return this.getProducts().find(product => product.id == id);
    }

    getOrders() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [];
    }

    getOrder(id) {
        return this.getOrders().find(order => order.id == id);
    }

    getSettings() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || this.getDefaultSettings();
    }

    getLastUpdate() {
        return localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    }

    // === وظائف SET ===
    setProducts(products) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        this.updateTimestamp();
    }

    setOrders(orders) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        this.updateTimestamp();
    }

    setSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        this.updateTimestamp();
    }

    // === وظائف UPDATE ===
    addProduct(product) {
        const products = this.getProducts();
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        product.id = newId;
        product.createdAt = new Date().toISOString();
        products.push(product);
        this.setProducts(products);
        return product;
    }

    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id == id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates };
            this.setProducts(products);
            return true;
        }
        return false;
    }

    deleteProduct(id) {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id != id);
        this.setProducts(filtered);
        return filtered.length !== products.length;
    }

    addOrder(order) {
        const orders = this.getOrders();
        const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
        order.id = newId;
        order.orderNumber = `ORD-${new Date().getFullYear()}-${String(newId).padStart(3, '0')}`;
        order.orderDate = new Date().toISOString();
        order.status = order.status || 'new';
        orders.push(order);
        this.setOrders(orders);
        return order;
    }

    updateOrderStatus(id, status) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id == id);
        if (index !== -1) {
            orders[index].status = status;
            this.setOrders(orders);
            return true;
        }
        return false;
    }

    deleteOrder(id) {
        const orders = this.getOrders();
        const filtered = orders.filter(o => o.id != id);
        this.setOrders(filtered);
        return filtered.length !== orders.length;
    }

    updateSettings(updates) {
        const settings = this.getSettings();
        const newSettings = { ...settings, ...updates };
        this.setSettings(newSettings);
        return newSettings;
    }

    // === وظائف مساعدة ===
    updateTimestamp() {
        localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, Date.now().toString());
    }

    hasNewData(lastChecked) {
        const lastUpdate = this.getLastUpdate();
        return lastUpdate && parseInt(lastUpdate) > parseInt(lastChecked || 0);
    }

    exportData() {
        return {
            products: this.getProducts(),
            orders: this.getOrders(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        if (data.products) this.setProducts(data.products);
        if (data.orders) this.setOrders(data.orders);
        if (data.settings) this.setSettings(data.settings);
        return true;
    }

    clearAllData() {
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
        localStorage.removeItem(STORAGE_KEYS.ORDERS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE);
        this.initDefaultData();
    }
}

// إنشاء نسخة عامة للاستخدام
window.sharedStorage = new SharedStorage();
