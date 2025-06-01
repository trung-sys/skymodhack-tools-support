document.addEventListener('DOMContentLoaded', () => {
    // Theme handling
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    // Create theme toggle button if it doesn't exist
    let themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) {
        themeToggle = document.createElement('div');
        themeToggle.className = 'theme-toggle ml-4 cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-[#2a1b3e] hover:bg-pink-500/10 transition-all';
        themeToggle.innerHTML = `
            <i class="fas fa-moon moon-icon text-pink-500"></i>
            <i class="fas fa-sun sun-icon text-pink-500 hidden"></i>
        `;

        // Add theme toggle to header navigation
        const navItems = document.querySelector('.md\\:flex.items-center.space-x-6');
        if (navItems) {
            const langSelector = document.querySelector('.relative.group');
            if (langSelector) {
                langSelector.parentNode.insertBefore(themeToggle, langSelector);
            }
        }
    }

    // Initialize theme toggle icons
    const moonIcon = themeToggle.querySelector('.moon-icon');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    
    if (theme === 'dark') {
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
    } else {
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    }

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update icons visibility
        if (newTheme === 'dark') {
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        } else {
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        }
    });

    // Language handling
    const translations = {
        'en': {
            'home': 'Home',
            'shop': 'Key Shop',
            'topup': 'Top Up',
            'history': 'Order History',
            'contact': 'Contact',
            'login': 'LOGIN',
            'register': 'REGISTER',
            'products': 'PRODUCTS',
            'description': 'We provide licensed keys and high-quality gaming support software such as Aimbot, Wallhack, ESP, and other support systems. Comes with detailed usage instructions, supporting all popular platforms. Our team is ready to support you 24/7.',
            'status': 'Website Status: Online',
            'support': 'Support',
            'usage_guide': 'Usage Guide',
            'privacy_policy': 'Privacy Policy',
            'terms': 'Terms of Service',
            'follow_us': 'Follow Us',
            'quick_links': 'Quick Links',
            'remember_me': 'Remember me',
            'forgot_password': 'Forgot password?',
            'no_account': 'Don\'t have an account?',
            'sign_up_now': 'Sign up now',
            'have_account': 'Already have an account?',
            'sign_in': 'Sign in'
        },
        'vi': {
            'home': 'Trang chủ',
            'shop': 'Cửa hàng key',
            'topup': 'Nạp tiền',
            'history': 'Lịch sử đơn hàng',
            'contact': 'Liên hệ',
            'login': 'ĐĂNG NHẬP',
            'register': 'ĐĂNG KÝ',
            'products': 'SẢN PHẨM',
            'description': 'Chúng tôi cung cấp key bản quyền và các phần mềm hỗ trợ chơi game chất lượng cao như Aimbot, Wallhack, ESP và nhiều hệ thống hỗ trợ khác. Đi kèm với hướng dẫn sử dụng chi tiết, hỗ trợ tất cả các nền tảng phổ biến. Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.',
            'status': 'Trạng thái trang web: Trực tuyến',
            'support': 'Hỗ trợ',
            'usage_guide': 'Hướng dẫn sử dụng',
            'privacy_policy': 'Chính sách bảo mật',
            'terms': 'Điều khoản dịch vụ',
            'follow_us': 'Theo dõi chúng tôi',
            'quick_links': 'Liên kết nhanh',
            'remember_me': 'Ghi nhớ đăng nhập',
            'forgot_password': 'Quên mật khẩu?',
            'no_account': 'Chưa có tài khoản?',
            'sign_up_now': 'Đăng ký ngay',
            'have_account': 'Đã có tài khoản?',
            'sign_in': 'Đăng nhập'
        }
    };

    // Function to update text content based on selected language
    function updateLanguage(lang) {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                if (element.tagName.toLowerCase() === 'input' && element.type === 'submit') {
                    element.value = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });

        // Update language selector text
        const currentLangSpan = document.querySelector('.current-lang');
        if (currentLangSpan) {
            currentLangSpan.textContent = lang === 'vi' ? 'Tiếng Việt' : 'English';
        }

        localStorage.setItem('language', lang);

        // Update language options visibility
        document.querySelectorAll('.lang-option').forEach(option => {
            const checkIcon = option.querySelector('.fa-check');
            if (checkIcon) {
                checkIcon.style.opacity = option.getAttribute('data-lang') === lang ? '1' : '0';
            }
        });
    }

    // Initialize language
    const savedLang = localStorage.getItem('language') || 'vi';
    updateLanguage(savedLang);

    // Language change handlers
    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = option.getAttribute('data-lang');
            updateLanguage(lang);
        });
    });

    // Mobile language selector
    const mobileLangSelect = document.getElementById('mobileLangSelect');
    if (mobileLangSelect) {
        mobileLangSelect.value = savedLang;
        mobileLangSelect.addEventListener('change', (e) => {
            updateLanguage(e.target.value);
        });
    }
});
