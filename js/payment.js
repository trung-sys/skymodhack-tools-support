// Payment Service
class PaymentService {
    constructor() {
        this.init();
    }

    init() {
        // Load payment methods
        this.loadPaymentMethods();
    }

    loadPaymentMethods() {
        const config = JSON.parse(localStorage.getItem('config') || '{}');
        const { bank, momo } = config.payment || {};

        // Update bank info
        const bankInfo = document.getElementById('bank-info');
        if (bankInfo && bank) {
            bankInfo.innerHTML = `
                <div class="flex items-center space-x-4 mb-6">
                    <div class="w-12 h-12 rounded-lg bg-[#1a0b2e] flex items-center justify-center">
                        <i class="fas fa-university text-2xl text-pink-500"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-semibold">Chuyển khoản ngân hàng</h2>
                        <p class="text-sm text-gray-400">Chuyển khoản qua tài khoản ngân hàng</p>
                    </div>
                </div>
                <div class="space-y-4">
                    <div class="flex justify-between items-center p-4 rounded-lg bg-[#1a0b2e]">
                        <div>
                            <p class="text-sm text-gray-400">Ngân hàng</p>
                            <p class="font-semibold">${bank.name}</p>
                        </div>
                        <button onclick="payment.copyToClipboard('${bank.name}')"
                                class="px-3 py-1 rounded border border-pink-500/30 text-pink-500 hover:bg-pink-500 hover:text-white transition-colors">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="flex justify-between items-center p-4 rounded-lg bg-[#1a0b2e]">
                        <div>
                            <p class="text-sm text-gray-400">Số tài khoản</p>
                            <p class="font-semibold">${bank.account_number}</p>
                        </div>
                        <button onclick="payment.copyToClipboard('${bank.account_number}')"
                                class="px-3 py-1 rounded border border-pink-500/30 text-pink-500 hover:bg-pink-500 hover:text-white transition-colors">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="flex justify-between items-center p-4 rounded-lg bg-[#1a0b2e]">
                        <div>
                            <p class="text-sm text-gray-400">Chủ tài khoản</p>
                            <p class="font-semibold">${bank.account_name}</p>
                        </div>
                        <button onclick="payment.copyToClipboard('${bank.account_name}')"
                                class="px-3 py-1 rounded border border-pink-500/30 text-pink-500 hover:bg-pink-500 hover:text-white transition-colors">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        // Update MoMo info
        const momoInfo = document.getElementById('momo-info');
        if (momoInfo && momo) {
            momoInfo.innerHTML = `
                <div class="flex items-center space-x-4 mb-6">
                    <div class="w-12 h-12 rounded-lg bg-[#1a0b2e] flex items-center justify-center">
                        <i class="fas fa-mobile-alt text-2xl text-pink-500"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-semibold">Ví MoMo</h2>
                        <p class="text-sm text-gray-400">Chuyển tiền qua ví điện tử MoMo</p>
                    </div>
                </div>
                <div class="space-y-4">
                    <div class="flex justify-between items-center p-4 rounded-lg bg-[#1a0b2e]">
                        <div>
                            <p class="text-sm text-gray-400">Số điện thoại</p>
                            <p class="font-semibold">${momo.phone}</p>
                        </div>
                        <button onclick="payment.copyToClipboard('${momo.phone}')"
                                class="px-3 py-1 rounded border border-pink-500/30 text-pink-500 hover:bg-pink-500 hover:text-white transition-colors">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="flex justify-between items-center p-4 rounded-lg bg-[#1a0b2e]">
                        <div>
                            <p class="text-sm text-gray-400">Chủ tài khoản</p>
                            <p class="font-semibold">${momo.name}</p>
                        </div>
                        <button onclick="payment.copyToClipboard('${momo.name}')"
                                class="px-3 py-1 rounded border border-pink-500/30 text-pink-500 hover:bg-pink-500 hover:text-white transition-colors">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            `;
        }
    }

    async processTopup(formData) {
        try {
            const auth = JSON.parse(localStorage.getItem('auth') || '{}');
            if (!auth.isAuthenticated) {
                throw new Error('Vui lòng đăng nhập để nạp tiền');
            }

            const data = {
                id: 'topup_' + Date.now(),
                userId: auth.user.id,
                amount: parseInt(formData.get('amount')),
                method: formData.get('payment_method'),
                transactionId: formData.get('transaction_id'),
                status: 'pending',
                created_at: new Date().toISOString()
            };

            // Validate data
            if (!data.amount || data.amount < 10000) {
                throw new Error('Số tiền nạp tối thiểu là 10,000đ');
            }

            if (!data.method) {
                throw new Error('Vui lòng chọn phương thức thanh toán');
            }

            if (!data.transactionId) {
                throw new Error('Vui lòng nhập mã giao dịch');
            }

            // Save topup record
            const topups = JSON.parse(localStorage.getItem('topups') || '[]');
            topups.push(data);
            localStorage.setItem('topups', JSON.stringify(topups));

            // Auto approve for demo
            await this.approveTopup(data.id);

            // Show success message
            this.showNotification('Nạp tiền thành công', 'success');

            // Reset form
            document.getElementById('topup-form')?.reset();

            // Redirect to history page
            setTimeout(() => {
                window.location.href = 'history.html';
            }, 2000);
        } catch (error) {
            console.error('Process topup error:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async approveTopup(topupId) {
        try {
            const topups = JSON.parse(localStorage.getItem('topups') || '[]');
            const users = JSON.parse(localStorage.getItem('users') || '[]');

            const topup = topups.find(t => t.id === topupId);
            if (!topup) {
                throw new Error('Không tìm thấy giao dịch');
            }

            const user = users.find(u => u.id === topup.userId);
            if (!user) {
                throw new Error('Không tìm thấy người dùng');
            }

            // Update topup status
            topup.status = 'completed';

            // Update user balance
            user.balance += topup.amount;

            // Save changes
            localStorage.setItem('topups', JSON.stringify(topups));
            localStorage.setItem('users', JSON.stringify(users));

            // Update auth if current user
            const auth = JSON.parse(localStorage.getItem('auth') || '{}');
            if (auth.user?.id === user.id) {
                auth.user = user;
                localStorage.setItem('auth', JSON.stringify(auth));
            }

            return true;
        } catch (error) {
            console.error('Approve topup error:', error);
            return false;
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => this.showNotification('Đã sao chép', 'success'))
            .catch(() => this.showNotification('Không thể sao chép', 'error'));
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

// Create and export payment service instance
const payment = new PaymentService();
export default payment;
