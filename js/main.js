document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');

    // Function to navigate to shop page
    function goToShop(e) {
        if (e) e.preventDefault();
        console.log('Navigating to shop page...');
        window.location.href = 'shop.html';
    }

    // Set up product button navigation
    function setupProductNavigation() {
        // Main products button
        const productsBtn = document.getElementById('products-btn');
        if (productsBtn) {
            console.log('Found products button:', productsBtn.outerHTML);
            productsBtn.addEventListener('click', goToShop);
            
            // Also try setting onclick directly
            productsBtn.onclick = goToShop;
        } else {
            console.log('Products button not found by ID');
        }

        // Try finding by text content
        const buttons = Array.from(document.getElementsByTagName('button'));
        console.log('All buttons:', buttons.map(b => ({
            id: b.id,
            text: b.textContent.trim(),
            classes: b.className
        })));

        buttons.forEach(button => {
            if (button.textContent.trim() === 'SẢN PHẨM') {
                console.log('Found SẢN PHẨM button:', button.outerHTML);
                button.addEventListener('click', goToShop);
                button.onclick = goToShop;
            }
        });

        // Shop link in navigation
        const shopLink = document.querySelector('a[href="shop.html"]');
        if (shopLink) {
            console.log('Found shop link:', shopLink.outerHTML);
            shopLink.addEventListener('click', goToShop);
        }
    }

    // Initialize product navigation
    setupProductNavigation();

    // Shopping cart functionality
    const cart = {
        items: [],
        load() {
            try {
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    this.items = JSON.parse(savedCart);
                    this.updateCount();
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                this.items = [];
            }
        },
        save() {
            try {
                localStorage.setItem('cart', JSON.stringify(this.items));
            } catch (error) {
                console.error('Error saving cart:', error);
            }
        },
        addItem(item) {
            const existingItem = this.items.find(i => 
                i.name === item.name && 
                i.game === item.game
            );
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({ ...item, quantity: 1 });
            }
            this.save();
            this.updateCount();
        },
        removeItem(index) {
            this.items.splice(index, 1);
            this.save();
            this.updateCount();
        },
        updateCount() {
            const countElement = document.getElementById('cart-count');
            if (countElement) {
                const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
                countElement.textContent = totalItems;
            }
        }
    };

    // Initialize cart
    cart.load();

    // Mobile menu functionality
    const mobileMenuButton = document.querySelector('button.md\\:hidden');
    const mobileMenu = document.querySelector('div.md\\:hidden.hidden');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuButton.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // Language handling
    const langOptions = document.querySelectorAll('.lang-option');
    const currentLang = document.querySelector('.current-lang');
    const mobileLangSelect = document.getElementById('mobileLangSelect');

    if (currentLang || mobileLangSelect || langOptions.length > 0) {
        const savedLang = localStorage.getItem('language') || 'vi';
        updateLanguageDisplay(savedLang);

        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                updateLanguage(option.dataset.lang);
            });
        });

        if (mobileLangSelect) {
            mobileLangSelect.value = savedLang;
            mobileLangSelect.addEventListener('change', () => {
                updateLanguage(mobileLangSelect.value);
            });
        }
    }

    function updateLanguage(lang) {
        localStorage.setItem('language', lang);
        updateLanguageDisplay(lang);
    }

    function updateLanguageDisplay(lang) {
        const currentLang = document.querySelector('.current-lang');
        const mobileLangSelect = document.getElementById('mobileLangSelect');
        const langOptions = document.querySelectorAll('.lang-option');
        
        if (currentLang) {
            currentLang.textContent = lang === 'vi' ? 'Tiếng Việt' : 'English';
        }
        
        if (mobileLangSelect) {
            mobileLangSelect.value = lang;
        }
        
        langOptions.forEach(opt => {
            const optLang = opt.dataset.lang;
            const icon = opt.querySelector('i');
            if (icon) {
                icon.classList.toggle('opacity-0', optLang !== lang);
            }
        });
    }

    // Status indicator pulse effect
    const statusDot = document.querySelector('.status-dot');
    if (statusDot) {
        setInterval(() => {
            statusDot.style.opacity = '0.5';
            setTimeout(() => {
                statusDot.style.opacity = '1';
            }, 1000);
        }, 2000);
    }

    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe elements for animation
    document.querySelectorAll('.should-animate').forEach(el => {
        observer.observe(el);
    });

    // Add stagger animation to children
    document.querySelectorAll('.stagger-children').forEach(parent => {
        Array.from(parent.children).forEach((child, index) => {
            child.style.animationDelay = `${index * 0.1}s`;
        });
    });

    // Add global click handler for debugging
    document.addEventListener('click', (e) => {
        console.log('Click event:', {
            target: e.target,
            tagName: e.target.tagName,
            id: e.target.id,
            text: e.target.textContent.trim(),
            classes: e.target.className
        });
    });
});
