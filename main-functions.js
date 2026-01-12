// main-functions.js - وظائف الصفحة الرئيسية

class MainApp {
    constructor() {
        this.cart = [];
        this.total = 0;
        this.products = [];
        this.settings = {};
        
        this.init();
    }

    init() {
        this.loadProducts();
        this.loadSettings();
        this.setupEventListeners();
        this.updateCartDisplay();
        
        // تحميل عربة التسوق من localStorage
        this.loadCartFromStorage();
    }

    loadProducts() {
        this.products = simpleStorage.getProducts();
        this.renderProducts();
    }

    loadSettings() {
        this.settings = simpleStorage.getSettings();
    }

    setupEventListeners() {
        // زر التمرير للمنتجات
        const scrollBtn = document.getElementById('scrollToProducts');
        if (scrollBtn) {
            scrollBtn.addEventListener('click', () => {
                document.getElementById('productsSection').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        }

        // فلتر المنتجات
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('onclick').match(/filterProducts\('([^']+)'\)/)[1];
                this.filterProducts(filter);
            });
        });

        // تحديث عربة التسوق
        document.addEventListener('cartUpdated', () => {
            this.updateCartDisplay();
        });

        // زر إتمام الطلب
        const checkoutBtn = document.getElementById('checkoutBtnPremium');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.openOrderModal();
            });
        }
    }

    renderProducts() {
        const container = document.getElementById('productsGridPremium');
        if (!container) return;

        container.innerHTML = '';

        this.products.forEach(product => {
            const productCard = this.createProductCard(product);
            container.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card-premium';
        card.dataset.id = product.id;
        card.dataset.category = Array.isArray(product.category) ? product.category.join(' ') : product.category;

        const badges = [];
        if (product.isPopular) badges.push('<span class="product-badge-premium badge-popular"><i class="fas fa-fire"></i> الأكثر مبيعاً</span>');
        if (product.isNew) badges.push('<span class="product-badge-premium badge-new"><i class="fas fa-star"></i> جديد</span>');
        if (!product.available || product.stock <= 0) badges.push('<span class="product-badge-premium badge-out"><i class="fas fa-times"></i> غير متوفر</span>');

        card.innerHTML = `
            <div class="product-badge-container">
                ${badges.join('')}
            </div>
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image-premium">
                <div class="product-overlay">
                    <button class="btn-premium btn-primary-premium" onclick="appMain.addToCart(${product.id})" 
                            ${!product.available || product.stock <= 0 ? 'disabled' : ''}>
                        <i class="fas ${!product.available || product.stock <= 0 ? 'fa-times' : 'fa-cart-plus'}"></i>
                        ${!product.available || product.stock <= 0 ? 'غير متوفر' : 'أضف إلى العربة'}
                    </button>
                </div>
            </div>
            <div class="product-info-premium">
                <div class="product-brand-premium">${product.brand}</div>
                <h3 class="product-title-premium">${product.name}</h3>
                <p class="product-description-premium">${product.description}</p>
                <div class="product-price-premium">
                    <div class="price-main">${product.price} ${this.settings.currency || 'درهم'}</div>
                    ${product.originalPrice && product.originalPrice > product.price ? 
                        `<div class="price-original">${product.originalPrice} ${this.settings.currency || 'درهم'}</div>` : ''}
                </div>
                <div class="product-actions-premium">
                    <button class="btn-product-action btn-details-premium" onclick="appMain.showProductDetails(${product.id})">
                        <i class="fas fa-info-circle"></i> التفاصيل
                    </button>
                    <button class="btn-product-action btn-cart-premium" 
                            onclick="appMain.addToCart(${product.id})"
                            ${!product.available || product.stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> إضافة
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    filterProducts(category) {
        const products = document.querySelectorAll('.product-card-premium');
        const filterButtons = document.querySelectorAll('.filter-btn');

        // تحديث الأزرار النشطة
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('onclick').includes(`'${category}'`)) {
                btn.classList.add('active');
            }
        });

        // فلتر المنتجات
        products.forEach(product => {
            if (category === 'all') {
                product.style.display = 'block';
            } else if (category === 'popular') {
                product.style.display = product.dataset.category.includes('popular') ? 'block' : 'none';
            } else if (category === 'new') {
                product.style.display = product.dataset.category.includes('new') ? 'block' : 'none';
            } else {
                product.style.display = product.dataset.category.includes(category) ? 'block' : 'none';
            }
        });
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !product.available || product.stock <= 0) {
            this.showNotification('المنتج غير متوفر حالياً', 'error');
            return;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                this.showNotification('لا يمكن إضافة المزيد، الكمية المتاحة: ' + product.stock, 'warning');
                return;
            }
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
                stock: product.stock
            });
        }

        this.saveCartToStorage();
        this.updateCartDisplay();
        this.showNotification(`تم إضافة ${product.name} إلى العربة`, 'success');
        
        // إرسال حدث تحديث العربة
        document.dispatchEvent(new Event('cartUpdated'));
    }

    removeFromCart(productId) {
        const index = this.cart.findIndex(item => item.id === productId);
        if (index !== -1) {
            this.cart.splice(index, 1);
            this.saveCartToStorage();
            this.updateCartDisplay();
            document.dispatchEvent(new Event('cartUpdated'));
        }
    }

    updateCartDisplay() {
        this.calculateTotal();
        
        const orderBar = document.getElementById('orderBarPremium');
        const orderCount = document.getElementById('orderCountPremium');
        const orderTotal = document.getElementById('orderTotalPremium');
        const orderItems = document.getElementById('orderItemsPremium');
        
        if (this.cart.length > 0) {
            if (orderBar) orderBar.style.display = 'flex';
            if (orderCount) orderCount.textContent = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            if (orderTotal) orderTotal.textContent = `${this.total.toFixed(2)} ${this.settings.currency || 'درهم'}`;
            if (orderItems) {
                const itemText = this.cart.length === 1 ? 'منتج واحد' : `${this.cart.length} منتجات`;
                orderItems.textContent = itemText;
            }
        } else {
            if (orderBar) orderBar.style.display = 'none';
        }
    }

    calculateTotal() {
        this.total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    saveCartToStorage() {
        localStorage.setItem('goldenMalaysiaCart', JSON.stringify(this.cart));
    }

    loadCartFromStorage() {
        const savedCart = localStorage.getItem('goldenMalaysiaCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }

    openOrderModal() {
        if (this.cart.length === 0) {
            this.showNotification('عربة التسوق فارغة', 'warning');
            return;
        }

        const modalContent = this.createOrderModalContent();
        this.showModal(modalContent, 'order-modal');
    }

    createOrderModalContent() {
        let itemsHTML = '';
        this.cart.forEach((item, index) => {
            itemsHTML += `
                <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; margin-bottom: 10px;">
                    <img src="${item.image}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                    <div style="flex: 1;">
                        <div style="font-weight: 700; color: #1A1A1A;">${item.name}</div>
                        <div style="color: #666; font-size: 0.9rem;">${item.price} ${this.settings.currency} × ${item.quantity}</div>
                    </div>
                    <div style="font-weight: 700; color: #4361EE;">${(item.price * item.quantity).toFixed(2)} ${this.settings.currency}</div>
                    <button onclick="appMain.removeFromCart(${item.id})" 
                            style="background: #f44336; color: white; border: none; width: 30px; height: 30px; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        return `
            <div style="max-width: 600px; padding: 20px;">
                <h3 style="color: #1A1A1A; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                    <i class="fas fa-shopping-cart"></i> إتمام الطلب
                </h3>
                
                <div style="margin-bottom: 25px;">
                    <h4 style="color: #4361EE; margin-bottom: 15px;">المنتجات المختارة</h4>
                    ${itemsHTML}
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>المجموع الفرعي:</span>
                        <span><strong>${this.total.toFixed(2)} ${this.settings.currency}</strong></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>رسوم التوصيل:</span>
                        <span><strong>${this.settings.deliveryFee || 30} ${this.settings.currency}</strong></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; padding-top: 10px; border-top: 2px solid #dee2e6;">
                        <span>المجموع الإجمالي:</span>
                        <span style="color: var(--emerald);">${(this.total + (this.settings.deliveryFee || 30)).toFixed(2)} ${this.settings.currency}</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h4 style="color: #4361EE; margin-bottom: 15px;">معلومات العميل</h4>
                    <div style="display: grid; gap: 15px;">
                        <input type="text" id="customerName" placeholder="الاسم الكامل *" 
                               style="padding: 12px; border: 2px solid #eef2f7; border-radius: 8px; font-family: 'Tajawal', sans-serif;">
                        <input type="tel" id="customerPhone" placeholder="رقم الهاتف *" 
                               style="padding: 12px; border: 2px solid #eef2f7; border-radius: 8px; font-family: 'Tajawal', sans-serif;">
                        <textarea id="customerAddress" placeholder="العنوان التفصيلي" 
                                  style="padding: 12px; border: 2px solid #eef2f7; border-radius: 8px; min-height: 80px; font-family: 'Tajawal', sans-serif;"></textarea>
                        <select id="paymentMethod" style="padding: 12px; border: 2px solid #eef2f7; border-radius: 8px; font-family: 'Tajawal', sans-serif;">
                            <option value="cash">نقداً عند الاستلام</option>
                            <option value="card">دفع إلكتروني</option>
                        </select>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px;">
                    <button id="submitOrderBtn" 
                            style="flex: 1; background: linear-gradient(45deg, var(--emerald), #4CAF50); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        <i class="fas fa-check-circle"></i> تأكيد الطلب
                    </button>
                    <button class="modal-close" 
                            style="flex: 1; background: #f8f9fa; color: #666; border: 2px solid #e0e0e0; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            </div>
        `;
    }

    submitOrder() {
        const name = document.getElementById('customerName').value;
        const phone = document.getElementById('customerPhone').value;
        const address = document.getElementById('customerAddress').value;
        const paymentMethod = document.getElementById('paymentMethod').value;

        if (!name || !phone) {
            this.showNotification('يرجى إدخال الاسم ورقم الهاتف', 'error');
            return;
        }

        const orderData = {
            customerName: name,
            customerPhone: phone,
            address: address,
            paymentMethod: paymentMethod,
            items: this.cart.map(item => ({
                productId: item.id,
                productName: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            })),
            subtotal: this.total,
            deliveryFee: this.settings.deliveryFee || 30,
            total: this.total + (this.settings.deliveryFee || 30),
            status: 'new'
        };

        const newOrder = simpleStorage.addOrder(orderData);
        
        if (newOrder) {
            // إرسال رسالة واتساب
            this.sendWhatsAppOrder(newOrder);
            
            // تفريغ العربة
            this.cart = [];
            this.saveCartToStorage();
            this.updateCartDisplay();
            
            // إغلاق النافذة
            this.closeModal();
            
            this.showNotification('تم إرسال طلبك بنجاح! سنتصل بك قريباً', 'success');
        } else {
            this.showNotification('حدث خطأ في إرسال الطلب', 'error');
        }
    }

    sendWhatsAppOrder(order) {
        const whatsappNumber = this.settings.whatsappNumber || '+971501234567';
        const message = `طلب جديد من موقع ماليزيا الذهبية\n\n` +
                       `الاسم: ${order.customerName}\n` +
                       `الهاتف: ${order.customerPhone}\n` +
                       `العنوان: ${order.address || 'لم يتم تحديد العنوان'}\n` +
                       `طريقة الدفع: ${order.paymentMethod === 'cash' ? 'نقداً' : 'إلكتروني'}\n\n` +
                       `المنتجات:\n${order.items.map(item => `- ${item.productName} (${item.quantity} × ${item.price})`).join('\n')}\n\n` +
                       `المجموع: ${order.total} ${this.settings.currency}\n` +
                       `رقم الطلب: ${order.orderNumber}`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // فتح واتساب في نافذة جديدة
        window.open(whatsappURL, '_blank');
    }

    showModal(content, modalId = 'modal') {
        // إغلاق أي نافذة مفتوحة
        this.closeModal();
        
        const modal = document.createElement('div');
        modal.id = modalId;
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
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 15px;
            max-width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        `;
        modalContent.innerHTML = content;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // إضافة مستمع الحدث للزر بعد إنشاء النافذة
        setTimeout(() => {
            const submitBtn = document.getElementById('submitOrderBtn');
            if (submitBtn) {
                submitBtn.addEventListener('click', () => this.submitOrder());
            }
        }, 100);
    }

    closeModal() {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
            document.body.style.overflow = 'auto';
        }
    }

    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modalContent = `
            <div style="max-width: 700px; padding: 20px;">
                <div style="display: flex; gap: 30px; margin-bottom: 25px;">
                    <img src="${product.image}" 
                         style="width: 250px; height: 250px; border-radius: 12px; object-fit: cover;">
                    <div style="flex: 1;">
                        <div style="color: var(--emerald); font-weight: 600; margin-bottom: 10px;">
                            <i class="fas fa-check-circle"></i> ${product.brand}
                        </div>
                        <h3 style="color: #1A1A1A; margin-bottom: 15px; font-size: 1.8rem;">${product.name}</h3>
                        <div style="font-size: 2rem; font-weight: 800; color: var(--gold); margin-bottom: 20px;">
                            ${product.price} ${this.settings.currency}
                        </div>
                        <div style="margin-bottom: 20px;">
                            <span class="status-badge ${product.available && product.stock > 0 ? 'status-active' : 'status-inactive'}">
                                ${product.available && product.stock > 0 ? 'متوفر' : 'غير متوفر'}
                            </span>
                            <span style="color: #666; margin-right: 15px;">المخزون: ${product.stock}</span>
                        </div>
                        <button onclick="appMain.addToCart(${product.id})" 
                                style="background: linear-gradient(45deg, var(--emerald), #4CAF50); color: white; border: none; padding: 15px 30px; border-radius: 8px; font-weight: 700; cursor: pointer;"
                                ${!product.available || product.stock <= 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> أضف إلى العربة
                        </button>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h4 style="color: #4361EE; margin-bottom: 15px;">وصف المنتج</h4>
                    <p style="color: #666; line-height: 1.8;">${product.description}</p>
                </div>
                
                <div style="display: flex; gap: 15px;">
                    <button onclick="appMain.closeModal()" 
                            style="flex: 1; background: #4361EE; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        <i class="fas fa-check"></i> تم
                    </button>
                </div>
            </div>
        `;
        
        this.showModal(modalContent, 'product-details-modal');
    }

    showNotification(message, type = 'success') {
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
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 3 ثوان
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// إنشاء نسخة عامة
window.appMain = new MainApp();

// إضافة الأنيميشن للإشعارات
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
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

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.appMain.init();
});
