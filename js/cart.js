document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing cart...');

    // Initialize cart from localStorage
    let cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log('Initial cart items:', cartItems);

    // Update cart count
    function updateCartCount() {
        const countElement = document.getElementById('cart-count');
        if (countElement) {
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            countElement.textContent = totalItems;
            console.log('Cart count updated:', totalItems);
        }
    }

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        console.log('Cart saved:', cartItems);
    }

    // Add item to cart
    function addToCart(name, price, game) {
        console.log('Adding to cart:', { name, price, game });
        
        const existingItem = cartItems.find(item => 
            item.name === name && item.game === game
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({
                name,
                price,
                game,
                quantity: 1
            });
        }

        saveCart();
        updateCartCount();

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMessage.textContent = 'Đã thêm vào giỏ hàng';
        document.body.appendChild(successMessage);

        setTimeout(() => {
            successMessage.remove();
        }, 2000);
    }

    // Initialize cart count
    updateCartCount();

    // Handle add to cart button clicks
    document.addEventListener('click', (e) => {
        console.log('Click event on:', e.target);
        
        // Find the button element
        const button = e.target.closest('[data-action="add-to-cart"]');
        if (!button) return;

        console.log('Add to cart button clicked:', button);
        e.preventDefault();
        
        const name = button.getAttribute('data-product-name');
        const price = button.getAttribute('data-product-price');
        const game = document.getElementById('game-title')?.textContent || '';
        
        console.log('Product details:', { name, price, game });
        
        if (name && price) {
            addToCart(name, price, game);
            
            // Update button appearance temporarily
            button.classList.remove('bg-pink-500', 'hover:bg-pink-600');
            button.classList.add('bg-green-500', 'hover:bg-green-600');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check mr-2"></i>Đã thêm vào giỏ';
            
            setTimeout(() => {
                button.classList.remove('bg-green-500', 'hover:bg-green-600');
                button.classList.add('bg-pink-500', 'hover:bg-pink-600');
                button.innerHTML = originalText;
            }, 2000);
        }
    });

    // Handle cart page functionality
    if (window.location.pathname.includes('cart.html')) {
        console.log('Initializing cart page');
        const cartItemsContainer = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartTotal = document.getElementById('cart-total');

        if (cartItemsContainer && cartSummary && emptyCartMessage && cartTotal) {
            function updateCartUI() {
                console.log('Updating cart UI with items:', cartItems);
                
                if (cartItems.length === 0) {
                    cartItemsContainer.innerHTML = '';
                    cartSummary.classList.add('hidden');
                    emptyCartMessage.classList.remove('hidden');
                    return;
                }

                cartSummary.classList.remove('hidden');
                emptyCartMessage.classList.add('hidden');

                cartItemsContainer.innerHTML = cartItems.map((item, index) => `
                    <div class="bg-[#2a1b3e] rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <h3 class="font-bold">${item.name}</h3>
                            <p class="text-sm text-gray-400">${item.game}</p>
                            <div class="flex items-center mt-2">
                                <span class="text-pink-500 font-bold">${item.price}</span>
                                <span class="mx-2 text-gray-400">×</span>
                                <span>${item.quantity}</span>
                            </div>
                        </div>
                        <button class="remove-item-btn text-gray-400 hover:text-pink-500 transition-colors" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('');

                const total = cartItems.reduce((sum, item) => {
                    const price = parseInt(item.price.replace(/\D/g, ''));
                    return sum + (price * item.quantity);
                }, 0);

                cartTotal.textContent = total.toLocaleString('vi-VN') + 'đ';
            }

            // Initialize cart UI
            updateCartUI();

            // Handle remove item buttons
            document.addEventListener('click', (e) => {
                const removeButton = e.target.closest('.remove-item-btn');
                if (removeButton) {
                    const index = parseInt(removeButton.dataset.index);
                    cartItems.splice(index, 1);
                    saveCart();
                    updateCartUI();
                }
            });

            // Handle checkout button
            const checkoutButton = document.getElementById('checkout-button');
            if (checkoutButton) {
                checkoutButton.addEventListener('click', () => {
                    if (cartItems.length === 0) return;

                    alert('Thanh toán thành công!');
                    cartItems = [];
                    saveCart();
                    updateCartUI();
                });
            }
        }
    }
});
