// Theme and Language Manager
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.currentLang = 'vi';
        this.translations = {
            vi: {
                // Navigation
                home: 'Trang chủ',
                shop: 'Cửa hàng',
                categories: 'Danh mục',
                cart: 'Giỏ hàng',
                history: 'Lịch sử',
                contact: 'Liên hệ',
                
                // Auth
                login: 'Đăng nhập',
                register: 'Đăng ký',
                logout: 'Đăng xuất',
                email: 'Email',
                password: 'Mật khẩu',
                confirm_password: 'Xác nhận mật khẩu',
                remember_me: 'Ghi nhớ đăng nhập',
                forgot_password: 'Quên mật khẩu?',
                
                // Shop
                add_to_cart: 'Thêm vào giỏ',
                buy_now: 'Mua ngay',
                price: 'Giá',
                duration: 'Thời hạn',
                features: 'Tính năng',
                
                // Cart
                empty_cart: 'Giỏ hàng trống',
                subtotal: 'Tạm tính',
                total: 'Tổng cộng',
                checkout: 'Thanh toán',
                continue_shopping: 'Tiếp tục mua hàng',
                
                // Payment
                topup: 'Nạp tiền',
                payment_method: 'Phương thức thanh toán',
                amount: 'Số tiền',
                transaction_id: 'Mã giao dịch',
                confirm_payment: 'Xác nhận thanh toán',
                
                // History
                order_history: 'Lịch sử đơn hàng',
                topup_history: 'Lịch sử nạp tiền',
                key_history: 'Lịch sử key',
                
                // Contact
                send_message: 'Gửi tin nhắn',
                name: 'Họ tên',
                subject: 'Chủ đề',
                message: 'Tin nhắn',
                
                // Admin
                dashboard: 'Bảng điều khiển',
                users: 'Người dùng',
                orders: 'Đơn hàng',
                products: 'Sản phẩm',
                settings: 'Cài đặt',
                
                // Status
                active: 'Hoạt động',
                inactive: 'Không hoạt động',
                completed: 'Hoàn thành',
                pending: 'Đang xử lý',
                cancelled: 'Đã hủy',
                
                // Messages
                login_success: 'Đăng nhập thành công',
                login_error: 'Email hoặc mật khẩu không chính xác',
                register_success: 'Đăng ký thành công',
                register_error: 'Email đã được sử dụng',
                logout_success: 'Đã đăng xuất',
                add_cart_success: 'Đã thêm vào giỏ hàng',
                remove_cart_success: 'Đã xóa khỏi giỏ hàng',
                checkout_success: 'Thanh toán thành công',
                topup_success: 'Nạp tiền thành công',
                contact_success: 'Tin nhắn đã được gửi',
                
                // Errors
                error_required: 'Vui lòng điền đầy đủ thông tin',
                error_email: 'Email không hợp lệ',
                error_password: 'Mật khẩu phải có ít nhất 6 ký tự',
                error_confirm_password: 'Mật khẩu xác nhận không khớp',
                error_amount: 'Số tiền không hợp lệ',
                error_balance: 'Số dư không đủ',
                error_server: 'Lỗi hệ thống, vui lòng thử lại sau'
            },
            en: {
                // Navigation
                home: 'Home',
                shop: 'Shop',
                categories: 'Categories',
                cart: 'Cart',
                history: 'History',
                contact: 'Contact',
                
                // Auth
                login: 'Login',
                register: 'Register',
                logout: 'Logout',
                email: 'Email',
                password: 'Password',
                confirm_password: 'Confirm Password',
                remember_me: 'Remember me',
                forgot_password: 'Forgot password?',
                
                // Shop
                add_to_cart: 'Add to Cart',
                buy_now: 'Buy Now',
                price: 'Price',
                duration: 'Duration',
                features: 'Features',
                
                // Cart
                empty_cart: 'Your cart is empty',
                subtotal: 'Subtotal',
                total: 'Total',
                checkout: 'Checkout',
                continue_shopping: 'Continue Shopping',
                
                // Payment
                topup: 'Top Up',
                payment_method: 'Payment Method',
                amount: 'Amount',
                transaction_id: 'Transaction ID',
                confirm_payment: 'Confirm Payment',
                
                // History
                order_history: 'Order History',
                topup_history: 'Top-up History',
                key_history: 'Key History',
                
                // Contact
                send_message: 'Send Message',
                name: 'Name',
                subject: 'Subject',
                message: 'Message',
                
                // Admin
                dashboard: 'Dashboard',
                users: 'Users',
                orders: 'Orders',
                products: 'Products',
                settings: 'Settings',
                
                // Status
                active: 'Active',
                inactive: 'Inactive',
                completed: 'Completed',
                pending: 'Pending',
                cancelled: 'Cancelled',
                
                // Messages
                login_success: 'Login successful',
                login_error: 'Invalid email or password',
                register_success: 'Registration successful',
                register_error: 'Email already in use',
                logout_success: 'Logged out successfully',
                add_cart_success: 'Added to cart',
                remove_cart_success: 'Removed from cart',
                checkout_success: 'Checkout successful',
                topup_success: 'Top-up successful',
                contact_success: 'Message sent successfully',
                
                // Errors
                error_required: 'Please fill in all fields',
                error_email: 'Invalid email address',
                error_password: 'Password must be at least 6 characters',
                error_confirm_password: 'Passwords do not match',
                error_amount: 'Invalid amount',
                error_balance: 'Insufficient balance',
                error_server: 'System error, please try again later'
            }
        };
        this.init();
    }

    init() {
        // Load saved preferences
        this.loadPreferences();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial update
        this.updateUI();
    }

    loadPreferences() {
        // Load theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }

        // Load language preference
        const savedLang = localStorage.getItem('lang');
        if (savedLang) {
            this.setLanguage(savedLang);
        }
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Theme toggle
            const themeToggle = document.getElementById('theme-toggle');
            themeToggle?.addEventListener('click', () => {
                this.toggleTheme();
            });

            // Language toggle
            const langToggle = document.getElementById('lang-toggle');
            langToggle?.addEventListener('click', () => {
                this.toggleLanguage();
            });

            // Handle dynamic content
            const observer = new MutationObserver(() => {
                this.updateUI();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeUI();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        this.updateLanguageUI();
    }

    toggleLanguage() {
        const newLang = this.currentLang === 'vi' ? 'en' : 'vi';
        this.setLanguage(newLang);
    }

    translate(key) {
        return this.translations[this.currentLang][key] || key;
    }

    updateUI() {
        this.updateThemeUI();
        this.updateLanguageUI();
    }

    updateThemeUI() {
        // Update theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'dark' ? 
                    'fas fa-sun' : 
                    'fas fa-moon';
            }
        }

        // Update theme-specific styles
        document.body.classList.toggle('dark', this.currentTheme === 'dark');
    }

    updateLanguageUI() {
        // Update all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (key) {
                element.textContent = this.translate(key);
            }
        });

        // Update language toggle button
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.textContent = this.currentLang.toUpperCase();
        }
    }
}

// Create and export theme manager instance
const themeManager = new ThemeManager();
export default themeManager;
