class AdminService {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            // Check admin access
            if (!this.checkAdminAccess()) {
                window.location.href = 'index.html';
                return;
            }

            // Initialize components
            this.initializeComponents();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            this.loadInitialData();
        });
    }

    checkAdminAccess() {
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        return auth.isAuthenticated && auth.user?.isAdmin;
    }

    initializeComponents() {
        // Initialize charts if any
        this.initializeCharts();
        
        // Initialize data tables if any
        this.initializeDataTables();
    }

    setupEventListeners() {
        // Payment settings form
        const paymentForm = document.getElementById('payment-settings-form');
        paymentForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePaymentSettings(new FormData(paymentForm));
        });

        // Package form
        const packageForm = document.getElementById('package-form');
        packageForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePackage(new FormData(packageForm));
        });

        // Tab switching
        const tabButtons = document.querySelectorAll('[data-tab]');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.getAttribute('data-tab'));
            });
        });
    }

    loadInitialData() {
        // Load payment settings
        this.loadPaymentSettings();
        
        // Load packages
        this.loadPackages();
        
        // Load customer data
        this.loadCustomerData();
    }

    initializeCharts() {
        // Revenue chart
        const revenueData = this.getRevenueData();
        this.createRevenueChart(revenueData);
        
        // User growth chart
        const userGrowthData = this.getUserGrowthData();
        this.createUserGrowthChart(userGrowthData);
    }

    initializeDataTables() {
        // Initialize customer data table
        this.initializeCustomerTable();
        
        // Initialize orders table
        this.initializeOrdersTable();
    }

    // Payment Settings
    savePaymentSettings(formData) {
        try {
            const settings = {
                bank_name: formData.get('bank_name'),
                account_number: formData.get('account_number'),
                account_name: formData.get('account_name'),
                momo_phone: formData.get('momo_phone'),
                momo_name: formData.get('momo_name')
            };

            localStorage.setItem('payment_config', JSON.stringify(settings));
            this.showNotification('Đã lưu cài đặt thanh toán', 'success');
        } catch (error) {
            console.error('Save payment settings error:', error);
            this.showNotification('Không thể lưu cài đặt', 'error');
        }
    }

    loadPaymentSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('payment_config') || '{}');
            const form = document.getElementById('payment-settings-form');
            
            if (form) {
                form.bank_name.value = settings.bank_name || '';
                form.account_number.value = settings.account_number || '';
                form.account_name.value = settings.account_name || '';
                form.momo_phone.value = settings.momo_phone || '';
                form.momo_name.value = settings.momo_name || '';
            }
        } catch (error) {
            console.error('Load payment settings error:', error);
            this.showNotification('Không thể tải cài đặt', 'error');
        }
    }

    // Package Management
    savePackage(formData) {
        try {
            const package_ = {
                id: 'pkg_' + Date.now(),
                name: formData.get('package_name'),
                price: parseInt(formData.get('package_price')),
                description: formData.get('package_description'),
                features: formData.get('package_features').split('\n').filter(f => f.trim()),
                created_at: new Date().toISOString()
            };

            const packages = JSON.parse(localStorage.getItem('packages') || '[]');
            packages.push(package_);
            localStorage.setItem('packages', JSON.stringify(packages));

            this.showNotification('Đã thêm gói mới', 'success');
            this.loadPackages();
            document.getElementById('package-form')?.reset();
        } catch (error) {
            console.error('Save package error:', error);
            this.showNotification('Không thể thêm gói', 'error');
        }
    }

    loadPackages() {
        try {
            const packages = JSON.parse(localStorage.getItem('packages') || '[]');
            const container = document.getElementById('packages-list');
            
            if (container) {
                container.innerHTML = packages.map(pkg => `
                    <div class="bg-[#1a0b2e] rounded-xl p-6 border border-pink-500/30">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="text-xl font-bold">${pkg.name}</h3>
                                <p class="text-sm text-gray-400">${pkg.description}</p>
                            </div>
                            <span class="text-xl font-bold text-pink-500">
                                ${pkg.price.toLocaleString('vi-VN')}đ
                            </span>
                        </div>
                        <div class="space-y-2 mb-6">
                            ${pkg.features.map(feature => `
                                <div class="flex items-center text-sm">
                                    <i class="fas fa-check text-pink-500 mr-2"></i>
                                    <span>${feature}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="flex justify-end space-x-4">
                            <button onclick="admin.editPackage('${pkg.id}')"
                                    class="px-4 py-2 rounded-lg border border-pink-500/30 text-pink-500 hover:bg-pink-500 hover:text-white transition-colors">
                                <i class="fas fa-edit mr-2"></i>
                                Sửa
                            </button>
                            <button onclick="admin.deletePackage('${pkg.id}')"
                                    class="px-4 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                                <i class="fas fa-trash-alt mr-2"></i>
                                Xóa
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Load packages error:', error);
            this.showNotification('Không thể tải danh sách gói', 'error');
        }
    }

    editPackage(packageId) {
        try {
            const packages = JSON.parse(localStorage.getItem('packages') || '[]');
            const package_ = packages.find(p => p.id === packageId);
            
            if (package_) {
                const form = document.getElementById('package-form');
                if (form) {
                    form.package_name.value = package_.name;
                    form.package_price.value = package_.price;
                    form.package_description.value = package_.description;
                    form.package_features.value = package_.features.join('\n');
                    form.setAttribute('data-editing', packageId);
                }
            }
        } catch (error) {
            console.error('Edit package error:', error);
            this.showNotification('Không thể sửa gói', 'error');
        }
    }

    deletePackage(packageId) {
        try {
            const packages = JSON.parse(localStorage.getItem('packages') || '[]');
            const newPackages = packages.filter(p => p.id !== packageId);
            localStorage.setItem('packages', JSON.stringify(newPackages));
            
            this.showNotification('Đã xóa gói', 'success');
            this.loadPackages();
        } catch (error) {
            console.error('Delete package error:', error);
            this.showNotification('Không thể xóa gói', 'error');
        }
    }

    // Customer Data
    loadCustomerData() {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const container = document.getElementById('customer-data');
            
            if (container) {
                container.innerHTML = `
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Người dùng
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Số dư
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Đơn hàng
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Ngày tham gia
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-pink-500/30">
                                ${users.map(user => {
                                    const userOrders = orders.filter(o => o.userId === user.id);
                                    return `
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="flex items-center">
                                                    <div class="h-10 w-10 rounded-full bg-[#2a1b3e] flex items-center justify-center">
                                                        <i class="fas fa-user text-pink-500"></i>
                                                    </div>
                                                    <div class="ml-4">
                                                        <div class="text-sm font-medium">${user.username}</div>
                                                        <div class="text-sm text-gray-400">${user.isAdmin ? 'Admin' : 'User'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm">${user.email}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                                ${user.balance?.toLocaleString('vi-VN')}đ
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                                ${userOrders.length}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                ${new Date(user.created_at).toLocaleDateString('vi-VN')}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Load customer data error:', error);
            this.showNotification('Không thể tải dữ liệu khách hàng', 'error');
        }
    }

    // Tab Switching
    switchTab(tabName) {
        const tabs = {
            payment: document.getElementById('payment-tab'),
            packages: document.getElementById('packages-tab'),
            customers: document.getElementById('customers-tab')
        };

        const buttons = document.querySelectorAll('[data-tab]');
        buttons.forEach(btn => {
            const isActive = btn.getAttribute('data-tab') === tabName;
            btn.classList.toggle('text-pink-500', isActive);
            btn.classList.toggle('border-b-2', isActive);
            btn.classList.toggle('border-pink-500', isActive);
            btn.classList.toggle('text-gray-400', !isActive);
        });

        Object.entries(tabs).forEach(([name, element]) => {
            if (element) {
                element.classList.toggle('hidden', name !== tabName);
            }
        });

        // Load tab data
        if (tabName === 'payment') {
            this.loadPaymentSettings();
        } else if (tabName === 'packages') {
            this.loadPackages();
        } else if (tabName === 'customers') {
            this.loadCustomerData();
        }
    }

    // Charts
    getRevenueData() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const today = new Date();
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        return last30Days.map(date => {
            const dayOrders = orders.filter(o => o.created_at.startsWith(date));
            const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
            return { date, revenue };
        });
    }

    getUserGrowthData() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const today = new Date();
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        return last30Days.map(date => {
            const newUsers = users.filter(u => u.created_at.startsWith(date));
            return { date, count: newUsers.length };
        });
    }

    createRevenueChart(data) {
        // Implement chart creation using your preferred charting library
        console.log('Revenue data:', data);
    }

    createUserGrowthChart(data) {
        // Implement chart creation using your preferred charting library
        console.log('User growth data:', data);
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

// Initialize admin service
const admin = new AdminService();
export default admin;
