// Shopping Cart Service
class CartService {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateUI();
            this.updateCartCount();
        });
    }

    addItem(item) {
        try {
            // Check if item already exists
            const existingItem = this.cart.find(i => i.id === item.id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.cart.push({
                    ...item,
                    quantity: 1
                });
            }

            // Save cart
            this.saveCart();

            // Show success message
            this.showNotification('Đã thêm vào giỏ hàng', 'success');

            return true;
        } catch (error) {
            console.error('Add to cart error:', error);
            this.showNotification('Không thể thêm vào giỏ hàng', 'error');
            return false;
        }
    }

    removeItem(itemId) {
        try {
            this.cart = this.cart.filter(item => item.id !== itemId);
            this.saveCart();
            this.showNotification('Đã xóa khỏi giỏ hàng', 'success');
            return true;
        } catch (error) {
            console.error('Remove from cart error:', error);
            this.showNotification('Không thể xóa khỏi giỏ hàng', 'error');
            return false;
        }
    }

    updateQuantity(itemId, quantity) {
        try {
            const item = this.cart.find(i => i.id === itemId);
            if (item) {
                item.quantity = Math.max(1, quantity);
                this.saveCart();
            }
            return true;
        } catch (error) {
            console.error('Update quantity error:', error);
            return false;
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateUI();
        this.updateCartCount();
    }

    updateUI() {
        // Update cart items display
        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = '';
            document.getElementById('empty-cart')?.classList.remove('hidden');
            return;
        }

        document.getElementById('empty-cart')?.classList.add('hidden');

        cartItems.innerHTML = this.cart.map(item => `
            <div class="bg-[#2a1b3e] rounded-xl p-6 border border-pink-500/30">
                <div class="flex justify-between items-start">
                    <div class="flex items-center space-x-4">
                        <div class="w-16 h-16 rounded-lg bg-[#1a0b2e] flex items-center justify-center">
                            <i class="fas fa-gamepad text-3xl text-pink-500"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold">${item.name}</h3>
                            <p class="text-sm text-gray-400">${item.duration}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <button onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})"
                                    class="w-8 h-8 rounded-lg bg-[#1a0b2e] text-gray-400 hover:text-white transition-colors">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="w-8 text-center">${item.quantity}</span>
                            <button onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})"
                                    class="w-8 h-8 rounded-lg bg-[#1a0b2e] text-gray-400 hover:text-white transition-colors">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-pink-500">
                                ${(item.price * item.quantity).toLocaleString('vi-VN')}đ
                            </p>
                            <button onclick="cart.removeItem('${item.id}')"
                                    class="text-sm text-gray-400 hover:text-red-500 transition-colors">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Update totals
        const subtotal = this.getTotal();
        document.getElementById('subtotal')?.textContent = subtotal.toLocaleString('vi-VN') + 'đ';
        document.getElementById('total')?.textContent = subtotal.toLocaleString('vi-VN') + 'đ';

        // Update checkout button state
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        const checkoutBtn = document.getElementById('checkout-btn');
        
        if (checkoutBtn) {
            if (!auth.isAuthenticated) {
                checkoutBtn.disabled = true;
                document.getElementById('login-warning')?.classList.remove('hidden');
            } else if (auth.user.balance < subtotal) {
                checkoutBtn.disabled = true;
                document.getElementById('balance-warning')?.classList.remove('hidden');
            } else {
                checkoutBtn.disabled = false;
                document.getElementById('login-warning')?.classList.add('hidden');
                document.getElementById('balance-warning')?.classList.add('hidden');
            }
        }
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartCount = document.getElementById('cart-count');
        
        if (cartCount) {
            cartCount.textContent = count;
            cartCount.classList.toggle('hidden', count === 0);
        }
    }

    async checkout() {
        try {
            const auth = JSON.parse(localStorage.getItem('auth') || '{}');
            if (!auth.isAuthenticated) {
                throw new Error('Vui lòng đăng nhập để thanh toán');
            }

            const total = this.getTotal();
            if (auth.user.balance < total) {
                throw new Error('Số dư không đủ');
            }

            // Create order
            const order = {
                id: 'order_' + Date.now(),
                userId: auth.user.id,
                items: this.cart,
                total: total,
                status: 'completed',
                created_at: new Date().toISOString()
            };

            // Save order
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Update user balance
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.id === auth.user.id);
            if (user) {
                user.balance -= total;
                localStorage.setItem('users', JSON.stringify(users));

                // Update auth state
                auth.user = user;
                localStorage.setItem('auth', JSON.stringify(auth));
            }

            // Generate keys
            const keys = JSON.parse(localStorage.getItem('keys') || '[]');
            this.cart.forEach(item => {
                for (let i = 0; i < item.quantity; i++) {
                    keys.push({
                        id: 'key_' + Date.now() + i,
                        code: this.generateKeyCode(),
                        packageId: item.id,
                        userId: auth.user.id,
                        status: 'active',
                        created_at: new Date().toISOString()
                    });
                }
            });
            localStorage.setItem('keys', JSON.stringify(keys));

            // Clear cart
            this.clearCart();

            // Show success message
            this.showNotification('Thanh toán thành công', 'success');

            // Redirect to history page
            setTimeout(() => {
                window.location.href = 'history.html';
            }, 2000);

            return true;
        } catch (error) {
            console.error('Checkout error:', error);
            this.showNotification(error.message, 'error');
            return false;
        }
    }

    generateKeyCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const segments = 4;
        const segmentLength = 4;
        let key = '';
        
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segmentLength; j++) {
                key += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            if (i < segments - 1) key += '-';
        }
        
        return key;
    }

    showNotification(message, type = 'success') {
        const container = document.createElement('div');
        container.className = `fixed top-4 right-4 z-50 p-4 rounded-lg ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white shadow-lg transform transition-all duration-300 translate-x-full`;

        container.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(container);

        // Animate in
        setTimeout(() => {
            container.classList.remove('translate-x-full');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            container.classList.add('translate-x-full');
            setTimeout(() => {
                container.remove();
            }, 300);
        }, 3000);
    }
}

// Create and export cart service instance
const cart = new CartService();
export default cart;
