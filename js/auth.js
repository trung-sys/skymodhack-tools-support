// Authentication Service
class AuthService {
    constructor() {
        this.auth = JSON.parse(localStorage.getItem('auth') || '{}');
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            // Set up form submissions
            const loginForm = document.getElementById('login-form');
            loginForm?.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login(new FormData(loginForm));
            });

            const registerForm = document.getElementById('register-form');
            registerForm?.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register(new FormData(registerForm));
            });

            // Update UI
            this.updateUI();
        });
    }

    get isAuthenticated() {
        return this.auth.isAuthenticated || false;
    }

    get currentUser() {
        return this.auth.user || null;
    }

    async login(formData) {
        try {
            const email = formData.get('email');
            const password = formData.get('password');

            // Validate input
            if (!email || !password) {
                throw new Error('Vui lòng điền đầy đủ thông tin');
            }

            // Find user
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                throw new Error('Email hoặc mật khẩu không chính xác');
            }

            // Update auth state
            this.auth = {
                isAuthenticated: true,
                user: user
            };

            // Save to localStorage
            localStorage.setItem('auth', JSON.stringify(this.auth));

            // Update UI
            this.updateUI();

            // Hide login modal
            document.getElementById('login-modal')?.classList.add('hidden');

            // Show success message
            this.showNotification('Đăng nhập thành công', 'success');

            return true;
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification(error.message, 'error');
            return false;
        }
    }

    async register(formData) {
        try {
            const username = formData.get('username');
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirm_password');
            const agreeTerms = formData.get('agree_terms');

            // Validate input
            if (!username || !email || !password || !confirmPassword) {
                throw new Error('Vui lòng điền đầy đủ thông tin');
            }

            if (password !== confirmPassword) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }

            if (!agreeTerms) {
                throw new Error('Vui lòng đồng ý với điều khoản dịch vụ');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Email không hợp lệ');
            }

            // Check if email exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.some(u => u.email === email)) {
                throw new Error('Email đã được sử dụng');
            }

            // Create new user
            const newUser = {
                id: 'user_' + Date.now(),
                username,
                email,
                password,
                isAdmin: false,
                balance: 0,
                created_at: new Date().toISOString()
            };

            // Save user
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Auto login
            this.auth = {
                isAuthenticated: true,
                user: newUser
            };

            // Save auth state
            localStorage.setItem('auth', JSON.stringify(this.auth));

            // Update UI
            this.updateUI();

            // Hide register modal
            document.getElementById('register-modal')?.classList.add('hidden');

            // Show success message
            this.showNotification('Đăng ký thành công', 'success');

            return true;
        } catch (error) {
            console.error('Register error:', error);
            this.showNotification(error.message, 'error');
            return false;
        }
    }

    logout() {
        // Clear auth state
        this.auth = {};
        localStorage.setItem('auth', JSON.stringify(this.auth));

        // Update UI
        this.updateUI();

        // Show success message
        this.showNotification('Đã đăng xuất', 'success');

        // Redirect to home if on protected page
        const protectedPages = ['admin.html', 'history.html', 'topup.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    }

    updateUI() {
        // Update guest/user actions visibility
        const guestActions = document.getElementById('guest-actions');
        const userActions = document.getElementById('user-actions');

        if (guestActions && userActions) {
            if (this.isAuthenticated) {
                guestActions.classList.add('hidden');
                userActions.classList.remove('hidden');
            } else {
                guestActions.classList.remove('hidden');
                userActions.classList.add('hidden');
            }
        }

        // Update username display
        const usernameElement = document.getElementById('username');
        if (usernameElement && this.currentUser) {
            usernameElement.textContent = this.currentUser.username;
        }

        // Update balance display
        const balanceElements = document.querySelectorAll('.user-balance');
        if (balanceElements.length > 0 && this.currentUser) {
            balanceElements.forEach(element => {
                element.textContent = this.currentUser.balance.toLocaleString('vi-VN') + 'đ';
            });
        }

        // Check admin access
        if (window.location.pathname.endsWith('admin.html') && (!this.isAuthenticated || !this.currentUser?.isAdmin)) {
            window.location.href = 'index.html';
        }
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

// Create and export auth service instance
const auth = new AuthService();
export default auth;
