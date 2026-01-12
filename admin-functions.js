// admin-functions.js - وظائف صفحة الإدارة

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
        
        // زر حفظ الإعدادات
        const saveSettingsBtn = document.querySelector('[onclick*="saveSettings"]');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }
        
        // فلتر الطلبات
        const orderFilter = document.getElementById('orderFilter');
        if (orderFilter) {
            orderFilter.addEventListener('change', (e) => {
                this.filterOrders(e.target.value);
            });
        }
        
        // إغلاق النوافذ
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
        
        // زر التصدير
        const exportBtn = document.querySelector('[onclick*="exportData"]');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportData();
            });
        }
    }

    switchView(view) {
        this.currentView = view;
        
        // إخفاء كل المحتويات
        const tabContents = document.querySelectorAll('.tab-content');
        if (tabContents.length > 0) {
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
        }
        
        // إظهار المحتوى المطلوب
        const targetSection = document.getElementById(`${view}Tab`);
        if (targetSection) {
            targetSection.classList.add('active');
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
        this.loadData(); // تحديث البيانات أولاً
        
        // تحديث بطاقات الإحصائيات
        this.updateStatsCards();
        
        // تحديث الطلبات الأخيرة
        this.renderRecentOrders();
        
        // تحديث المنتجات الأكثر مبيعاً
        this.renderTopProducts();
        
        // تحديث الرسوم البيانية
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
        if (!tbody) return;
        
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

    renderOrdersTable(filter = 'all') {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        let ordersToShow = [...this.orders];
        
        // تطبيق الفلتر
        if (filter !== 'all') {
            ordersToShow = ordersToShow.filter(order => order.status === filter);
        }
        
        // ترتيب حسب التاريخ (الأحدث أولاً)
        ordersToShow.sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));
        
        ordersToShow.forEach((order, index) => {
            const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();
            const formattedDate = orderDate.toLocaleDateString('ar-EG');
            const formattedTime = orderDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${order.orderNumber || `ORD-${order.id}`}</strong></td>
                <td>
                    <div style="font-weight: 700;">${order.customerName}</div>
                    <div style="font-size: 0.85rem; color: #666;">${order.customerPhone}</div>
                </td>
                <td>
                    <div>${formattedDate}</div>
                    <div style="font-size: 0.85rem; color: #666;">${formattedTime}</div>
                </td>
                <td><strong>${order.total ? order.total.toFixed(2) : '0.00'} ${this.settings.currency}</strong></td>
                <td>${order.paymentMethod === 'cash' ? 'نقداً' : 'إلكتروني'}</td>
                <td>
                    <span class="status-badge ${this.getOrderStatusClass(order.status)}">
                        ${this.getOrderStatusText(order.status)}
                    </span>
                </td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn view" data-id="${order.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="icon-btn edit" data-id="${order.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // إضافة مستمعي الأحداث
        tbody.querySelectorAll('.icon-btn.view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('button').getAttribute('data-id');
                this.viewOrderDetails(parseInt(orderId));
            });
        });
        
        tbody.querySelectorAll('.icon-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('button').getAttribute('data-id');
                this.editOrderStatus(parseInt(orderId));
            });
        });
        
        // إذا لم توجد طلبات
        if (ordersToShow.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
                        <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 15px; display: block; color: #dee2e6;"></i>
                        لا توجد طلبات ${filter !== 'all' ? `بحالة "${this.getOrderStatusText(filter)}"` : ''}
                    </td>
                </tr>
            `;
        }
    }

    renderRecentOrders() {
        const container = document.getElementById('recentOrdersDashboard');
        if (!container) return;
        
        // أخذ آخر 5 طلبات
        const recentOrders = [...this.orders]
            .sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0))
            .slice(0, 5);
        
        let html = '';
        recentOrders.forEach(order => {
            const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();
            const formattedDate = orderDate.toLocaleDateString('ar-EG');
            
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 10px; margin-bottom: 10px;">
                    <div>
                        <div style="font-weight: 700; color: #1A1A1A;">${order.orderNumber || `ORD-${order.id}`}</div>
                        <div style="font-size: 0.85rem; color: #666;">${order.customerName}</div>
                    </div>
                    <div style="text-align: left;">
                        <div style="font-weight: 700; color: #1A1A1A;">${order.total ? order.total.toFixed(2) : '0.00'} ${this.settings.currency}</div>
                        <div style="font-size: 0.85rem; color: #666;">${formattedDate}</div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<p style="text-align: center; color: #666; padding: 20px;">لا توجد طلبات حديثة</p>';
    }

    renderTopProducts() {
        const container = document.getElementById('topProductsDashboard');
        if (!container) return;
        
        // أخذ أفضل 5 منتجات حسب المبيعات (محاكاة)
        const topProducts = [...this.products]
            .filter(p => p.available)
            .slice(0, 5);
        
        let html = '';
        topProducts.forEach((product, index) => {
            html += `
                <div style="display: flex; align-items: center; gap: 15px; padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                    <div style="font-weight: 700; color: #4361EE; width: 24px;">${index + 1}</div>
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 700; color: #1A1A1A; font-size: 0.9rem;">${product.name}</div>
                        <div style="font-size: 0.8rem; color: #666;">${product.stock} قطعة</div>
                    </div>
                    <div style="font-weight: 700; color: #2E8B57;">${product.price} ${this.settings.currency}</div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<p style="text-align: center; color: #666; padding: 20px;">لا توجد بيانات</p>';
    }

    renderSettings() {
        // تعبئة حقول الإعدادات
        const settings = this.settings;
        
        const fields = {
            'deliveryFee': settings.deliveryFee,
            'deliveryAreas': settings.deliveryAreas,
            'deliveryTime': settings.deliveryTime,
            'whatsappNumber': settings.whatsappNumber,
            'instagramLink': settings.instagramLink,
            'welcomeMessage': settings.welcomeMessage,
            'siteTitle': settings.siteTitle,
            'siteDescription': settings.siteDescription,
            'freeShippingThreshold': settings.freeShippingThreshold || 300,
            'currency': settings.currency
        };
        
        for (const [id, value] of Object.entries(fields)) {
            const element = document.getElementById(id);
            if (element) {
                element.value = value || '';
            }
        }
    }

    renderAnalytics() {
        // تحديث الرسوم البيانية
        this.updateCharts();
    }

    updateCharts() {
        // محاولة تحديث الرسوم البيانية إذا كانت موجودة
        this.renderSalesChart();
        this.renderCategoryChart();
    }

    renderSalesChart() {
        const canvas = document.getElementById('salesChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // إذا كان هناك رسم بياني موجود، قم بتدميره أولاً
        if (window.salesChartInstance) {
            window.salesChartInstance.destroy();
        }
        
        // بيانات المبيعات الأسبوعية (محاكاة)
        const salesData = {
            labels: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
            datasets: [{
                label: 'المبيعات اليومية',
                data: [1200, 1900, 1500, 2500, 2200, 3000, 2800],
                borderColor: '#4361EE',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        };
        
        window.salesChartInstance = new Chart(ctx, {
            type: 'line',
            data: salesData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                family: 'Tajawal, sans-serif'
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' ' + (this.settings?.currency || 'درهم');
                            }.bind(this)
                        }
                    }
                }
            }
        });
    }

    renderCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (window.categoryChartInstance) {
            window.categoryChartInstance.destroy();
        }
        
        // تحليل فئات المنتجات
        const categories = {};
        this.products.forEach(product => {
            if (Array.isArray(product.category)) {
                product.category.forEach(cat => {
                    categories[cat] = (categories[cat] || 0) + 1;
                });
            } else if (product.category) {
                categories[product.category] = (categories[product.category] || 0) + 1;
            }
        });
        
        const labels = Object.keys(categories);
        const data = Object.values(categories);
        
        const categoryData = {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#4361EE',
                    '#4CC9F0',
                    '#F72585',
                    '#7209B7',
                    '#3A0CA3',
                    '#2E8B57',
                    '#FF9800'
                ].slice(0, labels.length),
                borderWidth: 0
            }]
        };
        
        window.categoryChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: categoryData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                family: 'Tajawal, sans-serif',
                                size: 12
                            },
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    searchProducts(query) {
        if (!query.trim()) {
            this.renderProductsTable();
            return;
        }
        
        const filtered = this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.brand.toLowerCase().includes(query.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        this.renderFilteredProducts(filtered);
    }

    renderFilteredProducts(products) {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        products.forEach((product, index) => {
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
        
        // إضافة مستمعي الأحداث
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
        
        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 15px; display: block; color: #dee2e6;"></i>
                        لا توجد منتجات تطابق البحث
                    </td>
                </tr>
            `;
        }
    }

    filterOrders(status) {
        this.renderOrdersTable(status);
    }

    showProductModal(productId = null) {
        this.editingProductId = productId;
        
        let product = null;
        if (productId) {
            product = simpleStorage.getProduct(productId);
        }
        
        const modalContent = `
            <div style="max-width: 800px; padding: 20px;">
                <h3 style="color: #1A1A1A; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                    <i class="fas ${productId ? 'fa-edit' : 'fa-plus-circle'}"></i>
                    ${productId ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">اسم المنتج *</label>
                        <input type="text" id="modalProductName" 
                               style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;" 
                               value="${product?.name || ''}" 
                               placeholder="أدخل اسم المنتج">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">العلامة التجارية</label>
                        <select id="modalProductBrand" style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;">
                            <option value="DXN" ${product?.brand === 'DXN' ? 'selected' : ''}>DXN</option>
                            <option value="Malaysian Premium" ${product?.brand === 'Malaysian Premium' ? 'selected' : ''}>Malaysian Premium</option>
                            <option value="Golden Malaysia" ${product?.brand === 'Golden Malaysia' ? 'selected' : ''}>Golden Malaysia</option>
                        </select>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">السعر (${this.settings.currency}) *</label>
                        <input type="number" id="modalProductPrice" 
                               style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;" 
                               value="${product?.price || ''}" 
                               placeholder="أدخل السعر">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">كمية المخزون *</label>
                        <input type="number" id="modalProductStock" 
                               style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;" 
                               value="${product?.stock || 0}" 
                               placeholder="أدخل الكمية">
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">وصف المنتج</label>
                    <textarea id="modalProductDescription" 
                              style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px; min-height: 100px;"
                              placeholder="أدخل وصف المنتج">${product?.description || ''}</textarea>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">رابط الصورة</label>
                    <input type="text" id="modalProductImage" 
                           style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;" 
                           value="${product?.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'}" 
                           placeholder="أدخل رابط الصورة">
                    <div style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                        <i class="fas fa-info-circle"></i> استخدم رابط صورة من Unsplash أو أي خدمة استضافة
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">التصنيف</label>
                        <select id="modalProductCategory" style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;">
                            <option value="health" ${product?.category?.includes('health') ? 'selected' : ''}>صحي</option>
                            <option value="energy" ${product?.category?.includes('energy') ? 'selected' : ''}>طاقة</option>
                            <option value="coffee" ${product?.category?.includes('coffee') ? 'selected' : ''}>قهوة</option>
                            <option value="honey" ${product?.category?.includes('honey') ? 'selected' : ''}>عسل</option>
                            <option value="supplement" ${product?.category?.includes('supplement') ? 'selected' : ''}>مكمل غذائي</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">الحالة</label>
                        <select id="modalProductAvailable" style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;">
                            <option value="true" ${product?.available ? 'selected' : ''}>متوفر</option>
                            <option value="false" ${!product?.available ? 'selected' : ''}>غير متوفر</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">الأكثر مبيعاً</label>
                        <select id="modalProductPopular" style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;">
                            <option value="true" ${product?.isPopular ? 'selected' : ''}>نعم</option>
                            <option value="false" ${!product?.isPopular ? 'selected' : ''}>لا</option>
                        </select>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; margin-top: 30px;">
                    <button id="saveProductBtn" 
                            style="flex: 1; background: linear-gradient(45deg, #2E8B57, #4CAF50); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        <i class="fas fa-save"></i> ${productId ? 'تحديث المنتج' : 'حفظ المنتج'}
                    </button>
                    <button class="modal-close" 
                            style="flex: 1; background: #f8f9fa; color: #666; border: 2px solid #e0e0e0; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            </div>
        `;
        
        this.showModal(modalContent);
        
        // إضافة مستمع الأحداث بعد إنشاء النافذة
        setTimeout(() => {
            const saveBtn = document.getElementById('saveProductBtn');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => this.saveProduct());
            }
        }, 100);
    }

    saveProduct() {
        const productData = {
            name: document.getElementById('modalProductName').value,
            brand: document.getElementById('modalProductBrand').value,
            price: parseFloat(document.getElementById('modalProductPrice').value),
            stock: parseInt(document.getElementById('modalProductStock').value),
            description: document.getElementById('modalProductDescription').value,
            image: document.getElementById('modalProductImage').value,
            category: [document.getElementById('modalProductCategory').value],
            available: document.getElementById('modalProductAvailable').value === 'true',
            isPopular: document.getElementById('modalProductPopular').value === 'true'
        };
        
        // التحقق من البيانات
        if (!productData.name || !productData.price) {
            this.showNotification('يرجى إدخال اسم المنتج والسعر', 'error');
            return;
        }
        
        let success = false;
        let message = '';
        
        if (this.editingProductId) {
            // تحديث المنتج
            success = simpleStorage.updateProduct(this.editingProductId, productData);
            message = success ? 'تم تحديث المنتج بنجاح' : 'فشل في تحديث المنتج';
        } else {
            // إضافة منتج جديد
            const newProduct = simpleStorage.addProduct(productData);
            success = !!newProduct;
            message = success ? 'تم إضافة المنتج بنجاح' : 'فشل في إضافة المنتج';
        }
        
        if (success) {
            this.showNotification(message, 'success');
            this.loadData();
            this.renderProductsTable();
            this.closeModal();
        } else {
            this.showNotification(message, 'error');
        }
    }

    editProduct(productId) {
        this.showProductModal(productIddeleteProduct(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    const success = simpleStorage.deleteProduct(productId);
    if (success) {
        this.showNotification('تم حذف المنتج بنجاح', 'success');
        this.loadData();
        this.renderProductsTable();
        this.renderDashboard(); // تحديث لوحة التحكم
    } else {
        this.showNotification('فشل في حذف المنتج', 'error');
    }
}

showOrderModal(orderId = null) {
    this.editingOrderId = orderId;
    
    let order = null;
    if (orderId) {
        order = simpleStorage.getOrder(orderId);
    }
    
    const modalContent = `
        <div style="max-width: 800px; padding: 20px;">
            <h3 style="color: #1A1A1A; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                <i class="fas ${orderId ? 'fa-edit' : 'fa-plus-circle'}"></i>
                ${orderId ? 'تعديل الطلب' : 'إنشاء طلب جديد'}
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">اسم العميل *</label>
                    <input type="text" id="modalCustomerName" 
                           style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;" 
                           value="${order?.customerName || ''}" 
                           placeholder="أدخل اسم العميل">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">رقم الهاتف *</label>
                    <input type="tel" id="modalCustomerPhone" 
                           style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;" 
                           value="${order?.customerPhone || ''}" 
                           placeholder="أدخل رقم الهاتف">
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">العنوان التفصيلي</label>
                <textarea id="modalCustomerAddress" 
                          style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px; min-height: 80px;"
                          placeholder="أدخل العنوان التفصيلي">${order?.address || ''}</textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">طريقة الدفع</label>
                    <select id="modalPaymentMethod" style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;">
                        <option value="cash" ${order?.paymentMethod === 'cash' ? 'selected' : ''}>نقداً عند الاستلام</option>
                        <option value="card" ${order?.paymentMethod === 'card' ? 'selected' : ''}>دفع إلكتروني</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">حالة الطلب</label>
                    <select id="modalOrderStatus" style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;">
                        <option value="new" ${order?.status === 'new' ? 'selected' : ''}>جديد</option>
                        <option value="processing" ${order?.status === 'processing' ? 'selected' : ''}>قيد المعالجة</option>
                        <option value="shipped" ${order?.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
                        <option value="delivered" ${order?.status === 'delivered' ? 'selected' : ''}>تم التسليم</option>
                        <option value="cancelled" ${order?.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                    </select>
                </div>
            </div>
            
            <div id="orderItemsContainer" style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <label style="font-weight: 600; color: #555;">المنتجات المطلوبة</label>
                    <button type="button" id="addOrderItemBtn" style="background: #4361EE; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-plus"></i> إضافة منتج
                    </button>
                </div>
                
                <div id="orderItemsList" style="background: #f8f9fa; border-radius: 8px; padding: 15px; min-height: 100px;">
                    ${order?.items ? this.renderOrderItems(order.items) : '<p style="color: #666; text-align: center;">لم يتم إضافة منتجات</p>'}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">قيمة الطلب</label>
                    <input type="number" id="modalOrderSubtotal" 
                           style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;" 
                           value="${order?.subtotal || 0}" 
                           readonly>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">رسوم التوصيل</label>
                    <input type="number" id="modalOrderDelivery" 
                           style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;" 
                           value="${order?.deliveryFee || this.settings.deliveryFee || 20}">
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">المجموع الكلي</label>
                <input type="number" id="modalOrderTotal" 
                       style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px; font-size: 1.2rem; font-weight: 700; color: #2E8B57;" 
                       value="${order?.total || 0}" 
                       readonly>
            </div>
            
            <div style="display: flex; gap: 15px; margin-top: 30px;">
                <button id="saveOrderBtn" 
                        style="flex: 1; background: linear-gradient(45deg, #4361EE, #3A0CA3); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                    <i class="fas fa-save"></i> ${orderId ? 'تحديث الطلب' : 'حفظ الطلب'}
                </button>
                <button class="modal-close" 
                        style="flex: 1; background: #f8f9fa; color: #666; border: 2px solid #e0e0e0; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                    <i class="fas fa-times"></i> إلغاء
                </button>
            </div>
        </div>
    `;
    
    this.showModal(modalContent);
    
    // إضافة مستمعي الأحداث
    setTimeout(() => {
        const saveBtn = document.getElementById('saveOrderBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveOrder());
        }
        
        const addItemBtn = document.getElementById('addOrderItemBtn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.addOrderItem());
        }
        
        // تحديث المجموع عند تغيير القيم
        const deliveryInput = document.getElementById('modalOrderDelivery');
        const subtotalInput = document.getElementById('modalOrderSubtotal');
        if (deliveryInput && subtotalInput) {
            deliveryInput.addEventListener('input', () => this.calculateOrderTotal());
            subtotalInput.addEventListener('input', () => this.calculateOrderTotal());
        }
    }, 100);
}

renderOrderItems(items) {
    let html = '';
    items.forEach((item, index) => {
        html += `
            <div style="display: flex; align-items: center; gap: 15px; padding: 10px; background: white; border-radius: 5px; margin-bottom: 10px;">
                <div style="flex: 1;">
                    <select class="order-item-product" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;" data-index="${index}">
                        <option value="">اختر منتج</option>
                        ${this.products.filter(p => p.available).map(p => `
                            <option value="${p.id}" ${item.productId === p.id ? 'selected' : ''}>${p.name} - ${p.price} ${this.settings.currency}</option>
                        `).join('')}
                    </select>
                </div>
                <div style="width: 100px;">
                    <input type="number" class="order-item-quantity" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;" 
                           value="${item.quantity || 1}" 
                           min="1" 
                           data-index="${index}"
                           placeholder="الكمية">
                </div>
                <div style="width: 120px; text-align: left; font-weight: 600; color: #1A1A1A;">
                    <span class="order-item-total" data-index="${index}">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)} ${this.settings.currency}
                    </span>
                </div>
                <button type="button" class="remove-order-item" data-index="${index}" 
                        style="background: #f44336; color: white; border: none; width: 30px; height: 30px; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    return html;
}

addOrderItem() {
    const container = document.getElementById('orderItemsList');
    const index = container.children.length;
    
    const itemHTML = `
        <div style="display: flex; align-items: center; gap: 15px; padding: 10px; background: white; border-radius: 5px; margin-bottom: 10px;">
            <div style="flex: 1;">
                <select class="order-item-product" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;" data-index="${index}">
                    <option value="">اختر منتج</option>
                    ${this.products.filter(p => p.available).map(p => `
                        <option value="${p.id}">${p.name} - ${p.price} ${this.settings.currency}</option>
                    `).join('')}
                </select>
            </div>
            <div style="width: 100px;">
                <input type="number" class="order-item-quantity" 
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;" 
                       value="1" 
                       min="1" 
                       data-index="${index}"
                       placeholder="الكمية">
            </div>
            <div style="width: 120px; text-align: left; font-weight: 600; color: #1A1A1A;">
                <span class="order-item-total" data-index="${index}">
                    0.00 ${this.settings.currency}
                </span>
            </div>
            <button type="button" class="remove-order-item" data-index="${index}" 
                    style="background: #f44336; color: white; border: none; width: 30px; height: 30px; border-radius: 5px; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', itemHTML);
    
    // إضافة مستمعي الأحداث للعنصر الجديد
    const newItem = container.lastElementChild;
    const productSelect = newItem.querySelector('.order-item-product');
    const quantityInput = newItem.querySelector('.order-item-quantity');
    const removeBtn = newItem.querySelector('.remove-order-item');
    
    productSelect.addEventListener('change', () => this.updateOrderItemTotal(index));
    quantityInput.addEventListener('input', () => this.updateOrderItemTotal(index));
    removeBtn.addEventListener('click', () => this.removeOrderItem(index));
    
    this.calculateOrderTotal();
}

updateOrderItemTotal(index) {
    const container = document.getElementById('orderItemsList');
    const item = container.children[index];
    
    if (!item) return;
    
    const productSelect = item.querySelector('.order-item-product');
    const quantityInput = item.querySelector('.order-item-quantity');
    const totalSpan = item.querySelector('.order-item-total');
    
    const productId = parseInt(productSelect.value);
    const quantity = parseInt(quantityInput.value) || 1;
    
    if (productId && quantity > 0) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            const total = product.price * quantity;
            totalSpan.textContent = `${total.toFixed(2)} ${this.settings.currency}`;
        }
    } else {
        totalSpan.textContent = `0.00 ${this.settings.currency}`;
    }
    
    this.calculateOrderTotal();
}

removeOrderItem(index) {
    const container = document.getElementById('orderItemsList');
    const item = container.children[index];
    
    if (item) {
        item.remove();
        
        // تحديث بيانات العناصر المتبقية
        const items = container.children;
        for (let i = 0; i < items.length; i++) {
            items[i].querySelectorAll('[data-index]').forEach(el => {
                el.setAttribute('data-index', i);
            });
        }
        
        this.calculateOrderTotal();
    }
}

calculateOrderTotal() {
    const subtotalInput = document.getElementById('modalOrderSubtotal');
    const deliveryInput = document.getElementById('modalOrderDelivery');
    const totalInput = document.getElementById('modalOrderTotal');
    
    if (!subtotalInput || !deliveryInput || !totalInput) return;
    
    // حساب المجموع الفرعي من العناصر
    let subtotal = 0;
    const container = document.getElementById('orderItemsList');
    if (container) {
        const items = container.querySelectorAll('.order-item-total');
        items.forEach(item => {
            const text = item.textContent;
            const match = text.match(/([\d.]+)/);
            if (match) {
                subtotal += parseFloat(match[1]);
            }
        });
    }
    
    const delivery = parseFloat(deliveryInput.value) || 0;
    const total = subtotal + delivery;
    
    subtotalInput.value = subtotal.toFixed(2);
    totalInput.value = total.toFixed(2);
}

saveOrder() {
    const orderData = {
        customerName: document.getElementById('modalCustomerName').value,
        customerPhone: document.getElementById('modalCustomerPhone').value,
        address: document.getElementById('modalCustomerAddress').value,
        paymentMethod: document.getElementById('modalPaymentMethod').value,
        status: document.getElementById('modalOrderStatus').value,
        subtotal: parseFloat(document.getElementById('modalOrderSubtotal').value) || 0,
        deliveryFee: parseFloat(document.getElementById('modalOrderDelivery').value) || 0,
        total: parseFloat(document.getElementById('modalOrderTotal').value) || 0,
        orderDate: new Date().toISOString(),
        orderNumber: `ORD-${Date.now()}`
    };
    
    // جمع عناصر الطلب
    const items = [];
    const container = document.getElementById('orderItemsList');
    if (container) {
        container.querySelectorAll('.order-item-product').forEach((select, index) => {
            const productId = parseInt(select.value);
            const quantityInput = container.querySelector(`.order-item-quantity[data-index="${index}"]`);
            const quantity = parseInt(quantityInput?.value) || 1;
            
            if (productId && quantity > 0) {
                const product = this.products.find(p => p.id === productId);
                if (product) {
                    items.push({
                        productId: productId,
                        productName: product.name,
                        price: product.price,
                        quantity: quantity,
                        total: product.price * quantity
                    });
                }
            }
        });
    }
    
    orderData.items = items;
    
    // التحقق من البيانات
    if (!orderData.customerName || !orderData.customerPhone) {
        this.showNotification('يرجى إدخال اسم العميل ورقم الهاتف', 'error');
        return;
    }
    
    if (items.length === 0) {
        this.showNotification('يرجى إضافة منتجات على الأقل للطلب', 'error');
        return;
    }
    
    let success = false;
    let message = '';
    
    if (this.editingOrderId) {
        // تحديث الطلب
        success = simpleStorage.updateOrder(this.editingOrderId, orderData);
        message = success ? 'تم تحديث الطلب بنجاح' : 'فشل في تحديث الطلب';
    } else {
        // إضافة طلب جديد
        const newOrder = simpleStorage.addOrder(orderData);
        success = !!newOrder;
        message = success ? 'تم إضافة الطلب بنجاح' : 'فشل في إضافة الطلب';
    }
    
    if (success) {
        this.showNotification(message, 'success');
        this.loadData();
        this.renderOrdersTable();
        this.renderDashboard(); // تحديث لوحة التحكم
        this.closeModal();
    } else {
        this.showNotification(message, 'error');
    }
}

viewOrderDetails(orderId) {
    const order = simpleStorage.getOrder(orderId);
    if (!order) return;
    
    const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();
    const formattedDate = orderDate.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = orderDate.toLocaleTimeString('ar-EG', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    let itemsHTML = '';
    if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
            itemsHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toFixed(2)} ${this.settings.currency}</td>
                    <td>${item.total.toFixed(2)} ${this.settings.currency}</td>
                </tr>
            `;
        });
    } else {
        itemsHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                    لا توجد منتجات
                </td>
            </tr>
        `;
    }
    
    const modalContent = `
        <div style="max-width: 800px; padding: 20px;">
            <h3 style="color: #1A1A1A; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                <i class="fas fa-file-invoice"></i> تفاصيل الطلب ${order.orderNumber || `#${orderId}`}
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <h4 style="color: #4361EE; margin-bottom: 10px;">معلومات العميل</h4>
                    <p><strong>الاسم:</strong> ${order.customerName}</p>
                    <p><strong>الهاتف:</strong> ${order.customerPhone}</p>
                    <p><strong>العنوان:</strong> ${order.address || 'لم يتم تحديد العنوان'}</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <h4 style="color: #4361EE; margin-bottom: 10px;">معلومات الطلب</h4>
                    <p><strong>رقم الطلب:</strong> ${order.orderNumber || `ORD-${orderId}`}</p>
                    <p><strong>التاريخ:</strong> ${formattedDate}</p>
                    <p><strong>الوقت:</strong> ${formattedTime}</p>
                    <p><strong>طريقة الدفع:</strong> ${order.paymentMethod === 'cash' ? 'نقداً' : 'إلكتروني'}</p>
                    <p><strong>الحالة:</strong> <span class="status-badge ${this.getOrderStatusClass(order.status)}">${this.getOrderStatusText(order.status)}</span></p>
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h4 style="color: #4361EE; margin-bottom: 15px;">المنتجات المطلوبة</h4>
                <div style="background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f8f9fa;">
                            <tr>
                                <th style="padding: 12px; text-align: right;">#</th>
                                <th style="padding: 12px; text-align: right;">المنتج</th>
                                <th style="padding: 12px; text-align: right;">الكمية</th>
                                <th style="padding: 12px; text-align: right;">السعر</th>
                                <th style="padding: 12px; text-align: right;">المجموع</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: left;">
                        <p><strong>المجموع الفرعي:</strong> ${order.subtotal?.toFixed(2) || '0.00'} ${this.settings.currency}</p>
                        <p><strong>رسوم التوصيل:</strong> ${order.deliveryFee?.toFixed(2) || '0.00'} ${this.settings.currency}</p>
                        <p><strong>المجموع الكلي:</strong> <span style="font-size: 1.2rem; font-weight: 700; color: #2E8B57;">${order.total?.toFixed(2) || '0.00'} ${this.settings.currency}</span></p>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button onclick="appAdmin.sendOrderWhatsapp(${orderId})" 
                            style="background: #25D366; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fab fa-whatsapp"></i> إرسال عبر واتساب
                    </button>
                    <button onclick="appAdmin.printOrder(${orderId})" 
                            style="background: #4361EE; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-print"></i> طباعة الفاتورة
                    </button>
                    <button onclick="appAdmin.editOrderStatus(${orderId})" 
                            style="background: #FF9800; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-edit"></i> تغيير حالة الطلب
                    </button>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; margin-top: 30px;">
                <button class="modal-close" 
                        style="flex: 1; background: #4361EE; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                    <i class="fas fa-check"></i> تمت المراجعة
                </button>
            </div>
        </div>
    `;
    
    this.showModal(modalContent);
}

editOrderStatus(orderId) {
    this.editingOrderId = orderId;
    const order = simpleStorage.getOrder(orderId);
    
    if (!order) return;
    
    const modalContent = `
        <div style="max-width: 500px; padding: 20px;">
            <h3 style="color: #1A1A1A; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                <i class="fas fa-edit"></i> تغيير حالة الطلب ${order.orderNumber || `#${orderId}`}
            </h3>
            
            <div style="margin-bottom: 25px;">
                <p style="color: #666; margin-bottom: 15px;">العميل: <strong>${order.customerName}</strong></p>
                <p style="color: #666; margin-bottom: 25px;">المجموع: <strong>${order.total?.toFixed(2) || '0.00'} ${this.settings.currency}</strong></p>
                
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">حالة الطلب الجديدة</label>
                <select id="newOrderStatus" style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;">
                    <option value="new" ${order.status === 'new' ? 'selected' : ''}>جديد</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>قيد المعالجة</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>تم التسليم</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                </select>
            </div>
            
            <div id="statusNotes" style="margin-bottom: 25px; display: ${order.status === 'cancelled' ? 'block' : 'none'}">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">سبب الإلغاء (اختياري)</label>
                <textarea id="cancelReason" 
                          style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px; min-height: 80px;"
                          placeholder="أدخل سبب الإلغاء...">${order.cancelReason || ''}</textarea>
            </div>
            
            <div style="display: flex; gap: 15px; margin-top: 30px;">
                <button id="updateStatusBtn" 
                        style="flex: 1; background: linear-gradient(45deg, #4361EE, #3A0CA3); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                    <i class="fas fa-save"></i> حفظ التغييرات
                </button>
                <button class="modal-close" 
                        style="flex: 1; background: #f8f9fa; color: #666; border: 2px solid #e0e0e0; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                    <i class="fas fa-times"></i> إلغاء
                </button>
            </div>
        </div>
    `;
    
    this.showModal(modalContent);
    
    setTimeout(() => {
        const statusSelect = document.getElementById('newOrderStatus');
        const updateBtn = document.getElementById('updateStatusBtn');
        const statusNotes = document.getElementById('statusNotes');
        
        if (statusSelect) {
            statusSelect.addEventListener('change', function() {
                if (statusNotes) {
                    statusNotes.style.display = this.value === 'cancelled' ? 'block' : 'none';
                }
            });
        }
        
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.updateOrderStatus());
        }
    }, 100);
}

updateOrderStatus() {
    const newStatus = document.getElementById('newOrderStatus').value;
    const cancelReason = document.getElementById('cancelReason')?.value;
    
    const orderData = {
        status: newStatus
    };
    
    if (newStatus === 'cancelled' && cancelReason) {
        orderData.cancelReason = cancelReason;
    }
    
    const success = simpleStorage.updateOrder(this.editingOrderId, orderData);
    
    if (success) {
        this.showNotification('تم تحديث حالة الطلب بنجاح', 'success');
        this.loadData();
        this.renderOrdersTable();
        this.renderDashboard();
        this.closeModal();
        
        // إرسال إشعار للعميل إذا كان مسجلاً
        this.notifyCustomerStatusChange(this.editingOrderId, newStatus);
    } else {
        this.showNotification('فشل في تحديث حالة الطلب', 'error');
    }
}

notifyCustomerStatusChange(orderId, newStatus) {
    const order = simpleStorage.getOrder(orderId);
    if (!order || !order.customerPhone) return;
    
    const statusText = this.getOrderStatusText(newStatus);
    const message = `مرحباً ${order.customerName}، تم تحديث حالة طلبك ${order.orderNumber} إلى: ${statusText}`;
    
    // في التطبيق الحقيقي، هنا سيتم إرسال رسالة عبر واتساب أو SMS
    console.log(`إشعار للعميل ${order.customerPhone}: ${message}`);
}

getOrderStatusClass(status) {
    const classes = {
        'new': 'status-new',
        'processing': 'status-processing',
        'shipped': 'status-shipped',
        'delivered': 'status-delivered',
        'cancelled': 'status-cancelled'
    };
    return classes[status] || 'status-new';
}

getOrderStatusText(status) {
    const texts = {
        'new': 'جديد',
        'processing': 'قيد المعالجة',
        'shipped': 'تم الشحن',
        'delivered': 'تم التسليم',
        'cancelled': 'ملغي'
    };
    return texts[status] || status;
}

showQuickActions() {
    const modalContent = `
        <div style="max-width: 600px; padding: 20px;">
            <h3 style="color: #1A1A1A; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                <i class="fas fa-bolt"></i> إجراءات سريعة
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                <button onclick="appAdmin.quickAction('addProduct')" 
                        style="background: white; border: 2px solid #eef2f7; padding: 20px; border-radius: 10px; cursor: pointer; transition: all 0.3s;">
                    <div style="color: #4361EE; font-size: 2rem; margin-bottom: 10px;">
                        <i class="fas fa-plus-circle"></i>
                    </div>
                    <div style="font-weight: 700; color: #1A1A1A;">إضافة منتج</div>
                    <div style="font-size: 0.85rem; color: #666;">أضف منتج جديد للمتجر</div>
                </button>
                
                <button onclick="appAdmin.quickAction('createOrder')" 
                        style="background: white; border: 2px solid #eef2f7; padding: 20px; border-radius: 10px; cursor: pointer; transition: all 0.3s;">
                    <div style="color: #2E8B57; font-size: 2rem; margin-bottom: 10px;">
                        <i class="fas fa-cart-plus"></i>
                    </div>
                    <div style="font-weight: 700; color: #1A1A1A;">إنشاء طلب</div>
                    <div style="font-size: 0.85rem; color: #666;">إنشاء طلب يدوي للعميل</div>
                </button>
                
                <button onclick="appAdmin.quickAction('exportData')" 
                        style="background: white; border: 2px solid #eef2f7; padding: 20px; border-radius: 10px; cursor: pointer; transition: all 0.3s;">
                    <div style="color: #FF9800; font-size: 2rem; margin-bottom: 10px;">
                        <i class="fas fa-file-export"></i>
                    </div>
                    <div style="font-weight: 700; color: #1A1A1A;">تصدير البيانات</div>
                    <div style="font-size: 0.85rem; color: #666;">تصدير الطلبات والمنتجات</div>
                </button>
                
                <button onclick="appAdmin.quickAction('backup')" 
                        style="background: white; border: 2px solid #eef2f7; padding: 20px; border-radius: 10px; cursor: pointer; transition: all 0.3s;">
                    <div style="color: #F72585; font-size: 2rem; margin-bottom: 10px;">
                        <i class="fas fa-database"></i>
                    </div>
                    <div style="font-weight: 700; color: #1A1A1A;">نسخ احتياطي</div>
                    <div style="font-size: 0.85rem; color: #666;">إنشاء نسخة احتياطية للبيانات</div>
                </button>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h4 style="color: #4361EE; margin-bottom: 15px;">تنبيهات سريعة</h4>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>الطلبات الجديدة:</span>
                        <strong>${this.orders.filter(o => o.status === 'new').length} طلب</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>منتجات نفدت:</span>
                        <strong>${this.products.filter(p => p.stock <= 0).length} منتج</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>إجمالي المبيعات اليوم:</span>
                        <strong>${this.stats.todayOrders} طلب</strong>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; margin-top: 30px;">
                <button class="modal-close" 
                        style="flex: 1; background: #4361EE; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                    <i class="fas fa-check"></i> تم
                </button>
            </div>
        </div>
    `;
    
    this.showModal(modalContent);
}

quickAction(action) {
    this.closeModal();
    
    switch(action) {
        case 'addProduct':
            this.showProductModal();
            break;
        case 'createOrder':
            this.showOrderModal();
            break;
        case 'exportData':
            this.exportData();
            break;
        case 'backup':
            this.createBackup();
            break;
    }
}

exportData() {
    const data = {
        products: this.products,
        orders: this.orders,
        settings: this.settings,
        exportDate: new Date().toISOString(),
        totalRecords: this.products.length + this.orders.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golden-malaysia-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('تم تصدير البيانات بنجاح', 'success');
}

createBackup() {
    const backupData = {
        timestamp: new Date().toISOString(),
        products: this.products.length,
        orders: this.orders.length,
        settings: this.settings,
        stats: this.stats
    };
    
    // حفظ في LocalStorage
    localStorage.setItem('backup_' + Date.now(), JSON.stringify(backupData));
    
    // حفظ فقط آخر 10 نسخ
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('backup_')) {
            backups.push({ key, data: JSON.parse(localStorage.getItem(key)) });
        }
    }
    
    backups.sort((a, b) => new Date(b.data.timestamp) - new Date(a.data.timestamp));
    
    if (backups.length > 10) {
        for (let i = 10; i < backups.length; i++) {
            localStorage.removeItem(backups[i].key);
        }
    }
    
    this.showNotification('تم إنشاء نسخة احتياطية بنجاح', 'success');
}

saveSettings() {
    const settingsData = {
        deliveryFee: parseFloat(document.getElementById('deliveryFee').value) || 0,
        deliveryAreas: document.getElementById('deliveryAreas').value,
        deliveryTime: document.getElementById('deliveryTime').value,
        whatsappNumber: document.getElementById('whatsappNumber').value,
        instagramLink: document.getElementById('instagramLink').value,
        welcomeMessage: document.getElementById('welcomeMessage').value,
        siteTitle: document.getElementById('siteTitle').value,
        siteDescription: document.getElementById('siteDescription').value,
        freeShippingThreshold: parseFloat(document.getElementById('freeShippingThreshold').value) || 300,
        currency: document.getElementById('currency').value
    };
    
    const success = simpleStorage.saveSettings(settingsData);
    
    if (success) {
        this.showNotification('تم حفظ الإعدادات بنجاح', 'success');
        this.loadData();
        this.renderSettings();
    } else {
        this.showNotification('فشل في حفظ الإعدادات', 'error');
    }
}

updateData() {
    if (this.currentView === 'dashboard') {
        this.loadData();
        this.updateStatsCards();
        this.renderRecentOrders();
        this.renderTopProducts();
    }
    
    if (this.currentView === 'orders') {
        this.loadData();
        this.renderOrdersTable();
    }
}

showModal(content) {
    // إغلاق أي نافذة مفتوحة أولاً
    this.closeModal();
    
    // إنشاء عناصر النافذة
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        z-index: 1000;
    `;
    
    modalContainer.innerHTML = content;
    modalOverlay.appendChild(modalContainer);
    
    // إضافة النافذة إلى الجسم
    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden';
    
    // إضافة CSS إذا لم يكن موجوداً
    if (!document.getElementById('modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 999;
                backdrop-filter: blur(5px);
            }
            .modal-close {
                cursor: pointer;
                transition: all 0.3s;
            }
            .modal-close:hover {
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    }
}

closeModal() {
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
        document.body.style.overflow = 'auto';
    }
}

showNotification(message, type = 'success') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2E8B57' : type === 'error' ? '#f44336' : '#4361EE'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="margin-right: auto; background: none; border: none; color: white; cursor: pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // إضافة أنيميشن إذا لم تكن موجودة
    if (!document.getElementById('notification-animations')) {
        const style = document.createElement('style');
        style.id = 'notification-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // إزالة الإشعار تلقائياً بعد 5 ثوان
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

sendOrderWhatsapp(orderId) {
    const order = simpleStorage.getOrder(orderId);
    if (!order || !order.customerPhone) {
        this.showNotification('لا يوجد رقم هاتف للعميل', 'error');
        return;
    }
    
    const whatsappNumber = this.settings.whatsappNumber || '971501234567';
    const message = `مرحباً ${order.customerName}،
