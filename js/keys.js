// Key Management Service
class KeyService {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            // Set up key generation form if on admin page
            const generateKeyForm = document.getElementById('generate-key-form');
            generateKeyForm?.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateKeys(new FormData(generateKeyForm));
            });
        });
    }

    async generateKeys(formData) {
        try {
            const auth = JSON.parse(localStorage.getItem('auth') || '{}');
            if (!auth.isAuthenticated || !auth.user.isAdmin) {
                throw new Error('Unauthorized');
            }

            const packageId = formData.get('package');
            const quantity = parseInt(formData.get('quantity'));

            if (!packageId || !quantity) {
                throw new Error('Vui lòng điền đầy đủ thông tin');
            }

            // Generate keys
            const keys = JSON.parse(localStorage.getItem('keys') || '[]');
            const newKeys = [];

            for (let i = 0; i < quantity; i++) {
                newKeys.push({
                    id: 'key_' + Date.now() + i,
                    code: this.generateKeyCode(),
                    packageId: packageId,
                    status: 'active',
                    created_at: new Date().toISOString()
                });
            }

            // Save keys
            keys.push(...newKeys);
            localStorage.setItem('keys', JSON.stringify(keys));

            // Show success message
            this.showNotification(`Đã tạo ${quantity} key thành công`, 'success');

            // Reset form
            document.getElementById('generate-key-form')?.reset();

            // Update key inventory display
            this.updateKeyInventory();

            return true;
        } catch (error) {
            console.error('Generate keys error:', error);
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

    showKey(keyId) {
        try {
            const auth = JSON.parse(localStorage.getItem('auth') || '{}');
            if (!auth.isAuthenticated) {
                throw new Error('Vui lòng đăng nhập để xem key');
            }

            const keys = JSON.parse(localStorage.getItem('keys') || '[]');
            const key = keys.find(k => k.id === keyId);

            if (!key) {
                throw new Error('Không tìm thấy key');
            }

            if (key.userId !== auth.user.id && !auth.user.isAdmin) {
                throw new Error('Bạn không có quyền xem key này');
            }

            // Create modal
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-[#2a1b3e] rounded-xl p-8 w-full max-w-md mx-4">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold">Chi tiết key</h3>
                        <button onclick="this.closest('.fixed').remove()" 
                                class="text-gray-400 hover:text-white transition-colors">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="space-y-4">
                        <div class="p-4 rounded-lg bg-[#1a0b2e] text-center">
                            <p class="text-sm text-gray-400 mb-1">Key code</p>
                            <p class="font-mono text-xl font-bold">${key.code}</p>
                        </div>
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="text-sm text-gray-400">Trạng thái</p>
                                <p class="font-semibold ${
                                    key.status === 'active' ? 'text-green-500' : 'text-yellow-500'
                                }">
                                    ${key.status === 'active' ? 'Chưa sử dụng' : 'Đã sử dụng'}
                                </p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-gray-400">Ngày tạo</p>
                                <p class="font-semibold">
                                    ${new Date(key.created_at).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>
                        <button onclick="keys.copyToClipboard('${key.code}')"
                                class="w-full px-4 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                            <i class="fas fa-copy mr-2"></i>
                            Sao chép key
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        } catch (error) {
            console.error('Show key error:', error);
            this.showNotification(error.message, 'error');
        }
    }

    updateKeyInventory() {
        const container = document.getElementById('key-inventory');
        if (!container) return;

        const keys = JSON.parse(localStorage.getItem('keys') || '[]');
        const config = JSON.parse(localStorage.getItem('config') || '{}');

        // Group keys by package
        const groupedKeys = keys.reduce((groups, key) => {
            const pkg = config.packages?.find(p => p.id === key.packageId);
            if (!pkg) return groups;

            if (!groups[key.packageId]) {
                groups[key.packageId] = {
                    package: pkg,
                    total: 0,
                    active: 0,
                    used: 0
                };
            }

            groups[key.packageId].total++;
            if (key.status === 'active') {
                groups[key.packageId].active++;
            } else {
                groups[key.packageId].used++;
            }

            return groups;
        }, {});

        container.innerHTML = Object.values(groupedKeys).map(group => `
            <div class="bg-[#2a1b3e] rounded-xl p-6 border border-pink-500/30">
                <div class="flex items-center space-x-4 mb-4">
                    <div class="w-12 h-12 rounded-lg bg-[#1a0b2e] flex items-center justify-center">
                        <i class="fas fa-gamepad text-2xl text-pink-500"></i>
                    </div>
                    <div>
                        <h3 class="font-semibold">${group.package.name}</h3>
                        <p class="text-sm text-gray-400">${group.package.duration}</p>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p class="text-sm text-gray-400">Tổng</p>
                        <p class="font-bold">${group.total}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Khả dụng</p>
                        <p class="font-bold text-green-500">${group.active}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">Đã dùng</p>
                        <p class="font-bold text-yellow-500">${group.used}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => this.showNotification('Đã sao chép key', 'success'))
            .catch(() => this.showNotification('Không thể sao chép key', 'error'));
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

// Create and export key service instance
const keys = new KeyService();
export default keys;
