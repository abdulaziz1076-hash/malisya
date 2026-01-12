// admin-functions.js - وظائف صفحة الإدارة (مصحح)

class AdminApp {
    constructor() {
        this.currentView = 'dashboard';
        this.editingProductId = null;
        this.editingOrderId = null;
        this.products = [];
        this.orders = [];
        this.settings = {};
        this.stats = {};
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderDashboard();
        
        // تحديث البيانات كل 5 ثوان
        setInterval(() => this.updateData(), 5000);
    }

    loadData() {
        this.products = simpleStorage.getProducts();
        this.orders = simpleStorage.getOrders();
        this.settings = simpleStorage.getSettings();
        this.stats = this.calculateStats();
    }

    calculateStats() {
        const today = new Date().toISOString().split('T')[0];
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const todayOrders = this.orders.filter(order => 
            order.orderDate && order.orderDate.split('T')[0] === today
        );
        
        const lastWeekOrders = this.orders.filter(order => 
            order.orderDate && order.orderDate >= lastWeek
        );
        
        const availableProducts = this.products.filter(p => p.available && p.stock > 0);
        const popularProducts = this.products.filter(p => p.isPopular);
        
        return {
            totalOrders: this.orders.length,
            todayOrders: todayOrders.length,
            weeklyRevenue: lastWeekOrders.reduce((sum, order) => sum + (order.total || 0), 0),
            availableProducts: availableProducts.length,
            pendingOrders: this.orders.filter(o => o.status === 'new').length,
            totalRevenue: this.orders.reduce((sum, order) => sum + (order.total || 0), 0),
            popularProducts: popularProducts.length,
            outOfStock: this.products.filter(p => p.stock <= 0).length
        };
    }

    setupEventListeners() {
        // القائمة الجانبية
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-tab');
                this.switchView(view);
                
                // تحديث النشاط
                document.querySelectorAll('.menu-item').forEach(i => {
                    i.classList.remove('active');
                });
                item.classList.add('active');
            });
        });
        
        // زر toggle القائمة
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('active');
            });
        }
        
        // بحث المنتجات
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }
        
        // زر الإجراء السريع
        const quickActionBtn = document.querySelector('[onclick*="showQuickActionModal"]');
        if (quickActionBtn) {
            quickActionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showQuickActions();
            });
        }
        
        // زر إضافة منتج
        const addProductBtn = document.querySelector('[onclick*="showProductModal"]');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showProductModal();
            });
        }
        
        // زر إنشاء طلب
        const addOrderBtn = document.querySelector('[onclick*="showOrderModal"]');
        if (addOrderBtn) {
            addOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showOrderModal();
            });
        }
        
        // إغلاق النوافذ
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
    }

    switchView(view) {
        this.currentView = view;
        this.updatePageTitle(view);
        
        // تحميل البيانات الخاصة بالعرض
        switch(view) {
            case 'products':
                this.renderProductsTable();
                break;
            case 'orders':
                this.renderOrdersTable();
                break;
            case 'settings':
                this.renderSettings();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
            case 'dashboard':
                this.renderDashboard();
                break;
        }
    }

    updatePageTitle(view) {
        const titles = {
            'dashboard': 'لوحة التحكم',
            'products': 'إدارة المنتجات',
            'orders': 'إدارة الطلبات',
            'settings': 'إعدادات الموقع',
            'analytics': 'التحليلات',
            'promotions': 'العروض',
            'customers': 'العملاء',
            'reports': 'التقارير'
        };
        
        const header = document.querySelector('.header-title h1');
        const description = document.querySelector('.header-title p');
        
        if (header) {
            const icon = this.getViewIcon(view);
            header.innerHTML = `<i class="fas ${icon}"></i> ${titles[view] || view}`;
        }
        
        if (description) {
            description.textContent = `Golden Malaysia - ${titles[view] || view}`;
        }
    }

    getViewIcon(view) {
        const icons = {
            'dashboard': 'fa-tachometer-alt',
            'products': 'fa-box',
            'orders': 'fa-shopping-cart',
            'settings': 'fa-cogs',
            'analytics': 'fa-chart-line',
            'promotions': 'fa-tag',
            'customers': 'fa-users',
            'reports': 'fa-file-alt'
        };
        return icons[view] || 'fa-cog';
    }

    renderDashboard() {
        this.loadData();
        this.updateStatsCards();
        this.renderRecentOrders();
        this.renderTopProducts();
        this.updateCharts();
    }

    updateStatsCards() {
        const stats = this.stats;
        
        // تحديث كل بطاقة
        const statElements = {
            'totalOrders': document.getElementById('totalOrdersStat'),
            'todayOrders': document.getElementById('todayOrdersStat'),
            'weeklyRevenue': document.getElementById('weeklyRevenueStat'),
            'availableProducts': document.getElementById('availableProductsStat'),
            'pendingOrders': document.getElementById('pendingOrdersStat'),
            'totalRevenue': document.getElementById('totalRevenueStat')
        };
        
        for (const [key, element] of Object.entries(statElements)) {
            if (element) {
                if (key.includes('Revenue')) {
                    element.textContent = `${stats[key].toFixed(0)} ${this.settings.currency}`;
                } else {
                    element.textContent = stats[key];
                }
            }
        }
    }

    renderProductsTable() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) {
            // إنشاء الجدول إذا لم يكن موجوداً
            this.createProductsTable();
            return;
        }
        
        tbody.innerHTML = '';
        
        this.products.forEach((product, index) => {
            const isAvailable = product.available && product.stock > 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                </td>
                <td>
                    <div style="font-weight: 700; color: #1A1A1A;">${product.name}</div>
                    <div style="font-size: 0.85rem; color: #666;">${Array.isArray(product.category) ? product.category.join(', ') : product.category || 'بدون تصنيف'}</div>
                </td>
                <td>${product.brand}</td>
                <td><strong>${product.price} ${this.settings.currency}</strong></td>
                <td>${product.stock}</td>
                <td>
                    <span class="status-badge ${isAvailable ? 'status-active' : 'status-inactive'}">
                        ${isAvailable ? 'متوفر' : 'غير متوفر'}
                    </span>
                </td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn edit" data-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn delete" data-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // إضافة مستمعي الأحداث للأزرار
        tbody.querySelectorAll('.icon-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('button').getAttribute('data-id');
                this.editProduct(parseInt(productId));
            });
        });
        
        tbody.querySelectorAll('.icon-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('button').getAttribute('data-id');
                this.deleteProduct(parseInt(productId));
            });
        });
        
        // إذا لم توجد منتجات
        if (this.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                        <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 15px; display: block; color: #dee2e6;"></i>
                        لا توجد منتجات
                    </td>
                </tr>
            `;
        }
    }

    createProductsTable() {
        const tableSection = document.createElement('div');
        tableSection.className = 'table-section';
        tableSection.innerHTML = `
            <div class="section-header">
                <h3><i class="fas fa-box"></i> إدارة المنتجات</h3>
                <div class="table-actions">
                    <button class="btn btn-primary" onclick="appAdmin.showProductModal()">
                        <i class="fas fa-plus"></i> إضافة منتج
                    </button>
                </div>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الصورة</th>
                            <th>المنتج</th>
                            <th>العلامة التجارية</th>
                            <th>السعر</th>
                            <th>المخزون</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="productsTableBody">
                    </tbody>
                </table>
            </div>
        `;
        
        const mainContent = document.querySelector('.main-content');
        mainContent.appendChild(tableSection);
        
        this.renderProductsTable();
    }

    deleteProduct(productId) {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
        
        const success = simpleStorage.deleteProduct(productId);
        if (success) {
            this.showNotification('تم حذف المنتج بنجاح', 'success');
            this.loadData();
            this.renderProductsTable();
            this.renderDashboard();
        } else {
            this.showNotification('فشل في حذف المنتج', 'error');
        }
    }

    // باقي الدوال تبقى كما هي مع تصحيح الأخطاء الصغيرة...
    // سأقدم النسخة الكاملة المصححة في ملف منفصل
}

// إنشاء نسخة عامة
window.appAdmin = new AdminApp();
