class AuthService {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                this.updateUI(true);
            } catch (e) {
                console.error('Error parsing user data:', e);
                this.logout();
            }
        }

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(
                    loginForm.querySelector('input[name="email"]').value,
                    loginForm.querySelector('input[name="password"]').value
                );
            });
        }

        // Register form submission
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(
                    registerForm.querySelector('input[name="email"]').value,
                    registerForm.querySelector('input[name="password"]').value,
                    registerForm.querySelector('input[name="confirm_password"]').value,
                    registerForm.querySelector('input[name="username"]').value
                );
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    async handleLogin(email, password) {
        try {
            // In a real application, this would be an API call
            const mockApiCall = new Promise((resolve, reject) => {
                // Simulate API delay
                setTimeout(() => {
                    // Get users from localStorage (mock database)
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const user = users.find(u => u.email === email && u.password === this.hashPassword(password));
                    
                    if (user) {
                        resolve({
                            token: 'mock_token_' + Date.now(),
                            user: { ...user, password: undefined }
                        });
                    } else {
                        reject(new Error('Invalid credentials'));
                    }
                }, 1000);
            });

            const response = await mockApiCall;
            
            // Store auth data
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_data', JSON.stringify(response.user));
            
            this.currentUser = response.user;
            this.isAuthenticated = true;
            
            // Update UI
            this.updateUI(true);
            
            // Show success message
            this.showNotification('Đăng nhập thành công!', 'success');
            
            // Redirect to dashboard/home
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!', 'error');
        }
    }

    async handleRegister(email, password, confirmPassword, username) {
        try {
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Validate password strength
            if (!this.validatePassword(password)) {
                throw new Error('Password must be at least 8 characters long and contain letters and numbers');
            }

            // In a real application, this would be an API call
            const mockApiCall = new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Get existing users
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    
                    // Check if user already exists
                    if (users.some(u => u.email === email)) {
                        reject(new Error('User already exists'));
                        return;
                    }

                    // Create new user
                    const newUser = {
                        id: Date.now(),
                        email,
                        username,
                        password: this.hashPassword(password),
                        created_at: new Date().toISOString()
                    };

                    // Add to "database"
                    users.push(newUser);
                    localStorage.setItem('users', JSON.stringify(users));

                    resolve({
                        token: 'mock_token_' + Date.now(),
                        user: { ...newUser, password: undefined }
                    });
                }, 1000);
            });

            const response = await mockApiCall;
            
            // Store auth data
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_data', JSON.stringify(response.user));
            
            this.currentUser = response.user;
            this.isAuthenticated = true;
            
            // Update UI
            this.updateUI(true);
            
            // Show success message
            this.showNotification('Đăng ký thành công!', 'success');
            
            // Redirect to dashboard/home
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);

        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification(error.message || 'Đăng ký thất bại. Vui lòng thử lại!', 'error');
        }
    }

    logout() {
        // Clear auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Update UI
        this.updateUI(false);
        
        // Show success message
        this.showNotification('Đăng xuất thành công!', 'success');
        
        // Redirect to home
        window.location.href = '/index.html';
    }

    updateUI(isAuthenticated) {
        // Update navigation items
        const authButtons = document.querySelectorAll('.auth-buttons');
        const userMenu = document.querySelectorAll('.user-menu');
        const userNameElements = document.querySelectorAll('.user-name');

        authButtons.forEach(el => {
            el.style.display = isAuthenticated ? 'none' : 'flex';
        });

        userMenu.forEach(el => {
            el.style.display = isAuthenticated ? 'flex' : 'none';
        });

        if (isAuthenticated && this.currentUser) {
            userNameElements.forEach(el => {
                el.textContent = this.currentUser.username;
            });
        }
    }

    validatePassword(password) {
        // Password must be at least 8 characters and contain both letters and numbers
        return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
    }

    hashPassword(password) {
        // In a real application, use a proper hashing algorithm
        // This is just for demonstration
        return btoa(password);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize auth service
const auth = new AuthService();
export default auth;
