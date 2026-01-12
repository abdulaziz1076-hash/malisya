// main-functions.js - النسخة الكاملة المحسنة
class MainApp {
    constructor() {
        this.cart = [];
        this.products = [];
        this.settings = {};
        this.state = {
            currentCategory: 'all',
            isLoading: false,
            searchQuery: ''
        };
        
        this.init();
    }

    /**
     * تهيئة التطبيق
     */
    init() {
        console.log("🚀 بدء تطبيق ماليزيا الذهبية...");
        this.loadData();
        this.setupEventListeners();
        this.renderProducts();
        this.updateCartUI();
        this.showWelcomeMessage();
    }

    /**
     * تحميل البيانات من التخزين
     */
    loadData() {
        this.cart = this.getStorage('cart') || [];
        this.products = this.getStorage('products') || [];
        this.settings = this.getStorage('settings') || {
            currency: 'درهم',
            deliveryFee: 30,
            whatsappNumber: '+971501234567'
        };
    }

    /**
     * حفظ البيانات في التخزين
     */
    saveData(key, data) {
        try {
            localStorage.setItem(`malaysiaGold_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    /**
     * جلب البيانات من التخزين
     */
    getStorage(key) {
        try {
            const data = localStorage.getItem(`malaysiaGold_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting data:', error);
            return null;
        }
    }

    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // استخدام event delegation لأداء أفضل
        document.addEventListener('click', (e) => {
            // فلتر المنتجات
            if (e.target.closest('.filter-btn')) {
                const category = e.target.dataset.category || e.target.textContent;
                this.filterProducts(category);
                return;
            }

            // إضافة إلى العربة
            if (e.target.closest('[data-add-to-cart]')) {
                const productId = parseInt(e.target.closest('[data-add-to-cart]').dataset.addToCart);
                this.addToCart(productId);
                return;
            }

            // عرض تفاصيل المنتج
            if (e.target.closest('[data-view-details]')) {
                const productId = parseInt(e.target.closest('[data-view-details]').dataset.viewDetails);
                this.showProductDetails(productId);
                return;
            }

            // إزالة من العربة
            if (e.target.closest('[data-remove-from-cart]')) {
                const productId = parseInt(e.target.closest('[data-remove-from-cart]').dataset.removeFromCart);
                this.removeFromCart(productId);
                return;
            }

            // فتح نافذة الطلب
            if (e.target.closest('#openOrderModalBtn')) {
                this.openOrderModal();
                return;
            }

            // البحث
            if (e.target.closest('#searchBtn') || (e.target.type === 'search' && e.key === 'Enter')) {
                this.searchProducts(e.target.value || document.querySelector('#searchInput')?.value);
                return;
            }
        });

        // زر التمرير للمنتجات
        document.getElementById('scrollToProducts')?.addEventListener('click', () => {
            this.scrollToSection('productsSection');
        });

        // تحديث واجهة العربة عند التغيير
        this.setupCartObserver();
    }

    /**
     * تمرير الصفحة لقسم معين
     */
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * إعداد مراقبة العربة
     */
    setupCartObserver() {
        // مراقبة تغييرات العربة
        const originalCart = [...this.cart];
        setInterval(() => {
            if (JSON.stringify(this.cart) !== JSON.stringify(originalCart)) {
                this.updateCartUI();
            }
        }, 1000);
    }

    /**
     * فلترة المنتجات حسب التصنيف
     */
    filterProducts(category) {
        this.state.currentCategory = category;
        
        // تحديث أزرار الفلتر
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const btnCategory = btn.dataset.category || btn.textContent;
            btn.classList.toggle('active', btnCategory === category || (category === 'all' && btn.textContent.includes('الكل')));
        });

        // فلترة المنتجات
        const filteredProducts = category === 'all' 
            ? this.products 
            : this.products.filter(product => 
                product.category?.includes(category) || 
                product.name.includes(category) ||
                product.tags?.some(tag => tag.includes(category))
            );

        this.renderProducts(filteredProducts);
        this.showAlert(`عرض ${filteredProducts.length} منتج${filteredProducts.length !== 1 ? 'ات' : ''}`, 'info');
    }

    /**
     * بحث في المنتجات
     */
    searchProducts(query) {
        this.state.searchQuery = query.toLowerCase();
        
        if (!query.trim()) {
            this.filterProducts(this.state.currentCategory);
            return;
        }

        const results = this.products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.brand.toLowerCase().includes(query) ||
            product.tags?.some(tag => tag.toLowerCase().includes(query))
        );

        this.renderProducts(results);
        
        const searchFeedback = document.getElementById('searchFeedback');
        if (searchFeedback) {
            searchFeedback.textContent = results.length > 0 
                ? `تم العثور على ${results.length} نتيجة`
                : 'لم يتم العثور على نتائج';
            searchFeedback.style.display = 'block';
        }
    }

    /**
     * عرض المنتجات في الشبكة
     */
    renderProducts(productsToRender = null) {
        const container = document.getElementById('productsGridPremium');
        if (!container) return;

        const products = productsToRender || this.products;
        
        // إضافة تأثير التحميل
        container.style.opacity = '0.5';
        container.style.transition = 'opacity 0.3s';

        // مسح المحتوى القديم
        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                    <h3 style="color: #666; margin-bottom: 10px;">لا توجد منتجات</h3>
                    <p style="color: #999;">جرب بحثاً مختلفاً أو تصفح الفئات الأخرى</p>
                </div>
            `;
            container.style.opacity = '1';
            return;
        }

        // إنشاء بطاقات المنتجات
        products.forEach((product, index) => {
            const card = this.createProductCard(product, index);
            container.appendChild(card);
        });

        // إظهار البطاقات بتأثير تدريجي
        setTimeout(() => {
            container.style.opacity = '1';
            this.animateProductCards();
        }, 100);
    }

    /**
     * إنشاء بطاقة منتج
     */
    createProductCard(product, index) {
        const card = document.createElement('div');
        card.className = 'product-card-premium';
        card.dataset.productId = product.id;
        card.style.animationDelay = `${index * 0.1}s`;

        const isAvailable = product.available && product.stock > 0;
        const inCart = this.cart.find(item => item.id === product.id);
        const cartQuantity = inCart ? inCart.quantity : 0;

        card.innerHTML = `
            <div class="product-badge-container">
                ${product.isPopular ? '<span class="product-badge-premium badge-popular"><i class="fas fa-fire"></i> الأكثر مبيعاً</span>' : ''}
                ${product.isNew ? '<span class="product-badge-premium badge-new"><i class="fas fa-star"></i> جديد</span>' : ''}
                ${!isAvailable ? '<span class="product-badge-premium badge-out"><i class="fas fa-times"></i> غير متوفر</span>' : ''}
                ${product.discount ? `<span class="product-badge-premium badge-discount"><i class="fas fa-tag"></i> خصم ${product.discount}%</span>` : ''}
            </div>
            
            <div class="product-image-container">
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="product-image-premium"
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&w=400&q=80'">
                <div class="product-overlay">
                    <button class="btn-premium btn-primary-premium" 
                            data-add-to-cart="${product.id}"
                            ${!isAvailable ? 'disabled' : ''}>
                        <i class="fas ${!isAvailable ? 'fa-times' : 'fa-cart-plus'}"></i>
                        ${!isAvailable ? 'غير متوفر' : cartQuantity > 0 ? `(${cartQuantity}) إضافة` : 'أضف إلى العربة'}
                    </button>
                    <button class="btn-premium btn-secondary-premium" 
                            data-view-details="${product.id}">
                        <i class="fas fa-eye"></i> معاينة
                    </button>
                </div>
            </div>
            
            <div class="product-info-premium">
                <div class="product-brand-premium">
                    <i class="fas fa-tag"></i> ${product.brand}
                </div>
                <h3 class="product-title-premium">${product.name}</h3>
                <p class="product-description-premium">${this.truncateText(product.description, 80)}</p>
                
                <div class="product-price-premium">
                    ${product.originalPrice ? `
                        <div class="price-original" style="text-decoration: line-through; color: #999; font-size: 0.9rem;">
                            ${product.originalPrice} ${this.settings.currency}
                        </div>
                    ` : ''}
                    <div class="price-main">
                        ${product.price} ${this.settings.currency}
                    </div>
                    ${product.discount ? `
                        <div class="price-discount" style="color: #4CAF50; font-weight: bold;">
                            وفر ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </div>
                    ` : ''}
                </div>
                
                <div class="product-stock-info">
                    <i class="fas fa-box"></i>
                    ${isAvailable ? 
                        `<span style="color: #4CAF50;">${product.stock} متوفر</span>` : 
                        '<span style="color: #f44336;">نفذ من المخزون</span>'
                    }
                </div>
                
                <div class="product-actions-premium">
                    <button class="btn-product-action btn-details-premium" 
                            data-view-details="${product.id}">
                        <i class="fas fa-info-circle"></i> التفاصيل
                    </button>
                    <button class="btn-product-action btn-cart-premium" 
                            data-add-to-cart="${product.id}"
                            ${!isAvailable ? 'disabled' : ''}>
                        <i class="fas ${cartQuantity > 0 ? 'fa-cart-plus' : 'fa-shopping-cart'}"></i>
                        ${cartQuantity > 0 ? `(${cartQuantity})` : 'إضافة'}
                    </button>
                    <button class="btn-product-action btn-wishlist-premium" 
                            data-wishlist="${product.id}"
                            onclick="this.classList.toggle('active')">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * إضافة منتج إلى العربة
     */
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
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
                this.showAlert(`لا يمكن إضافة أكثر من ${product.stock} وحدة`, 'warning');
                return;
            }
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.image,
                quantity: 1,
                stock: product.stock,
                brand: product.brand
            });
        }

        this.saveData('cart', this.cart);
        this.updateCartUI();
        this.updateProductInView(productId);
        this.showAlert(`تم إضافة "${product.name}" إلى العربة`, 'success');
        this.animateAddToCart(productId);
        
        // إظهار شريط الطلبات
        this.showOrderBar();
    }

    /**
     * إزالة منتج من العربة
     */
    removeFromCart(productId) {
        const index = this.cart.findIndex(item => item.id === productId);
        if (index !== -1) {
            const productName = this.cart[index].name;
            this.cart.splice(index, 1);
            this.saveData('cart', this.cart);
            this.updateCartUI();
            this.updateProductInView(productId);
            this.showAlert(`تم إزالة "${productName}" من العربة`, 'info');
        }
    }

    /**
     * تحديث كمية منتج في العربة
     */
    updateCartQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            const product = this.products.find(p => p.id === productId);
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else if (newQuantity > (product?.stock || item.stock)) {
                this.showAlert(`الكمية المتاحة: ${product?.stock || item.stock}`, 'warning');
            } else {
                item.quantity = newQuantity;
                this.saveData('cart', this.cart);
                this.updateCartUI();
                this.updateProductInView(productId);
            }
        }
    }

    /**
     * تحديث عرض المنتج في الواجهة
     */
    updateProductInView(productId) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (productCard) {
            const inCart = this.cart.find(item => item.id === productId);
            const cartButtons = productCard.querySelectorAll('[data-add-to-cart]');
            
            cartButtons.forEach(button => {
                if (inCart) {
                    button.innerHTML = `<i class="fas fa-cart-plus"></i> (${inCart.quantity}) إضافة`;
                } else {
                    button.innerHTML = `<i class="fas fa-cart-plus"></i> أضف إلى العربة`;
                }
            });
        }
    }

    /**
     * تحديث واجهة العربة
     */
    updateCartUI() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // تحديث شريط الطلبات
        const orderBar = document.getElementById('orderBarPremium');
        const orderCount = document.getElementById('orderCountPremium');
        const orderTotal = document.getElementById('orderTotalPremium');
        const orderItems = document.getElementById('orderItemsPremium');
        
        if (orderBar) {
            if (totalItems > 0) {
                orderBar.classList.add('active');
                if (orderCount) orderCount.textContent = totalItems;
                if (orderTotal) orderTotal.textContent = `${this.formatPrice(totalAmount)}`;
                if (orderItems) {
                    orderItems.textContent = totalItems === 1 ? 'منتج واحد' : `${totalItems} منتجات`;
                }
            } else {
                orderBar.classList.remove('active');
            }
        }
        
        // تحديث أيقونة العربة في الهيدر
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            const badge = cartIcon.querySelector('.cart-badge') || document.createElement('span');
            if (!badge.classList.contains('cart-badge')) {
                badge.className = 'cart-badge';
                cartIcon.appendChild(badge);
            }
            
            if (totalItems > 0) {
                badge.textContent = totalItems > 9 ? '9+' : totalItems;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    /**
     * إظهار شريط الطلبات
     */
    showOrderBar() {
        const orderBar = document.getElementById('orderBarPremium');
        if (orderBar) {
            orderBar.classList.add('show');
            setTimeout(() => {
                if (orderBar.classList.contains('show')) {
                    orderBar.classList.remove('show');
                }
            }, 3000);
        }
    }

    /**
     * فتح نافذة تفاصيل المنتج
     */
    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const inCart = this.cart.find(item => item.id === productId);
        const modalHTML = `
            <div class="modal-overlay" id="productModal">
                <div class="modal-content">
                    <button class="modal-close" onclick="appMain.closeModal()">&times;</button>
                    
                    <div class="product-modal-body">
                        <div class="product-modal-images">
                            <img src="${product.image}" alt="${product.name}" class="main-image">
                            <div class="image-thumbnails">
                                <img src="${product.image}" alt="صورة رئيسية">
                                ${product.images?.slice(0, 3).map(img => 
                                    `<img src="${img}" alt="صورة إضافية">`
                                ).join('') || ''}
                            </div>
                        </div>
                        
                        <div class="product-modal-info">
                            <div class="product-modal-header">
                                <span class="product-brand">${product.brand}</span>
                                <h2>${product.name}</h2>
                                <div class="product-rating">
                                    ${this.generateStarRating(product.rating || 0)}
                                    <span>(${product.reviewCount || 0} تقييم)</span>
                                </div>
                            </div>
                            
                            <div class="product-modal-price">
                                ${product.originalPrice ? `
                                    <div class="original-price">
                                        ${product.originalPrice} ${this.settings.currency}
                                    </div>
                                    <div class="discount-badge">
                                        خصم ${product.discount}%
                                    </div>
                                ` : ''}
                                <div class="current-price">
                                    ${product.price} ${this.settings.currency}
                                </div>
                            </div>
                            
                            <div class="product-modal-description">
                                <h3><i class="fas fa-info-circle"></i> الوصف</h3>
                                <p>${product.description}</p>
                                ${product.detailedDescription ? `
                                    <p>${product.detailedDescription}</p>
                                ` : ''}
                            </div>
                            
                            <div class="product-modal-specs">
                                ${product.benefits ? `
                                    <div class="specs-section">
                                        <h4><i class="fas fa-check-circle"></i> الفوائد</h4>
                                        <ul>
                                            ${product.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                
                                <div class="specs-section">
                                    <h4><i class="fas fa-cube"></i> التفاصيل</h4>
                                    <div class="specs-grid">
                                        <div class="spec-item">
                                            <span class="spec-label">الكمية:</span>
                                            <span class="spec-value">${product.weight || 'غير محدد'}</span>
                                        </div>
                                        <div class="spec-item">
                                            <span class="spec-label">الحالة:</span>
                                            <span class="spec-value ${product.available ? 'available' : 'unavailable'}">
                                                ${product.available ? 'متوفر' : 'غير متوفر'}
                                            </span>
                                        </div>
                                        <div class="spec-item">
                                            <span class="spec-label">المخزون:</span>
                                            <span class="spec-value">${product.stock} وحدة</span>
                                        </div>
                                        ${product.category ? `
                                            <div class="spec-item">
                                                <span class="spec-label">التصنيف:</span>
                                                <span class="spec-value">${product.category.join(', ')}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="product-modal-actions">
                                <div class="quantity-selector">
                                    <button class="quantity-btn minus" onclick="appMain.updateCartQuantity(${product.id}, ${(inCart?.quantity || 0) - 1})">-</button>
                                    <input type="number" 
                                           class="quantity-input" 
                                           value="${inCart?.quantity || 0}" 
                                           min="0" 
                                           max="${product.stock}"
                                           onchange="appMain.updateCartQuantity(${product.id}, parseInt(this.value))">
                                    <button class="quantity-btn plus" onclick="appMain.updateCartQuantity(${product.id}, ${(inCart?.quantity || 0) + 1})">+</button>
                                </div>
                                
                                <button class="btn-add-to-cart ${inCart ? 'in-cart' : ''}" 
                                        onclick="appMain.addToCart(${product.id})"
                                        ${!product.available ? 'disabled' : ''}>
                                    <i class="fas ${inCart ? 'fa-check' : 'fa-cart-plus'}"></i>
                                    ${inCart ? 'مضاف إلى العربة' : 'أضف إلى العربة'}
                                </button>
                                
                                <button class="btn-buy-now" 
                                        onclick="appMain.addToCart(${product.id}); appMain.openOrderModal();"
                                        ${!product.available ? 'disabled' : ''}>
                                    <i class="fas fa-bolt"></i> شراء الآن
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.openModal(modalHTML);
    }

    /**
     * فتح نافذة الطلب
     */
    openOrderModal() {
        if (this.cart.length === 0) {
            this.showAlert('عربة التسوق فارغة', 'warning');
            return;
        }

        let itemsHTML = '';
        this.cart.forEach((item, index) => {
            itemsHTML += `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="order-item-info">
                        <h4>${item.name}</h4>
                        <div class="order-item-brand">${item.brand}</div>
                        <div class="order-item-price">${item.price} ${this.settings.currency}</div>
                    </div>
                    <div class="order-item-quantity">
                        <button class="quantity-btn small minus" onclick="appMain.updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn small plus" onclick="appMain.updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <div class="order-item-total">
                        ${this.formatPrice(item.price * item.quantity)}
                    </div>
                    <button class="order-item-remove" onclick="appMain.removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = this.settings.deliveryFee || 30;
        const total = subtotal + deliveryFee;

        const modalHTML = `
            <div class="modal-overlay" id="orderModal">
                <div class="modal-content">
                    <button class="modal-close" onclick="appMain.closeModal()">&times;</button>
                    
                    <div class="order-modal-body">
                        <h2><i class="fas fa-shopping-cart"></i> تأكيد الطلب</h2>
                        
                        <div class="order-summary">
                            <h3>ملخص الطلب</h3>
                            <div class="order-items-list">
                                ${itemsHTML || '<p class="empty-cart">العربة فارغة</p>'}
                            </div>
                            
                            <div class="order-totals">
                                <div class="total-row">
                                    <span>المجموع الفرعي:</span>
                                    <span>${this.formatPrice(subtotal)}</span>
                                </div>
                                <div class="total-row">
                                    <span>رسوم التوصيل:</span>
                                    <span>${this.formatPrice(deliveryFee)}</span>
                                </div>
                                <div class="total-row grand-total">
                                    <span>الإجمالي:</span>
                                    <span>${this.formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="customer-info">
                            <h3><i class="fas fa-user"></i> معلومات العميل</h3>
                            <div class="form-group">
                                <label for="customerName"><i class="fas fa-user"></i> الاسم الكامل *</label>
                                <input type="text" id="customerName" placeholder="أدخل اسمك الكامل" required>
                            </div>
                            <div class="form-group">
                                <label for="customerPhone"><i class="fas fa-phone"></i> رقم الهاتف *</label>
                                <input type="tel" id="customerPhone" placeholder="05xxxxxxxx" required>
                            </div>
                            <div class="form-group">
                                <label for="customerAddress"><i class="fas fa-map-marker-alt"></i> العنوان</label>
                                <textarea id="customerAddress" placeholder="العنوان التفصيلي (اختياري)"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="customerNotes"><i class="fas fa-edit"></i> ملاحظات إضافية</label>
                                <textarea id="customerNotes" placeholder="ملاحظات حول الطلب (اختياري)"></textarea>
                            </div>
                        </div>
                        
                        <div class="payment-method">
                            <h3><i class="fas fa-credit-card"></i> طريقة الدفع</h3>
                            <div class="payment-options">
                                <label class="payment-option">
                                    <input type="radio" name="paymentMethod" value="cash" checked>
                                    <span class="payment-option-content">
                                        <i class="fas fa-money-bill-wave"></i>
                                        <span>الدفع عند الاستلام</span>
                                    </span>
                                </label>
                                <label class="payment-option">
                                    <input type="radio" name="paymentMethod" value="card">
                                    <span class="payment-option-content">
                                        <i class="fas fa-credit-card"></i>
                                        <span>بطاقة ائتمان</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="order-actions">
                            <button class="btn-continue-shopping" onclick="appMain.closeModal()">
                                <i class="fas fa-arrow-right"></i> متابعة التسوق
                            </button>
                            <button class="btn-confirm-order" onclick="appMain.submitOrder()">
                                <i class="fas fa-check-circle"></i> تأكيد الطلب وإرسال الواتساب
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.openModal(modalHTML);
    }

    /**
     * تأكيد الطلب
     */
    submitOrder() {
        const name = document.getElementById('customerName')?.value.trim();
        const phone = document.getElementById('customerPhone')?.value.trim();
        const address = document.getElementById('customerAddress')?.value.trim() || '';
        const notes = document.getElementById('customerNotes')?.value.trim() || '';
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash';

        if (!name || !phone) {
            this.showAlert('يرجى إدخال الاسم ورقم الهاتف', 'error');
            return;
        }

        if (phone.length < 10) {
            this.showAlert('يرجى إدخال رقم هاتف صحيح', 'error');
            return;
        }

        if (this.cart.length === 0) {
            this.showAlert('عربة التسوق فارغة', 'warning');
            return;
        }

        // إنشاء رقم طلب فريد
        const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        
        const orderData = {
            orderNumber,
            customerName: name,
            customerPhone: phone,
            address: address,
            notes: notes,
            paymentMethod: paymentMethod,
            items: this.cart.map(item => ({
                productId: item.id,
                productName: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            })),
            subtotal: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            deliveryFee: this.settings.deliveryFee || 30,
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (this.settings.deliveryFee || 30),
            status: 'new',
            createdAt: new Date().toISOString()
        };

        // حفظ الطلب
        const orders = this.getStorage('orders') || [];
        orders.push(orderData);
        this.saveData('orders', orders);

        // إرسال رسالة واتساب
        this.sendWhatsAppOrder(orderData);
        
        // تفريغ العربة
        this.cart = [];
        this.saveData('cart', this.cart);
        this.updateCartUI();
        
        // إغلاق النافذة
        this.closeModal();
        
        // إظهار رسالة نجاح
        this.showSuccessOrder(orderData);
    }

    /**
     * إرسال طلب عبر واتساب
     */
    sendWhatsAppOrder(order) {
        const whatsappNumber = this.settings.whatsappNumber || '+971501234567';
        
        let message = `📦 *طلب جديد - ${order.orderNumber}*\n\n`;
        message += `👤 *العميل:* ${order.customerName}\n`;
        message += `📞 *الهاتف:* ${order.customerPhone}\n`;
        if (order.address) message += `📍 *العنوان:* ${order.address}\n`;
        if (order.notes) message += `📝 *ملاحظات:* ${order.notes}\n`;
        message += `💳 *طريقة الدفع:* ${order.paymentMethod === 'cash' ? 'نقداً عند الاستلام' : 'بطاقة ائتمان'}\n\n`;
        message += `🛒 *المنتجات:*\n`;
        
        order.items.forEach(item => {
            message += `➤ ${item.productName}\n`;
            message += `   الكمية: ${item.quantity} × ${item.price} ${this.settings.currency}\n`;
            message += `   المجموع: ${item.total} ${this.settings.currency}\n\n`;
        });
        
        message += `💰 *الإجمالي:* ${order.total} ${this.settings.currency}\n`;
        message += `📅 *التاريخ:* ${new Date(order.createdAt).toLocaleDateString('ar-SA')}\n`;
        message += `⏰ *الوقت:* ${new Date(order.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        window.open(whatsappURL, '_blank');
    }

    /**
     * إظهار رسالة نجاح الطلب
     */
    showSuccessOrder(order) {
        const successHTML = `
            <div class="modal-overlay" id="successModal">
                <div class="modal-content success-modal">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>تم تأكيد طلبك بنجاح! 🎉</h2>
                    <p class="success-message">
                        شكراً لك <strong>${order.customerName}</strong> على طلبك
                    </p>
                    
                    <div class="order-details-card">
                        <div class="order-detail">
                            <span class="detail-label">رقم الطلب:</span>
                            <span class="detail-value">${order.orderNumber}</span>
                        </div>
                        <div class="order-detail">
                            <span class="detail-label">الإجمالي:</span>
                            <span class="detail-value">${this.formatPrice(order.total)}</span>
                        </div>
                        <div class="order-detail">
                            <span class="detail-label">طريقة الدفع:</span>
                            <span class="detail-value">${order.paymentMethod === 'cash' ? 'نقداً عند الاستلام' : 'بطاقة ائتمان'}</span>
                        </div>
                        <div class="order-detail">
                            <span class="detail-label">حالة الطلب:</span>
                            <span class="detail-value status-new">جديد</span>
                        </div>
                    </div>
                    
                    <div class="success-actions">
                        <p class="success-note">
                            <i class="fas fa-info-circle"></i>
                            سيتم التواصل معك على الرقم <strong>${order.customerPhone}</strong> لتأكيد الطلب
                        </p>
                        
                        <div class="action-buttons">
                            <button class="btn-track-order" onclick="appMain.trackOrder('${order.orderNumber}')">
                                <i class="fas fa-search"></i> تتبع الطلب
                            </button>
                            <button class="btn-continue" onclick="appMain.closeModal(); appMain.scrollToSection('productsSection')">
                                <i class="fas fa-shopping-bag"></i> مواصلة التسوق
                            </button>
                        </div>
                        
                        <div class="contact-support">
                            <p>للأسئلة والاستفسارات:</p>
                            <a href="https://wa.me/${this.settings.whatsappNumber}" target="_blank" class="whatsapp-link">
                                <i class="fab fa-whatsapp"></i> تواصل عبر الواتساب
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.openModal(successHTML);
    }

    /**
     * دوال مساعدة
     */
    formatPrice(price) {
        return `${price.toFixed(2)} ${this.settings.currency || 'درهم'}`;
    }

    truncateText(text, length) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    generateStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    openModal(html) {
        this.closeModal(); // إغلاق أي مودال مفتوح
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer);
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
        document.body.style.overflow = 'auto';
    }

    animateProductCards() {
        const cards = document.querySelectorAll('.product-card-premium');
        cards.forEach((card, index) => {
            card.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s both`;
        });
    }

    animateAddToCart(productId) {
        const button = document.querySelector(`[data-add-to-cart="${productId}"]`);
        if (button) {
            button.classList.add('pulse');
            setTimeout(() => button.classList.remove('pulse'), 300);
        }
    }

    showAlert(message, type = 'info') {
        // إنشاء إشعار
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                          type === 'error' ? 'fa-exclamation-circle' : 
                          type === 'warning' ? 'fa-exclamation-triangle' : 
                          'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        document.body.appendChild(alert);
        
        // إزالة الإشعار بعد 3 ثوان
        setTimeout(() => {
            if (alert.parentElement) {
                alert.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => alert.remove(), 300);
            }
        }, 3000);
    }

    showWelcomeMessage() {
        if (!this.getStorage('firstVisit')) {
            setTimeout(() => {
                this.showAlert('مرحباً بك في متجر ماليزيا الذهبية! 🎉', 'success');
                this.saveData('firstVisit', new Date().toISOString());
            }, 1000);
        }
    }
}

// إنشاء نسخة عالمية من التطبيق
window.appMain = new MainApp();

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تأخير لضمان تحميل جميع العناصر
    setTimeout(() => {
        window.appMain.init();
        
        // إضافة الأنيميشن للصفحة
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    }, 500);
});

// تصدير الكلاس للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainApp;
}
