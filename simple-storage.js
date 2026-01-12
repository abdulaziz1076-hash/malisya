// simple-storage.js
// نظام تخزين مبسط يعمل على Static Sites

class SimpleStorage {
    constructor() {
        this.keys = {
            PRODUCTS: 'goldenMalaysiaProducts',
            ORDERS: 'goldenMalaysiaOrders',
            SETTINGS: 'goldenMalaysiaSettings',
            LAST_UPDATE: 'goldenMalaysiaLastUpdate'
        };
        this.initDefaultData();
    }

    // تهيئة بيانات افتراضية
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

    // === بيانات افتراضية ===
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
                isPopular: true,
                isNew: false,
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

    getDefaultSettings() {
        return {
            deliveryFee: 30,
            deliveryAreas: "abu-dhabi",
            deliveryTime: "24 ساعة",
            whatsappNumber: "+971501234567",
            instagramLink: "@malaysian_products",
            welcomeMessage: "اكتشف مجموعة مختارة من أفضل المنتجات الماليزية الصحية والعالية الجودة",
            siteTitle: "ماليزيا الذهبية",
            siteDescription: "منتجات DXN الصحية من ماليزيا",
            freeShippingThreshold: 300,
            currency: "درهم"
        };
    }

    getDefaultOrders() {
        return [
            {
                id: 1,
                orderNumber: "ORD-2024-001",
                customerName: "أحمد محمد",
                customerPhone: "+971501112233",
                products: [
                    { id: 1, name: "قهوة الجانوديرما الفاخرة", quantity: 2, price: 95 },
                    { id: 3, name: "شاي أخضر ماليزي عضوي", quantity: 1, price: 45 }
                ],
                subtotal: 235,
                deliveryFee: 30,
                total: 265,
                paymentMethod: "cash",
                status: "new",
                orderDate: "2024-03-15T10:30:00.000Z"
            }
        ];
    }

    // === دوال الحصول على البيانات ===
    getProducts() {
        try {
            return JSON.parse(localStorage.getItem(this.keys.PRODUCTS)) || [];
        } catch (e) {
            console.error('خطأ في قراءة المنتجات:', e);
            return [];
        }
    }

    getProduct(id) {
        return this.getProducts().find(product => product.id == id);
    }

    getOrders() {
        try {
            return JSON.parse(localStorage.getItem(this.keys.ORDERS)) || [];
        } catch (e) {
            console.error('خطأ في قراءة الطلبات:', e);
            return [];
        }
    }

    getOrder(id) {
        return this.getOrders().find(order => order.id == id);
    }

    getSettings() {
        try {
            return JSON.parse(localStorage.getItem(this.keys.SETTINGS)) || this.getDefaultSettings();
        } catch (e) {
            console.error('خطأ في قراءة الإعدادات:', e);
            return this.getDefaultSettings();
        }
    }

    // === دوال حفظ البيانات ===
    setProducts(products) {
        try {
            localStorage.setItem(this.keys.PRODUCTS, JSON.stringify(products));
            this.updateTimestamp();
            return true;
        } catch (e) {
            console.error('خطأ في حفظ المنتجات:', e);
            return false;
        }
    }

    setOrders(orders) {
        try {
            localStorage.setItem(this.keys.ORDERS, JSON.stringify(orders));
            this.updateTimestamp();
            return true;
        } catch (e) {
            console.error('خطأ في حفظ الطلبات:', e);
            return false;
        }
    }

    setSettings(settings) {
        try {
            localStorage.setItem(this.keys.SETTINGS, JSON.stringify(settings));
            this.updateTimestamp();
            return true;
        } catch (e) {
            console.error('خطأ في حفظ الإعدادات:', e);
            return false;
        }
    }

    // === دوال التعديل ===
    addProduct(productData) {
        const products = this.getProducts();
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        
        const newProduct = {
            id: newId,
            ...productData,
            createdAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        this.setProducts(products);
        return newProduct;
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
        
        if (filtered.length !== products.length) {
            this.setProducts(filtered);
            return true;
        }
        return false;
    }

    addOrder(orderData) {
        const orders = this.getOrders();
        const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
        
        const newOrder = {
            id: newId,
            orderNumber: `ORD-${new Date().getFullYear()}-${String(newId).padStart(3, '0')}`,
            ...orderData,
            orderDate: new Date().toISOString(),
            status: orderData.status || 'new'
        };
        
        orders.push(newOrder);
        this.setOrders(orders);
        return newOrder;
    }

    updateOrder(id, updates) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id == id);
        
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates };
            this.setOrders(orders);
            return true;
        }
        return false;
    }

    updateOrderStatus(id, status) {
        return this.updateOrder(id, { status });
    }

    deleteOrder(id) {
        const orders = this.getOrders();
        const filtered = orders.filter(o => o.id != id);
        
        if (filtered.length !== orders.length) {
            this.setOrders(filtered);
            return true;
        }
        return false;
    }

    updateSettings(updates) {
        const settings = this.getSettings();
        const newSettings = { ...settings, ...updates };
        this.setSettings(newSettings);
        return newSettings;
    }

    // === دوال مساعدة ===
    updateTimestamp() {
        localStorage.setItem(this.keys.LAST_UPDATE, Date.now().toString());
    }

    hasUpdates(lastChecked) {
        const lastUpdate = localStorage.getItem(this.keys.LAST_UPDATE);
        return lastUpdate && parseInt(lastUpdate) > parseInt(lastChecked || 0);
    }

    getLastUpdate() {
        return localStorage.getItem(this.keys.LAST_UPDATE);
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
        localStorage.removeItem(this.keys.PRODUCTS);
        localStorage.removeItem(this.keys.ORDERS);
        localStorage.removeItem(this.keys.SETTINGS);
        localStorage.removeItem(this.keys.LAST_UPDATE);
        this.initDefaultData();
    }
}

// إنشاء نسخة عامة للاستخدام
window.simpleStorage = new SimpleStorage();
