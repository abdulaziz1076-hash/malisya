// admin-functions.js
class AdminApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.editingProductId = null;
        this.init();
    }

    init() {
        console.log("🛠️ بدء لوحة التحكم الإدارية...");
        this.loadData();
        this.setupEventListeners();
        this.renderDashboard();
        
        // تحديث البيانات كل 10 ثوان
        setInterval(() => this.refreshData(), 10000);
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
        
        return {
            totalOrders: this.orders.length,
            todayOrders: todayOrders.length,
            weeklyRevenue: lastWeekOrders.reduce((sum, order) => sum + (order.total || 0), 0),
            availableProducts: availableProducts.length,
            pendingOrders: this.orders.filter(o => o.status === 'new').length,
            totalRevenue: this.orders.reduce((sum, order) => sum + (order.total || 0), 0)
        };
    }

    setupEventListeners() {
        // القائمة الجانبية
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.getAttribute('data-tab');
                this.switchTab(tab);
                
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
        
        // زر الإجراء السريع
        const quickActionBtn = document.querySelector('.btn-primary');
        if (quickActionBtn && quickActionBtn.textContent.includes('إجراء سريع')) {
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
            showOrderModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    `;
    
    const products = simpleStorage.getProducts().filter(p => p.available && p.stock > 0);
    let productsOptions = '<option value="">اختر منتج</option>';
    products.forEach(product => {
        productsOptions += `<option value="${product.id}">${product.name} - ${product.price} ${this.settings.currency}</option>`;
    });
    
    modal.innerHTML = `
        <div class="modal-container" style="
            background: white;
            border-radius: 15px;
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalSlideIn 0.3s ease;
        ">
            <div class="modal-header" style="
                padding: 25px 30px;
                border-bottom: 1px solid #eef2f7;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <h3 style="color: var(--dark); font-size: 1.5rem;">
                    <i class="fas fa-cart-plus"></i> إنشاء طلب جديد
                </h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove();" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #999;
                    cursor: pointer;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">&times;</button>
            </div>
            
            <div class="modal-body" style="padding: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">اسم العميل *</label>
                        <input type="text" id="modalCustomerName" class="form-control" placeholder="أدخل اسم العميل">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">رقم الهاتف *</label>
                        <input type="tel" id="modalCustomerPhone" class="form-control" placeholder="أدخل رقم الهاتف">
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">العنوان</label>
                    <textarea id="modalCustomerAddress" class="form-control" rows="3" placeholder="أدخل العنوان التفصيلي"></textarea>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <label style="font-weight: 600; color: var(--dark);">المنتجات المطلوبة</label>
                        <button type="button" id="addOrderItemBtn" style="background: #4361EE; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-plus"></i> إضافة منتج
                        </button>
                    </div>
                    
                    <div id="orderItemsList" style="background: #f8f9fa; border-radius: 8px; padding: 15px; min-height: 100px;">
                        <p style="color: #666; text-align: center;">لم يتم إضافة منتجات</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">طريقة الدفع</label>
                        <select id="modalPaymentMethod" class="form-control">
                            <option value="cash">نقداً عند الاستلام</option>
                            <option value="card">دفع إلكتروني</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">رسوم التوصيل</label>
                        <input type="number" id="modalDeliveryFee" class="form-control" value="${this.settings.deliveryFee || 30}">
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>المجموع الفرعي:</span>
                        <span id="modalSubtotal">0.00 ${this.settings.currency}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>رسوم التوصيل:</span>
                        <span id="modalDeliveryDisplay">${this.settings.deliveryFee || 30} ${this.settings.currency}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; padding-top: 10px; border-top: 2px solid #dee2e6;">
                        <span>المجموع الإجمالي:</span>
                        <span id="modalTotal" style="color: var(--success);">${this.settings.deliveryFee || 30} ${this.settings.currency}</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer" style="
                padding: 25px 30px;
                border-top: 1px solid #eef2f7;
                display: flex;
                justify-content: flex-end;
                gap: 15px;
            ">
                <button onclick="this.closest('.modal-overlay').remove();" 
                        style="background: #f8f9fa; color: #666; border: 2px solid #e0e0e0; padding: 12px 24px; border-radius: var(--radius-md); cursor: pointer;">
                    إلغاء
                </button>
                <button onclick="appAdmin.saveManualOrder()" 
                        style="background: linear-gradient(45deg, var(--primary), #6C63FF); color: white; border: none; padding: 12px 24px; border-radius: var(--radius-md); cursor: pointer;">
                    <i class="fas fa-save"></i> إنشاء الطلب
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إضافة الأنيميشن
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(-50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .form-control {
            width: 100%;
            padding: 12px;
            border: 2px solid #eef2f7;
            border-radius: var(--radius-md);
            font-family: 'Tajawal', sans-serif;
        }
    `;
    document.head.appendChild(style);
    
    // إضافة مستمعي الأحداث بعد إنشاء النافذة
    setTimeout(() => {
        const addItemBtn = document.getElementById('addOrderItemBtn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.addOrderItem());
        }
        
        const deliveryInput = document.getElementById('modalDeliveryFee');
        if (deliveryInput) {
            deliveryInput.addEventListener('input', () => this.calculateManualOrderTotal());
        }
    }, 100);
}

addOrderItem() {
    const container = document.getElementById('orderItemsList');
    if (!container) return;
    
    const products = simpleStorage.getProducts().filter(p => p.available && p.stock > 0);
    let productsOptions = '<option value="">اختر منتج</option>';
    products.forEach(product => {
        productsOptions += `<option value="${product.id}" data-price="${product.price}">${product.name} - ${product.price} ${this.settings.currency}</option>`;
    });
    
    const itemHTML = `
        <div class="order-item" style="display: flex; align-items: center; gap: 15px; padding: 10px; background: white; border-radius: 5px; margin-bottom: 10px;">
            <div style="flex: 1;">
                <select class="order-item-product" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;" onchange="appAdmin.updateOrderItemPrice(this)">
                    ${productsOptions}
                </select>
            </div>
            <div style="width: 100px;">
                <input type="number" class="order-item-quantity" 
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;" 
                       value="1" min="1" oninput="appAdmin.calculateManualOrderTotal()" placeholder="الكمية">
            </div>
            <div style="width: 120px; text-align: left; font-weight: 600; color: #1A1A1A;">
                <span class="order-item-price">0.00 ${this.settings.currency}</span>
            </div>
            <button type="button" class="remove-order-item" 
                    style="background: #f44336; color: white; border: none; width: 30px; height: 30px; border-radius: 5px; cursor: pointer;"
                    onclick="this.closest('.order-item').remove(); appAdmin.calculateManualOrderTotal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    if (container.innerHTML.includes('لم يتم إضافة منتجات')) {
        container.innerHTML = itemHTML;
    } else {
        container.insertAdjacentHTML('beforeend', itemHTML);
    }
    
    this.calculateManualOrderTotal();
}

updateOrderItemPrice(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const price = selectedOption.dataset.price || 0;
    const quantityInput = selectElement.closest('.order-item').querySelector('.order-item-quantity');
    const priceSpan = selectElement.closest('.order-item').querySelector('.order-item-price');
    
    priceSpan.textContent = `${(price * (quantityInput.value || 1)).toFixed(2)} ${this.settings.currency}`;
    this.calculateManualOrderTotal();
}

calculateManualOrderTotal() {
    let subtotal = 0;
    
    document.querySelectorAll('.order-item').forEach(item => {
        const select = item.querySelector('.order-item-product');
        const quantityInput = item.querySelector('.order-item-quantity');
        const selectedOption = select.options[select.selectedIndex];
        
        if (selectedOption.value) {
            const price = parseFloat(selectedOption.dataset.price || 0);
            const quantity = parseFloat(quantityInput.value || 1);
            subtotal += price * quantity;
        }
    });
    
    const deliveryFee = parseFloat(document.getElementById('modalDeliveryFee')?.value || this.settings.deliveryFee || 30);
    const total = subtotal + deliveryFee;
    
    document.getElementById('modalSubtotal').textContent = `${subtotal.toFixed(2)} ${this.settings.currency}`;
    document.getElementById('modalDeliveryDisplay').textContent = `${deliveryFee.toFixed(2)} ${this.settings.currency}`;
    document.getElementById('modalTotal').textContent = `${total.toFixed(2)} ${this.settings.currency}`;
}

saveManualOrder() {
    const customerName = document.getElementById('modalCustomerName')?.value;
    const customerPhone = document.getElementById('modalCustomerPhone')?.value;
    const customerAddress = document.getElementById('modalCustomerAddress')?.value || '';
    const paymentMethod = document.getElementById('modalPaymentMethod')?.value || 'cash';
    const deliveryFee = parseFloat(document.getElementById('modalDeliveryFee')?.value || this.settings.deliveryFee || 30);
    
    // جمع عناصر الطلب
    const items = [];
    document.querySelectorAll('.order-item').forEach(item => {
        const select = item.querySelector('.order-item-product');
        const quantityInput = item.querySelector('.order-item-quantity');
        const selectedOption = select.options[select.selectedIndex];
        
        if (selectedOption.value) {
            const productId = parseInt(selectedOption.value);
            const product = simpleStorage.getProduct(productId);
            const quantity = parseInt(quantityInput.value) || 1;
            
            if (product && quantity > 0) {
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
    
    // التحقق من البيانات
    if (!customerName || !customerPhone) {
        this.showAlert('يرجى إدخال اسم العميل ورقم الهاتف', 'error');
        return;
    }
    
    if (items.length === 0) {
        this.showAlert('يرجى إضافة منتجات على الأقل للطلب', 'error');
        return;
    }
    
    // حساب المجاميع
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + deliveryFee;
    
    const orderData = {
        customerName: customerName,
        customerPhone: customerPhone,
        address: customerAddress,
        paymentMethod: paymentMethod,
        items: items,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        status: 'new'
    };
    
    // حفظ الطلب
    const newOrder = simpleStorage.addOrder(orderData);
    
    if (newOrder) {
        this.showAlert('تم إنشاء الطلب بنجاح', 'success');
        this.loadData();
        if (this.currentTab === 'orders') {
            this.renderOrdersTable();
        }
        this.renderDashboard();
        
        // إغلاق النافذة
        document.querySelector('.modal-overlay')?.remove();
    } else {
        this.showAlert('فشل في إنشاء الطلب', 'error');
    }
}
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        this.updatePageTitle(tabName);
        
        // إخفاء كل المحتويات
        const sections = document.querySelectorAll('.tab-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // إظهار المحتوى المطلوب
        const targetSection = document.getElementById(`${tabName}Section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        // تحميل بيانات التبويب
        switch(tabName) {
            case 'products':
                this.renderProductsTable();
                break;
            case 'orders':
                this.renderOrdersTable();
                break;
            case 'dashboard':
                this.renderDashboard();
                break;
        }
    }

    updatePageTitle(tabName) {
        const titles = {
            'dashboard': 'لوحة التحكم الرئيسية',
            'products': 'إدارة المنتجات',
            'orders': 'إدارة الطلبات',
            'customers': 'العملاء',
            'analytics': 'التحليلات',
            'settings': 'الإعدادات'
        };
        
        const headerTitle = document.querySelector('.header-title h1');
        const headerDesc = document.querySelector('.header-title p');
        
        if (headerTitle) {
            headerTitle.innerHTML = `<i class="fas fa-${this.getTabIcon(tabName)}"></i> ${titles[tabName] || tabName}`;
        }
        
        if (headerDesc) {
            headerDesc.textContent = `Golden Malaysia - ${titles[tabName] || tabName}`;
        }
    }

    getTabIcon(tabName) {
        const icons = {
            'dashboard': 'tachometer-alt',
            'products': 'box',
            'orders': 'shopping-cart',
            'customers': 'users',
            'analytics': 'chart-line',
            'settings': 'cogs'
        };
        return icons[tabName] || 'cog';
    }

    renderDashboard() {
        this.loadData();
        this.updateStatsCards();
        this.renderRecentOrders();
        this.renderTopProducts();
    }

    updateStatsCards() {
        const stats = this.stats;
        
        // تحديث بطاقات الإحصائيات في لوحة التحكم
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 4) {
            // بطاقة الطلبات
            statCards[0].querySelector('.stat-value').textContent = stats.totalOrders;
            statCards[0].querySelector('.stat-progress .progress-bar').style.width = 
                Math.min((stats.totalOrders / 100) * 100, 100) + '%';
            
            // بطاقة الإيرادات
            statCards[1].querySelector('.stat-value').textContent = stats.totalRevenue.toFixed(0);
            statCards[1].querySelector('.stat-progress .progress-bar').style.width = 
                Math.min((stats.totalRevenue / 100000) * 100, 100) + '%';
            
            // بطاقة العملاء (تقديرية)
            statCards[2].querySelector('.stat-value').textContent = stats.pendingOrders;
            statCards[2].querySelector('.stat-progress .progress-bar').style.width = 
                Math.min((stats.pendingOrders / 50) * 100, 100) + '%';
            
            // بطاقة المنتجات
            statCards[3].querySelector('.stat-value').textContent = stats.availableProducts;
            statCards[3].querySelector('.stat-progress .progress-bar').style.width = 
                Math.min((stats.availableProducts / 200) * 100, 100) + '%';
        }
    }

    renderRecentOrders() {
        const tbody = document.getElementById('recentOrdersTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // عرض آخر 5 طلبات
        const recentOrders = [...this.orders]
            .sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0))
            .slice(0, 5);
        
        recentOrders.forEach(order => {
            const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();
            const formattedDate = orderDate.toLocaleDateString('ar-EG');
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${order.orderNumber || `ORD-${order.id}`}</strong></td>
                <td>${order.customerName}</td>
                <td>${formattedDate}</td>
                <td><strong>${order.total ? order.total.toFixed(2) : '0.00'} ${this.settings.currency}</strong></td>
                <td>${order.paymentMethod === 'cash' ? 'نقداً' : 'إلكتروني'}</td>
                <td>
                    <span class="status-badge ${this.getOrderStatusClass(order.status)}">
                        ${this.getOrderStatusText(order.status)}
                    </span>
                </td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn view" onclick="appAdmin.viewOrder(${order.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="icon-btn edit" onclick="appAdmin.editOrder(${order.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderTopProducts() {
        const tbody = document.getElementById('topProductsTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // عرض أفضل 5 منتجات حسب المخزون (كمثال)
        const topProducts = [...this.products]
            .filter(p => p.available)
            .sort((a, b) => b.stock - a.stock)
            .slice(0, 5);
        
        topProducts.forEach(product => {
            const salesEstimate = Math.floor(product.stock * 0.8); // تقدير المبيعات
            const revenue = salesEstimate * product.price;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${product.name}</strong></td>
                <td><span class="category-tag">${Array.isArray(product.category) ? product.category[0] : product.category || 'عام'}</span></td>
                <td>${salesEstimate}</td>
                <td><strong>${revenue.toFixed(2)} ${this.settings.currency}</strong></td>
                <td>
                    <span class="status-badge ${product.stock > 20 ? 'status-active' : product.stock > 0 ? 'status-pending' : 'status-inactive'}">
                        ${product.stock}
                    </span>
                </td>
                <td>
                    <div style="color: #FFC107;">
                        ${'★'.repeat(4)}☆
                        <span style="color: #666; margin-right: 5px;">(4.5)</span>
                    </div>
                </td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn edit" onclick="appAdmin.editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getOrderStatusClass(status) {
        const classes = {
            'new': 'status-pending',
            'processing': 'status-active',
            'shipped': 'status-active',
            'delivered': 'status-completed',
            'cancelled': 'status-inactive'
        };
        return classes[status] || 'status-pending';
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

    showProductModal(productId = null) {
        this.editingProductId = productId;
        let product = null;
        
        if (productId) {
            product = simpleStorage.getProduct(productId);
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div class="modal-container" style="
                background: white;
                border-radius: 15px;
                width: 100%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                animation: modalSlideIn 0.3s ease;
            ">
                <div class="modal-header" style="
                    padding: 25px 30px;
                    border-bottom: 1px solid #eef2f7;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="color: var(--dark); font-size: 1.5rem;">
                        <i class="fas ${productId ? 'fa-edit' : 'fa-plus-circle'}"></i>
                        ${productId ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                    </h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove();" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        color: #999;
                        cursor: pointer;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">&times;</button>
                </div>
                
                <div class="modal-body" style="padding: 30px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">اسم المنتج *</label>
                            <input type="text" id="productName" 
                                   style="width: 100%; padding: 14px; border: 2px solid #eef2f7; border-radius: var(--radius-md);" 
                                   value="${product?.name || ''}" 
                                   placeholder="أدخل اسم المنتج">
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">العلامة التجارية</label>
                            <select id="productBrand" style="width: 100%; padding: 14px; border: 2px solid #eef2f7; border-radius: var(--radius-md);">
                                <option value="DXN" ${product?.brand === 'DXN' ? 'selected' : ''}>DXN</option>
                                <option value="Malaysian Premium" ${product?.brand === 'Malaysian Premium' ? 'selected' : ''}>Malaysian Premium</option>
                                <option value="Golden Malaysia" ${product?.brand === 'Golden Malaysia' ? 'selected' : ''}>Golden Malaysia</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">السعر (${this.settings.currency}) *</label>
                            <input type="number" id="productPrice" 
                                   style="width: 100%; padding: 14px; border: 2px solid #eef2f7; border-radius: var(--radius-md);" 
                                   value="${product?.price || ''}" 
                                   placeholder="أدخل السعر">
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">كمية المخزون *</label>
                            <input type="number" id="productStock" 
                                   style="width: 100%; padding: 14px; border: 2px solid #eef2f7; border-radius: var(--radius-md);" 
                                   value="${product?.stock || 0}" 
                                   placeholder="أدخل الكمية">
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">وصف المنتج</label>
                        <textarea id="productDescription" 
                                  style="width: 100%; padding: 14px; border: 2px solid #eef2f7; border-radius: var(--radius-md); min-height: 100px;"
                                  placeholder="أدخل وصف المنتج">${product?.description || ''}</textarea>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">رابط الصورة</label>
                        <input type="text" id="productImage" 
                               style="width: 100%; padding: 14px; border: 2px solid #eef2f7; border-radius: var(--radius-md);" 
                               value="${product?.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}" 
                               placeholder="أدخل رابط الصورة">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">التصنيف</label>
                            <select id="productCategory" style="width: 100%; padding: 14px; border: 2px solid #eef2f7; border-radius: var(--radius-md);">
                                <option value="health" ${product?.category?.includes('health') ? 'selected' : ''}>صحي</option>
                                <option value="energy" ${product?.category?.includes('energy') ? 'selected' : ''}>طاقة</option>
                                <option value="coffee" ${product?.category?.includes('coffee') ? 'selected' : ''}>قهوة</option>
                                <option value="honey" ${product?.category?.includes('honey') ? 'selected' : ''}>عسل</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">الحالة</label>
                            <select id="productAvailable" style="width: 100%; padding: 14px; border: 2px solid #eef2f7; border-radius: var(--radius-md);">
                                <option value="true" ${product?.available ? 'selected' : ''}>متوفر</option>
                                <option value="false" ${!product?.available ? 'selected' : ''}>غير متوفر</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">الأكثر مبيعاً</label>
                            <select id="productPopular" style="width: 100%; padding: 14px; border: 2px solid #eef2f7; border-radius: var(--radius-md);">
                                <option value="true" ${product?.isPopular ? 'selected' : ''}>نعم</option>
                                <option value="false" ${!product?.isPopular ? 'selected' : ''}>لا</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer" style="
                    padding: 25px 30px;
                    border-top: 1px solid #eef2f7;
                    display: flex;
                    justify-content: flex-end;
                    gap: 15px;
                ">
                    <button onclick="this.closest('.modal-overlay').remove();" 
                            style="background: #f8f9fa; color: #666; border: 2px solid #e0e0e0; padding: 12px 24px; border-radius: var(--radius-md); cursor: pointer;">
                        إلغاء
                    </button>
                    <button onclick="appAdmin.saveProduct()" 
                            style="background: linear-gradient(45deg, var(--primary), #6C63FF); color: white; border: none; padding: 12px 24px; border-radius: var(--radius-md); cursor: pointer;">
                        ${productId ? 'تحديث المنتج' : 'حفظ المنتج'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إضافة الأنيميشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(-50px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    saveProduct() {
        const productData = {
            name: document.getElementById('productName').value,
            brand: document.getElementById('productBrand').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            description: document.getElementById('productDescription').value,
            image: document.getElementById('productImage').value,
            category: [document.getElementById('productCategory').value],
            available: document.getElementById('productAvailable').value === 'true',
            isPopular: document.getElementById('productPopular').value === 'true'
        };
        
        // التحقق من البيانات
        if (!productData.name || !productData.price || isNaN(productData.price)) {
            this.showAlert('يرجى إدخال اسم المنتج والسعر بشكل صحيح', 'error');
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
            this.showAlert(message, 'success');
            this.loadData();
            if (this.currentTab === 'products') {
                this.renderProductsTable();
            }
            this.renderDashboard();
            
            // إغلاق النافذة
            document.querySelector('.modal-overlay')?.remove();
        } else {
            this.showAlert(message, 'error');
        }
    }

    editProduct(productId) {
        this.showProductModal(productId);
    }

    deleteProduct(productId) {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
        
        const success = simpleStorage.deleteProduct(productId);
        if (success) {
            this.showAlert('تم حذف المنتج بنجاح', 'success');
            this.loadData();
            if (this.currentTab === 'products') {
                this.renderProductsTable();
            }
            this.renderDashboard();
        } else {
            this.showAlert('فشل في حذف المنتج', 'error');
        }
    }

    renderProductsTable() {
        // إنشاء جدول المنتجات إذا لم يكن موجوداً
        let tableSection = document.getElementById('productsSection');
        if (!tableSection) {
            tableSection = document.createElement('div');
            tableSection.id = 'productsSection';
            tableSection.className = 'tab-section table-section';
            tableSection.style.display = 'block';
            
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
            
            document.querySelector('.main-content').appendChild(tableSection);
        }
        
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
                    <div style="font-size: 0.85rem; color: #666;">${product.description.substring(0, 50)}...</div>
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
                        <button class="icon-btn edit" onclick="appAdmin.editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn delete" onclick="appAdmin.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderOrdersTable() {
        // إنشاء جدول الطلبات إذا لم يكن موجوداً
        let tableSection = document.getElementById('ordersSection');
        if (!tableSection) {
            tableSection = document.createElement('div');
            tableSection.id = 'ordersSection';
            tableSection.className = 'tab-section table-section';
            tableSection.style.display = 'block';
            
            tableSection.innerHTML = `
                <div class="section-header">
                    <h3><i class="fas fa-shopping-cart"></i> إدارة الطلبات</h3>
                    <div class="table-actions">
                        <select id="orderFilter" style="padding: 8px 15px; border: 2px solid #eef2f7; border-radius: var(--radius-md);">
                            <option value="all">جميع الطلبات</option>
                            <option value="new">جديد</option>
                            <option value="processing">قيد المعالجة</option>
                            <option value="delivered">تم التسليم</option>
                        </select>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>رقم الطلب</th>
                                <th>العميل</th>
                                <th>التاريخ</th>
                                <th>المبلغ</th>
                                <th>طريقة الدفع</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTableBody">
                        </tbody>
                    </table>
                </div>
            `;
            
            document.querySelector('.main-content').appendChild(tableSection);
            
            // إضافة مستمع الحدث للفلتر
            setTimeout(() => {
                const filter = document.getElementById('orderFilter');
                if (filter) {
                    filter.addEventListener('change', (e) => {
                        this.filterOrders(e.target.value);
                    });
                }
            }, 100);
        }
        
        this.filterOrders('all');
    }

    filterOrders(status) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        let filteredOrders = this.orders;
        if (status !== 'all') {
            filteredOrders = this.orders.filter(order => order.status === status);
        }
        
        filteredOrders.forEach(order => {
            const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();
            const formattedDate = orderDate.toLocaleDateString('ar-EG');
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${order.orderNumber || `ORD-${order.id}`}</strong></td>
                <td>
                    <div style="font-weight: 700;">${order.customerName}</div>
                    <div style="font-size: 0.85rem; color: #666;">${order.customerPhone}</div>
                </td>
                <td>${formattedDate}</td>
                <td><strong>${order.total ? order.total.toFixed(2) : '0.00'} ${this.settings.currency}</strong></td>
                <td>${order.paymentMethod === 'cash' ? 'نقداً' : 'إلكتروني'}</td>
                <td>
                    <span class="status-badge ${this.getOrderStatusClass(order.status)}">
                        ${this.getOrderStatusText(order.status)}
                    </span>
                </td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn view" onclick="appAdmin.viewOrder(${order.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="icon-btn edit" onclick="appAdmin.editOrderStatus(${order.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    viewOrder(orderId) {
        const order = simpleStorage.getOrder(orderId);
        if (!order) return;
        
        const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();
        const formattedDate = orderDate.toLocaleDateString('ar-EG');
        
        let itemsHTML = '';
        if (order.items && order.items.length > 0) {
            order.items.forEach((item, index) => {
                itemsHTML += `
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; border-radius: 5px; margin-bottom: 5px;">
                        <span>${item.productName}</span>
                        <span>${item.quantity} × ${item.price} ${this.settings.currency} = ${item.total} ${this.settings.currency}</span>
                    </div>
                `;
            });
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div class="modal-container" style="
                background: white;
                border-radius: 15px;
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                animation: modalSlideIn 0.3s ease;
            ">
                <div class="modal-header" style="
                    padding: 25px 30px;
                    border-bottom: 1px solid #eef2f7;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="color: var(--dark); font-size: 1.5rem;">
                        <i class="fas fa-file-invoice"></i> تفاصيل الطلب ${order.orderNumber}
                    </h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove();" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        color: #999;
                        cursor: pointer;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">&times;</button>
                </div>
                
                <div class="modal-body" style="padding: 30px;">
                    <div style="margin-bottom: 25px;">
                        <h4 style="color: var(--primary); margin-bottom: 15px;">معلومات العميل</h4>
                        <p><strong>الاسم:</strong> ${order.customerName}</p>
                        <p><strong>الهاتف:</strong> ${order.customerPhone}</p>
                        <p><strong>العنوان:</strong> ${order.address || 'لم يتم تحديد العنوان'}</p>
                        <p><strong>التاريخ:</strong> ${formattedDate}</p>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <h4 style="color: var(--primary); margin-bottom: 15px;">المنتجات</h4>
                        ${itemsHTML || '<p>لا توجد منتجات</p>'}
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>المجموع الفرعي:</span>
                            <span>${order.subtotal?.toFixed(2) || '0.00'} ${this.settings.currency}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>رسوم التوصيل:</span>
                            <span>${order.deliveryFee?.toFixed(2) || '0.00'} ${this.settings.currency}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; padding-top: 10px; border-top: 2px solid #dee2e6;">
                            <span>المجموع الإجمالي:</span>
                            <span>${order.total?.toFixed(2) || '0.00'} ${this.settings.currency}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    editOrderStatus(orderId) {
        const order = simpleStorage.getOrder(orderId);
        if (!order) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div class="modal-container" style="
                background: white;
                border-radius: 15px;
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                animation: modalSlideIn 0.3s ease;
            ">
                <div class="modal-header" style="
                    padding: 25px 30px;
                    border-bottom: 1px solid #eef2f7;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="color: var(--dark); font-size: 1.5rem;">
                        <i class="fas fa-edit"></i> تغيير حالة الطلب
                    </h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove();" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        color: #999;
                        cursor: pointer;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">&times;</button>
                </div>
                
                <div class="modal-body" style="padding: 30px;">
                    <p style="margin-bottom: 20px;">الطلب: <strong>${order.orderNumber}</strong></p>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--dark);">حالة الطلب الجديدة</label>
                        <select id="newOrderStatus" style="width: 100%; padding: 14px; border: 2px solid #eef2f7; border-radius: var(--radius-md);">
                            <option value="new" ${order.status === 'new' ? 'selected' : ''}>جديد</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>قيد المعالجة</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>تم التسليم</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                        </select>
                    </div>
                    
                    <button onclick="appAdmin.updateOrderStatus(${orderId})" 
                            style="background: linear-gradient(45deg, var(--primary), #6C63FF); color: white; border: none; padding: 12px 24px; border-radius: var(--radius-md); cursor: pointer; width: 100%;">
                        <i class="fas fa-save"></i> حفظ التغييرات
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    updateOrderStatus(orderId) {
        const newStatus = document.getElementById('newOrderStatus').value;
        
        const success = simpleStorage.updateOrder(orderId, { status: newStatus });
        
        if (success) {
            this.showAlert('تم تحديث حالة الطلب بنجاح', 'success');
            this.loadData();
            this.renderOrdersTable();
            this.renderDashboard();
            document.querySelector('.modal-overlay')?.remove();
        } else {
            this.showAlert('فشل في تحديث حالة الطلب', 'error');
        }
    }

    showQuickActions() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div class="modal-container" style="
                background: white;
                border-radius: 15px;
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                animation: modalSlideIn 0.3s ease;
            ">
                <div class="modal-header" style="
                    padding: 25px 30px;
                    border-bottom: 1px solid #eef2f7;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="color: var(--dark); font-size: 1.5rem;">
                        <i class="fas fa-bolt"></i> إجراءات سريعة
                    </h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove();" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        color: #999;
                        cursor: pointer;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">&times;</button>
                </div>
                
                <div class="modal-body" style="padding: 30px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; cursor: pointer;" 
                             onclick="appAdmin.showProductModal()">
                            <div style="color: var(--primary); font-size: 2rem; margin-bottom: 10px;">
                                <i class="fas fa-plus-circle"></i>
                            </div>
                            <div style="font-weight: 700; color: var(--dark);">إضافة منتج</div>
                            <div style="font-size: 0.9rem; color: #666;">أضف منتج جديد للمتجر</div>
                        </div>
                        
                        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; cursor: pointer;"
                             onclick="appAdmin.exportData()">
                            <div style="color: var(--success); font-size: 2rem; margin-bottom: 10px;">
                                <i class="fas fa-file-export"></i>
                            </div>
                            <div style="font-weight: 700; color: var(--dark);">تصدير البيانات</div>
                            <div style="font-size: 0.9rem; color: #666;">تصدير الطلبات والمنتجات</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    exportData() {
        const data = {
            products: this.products,
            orders: this.orders,
            settings: this.settings,
            exportDate: new Date().toISOString()
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
        
        this.showAlert('تم تصدير البيانات بنجاح', 'success');
        document.querySelector('.modal-overlay')?.remove();
    }

    refreshData() {
        if (this.currentTab === 'dashboard') {
            this.loadData();
            this.updateStatsCards();
        }
    }

    showAlert(message, type = 'success') {
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            font-family: 'IBM Plex Sans Arabic', sans-serif;
            min-width: 300px;
        `;
        
        alert.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span style="margin-right: 10px;">${message}</span>
        `;
        
        document.body.appendChild(alert);
        
        // إزالة الإشعار بعد 3 ثوان
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (alert.parentElement) {
                    alert.remove();
                }
            }, 300);
        }, 3000);
        
        // إضافة الأنيميشن إذا لم تكن موجودة
        if (!document.getElementById('admin-alert-animations')) {
            const style = document.createElement('style');
            style.id = 'admin-alert-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// إنشاء نسخة عالمية
window.appAdmin = new AdminApp();

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تأخير بسيط للتأكد من تحميل كل شيء
    setTimeout(() => {
        window.appAdmin.init();
    }, 100);
});
