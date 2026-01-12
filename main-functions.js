// main-functions.js
// وظائف الصفحة الرئيسية (index.html)

class MainApp {
    constructor() {
        this.cart = [];
        this.currentModal = null;
        this.isMapInitialized = false;
        this.map = null;
        this.marker = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderProducts();
        this.updateCartDisplay();
        
        // التحقق من التحديثات كل 5 ثوان
        setInterval(() => this.checkForUpdates(), 5000);
    }

    loadData() {
        // تحميل المنتجات من التخزين
        this.products = sharedStorage.getProducts();
        
        // تحميل الإعدادات
        this.settings = sharedStorage.getSettings();
        
        // تحديث العرض بناءً على الإعدادات
        this.updateUIFromSettings();
    }

    updateUIFromSettings() {
        // تحديث معلومات التوصيل
        document.querySelectorAll('.delivery-fee').forEach(el => {
            el.textContent = `${this.settings.deliveryFee} ${this.settings.currency}`;
        });
        
        // تحديث مناطق التوصيل
        document.querySelectorAll('.delivery-areas').forEach(el => {
            el.textContent = this.settings.deliveryAreas === 'abu-dhabi' ? 'أبوظبي فقط' : 'جميع مناطق الإمارات';
        });
        
        // تحديث وقت التوصيل
        document.querySelectorAll('.delivery-time').forEach(el => {
            el.textContent = this.settings.deliveryTime;
        });
        
        // تحديث رسالة الترحيب
        const heroDescription = document.querySelector('.hero-description');
        if (heroDescription) {
            heroDescription.textContent = this.settings.welcomeMessage;
        }
    }

    checkForUpdates() {
        const lastChecked = localStorage.getItem('lastDataCheck') || 0;
        if (sharedStorage.hasNewData(lastChecked)) {
            this.loadData();
            this.renderProducts();
            this.showNotification('تم تحديث البيانات', 'success');
            localStorage.setItem('lastDataCheck', Date.now().toString());
        }
    }

    setupEventListeners() {
        // الانتقال إلى المنتجات
        const scrollToProducts = document.getElementById('scrollToProducts');
        if (scrollToProducts) {
            scrollToProducts.addEventListener('click', () => {
                document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // فلترة المنتجات
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.filterProducts(filter);
                
                // تحديث النشاط
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // زر إتمام الطلب
        const checkoutBtn = document.getElementById('checkoutBtnPremium');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.openOrderModal());
        }
        
        // إغلاق النوافذ بالضغط خارجها
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeCurrentModal();
            }
        });
        
        // زر التحميل للمزيد من المنتجات
        const loadMoreBtn = document.querySelector('[onclick="loadMoreProducts()"]');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreProducts());
        }
    }

    renderProducts(filter = 'all') {
        const container = document.getElementById('productsGridPremium');
        if (!container) return;
        
        container.innerHTML = '';
        
        let productsToShow = [...this.products];
        
        // تطبيق الفلتر
        if (filter !== 'all') {
            switch(filter) {
                case 'popular':
                    productsToShow = productsToShow.filter(p => p.isPopular);
                    break;
                case 'new':
                    productsToShow = productsToShow.filter(p => p.isNew);
                    break;
                case 'health':
                    productsToShow = productsToShow.filter(p => p.category.includes('health'));
                    break;
                case 'energy':
                    productsToShow = productsToShow.filter(p => p.category.includes('energy'));
                    break;
            }
        }
        
        // عرض المنتجات
        productsToShow.forEach(product => {
            const productCard = this.createProductCard(product);
            container.appendChild(productCard);
        });
        
        // إذا لم توجد منتجات
        if (productsToShow.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px;">
                    <i class="fas fa-box-open" style="font-size: 4rem; color: #dee2e6; margin-bottom: 20px;"></i>
                    <h3 style="color: #666;">لا توجد منتجات</h3>
                    <p style="color: #999;">لم يتم العثور على منتجات تطابق الفلتر المحدد</p>
                </div>
            `;
        }
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card-premium';
        
        // التحقق من التوفر
        const isAvailable = product.available && product.stock > 0;
        
        // إنشاء البطاقة
        card.innerHTML = `
            <div class="product-badge-container">
                ${product.isPopular ? '<div class="product-badge-premium badge-popular"><i class="fas fa-fire"></i> الأكثر مبيعاً</div>' : ''}
                ${product.isNew ? '<div class="product-badge-premium badge-new"><i class="fas fa-bolt"></i> جديد</div>' : ''}
                ${!isAvailable ? '<div class="product-badge-premium badge-out"><i class="fas fa-ban"></i> غير متوفر</div>' : ''}
            </div>
            
            <div class="product-image-container">
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="product-image-premium">
                <div class="product-overlay">
                    <button class="btn-premium btn-secondary-premium" onclick="mainApp.showProductDetails(${product.id})" style="width: 100%;">
                        <i class="fas fa-eye"></i> معاينة سريعة
                    </button>
                </div>
            </div>
            
            <div class="product-info-premium">
                <div class="product-brand-premium">
                    <i class="fas fa-check-circle"></i> منتج ${product.brand}
                </div>
                <h3 class="product-title-premium">${product.name}</h3>
                <p class="product-description-premium">${product.description}</p>
                
                <div class="product-price-premium">
                    <div>
                        <div class="price-main">${product.price} ${this.settings.currency}</div>
                        ${product.originalPrice ? `<div class="price-original">${product.originalPrice} ${this.settings.currency}</div>` : ''}
                    </div>
                    <div style="font-size: 0.9rem; color: ${isAvailable ? '#2E8B57' : '#D32F2F'};">
                        ${isAvailable ? `<i class="fas fa-check"></i> متوفر (${product.stock})` : '<i class="fas fa-times"></i> نفذ من المخزون'}
                    </div>
                </div>
                
                <div class="product-actions-premium">
                    <button class="btn-product-action btn-details-premium" onclick="mainApp.showProductDetails(${product.id})">
                        <i class="fas fa-info-circle"></i> التفاصيل
                    </button>
                    <button class="btn-product-action btn-cart-premium" 
                            onclick="mainApp.addToCart(${product.id})"
                            ${!isAvailable ? 'disabled' : ''}>
                        <i class="fas ${isAvailable ? 'fa-cart-plus' : 'fa-ban'}"></i>
                        ${isAvailable ? 'أضف للطلب' : 'غير متوفر'}
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    filterProducts(filter) {
        this.renderProducts(filter);
    }

    showProductDetails(productId) {
        const product = sharedStorage.getProduct(productId);
        if (!product) return;
        
        const modalContent = `
            <div style="display: flex; flex-direction: column; max-width: 900px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div>
                        <img src="${product.image}" 
                             alt="${product.name}" 
                             style="width: 100%; height: 300px; object-fit: cover; border-radius: 15px;">
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <div style="flex: 1; text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                                <div style="font-weight: 700; color: #2E8B57;">${product.stock}</div>
                                <div style="font-size: 0.9rem; color: #666;">الكمية المتاحة</div>
                            </div>
                            <div style="flex: 1; text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                                <div style="font-weight: 700; color: #D4AF37;">${product.brand}</div>
                                <div style="font-size: 0.9rem; color: #666;">العلامة التجارية</div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h2 style="color: #1A1A1A; margin-bottom: 10px;">${product.name}</h2>
                        <div style="color: #2E8B57; font-weight: 600; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check-circle"></i> منتج ${product.brand} الماليزي الأصلي
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                                <div style="font-size: 2rem; font-weight: 800; color: #1A1A1A;">
                                    ${product.price} ${this.settings.currency}
                                </div>
                                ${product.originalPrice ? `
                                    <div style="font-size: 1.2rem; color: #999; text-decoration: line-through;">
                                        ${product.originalPrice} ${this.settings.currency}
                                    </div>
                                    <div style="background: #F72585; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.9rem;">
                                        وفر ${product.originalPrice - product.price} ${this.settings.currency}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <h4 style="color: #1A1A1A; margin-bottom: 10px;">الوصف التفصيلي</h4>
                            <p style="color: #666; line-height: 1.8;">${product.description}</p>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <h4 style="color: #1A1A1A; margin-bottom: 10px;">الفوائد الصحية</h4>
                            <ul style="color: #666; padding-right: 20px; line-height: 1.8;">
                                <li>تعزيز جهاز المناعة بشكل طبيعي</li>
                                <li>تحسين مستويات الطاقة والحيوية</li>
                                <li>دعم صحة القلب والجهاز الهضمي</li>
                                <li>مضادات أكسدة طبيعية عالية الجودة</li>
                            </ul>
                        </div>
                        
                        <div style="display: flex; gap: 15px; margin-top: 30px;">
                            <button onclick="mainApp.addToCart(${product.id}); mainApp.closeCurrentModal();" 
                                    style="flex: 1; background: linear-gradient(45deg, #2E8B57, #4CAF50); color: white; border: none; padding: 18px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 1.1rem;">
                                <i class="fas fa-cart-plus"></i> أضف إلى الطلب
                            </button>
                            <button onclick="mainApp.closeCurrentModal()" 
                                    style="flex: 1; background: #f8f9fa; color: #666; border: 2px solid #e0e0e0; padding: 18px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 1.1rem;">
                                <i class="fas fa-times"></i> إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(modalContent, 'تفاصيل المنتج');
    }

    addToCart(productId) {
        const product = sharedStorage.getProduct(productId);
        if (!product || !product.available || product.stock <= 0) {
            this.showNotification('هذا المنتج غير متوفر حالياً', 'error');
            return;
        }
        
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            // التحقق من المخزون
            if (existingItem.quantity >= product.stock) {
                this.showNotification(`لا يمكن إضافة المزيد، الحد الأقصى ${product.stock}`, 'warning');
                return;
            }
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.updateCartDisplay();
        this.showNotification(`تمت إضافة ${product.name} إلى طلبك`, 'success');
    }

    updateCartDisplay() {
        const orderBar = document.getElementById('orderBarPremium');
        const orderCount = document.getElementById('orderCountPremium');
        const orderTotal = document.getElementById('orderTotalPremium');
        const orderItems = document.getElementById('orderItemsPremium');
        
        if (!orderBar || !orderCount || !orderTotal) return;
        
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = this.settings.deliveryFee;
        const total = subtotal + deliveryFee;
        
        orderCount.textContent = totalItems;
        orderTotal.textContent = `${total.toFixed(2)} ${this.settings.currency}`;
        
        if (orderItems) {
            orderItems.textContent = totalItems === 0 ? 'لم تضف أي منتجات بعد' : `${totalItems} منتج في الطلب`;
        }
        
        if (totalItems > 0) {
            orderBar.style.display = 'flex';
        } else {
            orderBar.style.display = 'none';
        }
    }

    removeFromCart(productId) {
        const index = this.cart.findIndex(item => item.id === productId);
        if (index !== -1) {
            const productName = this.cart[index].name;
            this.cart.splice(index, 1);
            this.updateCartDisplay();
            this.showNotification(`تمت إزالة ${productName} من طلبك`, 'info');
        }
    }

    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            const product = sharedStorage.getProduct(productId);
            if (quantity > product.stock) {
                this.showNotification(`الكمية المتاحة: ${product.stock} فقط`, 'warning');
                return;
            }
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.updateCartDisplay();
            }
        }
    }

    openOrderModal() {
        if (this.cart.length === 0) {
            this.showNotification('الرجاء إضافة منتجات إلى طلبك أولاً', 'warning');
            return;
        }
        
        const modalContent = this.createOrderModalContent();
        this.showModal(modalContent, 'إتمام الطلب');
        
        // تهيئة الخريطة بعد عرض النافذة
        setTimeout(() => this.initMap(), 100);
    }

    createOrderModalContent() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = this.settings.deliveryFee;
        const total = subtotal + deliveryFee;
        
        let cartItemsHTML = '';
        this.cart.forEach((item, index) => {
            cartItemsHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 10px; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${item.image}" 
                             alt="${item.name}" 
                             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 700; color: #1A1A1A;">${item.name}</div>
                            <div style="color: #666; font-size: 0.9rem;">${item.price} ${this.settings.currency} لكل قطعة</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button onclick="mainApp.updateCartQuantity(${item.id}, ${item.quantity - 1})" 
                                    style="width: 30px; height: 30px; border-radius: 50%; background: #e0e0e0; border: none; font-weight: 700; cursor: pointer;">-</button>
                            <span style="font-weight: 700; min-width: 30px; text-align: center;">${item.quantity}</span>
                            <button onclick="mainApp.updateCartQuantity(${item.id}, ${item.quantity + 1})" 
                                    style="width: 30px; height: 30px; border-radius: 50%; background: #e0e0e0; border: none; font-weight: 700; cursor: pointer;">+</button>
                        </div>
                        <div style="font-weight: 700; color: #1A1A1A; min-width: 80px; text-align: left;">
                            ${(item.price * item.quantity).toFixed(2)} ${this.settings.currency}
                        </div>
                        <button onclick="mainApp.removeFromCart(${item.id})" 
                                style="background: none; border: none; color: #F72585; cursor: pointer; padding: 5px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        return `
            <div style="max-width: 800px;">
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #1A1A1A; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                        <i class="fas fa-shopping-cart"></i> مراجعة طلبك
                    </h3>
                    <div id="orderCartItems">
                        ${cartItemsHTML}
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #1A1A1A; margin-bottom: 15px;">
                        <i class="fas fa-user"></i> معلومات العميل
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">الاسم الكامل *</label>
                            <input type="text" id="customerName" style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;" placeholder="أدخل اسمك الكامل">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">رقم الهاتف *</label>
                            <input type="tel" id="customerPhone" style="width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 8px;" placeholder="أدخل رقم هاتفك">
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #1A1A1A; margin-bottom: 15px;">
                        <i class="fas fa-map-marker-alt"></i> موقع التوصيل
                    </h3>
                    <div style="background: rgba(67, 97, 238, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px; border-right: 4px solid #4361EE;">
                        <i class="fas fa-info-circle" style="color: #4361EE; margin-left: 10px;"></i>
                        <span>التوصيل في ${this.settings.deliveryAreas === 'abu-dhabi' ? 'أبوظبي فقط' : 'جميع مناطق الإمارات'} خلال ${this.settings.deliveryTime}</span>
                    </div>
                    <div id="map" style="height: 300px; border-radius: 10px; border: 2px solid #eef2f7;"></div>
                    <button onclick="mainApp.useCurrentLocation()" style="margin-top: 15px; background: #f8f9fa; border: 2px solid #eef2f7; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-location-arrow"></i> استخدام موقعي الحالي
                    </button>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #1A1A1A; margin-bottom: 15px;">
                        <i class="fas fa-credit-card"></i> طريقة الدفع
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="border: 2px solid #4361EE; border-radius: 10px; padding: 20px; background: rgba(67, 97, 238, 0.05); cursor: pointer;" onclick="mainApp.selectPayment('cash')">
                            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                                <div style="width: 40px; height: 40px; background: #4361EE; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                                    <i class="fas fa-money-bill-wave"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 700; color: #1A1A1A;">الدفع عند الاستلام</div>
                                    <div style="color: #666; font-size: 0.9rem;">ادفع نقداً عند استلام الطلب</div>
                                </div>
                            </div>
                            <div style="color: #D32F2F; font-size: 0.9rem; margin-top: 10px;">
                                <i class="fas fa-exclamation-triangle"></i> يرجى توفير المبلغ بالضبط
                            </div>
                        </div>
                        <div style="border: 2px solid #eef2f7; border-radius: 10px; padding: 20px; background: #f8f9fa; opacity: 0.6;">
                            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                                <div style="width: 40px; height: 40px; background: #666; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                                    <i class="fas fa-credit-card"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 700; color: #666;">الدفع الإلكتروني</div>
                                    <div style="color: #999; font-size: 0.9rem;">قيد التطوير - قريباً</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: #f0f7f0; padding: 20px; border-radius: 12px; border-right: 4px solid #2E8B57; margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>المجموع الجزئي:</span>
                        <span><strong>${subtotal.toFixed(2)} ${this.settings.currency}</strong></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>رسوم التوصيل:</span>
                        <span><strong>${deliveryFee.toFixed(2)} ${this.settings.currency}</strong></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: 800; padding-top: 15px; border-top: 2px solid #ddd;">
                        <span>المجموع الإجمالي:</span>
                        <span style="color: #2E8B57;">${total.toFixed(2)} ${this.settings.currency}</span>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px;">
                    <button onclick="mainApp.submitOrder()" 
                            style="flex: 1; background: linear-gradient(45deg, #2E8B57, #4CAF50); color: white; border: none; padding: 18px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 1.1rem;">
                        <i class="fas fa-paper-plane"></i> إرسال الطلب
                    </button>
                    <button onclick="mainApp.closeCurrentModal()" 
                            style="flex: 1; background: #f8f9fa; color: #666; border: 2px solid #e0e0e0; padding: 18px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 1.1rem;">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            </div>
        `;
    }

    initMap() {
        if (this.isMapInitialized) return;
        
        const mapElement = document.getElementById('map');
        if (!mapElement) return;
        
        // مركز أبوظبي
        const abuDhabiCenter = [24.4539, 54.3773];
        
        try {
            this.map = L.map(mapElement).setView(abuDhabiCenter, 12);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
            
            this.marker = L.marker(abuDhabiCenter, {
                draggable: true
            }).addTo(this.map);
            
            this.isMapInitialized = true;
        } catch (error) {
            console.error('خطأ في تحميل الخريطة:', error);
        }
    }

    useCurrentLocation() {
        if (!navigator.geolocation) {
            this.showNotification('المتصفح لا يدعم تحديد الموقع', 'error');
            return;
        }
        
        this.showNotification('جاري تحديد موقعك...', 'info');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                if (this.map && this.marker) {
                    const newLatLng = [latitude, longitude];
                    this.map.setView(newLatLng, 15);
                    this.marker.setLatLng(newLatLng);
                    this.showNotification('تم تحديد موقعك بنجاح', 'success');
                }
            },
            (error) => {
                this.showNotification('فشل في تحديد الموقع: ' + error.message, 'error');
            }
        );
    }

    selectPayment(method) {
        this.selectedPayment = method;
        this.showNotification(`تم اختيار ${method === 'cash' ? 'الدفع عند الاستلام' : 'الدفع الإلكتروني'}`, 'info');
    }

    submitOrder() {
        const customerName = document.getElementById('customerName')?.value.trim();
        const customerPhone = document.getElementById('customerPhone')?.value.trim();
        
        if (!customerName || !customerPhone) {
            this.showNotification('الرجاء إدخال الاسم ورقم الهاتف', 'error');
            return;
        }
        
        if (customerPhone.length < 8) {
            this.showNotification('رقم الهاتف غير صحيح', 'error');
            return;
        }
        
        if (!this.selectedPayment) {
            this.showNotification('الرجاء اختيار طريقة الدفع', 'error');
            return;
        }
        
        // جمع بيانات الطلب
        const orderData = {
            customerName,
            customerPhone,
            customerLocation: this.marker ? this.marker.getLatLng() : { lat: 24.4539, lng: 54.3773 },
            products: this.cart.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            subtotal: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            deliveryFee: this.settings.deliveryFee,
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + this.settings.deliveryFee,
            paymentMethod: this.selectedPayment,
            status: 'new'
        };
        
        // إضافة الطلب
        const order = sharedStorage.addOrder(orderData);
        
        // إشعار النجاح
        this.showSuccessMessage(order);
        
        // إعادة تعيين السلة
        this.cart = [];
        this.updateCartDisplay();
        
        // إغلاق النافذة بعد 3 ثوان
        setTimeout(() => {
            this.closeCurrentModal();
        }, 3000);
    }

    showSuccessMessage(order) {
        const modalContent = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 5rem; color: #2E8B57; margin-bottom: 20px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2 style="color: #2E8B57; margin-bottom: 20px;">تم إرسال طلبك بنجاح!</h2>
                <p style="color: #666; margin-bottom: 30px; line-height: 1.8;">
                    شكراً لثقتك بنا. تم استلام طلبك رقم <strong>${order.orderNumber}</strong> وسنتواصل معك خلال ساعة لتأكيد الطلب وتحديد موعد التوصيل.
                </p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px; text-align: right;">
                    <div style="margin-bottom: 10px;">
                        <strong>اسم العميل:</strong> ${order.customerName}
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>رقم الهاتف:</strong> ${order.customerPhone}
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>المبلغ الإجمالي:</strong> ${order.total.toFixed(2)} ${this.settings.currency}
                    </div>
                    <div>
                        <strong>طريقة الدفع:</strong> ${order.paymentMethod === 'cash' ? 'الدفع عند الاستلام' : 'الدفع الإلكتروني'}
                    </div>
                </div>
                <button onclick="mainApp.closeCurrentModal()" 
                        style="background: #4361EE; color: white; border: none; padding: 15px 40px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 1.1rem;">
                    <i class="fas fa-home"></i> العودة للمتجر
                </button>
            </div>
        `;
        
        this.showModal(modalContent, 'طلب ناجح');
    }

    showModal(content, title = '') {
        // إنشاء نافذة منبثقة
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        modalContainer.style.cssText = `
            background: white;
            border-radius: 20px;
            width: 100%;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease;
        `;
        
        let headerHTML = '';
        if (title) {
            headerHTML = `
                <div style="padding: 25px 30px; border-bottom: 1px solid #eef2f7; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: #1A1A1A; font-size: 1.5rem; margin: 0;">${title}</h3>
                    <button onclick="mainApp.closeCurrentModal()" style="background: none; border: none; font-size: 1.5rem; color: #999; cursor: pointer; padding: 5px;">&times;</button>
                </div>
            `;
        }
        
        modalContainer.innerHTML = headerHTML + `
            <div style="padding: ${title ? '30px' : '40px 30px'}">
                ${content}
            </div>
        `;
        
        modal.appendChild(modalContainer);
        document.body.appendChild(modal);
        
        // إضافة أنيميشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `;
        document.head.appendChild(style);
        
        this.currentModal = modal;
    }

    closeCurrentModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }
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

    loadMoreProducts() {
        // في التطبيق الحقيقي، هذا سيجلب المزيد من المنتجات من الخادم
        this.showNotification('جاري تحميل المزيد من المنتجات...', 'info');
        
        setTimeout(() => {
            this.showNotification('تم تحميل المزيد من المنتجات', 'success');
            // هنا ستضيف المنتجات الجديدة إلى this.products ثم تعيد renderProducts()
        }, 1500);
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.mainApp = new MainApp();
});
