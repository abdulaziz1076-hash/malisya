// simple-storage.js - نظام التخزين المركزي للمشروع
const STORAGE_KEYS = {
    PRODUCTS: 'goldenMalaysiaProducts',
    ORDERS: 'goldenMalaysiaOrders',
    SETTINGS: 'goldenMalaysiaSettings',
    LAST_UPDATE: 'goldenMalaysiaLastUpdate'
};

class SimpleStorage {
    constructor() {
        this.initDefaultData();
    }

    initDefaultData() {
        if (!this.getProducts().length) this.setProducts(this.getDefaultProducts());
        if (!this.getSettings()) this.setSettings(this.getDefaultSettings());
        if (!this.getOrders().length) this.setOrders([]);
    }

    // المنتجات الافتراضية
    getDefaultProducts() {
        return [{
            id: 1,
            name: "قهوة الجانوديرما الفاخرة",
            brand: "DXN",
            price: 95,
            originalPrice: 120,
            description: "خلطة فريدة من فطر الجانوديرما النادر مع أجود أنواع البن الماليزي.",
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80",
            category: ["popular", "energy", "health"],
            stock: 50,
            available: true,
            isPopular: true,
            isNew: false
        }];
    }

    getDefaultSettings() {
        return {
            deliveryFee: 30,
            currency: "AED",
            deliveryAreas: "all",
            deliveryTime: "24-48 ساعة",
            whatsappNumber: "971501234567",
            welcomeMessage: "مرحباً بكم في ماليزيا الذهبية - جودة DXN العالمية"
        };
    }

    // عمليات البيانات الأساسية
    getProducts() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]'); }
    setProducts(data) { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data)); this.updateTimestamp(); }
    
    getOrders() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]'); }
    setOrders(data) { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data)); this.updateTimestamp(); }
    
    getSettings() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || 'null'); }
    setSettings(data) { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data)); this.updateTimestamp(); }

    updateTimestamp() { localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, Date.now().toString()); }
    hasUpdates(lastChecked) {
        const lastUpdate = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
        return lastUpdate && parseInt(lastUpdate) > parseInt(lastChecked || 0);
    }
}

const simpleStorage = new SimpleStorage();
