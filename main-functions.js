// main-functions.js
class MainApp {
    constructor() {
        this.cart = [];
        this.init();
    }

    init() {
        console.log("🚀 بدء تطبيق ماليزيا الذهبية...");
        this.loadCart();
        this.renderProducts();
        this.setupEventListeners();
        this.updateCartUI();
    }

    loadCart() {
        this.cart = simpleStorage.getCart();
    }

    saveCart() {
        simpleStorage.setCart(this.cart);
    }

    setupEventListeners() {
        // زر التمرير للمنتجات
        const scrollBtn = document.getElementById('scrollToProducts');
        if (scrollBtn) {
            scrollBtn.addEventListener('click', () => {
                document.getElementById('productsSection').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            });
        }

        // فلتر المنتجات
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterProducts(e.target.textContent);
            });
        });

        // تحديث واجهة العربة عند أي تغيير
        document.addEventListener('DOMContentLoaded', () => {
            this.updateCartUI();
        });
    }

    filterProducts(category) {
        const products = document.querySelectorAll('.product-card-premium');
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        // تحديث الأزرار النشطة
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // فلتر حقيقي حسب الكلمة
        products.forEach(product => {
            const productText = product.textContent.toLowerCase();
            if (category === 'جميع المنتجات' || productText.includes(category.toLowerCase()) || category.includes('المنتجات')) {
                product.style.display = 'block';
                setTimeout(() => {
                    product.style.opacity = '1';
                    product.style.transform = 'translateY(0)';
                }, 10);
            } else {
                product.style.opacity = '0';
                product.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    product.style.display = 'none';
                }, 300);
            }
        });
    }

    renderProducts() {
        const container = document.getElementById('productsGridPremium');
        if (!container) return;

        container.innerHTML = '';
        
        const products = simpleStorage.getProducts();
        
        products.forEach(product => {
            const card = this.createProductCard(product);
            container.appendChild(card);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card-premium';
        card.style.cssText = 'opacity: 0; transform: translateY(20px); transition: all 0.3s ease;';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);

        const isAvailable = product.available && product.stock > 0;
        
        card.innerHTML = `
            <div class="product-badge-container">
                ${product.isPopular ? '<span class="product-badge-premium badge-popular"><i class="fas fa-fire"></i> الأكثر مبيعاً</span>' : ''}
                ${!isAvailable ? '<span class="product-badge-premium badge-out"><i class="fas fa-times"></i> غير متوفر</span>' : ''}
            </div>
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image-premium">
                <div class="product-overlay">
                    <button class="btn-premium btn-primary-premium" onclick="appMain.addToCart(${product.id})" 
                            ${!isAvailable ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                        <i class="fas ${!isAvailable ? 'fa-times' : 'fa-cart-plus'}"></i>
                        ${!isAvailable ? 'غير متوفر' : 'أضف إلى العربة'}
                    </button>
                </div>
            </div>
            <div class="product-info-premium">
                <div class="product-brand-premium">${product.brand}</div>
                <h3 class="product-title-premium">${product.name}</h3>
                <p class="product-description-premium">${product.description}</p>
                <div class="product-price-premium">
                    <div class="price-main">${product.price} ${simpleStorage.getSettings().currency || 'درهم'}</div>
                </div>
                <div class="product-actions-premium">
                    <button class="btn-product-action btn-details-premium" onclick="appMain.showProductDetails(${product.id})">
                        <i class="fas fa-info-circle"></i> التفاصيل
                    </button>
                    <button class="btn-product-action btn-cart-premium" 
                            onclick="appMain.addToCart(${product.id})"
                            ${!isAvailable ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> إضافة
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    addToCart(productId) {
        const product = simpleStorage.getProduct(productId);
        if (!product) {
            this.showAlert('المنتج غير موجود', 'error');
            return;
        }

        if (!product.available || product.stock <= 0) {
            this.showAlert('المنتج غير متوفر حالياً', 'error');
            return;
        }

        // التحقق من وجود المنتج في العربة
        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                this.showAlert('لا يمكن إضافة المزيد، الكمية المتاحة: ' + product.stock, 'warning');
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

        this.saveCart();
        this.updateCartUI();
        this.showAlert(`تم إضافة ${product.name} إلى العربة`, 'success');
        
        // إظهار شريط الطلبات
        this.showOrderBar();
    }

    removeFromCart(productId) {
        const index = this.cart.findIndex(item => item.id === productId);
        if (index !== -1) {
            this.cart.splice(index, 1);
            this.saveCart();
            this.updateCartUI();
            this.showAlert('تم إزالة المنتج من العربة', 'info');
        }
    }

    updateCartUI() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const orderBar = document.getElementById('orderBarPremium');
        const orderCount = document.getElementById('orderCountPremium');
        const orderTotal = document.getElementById('orderTotalPremium');
        const orderItems = document.getElementById('orderItemsPremium');
        
        if (orderBar) {
            if (totalItems > 0) {
                orderBar.style.display = 'flex';
                if (orderCount) orderCount.textContent = totalItems;
                if (orderTotal) orderTotal.textContent = `${totalAmount.toFixed(2)} ${simpleStorage.getSettings().currency}`;
                if (orderItems) {
                    orderItems.textContent = totalItems === 1 ? 'منتج واحد' : `${totalItems} منتجات`;
                }
            } else {
                orderBar.style.display = 'none';
            }
        }
    }

    showOrderBar() {
        const orderBar = document.getElementById('orderBarPremium');
        if (orderBar) {
            orderBar.style.display = 'flex';
            setTimeout(() => {
                orderBar.classList.add('show');
            }, 10);
        }
    }

    showProductDetails(productId) {
        const product = simpleStorage.getProduct(productId);
        if (!product) return;

        const modal = document.createElement('div');
        modal.className = 'product-modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
        `;

        modal.innerHTML = `
            <div class="product-modal" style="
                background: white;
                border-radius: 15px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                animation: modalSlideIn 0.3s ease;
            ">
                <button class="close-modal" onclick="this.closest('.product-modal-overlay').remove(); document.body.style.overflow='auto';" style="
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: #f44336;
                    color: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    font-size: 20px;
                    cursor: pointer;
                    z-index: 10;
                ">×</button>
                
                <div style="display: flex; gap: 30px; padding: 30px;">
                    <div style="flex: 1;">
                        <img src="${product.image}" alt="${product.name}" style="
                            width: 100%;
                            height: 300px;
                            object-fit: cover;
                            border-radius: 10px;
                            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                        ">
                    </div>
                    <div style="flex: 1;">
                        <h2 style="color: #1A1A1A; margin-bottom: 10px;">${product.name}</h2>
                        <div style="color: var(--emerald); font-weight: 600; margin-bottom: 20px;">
                            ${product.brand}
                        </div>
                        <div style="font-size: 2rem; font-weight: 800; color: var(--gold); margin-bottom: 20px;">
                            ${product.price} ${simpleStorage.getSettings().currency}
                        </div>
                        <p style="color: #666; line-height: 1.8; margin-bottom: 30px;">
                            ${product.description}
                        </p>
                        <div style="margin-bottom: 20px;">
                            <span style="background: ${product.available ? '#4CAF50' : '#f44336'}; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem;">
                                ${product.available ? 'متوفر' : 'غير متوفر'}
                            </span>
                            <span style="color: #666; margin-right: 15px;">المخزون: ${product.stock}</span>
                        </div>
                        <button onclick="appMain.addToCart(${product.id}); this.closest('.product-modal-overlay').remove();" 
                                style="background: linear-gradient(45deg, var(--emerald), #4CAF50); color: white; border: none; padding: 15px 30px; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%; font-size: 1.1rem;"
                                ${!product.available || product.stock <= 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                            <i class="fas fa-cart-plus"></i> أضف إلى العربة
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

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

    openOrderModal() {
        if (this.cart.length === 0) {
            this.showAlert('عربة التسوق فارغة', 'warning');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'order-modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
        `;

        let itemsHTML = '';
        this.cart.forEach((item, index) => {
            itemsHTML += `
                <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; margin-bottom: 10px;">
                    <img src="${item.image}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                    <div style="flex: 1;">
                        <div style="font-weight: 700; color: #1A1A1A;">${item.name}</div>
                        <div style="color: #666; font-size: 0.9rem;">${item.price} ${simpleStorage.getSettings().currency} × ${item.quantity}</div>
                    </div>
                    <div style="font-weight: 700; color: #4361EE;">${(item.price * item.quantity).toFixed(2)} ${simpleStorage.getSettings().currency}</div>
                    <button onclick="appMain.removeFromCart(${item.id}); appMain.refreshOrderModal();" 
                            style="background: #f44336; color: white; border: none; width: 30px; height: 30px; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        const settings = simpleStorage.getSettings();
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = settings.deliveryFee || 30;
        const total = subtotal + deliveryFee;

        modal.innerHTML = `
            <div class="order-modal" style="
                background: white;
                border-radius: 15px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                animation: modalSlideIn 0.3s ease;
            ">
                <button class="close-modal" onclick="this.closest('.order-modal-overlay').remove(); document.body.style.overflow='auto';" style="
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: #f44336;
                    color: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    font-size: 20px;
                    cursor: pointer;
                    z-index: 10;
                ">×</button>
                
                <div style="padding: 30px;">
                    <h2 style="color: #1A1A1A; margin-bottom: 25px; text-align: center;">
                        <i class="fas fa-shopping-cart"></i> إتمام الطلب
                    </h2>
                    
                    <div style="margin-bottom: 25px;">
                        <h3 style="color: #4361EE; margin-bottom: 15px;">المنتجات المختارة</h3>
                        <div id="orderModalItems">${itemsHTML}</div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>المجموع الفرعي:</span>
                            <span><strong>${subtotal.toFixed(2)} ${settings.currency}</strong></span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>رسوم التوصيل:</span>
                            <span><strong>${deliveryFee} ${settings.currency}</strong></span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; padding-top: 10px; border-top: 2px solid #dee2e6;">
                            <span>المجموع الإجمالي:</span>
                            <span style="color: var(--emerald);">${total.toFixed(2)} ${settings.currency}</span>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <h3 style="color: #4361EE; margin-bottom: 15px;">معلومات العميل</h3>
                        <div style="display: grid; gap: 15px;">
                            <input type="text" id="customerName" placeholder="الاسم الكامل *" 
                                   style="padding: 12px; border: 2px solid #eef2f7; border-radius: 8px; font-family: 'Tajawal', sans-serif;">
                            <input type="tel" id="customerPhone" placeholder="رقم الهاتف *" 
                                   style="padding: 12px; border: 2px solid #eef2f7; border-radius: 8px; font-family: 'Tajawal', sans-serif;">
                            <textarea id="customerAddress" placeholder="العنوان التفصيلي" 
                                      style="padding: 12px; border: 2px solid #eef2f7; border-radius: 8px; min-height: 80px; font-family: 'Tajawal', sans-serif;"></textarea>
                        </div>
                    </div>
                    
                    <button onclick="appMain.submitOrder()" 
                            style="background: linear-gradient(45deg, var(--emerald), #4CAF50); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%; font-size: 1.1rem;">
                        <i class="fas fa-check-circle"></i> تأكيد الطلب
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    refreshOrderModal() {
        document.querySelector('.order-modal-overlay')?.remove();
        this.openOrderModal();
    }

    submitOrder() {
        const name = document.getElementById('customerName')?.value;
        const phone = document.getElementById('customerPhone')?.value;
        const address = document.getElementById('customerAddress')?.value || '';

        if (!name || !phone) {
            this.showAlert('يرجى إدخال الاسم ورقم الهاتف', 'error');
            return;
        }

        const settings = simpleStorage.getSettings();
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = settings.deliveryFee || 30;

        const orderData = {
            customerName: name,
            customerPhone: phone,
            address: address,
            items: this.cart.map(item => ({
                productId: item.id,
                productName: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            })),
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            total: subtotal + deliveryFee,
            status: 'new'
        };

        // حفظ الطلب
        const order = simpleStorage.addOrder(orderData);
        
        if (order) {
            // إرسال رسالة واتساب
            this.sendWhatsAppOrder(order);
            
            // تفريغ العربة
            this.cart = [];
            this.saveCart();
            this.updateCartUI();
            
            // إغلاق النافذة
            document.querySelector('.order-modal-overlay')?.remove();
            document.body.style.overflow = 'auto';
            
            this.showAlert('تم إرسال طلبك بنجاح! سنتصل بك قريباً', 'success');
        } else {
            this.showAlert('حدث خطأ في إرسال الطلب', 'error');
        }
    }

    sendWhatsAppOrder(order) {
        const whatsappNumber = simpleStorage.getSettings().whatsappNumber || '+971501234567';
        const message = `طلب جديد من موقع ماليزيا الذهبية\n\n` +
                       `الاسم: ${order.customerName}\n` +
                       `الهاتف: ${order.customerPhone}\n` +
                       `العنوان: ${order.address || 'لم يتم تحديد العنوان'}\n` +
                       `طريقة الدفع: نقداً عند الاستلام\n\n` +
                       `المنتجات:\n${order.items.map(item => `- ${item.productName} (${item.quantity} × ${item.price})`).join('\n')}\n\n` +
                       `المجموع: ${order.total} ${simpleStorage.getSettings().currency}\n` +
                       `رقم الطلب: ${order.orderNumber}`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // فتح واتساب في نافذة جديدة
        window.open(whatsappURL, '_blank');
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#FF9800' : '#2196F3'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            font-family: 'Tajawal', sans-serif;
            min-width: 300px;
        `;
        
        alert.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
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
        if (!document.getElementById('alert-animations')) {
            const style = document.createElement('style');
            style.id = 'alert-animations';
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
window.appMain = new MainApp();

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تأخير بسيط للتأكد من تحميل كل شيء
    setTimeout(() => {
        window.appMain.init();
    }, 100);
});
