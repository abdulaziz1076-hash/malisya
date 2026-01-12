// admin-functions.js
// وظائف صفحة الإدارة (admin.html)

class AdminApp {
    constructor() {
        this.currentView = 'dashboard';
        this.editingProductId = null;
        this.editingOrderId = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderDashboard();
        
        // تحديث البيانات كل 10 ثوان
        setInterval(() => this.updateData(), 10000);
    }

    loadData() {
        this.products = sharedStorage.getProducts();
        this.orders = sharedStorage.getOrders();
        this.settings = sharedStorage.getSettings();
        this.stats = this.calculateStats();
    }

    calculateStats() {
        const today = new Date().toISOString().split('T')[0];
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const todayOrders = this.orders.filter(order => 
            order.orderDate.split('T')[0] === today
        );
        
        const lastWeekOrders = this.orders.filter(order => 
            order.orderDate >= lastWeek
        );
        
        const availableProducts = this.products.filter(p => p.available && p.stock > 0);
        
        return {
            totalOrders: this.orders.length,
            todayOrders: todayOrders.length,
            weeklyRevenue: lastWeekOrders.reduce((sum, order) => sum + order.total, 0),
            availableProducts: availableProducts.length,
            pendingOrders: this.orders.filter(o => o.status === 'new').length,
            totalRevenue: this.orders.reduce((sum, order) => sum + order.total, 0)
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
        document.getElementById('menuToggle')?.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
        
        // بحث المنتجات
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }
        
        // زر الإجراء السريع
        document.querySelector('[onclick="showQuickActionModal()"]')?.addEventListener('click', () => {
            this.showQuickActions();
        });
        
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
        
        // إخفاء كل المحتويات
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
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
        document.getElementById('totalOrdersStat')?.textContent = this.stats.totalOrders;
        document.getElementById('todayOrdersStat')?.textContent = this.stats.todayOrders;
        document.getElementById('weeklyRevenueStat')?.textContent = this.stats.weeklyRevenue.toFixed(0);
        document.getElementById('availableProductsStat')?.textContent = this.stats.availableProducts;
        document.getElementById('pendingOrdersStat')?.textContent = this.stats.pendingOrders;
        document.getElementById('totalRevenueStat')?.textContent = this.stats.totalRevenue.toFixed(0);
        
        // تحديث الطلبات الأخيرة
        this.renderRecentOrders();
        
        // تحديث المنتجات الأكثر مبيعاً
        this.renderTopProducts();
        
        // تحديث الرسوم البيانية
        this.updateCharts();
    }

    renderProductsTable() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.products.forEach((product, index) => {
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
                    <div style="font-size: 0.85rem; color: #666;">${product.category?.join(', ') || 'بدون تصنيف'}</div>
                </td>
                <td>${product.brand}</td>
                <td><strong>${product.price} ${this.settings.currency}</strong></td>
                <td>${product.stock}</td>
                <td>
                    <span class="status-badge ${product.available && product.stock > 0 ? 'status-active' : 'status-inactive'}">
                        ${product.available && product.stock > 0 ? 'متوفر' : 'غير متوفر'}
                    </span>
                </td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn edit" onclick="adminApp.editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn delete" onclick="adminApp.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderOrdersTable() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.orders.forEach((order, index) => {
            const orderDate = new Date(order.orderDate);
            const formattedDate = orderDate.toLocaleDateString('ar-EG');
            const formattedTime = orderDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${order.orderNumber}</strong></td>
                <td>
                    <div style="font-weight: 700;">${order.customerName}</div>
                    <div style="font-size: 0.85rem; color: #666;">${order.customerPhone}</div>
                </td>
                <td>
                    <div>${formattedDate}</div>
                    <div style="font-size: 0.85rem; color: #666;">${formattedTime}</div>
                </td>
                <td><strong>${order.total.toFixed(2)} ${this.settings.currency}</strong></td>
                <td>${order.paymentMethod === 'cash' ? 'نقداً' : 'إلكتروني'}</td>
                <td>
                    <span class="status-badge ${this.getOrderStatusClass(order.status)}">
                        ${this.getOrderStatusText(order.status)}
                    </span>
                </td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn view" onclick="adminApp.viewOrderDetails(${order.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="icon-btn edit" onclick="adminApp.editOrderStatus(${order.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderRecentOrders() {
        const container = document.getElementById('recentOrdersDashboard');
        if (!container) return;
        
        const recentOrders = [...this.orders]
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5);
        
        let html = '';
        recentOrders.forEach(order => {
            const orderDate = new Date(order.orderDate);
            const formattedDate = orderDate.toLocaleDateString('ar-EG');
            
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 10px; margin-bottom: 10px;">
                    <div>
                        <div style="font-weight: 700; color: #1A1A1A;">${order.orderNumber}</div>
                        <div style="font-size: 0.85rem; color: #666;">${order.customerName}</div>
                    </div>
                    <div style="text-align: left;">
                        <div style="font-weight: 700; color: #1A1A1A;">${order.total.toFixed(2)} ${this.settings.currency}</div>
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
        
        // حساب أكثر المنتجات مبيعاً (محاكاة)
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
        document.getElementById('deliveryFee')?.value = this.settings.deliveryFee;
        document.getElementById('deliveryAreas')?.value = this.settings.deliveryAreas;
        document.getElementById('deliveryTime')?.value = this.settings.deliveryTime;
        document.getElementById('whatsappNumber')?.value = this.settings.whatsappNumber;
        document.getElementById('instagramLink')?.value = this.settings.instagramLink;
        document.getElementById('welcomeMessage')?.value = this.settings.welcomeMessage;
        document.getElementById('siteTitle')?.value = this.settings.siteTitle;
        document.getElementById('siteDescription')?.value = this.settings.siteDescription;
        document.getElementById('freeShippingThreshold')?.value = this.settings.freeShippingThreshold || 300;
        document.getElementById('currency')?.value = this.settings.currency;
    }

    renderAnalytics() {
        // تحديث الرسوم البيانية
        this.updateCharts();
    }

    updateCharts() {
        // تحديث الرسوم البيانية إذا كانت موجودة
        const salesChart = document.getElementById('salesChart');
        if (salesChart) {
            this.renderSalesChart();
        }
        
        const categoryChart = document.getElementById('categoryChart');
        if (categoryChart) {
            this.renderCategoryChart();
        }
    }

    renderSalesChart() {
        // بيانات المبيعات الأسبوعية (محاكاة)
        const ctx = document.getElementById('salesChart')?.getContext('2d');
        if (!ctx) return;
        
        // إذا كان هناك رسم بياني موجود، قم بتدميره أولاً
        if (window.salesChartInstance) {
            window.salesChartInstance.destroy();
        }
        
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
                                family: 'IBM Plex Sans Arabic'
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' درهم';
                            }
                        }
                    }
                }
            }
        });
    }

    renderCategoryChart() {
        const ctx = document.getElementById('categoryChart')?.getContext('2d');
        if (!ctx) return;
        
        if (window.categoryChartInstance) {
            window.categoryChartInstance.destroy();
        }
        
        const categoryData = {
            labels: ['مشروبات صحية', 'عسل طبيعي', 'مكملات غذائية', 'زيوت طبيعية', 'أخرى'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    '#4361EE',
                    '#4CC9F0',
                    '#F72585',
                    '#7209B7',
                    '#3A0CA3'
                ],
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
                                family: 'IBM Plex Sans Arabic',
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
            product.description?.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderFilteredProducts(filtered);
    }

    renderFilteredProducts(products) {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        products.forEach((product, index) => {
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
                    <div style="font-size: 0.85rem; color: #666;">${product.category?.join(', ') || 'بدون تصنيف'}</div>
                </td>
                <td>${product.brand}</td>
                <td><strong>${product.price} ${this.settings.currency}</strong></td>
                <td>${product.stock}</td>
                <td>
                    <span class="status-badge ${product.available && product.stock > 0 ? 'status-active' : 'status-inactive'}">
                        ${product.available && product.stock > 0 ? 'متوفر' : 'غير متوفر'}
                    </span>
                </td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn edit" onclick="adminApp.editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn delete" onclick="adminApp.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
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

    showProductModal(productId = null) {
        this.editingProductId = productId;
        
        let product = null;
        if (productId) {
            product = sharedStorage.getProduct(productId);
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
                    <button onclick="adminApp.saveProduct()" 
                            style="flex: 1; background: linear-gradient(45deg, #2E8B57, #4CAF50); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        <i class="fas fa-save"></i> ${productId ? 'تحديث المنتج' : 'حفظ المنتج'}
                    </button>
                    <button onclick="adminApp.closeModal()" 
                            style="flex: 1; background: #f8f9fa; color: #666; border: 2px solid #e0e0e0; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            </div>
        `;
        
        this.showModal(modalContent);
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
            success = sharedStorage.updateProduct(this.editingProductId, productData);
            message = success ? 'تم تحديث المنتج بنجاح' : 'فشل في تحديث المنتج';
        } else {
            // إضافة منتج جديد
            const newProduct = sharedStorage.addProduct(productData);
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
        this.showProductModal(productId);
    }

    deleteProduct(productId) {
        this.showConfirmDialog(
            'حذف المنتج',
            'هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.',
            () => {
                const success = sharedStorage.deleteProduct(productId);
                if (success) {
                    this.showNotification('تم حذف المنتج بنجاح', 'success');
                    this.loadData();
                    this.renderProductsTable();
                } else {
                    this.showNotification('فشل في حذف المنتج', 'error');
                }
            }
        );
    }

    viewOrderDetails(orderId) {
        const order = sharedStorage.getOrder(orderId);
        if (!order) return;
        
        const orderDate = new Date(order.orderDate);
        const formattedDate = orderDate.toLocaleDateString('ar-EG');
        const formattedTime = orderDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        
        let productsHtml = '';
        order.products.forEach((item, index) => {
            productsHtml += `
                <div style="display: flex; justify-content: space-between; padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 700;">${item.name}</div>
                        <div style="font-size: 0.85rem; color: #666;">${item.price} ${this.settings.currency} × ${item.quantity}</div>
                    </div>
                    <div style="font-weight: 700;">${(item.price * item.quantity).toFixed(2)} ${this.settings.currency}</div>
                </div>
            `;
        });
        
        const modalContent = `
            <div style="max-width: 700px; padding: 20px;">
                <h3 style="color: #1A1A1A; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                    <i class="fas fa-file-invoice"></i> تفاصيل الطلب ${order.orderNumber}
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <div>
                        <div style="font-weight: 600; color: #555; margin-bottom: 5px;">العميل</div>
                        <div style="font-size: 1.1rem; font-weight: 700;">${order.customerName}</div>
                        <div style="color: #666;">${order.customerPhone}</div>
                    </div>
                    
                    <div>
                        <div style="font-weight: 600; color: #555; margin-bottom: 5px;">التاريخ والوقت</div>
                        <div style="font-size: 1.1rem; font-weight: 700;">${formattedDate}</div>
                        <div style="color: #666;">${formattedTime}</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <div style="font-weight: 600; color: #555; margin-bottom: 10px;">المنتجات</div>
                    ${productsHtml}
                </div>
                
                <div style="margin-bottom: 25px;">
                    <div style="font-weight: 600; color: #555; margin-bottom: 10px;">معلومات الدفع</div>
                    <div style="background: #f0f7f0; padding: 15px; border-radius: 8px; border-right: 4px solid #2E8B57;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>المجموع الجزئي:</span>
                            <span>${order.subtotal.toFixed(2)} ${this.settings.currency}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>رسوم التوصيل:</span>
                            <span>${order.deliveryFee.toFixed(2)} ${this.settings.currency}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.2rem; padding-top: 10px; border-top: 2px solid #ddd;">
                            <span>المجموع الإجمالي:</span>
                            <span style="color: #2E8B57;">${order.total.toFixed(2)} ${this.settings.currency}</span>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <div style="font-weight: 600; color: #555; margin-bottom: 10px;">تغيير حالة الطلب</div>
                    <select id="orderStatusSelect" style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;">
                        <option value="new" ${order.status === 'new' ? 'selected' : ''}>جديد</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>قيد التجهيز</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                    </select>
                </div>
                
                ${order.notes ? `
                    <div style="margin-bottom: 25px;">
                        <div style="font-weight: 600; color: #555; margin-bottom: 10px;">ملاحظات العميل</div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">${order.notes}</div>
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 15px; margin-top: 30px;">
                    <button onclick="adminApp.updateOrderStatus(${order.id})" 
                            style="flex: 1; background: linear-gradient(45deg, #4361EE, #6C63FF); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        <i class="fas fa-save"></i> تحديث الحالة
                    </button>
                    <button onclick="adminApp.closeModal()" 
                            style="flex: 1; background: #f8f9fa; color: #666; border: 2px solid #e0e0e0; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        <i class="fas fa-times"></i> إغلاق
                    </button>
                </div>
            </div>
        `;
        
        this.showModal(modalContent);
    }

    updateOrderStatus(orderId) {
        const newStatus = document.getElementById('orderStatusSelect')?.value;
        if (!newStatus) return;
        
        const success = sharedStorage.updateOrderStatus(orderId, newStatus);
        if (success) {
            this.showNotification('تم تحديث حالة الطلب بنجاح', 'success');
            this.loadData();
            this.renderOrdersTable();
            this.closeModal();
        } else {
            this.showNotification('فشل في تحديث حالة الطلب', 'error');
        }
    }

    editOrderStatus(orderId) {
        this.viewOrderDetails(orderId);
    }

    saveSettings() {
        const settingsData = {
            deliveryFee: parseFloat(document.getElementById('deliveryFee').value) || 30,
            deliveryAreas: document.getElementById('deliveryAreas').value,
            deliveryTime: document.getElementById('deliveryTime').value,
            whatsappNumber: document.getElementById('whatsappNumber').value,
            instagramLink: document.getElementById('instagramLink').value,
            welcomeMessage: document.getElementById('welcomeMessage').value,
            siteTitle: document.getElementById('siteTitle').value,
            siteDescription: document.getElementById('siteDescription').value,
            freeShippingThreshold: parseInt(document.getElementById('freeShippingThreshold').value) || 300,
            currency: document.getElementById('currency').value
        };
        
        const newSettings = sharedStorage.updateSettings(settingsData);
        if (newSettings) {
            this.showNotification('تم حفظ الإعدادات بنجاح', 'success');
            this.settings = newSettings;
        } else {
            this.showNotification('فشل في حفظ الإعدادات', 'error');
        }
    }

    showQuickActions() {
        const modalContent = `
            <div style="max-width: 600px; padding: 30px;">
                <h3 style="color: #1A1A1A; margin-bottom: 25px; text-align: center;">
                    <i class="fas fa-bolt"></i> الإجراءات السريعة
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="text-align: center; padding: 25px; background: #f8f9fa; border-radius: 12px; cursor: pointer; transition: all 0.3s;" 
                         onclick="adminApp.exportData()">
                        <div style="width: 60px; height: 60px; background: linear-gradient(45deg, #4CC9F0, #00B4D8); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: white; font-size: 1.5rem;">
                            <i class="fas fa-file-export"></i>
                        </div>
                        <div style="font-weight: 700; color: #1A1A1A; margin-bottom: 8px;">تصدير البيانات</div>
                        <div style="color: #666; font-size: 0.9rem;">تصدير كافة البيانات إلى ملف</div>
                    </div>
                    
                    <div style="text-align: center; padding: 25px; background: #f8f9fa; border-radius: 12px; cursor: pointer; transition: all 0.3s;" 
                         onclick="adminApp.createBackup()">
                        <div style="width: 60px; height: 60px; background: linear-gradient(45deg, #2E8B57, #4CAF50); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: white; font-size: 1.5rem;">
                            <i class="fas fa-save"></i>
                        </div>
                        <div style="font-weight: 700; color: #1A1A1A; margin-bottom: 8px;">نسخ احتياطي</div>
                        <div style="color: #666; font-size: 0.9rem;">إنشاء نسخة احتياطية للنظام</div>
                    </div>
                    
                    <div style="text-align: center; padding: 25px; background: #f8f9fa; border-radius: 12px; cursor: pointer; transition: all 0.3s;" 
                         onclick="adminApp.clearCache()">
                        <div style="width: 60px; height: 60px; background: linear-gradient(45deg, #F72585, #FF006E); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: white; font-size: 1.5rem;">
                            <i class="fas fa-broom"></i>
                        </div>
                        <div style="font-weight: 700; color: #1A1A1A; margin-bottom: 8px;">تنظيف النظام</div>
                        <div style="color: #666; font-size: 0.9rem;">حذف البيانات المؤقتة</div>
                    </div>
                    
                    <div style="text-align: center; padding: 25px; background: #f8f9fa; border-radius: 12px; cursor: pointer; transition: all 0.3s;" 
                         onclick="adminApp.updateInventory()">
                        <div style="width: 60px; height: 60px; background: linear-gradient(45deg, #4361EE, #6C63FF); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: white; font-size: 1.5rem;">
                            <i class="fas fa-sync"></i>
                        </div>
                        <div style="font-weight: 700; color: #1A1A1A; margin-bottom: 8px;">تحديث المخزون</div>
                        <div style="color: #666; font-size: 0.9rem;">تحديث كميات المنتجات</div>
                    </div>
                </div>
                
                <button onclick="adminApp.closeModal()" 
                        style="width: 100%; margin-top: 30px; background: #f8f9fa; color: #666; border: 2px solid #e0e0e0; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                    <i class="fas fa-times"></i> إغلاق
                </button>
            </div>
        `;
        
        this.showModal(modalContent);
    }

    exportData() {
        const data = sharedStorage.exportData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `golden-malaysia-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('تم تصدير البيانات بنجاح', 'success');
        this.closeModal();
    }

    createBackup() {
        this.showNotification('جاري إنشاء نسخة احتياطية...', 'info');
        
        setTimeout(() => {
            localStorage.setItem('goldenMalaysiaBackup', JSON.stringify(sharedStorage.exportData()));
            this.showNotification('تم إنشاء نسخة احتياطية بنجاح', 'success');
            this.closeModal();
        }, 1000);
    }

    clearCache() {
        this.showConfirmDialog(
            'تنظيف النظام',
            'هل أنت متأكد من تنظيف البيانات المؤقتة؟',
            () => {
                // حذف البيانات المؤقتة (في التطبيق الحقيقي، هذا سيحذف ملفات الكاش)
                this.showNotification('تم تنظيف النظام بنجاح', 'success');
                this.closeModal();
            }
        );
    }

    updateInventory() {
        this.showNotification('جاري تحديث المخزون...', 'info');
        
        setTimeout(() => {
            // في التطبيق الحقيقي، هذا سيتزامن مع قاعدة البيانات
            this.showNotification('تم تحديث المخزون بنجاح', 'success');
            this.closeModal();
        }, 1500);
    }

    showModal(content) {
        // إنشاء النافذة المنبثقة
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease;
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        modalContainer.style.cssText = `
            background: white;
            border-radius: 16px;
            width: 100%;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease;
        `;
        
        modalContainer.innerHTML = `
            <div style="position: relative;">
                <button class="modal-close" style="position: absolute; top: 15px; left: 15px; background: none; border: none; font-size: 1.5rem; color: #999; cursor: pointer; z-index: 1;">&times;</button>
                ${content}
            </div>
        `;
        
        modal.appendChild(modalContainer);
        document.body.appendChild(modal);
        
        // إضافة الأنيميشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `;
        document.head.appendChild(style);
        
        this.currentModal = modal;
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
            this.editingProductId = null;
            this.editingOrderId = null;
        }
    }

    showConfirmDialog(title, message, onConfirm) {
        const modalContent = `
            <div style="text-align: center; padding: 30px;">
                <div style="font-size: 4rem; color: #F72585; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 style="color: #1A1A1A; margin-bottom: 15px;">${title}</h3>
                <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">${message}</p>
                <div style="display: flex; gap: 15px;">
                    <button onclick="adminApp.executeConfirm()" 
                            style="flex: 1; background: linear-gradient(45deg, #F72585, #FF006E); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        <i class="fas fa-check"></i> تأكيد
                    </button>
                    <button onclick="adminApp.closeModal()" 
                            style="flex: 1; background: #f8f9fa; color: #666; border: 2px solid #e0e0e0; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            </div>
        `;
        
        this.confirmCallback = onConfirm;
        this.showModal(modalContent);
    }

    executeConfirm() {
        if (this.confirmCallback) {
            this.confirmCallback();
            this.confirmCallback = null;
        }
        this.closeModal();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#2E8B57' : type === 'error' ? '#D32F2F' : type === 'warning' ? '#FF9800' : '#4361EE'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 600;
            animation: slideDown 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 300px;
            text-align: center;
        `;
        
        const icon = {
            'success': 'fa-check-circle',
            'error': 'fa-times-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        }[type];
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // إضافة أنيميشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown { from { top: -50px; opacity: 0; } to { top: 20px; opacity: 1; } }
            @keyframes slideUp { from { top: 20px; opacity: 1; } to { top: -50px; opacity: 0; } }
        `;
        document.head.appendChild(style);
        
        // إزالة الإشعار بعد 3 ثوان
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getOrderStatusText(status) {
        const statusMap = {
            'new': 'جديد',
            'processing': 'قيد التجهيز',
            'shipped': 'تم الشحن',
            'completed': 'مكتمل',
            'cancelled': 'ملغي'
        };
        return statusMap[status] || status;
    }

    getOrderStatusClass(status) {
        const classMap = {
            'new': 'status-pending',
            'processing': 'status-active',
            'shipped': 'status-active',
            'completed': 'status-completed',
            'cancelled': 'status-inactive'
        };
        return classMap[status] || 'status-pending';
    }

    updateData() {
        const lastUpdate = sharedStorage.getLastUpdate();
        if (lastUpdate !== this.lastDataUpdate) {
            this.loadData();
            this.lastDataUpdate = lastUpdate;
            
            if (this.currentView === 'dashboard') {
                this.renderDashboard();
            } else if (this.currentView === 'products') {
                this.renderProductsTable();
            } else if (this.currentView === 'orders') {
                this.renderOrdersTable();
            }
        }
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.adminApp = new AdminApp();
});
