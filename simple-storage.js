// simple-storage.js
class SimpleStorage {
    constructor() {
        this.keys = {
            PRODUCTS: 'goldenMalaysiaProducts',
            ORDERS: 'goldenMalaysiaOrders',
            SETTINGS: 'goldenMalaysiaSettings',
            CART: 'goldenMalaysiaCart'
        };
        this.init();
    }

    init() {
        // إذا لم توجد بيانات، نقوم بتهيئة بيانات افتراضية
        if (!localStorage.getItem(this.keys.PRODUCTS)) {
            this.setProducts(this.getDefaultProducts());
        }
        if (!localStorage.getItem(this.keys.SETTINGS)) {
            this.setSettings(this.getDefaultSettings());
        }
        if (!localStorage.getItem(this.keys.ORDERS)) {
            this.setOrders([]);
        }
    }

    getDefaultProducts() {
        return [
            {
                id: 1,
                name: "قهوة الجانوديرما الفاخرة",
                brand: "DXN",
                price: 95,
                description: "خلطة فريدة من فطر الجانوديرما النادر مع أجود أنواع البن الماليزي",
                image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: ["popular", "energy"],
                stock: 50,
                available: true,
                isPopular: true
            },
            {
                id: 2,
                name: "عسل المانوكا الأصلي",
                brand: "DXN",
                price: 120,
                description: "عسل مانوكا طبيعي 100% من ماليزيا، غني بمضادات الأكسدة",
                image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: ["health"],
                stock: 30,
                available: true,
                isPopular: true
            }
        ];
    }

    getDefaultSettings() {
        return {
            deliveryFee: 30,
            whatsappNumber: "+971501234567",
            currency: "درهم",
            siteTitle: "ماليزيا الذهبية"
        };
    }

    // === PRODUCTS ===
    getProducts() {
        try {
            return JSON.parse(localStorage.getItem(this.keys.PRODUCTS)) || [];
        } catch {
            return [];
        }
    }

    getProduct(id) {
        return this.getProducts().find(p => p.id == id);
    }

    setProducts(products) {
        localStorage.setItem(this.keys.PRODUCTS, JSON.stringify(products));
        return true;
    }

    addProduct(productData) {
        const products = this.getProducts();
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        
        const product = {
            id: newId,
            ...productData,
            createdAt: new Date().toISOString()
        };
        
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
        
        if (filtered.length !== products.length) {
            this.setProducts(filtered);
            return true;
        }
        return false;
    }

    // === ORDERS ===
    getOrders() {
        try {
            return JSON.parse(localStorage.getItem(this.keys.ORDERS)) || [];
        } catch {
            return [];
        }
    }

    getOrder(id) {
        return this.getOrders().find(o => o.id == id);
    }

    setOrders(orders) {
        localStorage.setItem(this.keys.ORDERS, JSON.stringify(orders));
        return true;
    }

    addOrder(orderData) {
        const orders = this.getOrders();
        const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
        
        const order = {
            id: newId,
            orderNumber: `ORD-${Date.now()}`,
            ...orderData,
            orderDate: new Date().toISOString(),
            status: orderData.status || 'new'
        };
        
        orders.push(order);
        this.setOrders(orders);
        return order;
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

    // === SETTINGS ===
    getSettings() {
        try {
            return JSON.parse(localStorage.getItem(this.keys.SETTINGS)) || this.getDefaultSettings();
        } catch {
            return this.getDefaultSettings();
        }
    }

    setSettings(settings) {
        localStorage.setItem(this.keys.SETTINGS, JSON.stringify(settings));
        return true;
    }

    updateSettings(updates) {
        const settings = this.getSettings();
        const newSettings = { ...settings, ...updates };
        this.setSettings(newSettings);
        return newSettings;
    }

    // === CART ===
    getCart() {
        try {
            return JSON.parse(localStorage.getItem(this.keys.CART)) || [];
        } catch {
            return [];
        }
    }

    setCart(cart) {
        localStorage.setItem(this.keys.CART, JSON.stringify(cart));
        return true;
    }

    clearCart() {
        localStorage.removeItem(this.keys.CART);
    }
}

// إنشاء نسخة عالمية
window.simpleStorage = new SimpleStorage();
