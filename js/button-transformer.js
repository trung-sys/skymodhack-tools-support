document.addEventListener('DOMContentLoaded', () => {
    // Find all "Chọn Gói" buttons and transform them
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (button.textContent.trim() === 'Chọn Gói') {
            // Add the add-to-cart-btn class
            button.classList.add('add-to-cart-btn');
            
            // Update the button content
            button.innerHTML = '<i class="fas fa-cart-plus mr-2"></i>Thêm vào giỏ hàng';
        }
    });
});
