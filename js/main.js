// Import services
import auth from './auth.js';
import cart from './cart.js';
import payment from './payment.js';
import keys from './keys.js';
import themeManager from './theme-lang.js';
import buttonTransformer from './button-transformer.js';

// Main Application Class
class App {
    constructor() {
        this.init();
    }

    init() {
        // Initialize services
        this.initializeServices();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial data
        this.loadInitialData();
        
        // Check protected routes
        this.checkProtectedRoutes();
    }

    initializeServices() {
        // Services are auto-initialized on import
        console.log('Services initialized');
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Handle dynamic content loading
            this.setupDynamicContent();
            
            // Handle form submissions
            this.setupForms();
            
            // Handle navigation
            this.setupNavigation();
        });
    }

    setupDynamicContent() {
        // Load components
        this.loadComponents();

        // Handle dynamic updates
        const observer = new MutationObserver(() => {
            this.updateUI();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    loadComponents() {
        const components = [
            { id: 'header-container', path: 'components/header.html' },
            { id: 'footer-container', path: 'components/footer.html' },
            { id: 'auth-modals-container', path: 'components/auth-modals.html' }
        ];

        components.forEach(component => {
            const container = document.getElementById(component.id);
            if (container) {
                fetch(component.path)
                    .then(response => response.text())
                    .then(html => {
                        container.innerHTML = html;
                        this.updateUI();
                    })
                    .catch(error => console.error(`Error loading ${component.path}:`, error));
            }
        });
    }

    setupForms() {
        // Login form
        const loginForm = document.getElementById('login-form');
        loginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            auth.login(new FormData(loginForm));
        });

        // Register form
        const registerForm = document.getElementById('register-form');
        registerForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            auth.register(new FormData(registerForm));
        });

        // Topup form
        const topupForm = document.getElementById('topup-form');
        topupForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            payment.processTopup(new FormData(topupForm));
        });
    }

    setupNavigation() {
        // Handle navigation events
        window.addEventListener('popstate', () => {
            this.checkProtectedRoutes();
        });
    }

    loadInitialData() {
        // Load config
        const config = {
            payment: {
                bank: {
                    name: 'Vietcombank',
                    account_number: '1234567890',
                    account_name: 'SKYMODHACK'
                },
                momo: {
                    phone: '0987654321',
                    name: 'SKYMODHACK'
                }
            },
            site: {
                name: 'SKYMODHACK',
                description: 'Chúng tôi cung cấp key bản quyền và các phần mềm hỗ trợ chơi game chất lượng cao.',
                maintenance: false,
                version: '1.0.0'
            }
        };

        // Save config if not exists
        if (!localStorage.getItem('config')) {
            localStorage.setItem('config', JSON.stringify(config));
        }

        // Load packages
        const packages = [
            {
                id: 'pkg_1',
                name: 'PUBG Hack Premium',
                price: 200000,
                description: 'Bộ hack cao cấp cho PUBG với nhiều tính năng độc quyền',
                features: [
                    'Aimbot thông minh',
                    'ESP toàn diện',
                    'Wallhack không giật',
                    'Anti-recoil nâng cao',
                    'Bypass anti-cheat'
                ],
                category: 'battle-royale',
                duration: '30 ngày',
                created_at: '2024-01-01T00:00:00.000Z'
            },
            {
                id: 'pkg_2',
                name: 'CS:GO Pro Package',
                price: 150000,
                description: 'Gói hack chuyên nghiệp cho CS:GO',
                features: [
                    'Aimbot tùy chỉnh',
                    'Wallhack HD',
                    'Triggerbot',
                    'Radar hack',
                    'Skin changer'
                ],
                category: 'fps',
                duration: '30 ngày',
                created_at: '2024-01-01T00:00:00.000Z'
            },
            {
                id: 'pkg_3',
                name: 'Valorant Ultimate',
                price: 300000,
                description: 'Bộ hack tối ưu cho Valorant với công nghệ mới nhất',
                features: [
                    'Aimbot siêu chính xác',
                    'ESP người chơi và vật phẩm',
                    'Wallhack thông minh',
                    'Recoil control system',
                    'Anti-screenshot',
                    'HWID spoofer'
                ],
                category: 'fps',
                duration: '30 ngày',
                created_at: '2024-01-01T00:00:00.000Z'
            }
        ];

        // Save packages if not exists
        if (!localStorage.getItem('packages')) {
            localStorage.setItem('packages', JSON.stringify(packages));
        }
    }

    checkProtectedRoutes() {
        const protectedPages = ['admin.html', 'history.html', 'topup.html'];
        const currentPage = window.location.pathname.split('/').pop();

        if (protectedPages.includes(currentPage)) {
            if (!auth.isAuthenticated) {
                window.location.href = 'index.html';
                return;
            }

            if (currentPage === 'admin.html' && !auth.currentUser?.isAdmin) {
                window.location.href = 'index.html';
                return;
            }
        }
    }

    updateUI() {
        // Update auth state UI
        const guestActions = document.getElementById('guest-actions');
        const userActions = document.getElementById('user-actions');
        const username = document.getElementById('username');
        const balanceElements = document.querySelectorAll('.user-balance');

        if (auth.isAuthenticated && auth.currentUser) {
            guestActions?.classList.add('hidden');
            userActions?.classList.remove('hidden');
            if (username) username.textContent = auth.currentUser.username;
            balanceElements.forEach(el => {
                el.textContent = auth.userBalance.toLocaleString('vi-VN') + 'đ';
            });
        } else {
            guestActions?.classList.remove('hidden');
            userActions?.classList.add('hidden');
        }

        // Update cart count
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const count = cart.getCount();
            cartCount.textContent = count;
            cartCount.classList.toggle('hidden', count === 0);
        }
    }
}

// Create and export app instance
const app = new App();
export default app;
