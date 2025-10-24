// Doetoez Main Application
class DoetoezApp {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.bindEvents();
        this.initializeComponents();
        this.setupServiceWorker();
    }

    checkAuthentication() {
        // Check if user is authenticated
        const user = localStorage.getItem('doetoez_current_user') || 
                     sessionStorage.getItem('doetoez_current_user');
        
        const isAuthenticated = localStorage.getItem('doetoez_authenticated') === 'true';
        
        if (user && isAuthenticated) {
            this.currentUser = JSON.parse(user);
            this.isAuthenticated = true;
            this.updateUIForAuthenticatedUser();
        } else {
            this.isAuthenticated = false;
            this.updateUIForGuest();
        }
    }

    bindEvents() {
        // Navigation toggle for mobile
        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Logout functionality
        const logoutButtons = document.querySelectorAll('[data-action="logout"]');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleLogout(e));
        });

        // Theme toggle (if implemented)
        const themeToggle = document.querySelector('[data-action="toggle-theme"]');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Audio effects for interactions
        this.setupAudioEffects();
    }

    initializeComponents() {
        // Initialize counters for stats
        this.animateCounters();
        
        // Initialize feature cards animations
        this.initializeAnimations();
        
        // Initialize chat preview if exists
        this.initializeChatPreview();
    }

    setupAudioEffects() {
        // Create audio context for sound effects
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Preload click sound
        this.clickSound = this.createClickSound();
    }

    createClickSound() {
        return function() {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        }.bind(this);
    }

    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // Play click sound
        this.clickSound();
    }

    updateUIForAuthenticatedUser() {
        // Update navigation
        const authButtons = document.querySelectorAll('.auth-btn');
        authButtons.forEach(btn => {
            btn.style.display = 'none';
        });

        // Show user menu
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.style.display = 'flex';
            
            // Update user name if available
            const userNameElement = userMenu.querySelector('.user-name');
            if (userNameElement && this.currentUser) {
                userNameElement.textContent = this.currentUser.firstName || 'User';
            }
        }

        // Update chat page if we're on chat page
        if (window.location.pathname.includes('chat.html')) {
            this.updateChatUIForUser();
        }
    }

    updateUIForGuest() {
        // Show auth buttons, hide user menu
        const authButtons = document.querySelectorAll('.auth-btn');
        authButtons.forEach(btn => {
            btn.style.display = 'block';
        });

        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.style.display = 'none';
        }

        // Redirect from protected pages
        if (window.location.pathname.includes('chat.html')) {
            window.location.href = 'login.html';
        }
    }

    updateChatUIForUser() {
        // Update user info in sidebar
        const profileName = document.querySelector('.profile-name');
        const profilePlan = document.querySelector('.profile-plan');
        
        if (profileName && this.currentUser) {
            profileName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }
        
        if (profilePlan) {
            // In a real app, this would come from user data
            profilePlan.textContent = 'Premium Plan';
        }
    }

    async handleLogout(event) {
        if (event) {
            event.preventDefault();
        }

        // Play logout sound
        this.clickSound();

        // Show confirmation
        if (!confirm('Apakah Anda yakin ingin logout?')) {
            return;
        }

        // Clear authentication data
        localStorage.removeItem('doetoez_current_user');
        sessionStorage.removeItem('doetoez_current_user');
        localStorage.removeItem('doetoez_authenticated');

        // Show logout message
        this.showMessage('Logout berhasil!', 'success');

        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    toggleTheme() {
        // Toggle between light and dark theme
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('doetoez_theme', newTheme);
        
        this.clickSound();
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            const increment = target / 100;
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.ceil(current).toLocaleString() + '+';
                    setTimeout(updateCounter, 20);
                } else {
                    counter.textContent = target.toLocaleString() + '+';
                }
            };
            
            // Start animation when element is in viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }

    initializeAnimations() {
        // Initialize Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe feature cards and other elements
        document.querySelectorAll('.feature-card, .capability, .step').forEach(el => {
            observer.observe(el);
        });
    }

    initializeChatPreview() {
        const chatPreview = document.querySelector('.ai-chat-preview');
        if (!chatPreview) return;

        // Simulate typing in chat preview
        const typingElement = chatPreview.querySelector('.typing');
        if (typingElement) {
            setTimeout(() => {
                const response = "Tentu! Saya buatkan gambar landscape gunung dengan danau yang indah...";
                typingElement.classList.remove('typing');
                typingElement.querySelector('.typing-indicator').remove();
                
                const messageContent = typingElement.querySelector('.message-content');
                messageContent.innerHTML = `
                    <div class="message-text">${response}</div>
                    <div class="message-meta">
                        <span>${new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                `;
            }, 3000);
        }
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.app-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `app-message app-message-${type}`;
        messageElement.textContent = message;
        
        // Add styles
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        `;
        
        if (type === 'success') {
            messageElement.style.background = 'var(--success)';
        } else if (type === 'error') {
            messageElement.style.background = 'var(--danger)';
        } else {
            messageElement.style.background = 'var(--primary)';
        }
        
        document.body.appendChild(messageElement);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => messageElement.remove(), 300);
            }
        }, 5000);
    }

    setupServiceWorker() {
        // Register service worker for PWA capabilities
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    // Utility methods
    formatNumber(number) {
        return new Intl.NumberFormat('id-ID').format(number);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.doetoezApp = new DoetoezApp();
});

// Add global utility functions
window.DoetoezUtils = {
    // Generate random ID
    generateId: (length = 8) => {
        return Math.random().toString(36).substr(2, length);
    },

    // Format file size
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Copy to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    },

    // Check if mobile device
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
};

// Add CSS for animations
const appStyles = document.createElement('style');
appStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease-out;
    }
    
    /* Mobile menu styles */
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: var(--dark);
            flex-direction: column;
            padding: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 999;
        }
        
        .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
        }
        
        .nav-toggle.active i::before {
            content: '\\f00d';
        }
    }
`;
document.head.appendChild(appStyles);