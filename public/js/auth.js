// Authentication Module
class AuthModule {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUsers();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Form switching
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });
    }

    showLoginForm() {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
    }

    showRegisterForm() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
            // Validate inputs
            if (!email || !password) {
                throw new Error('Please fill in all fields');
            }

            if (!window.fitnessApp.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Get users from localStorage
            const users = this.getUsers();
            const user = users.find(u => u.email === email);

            if (!user) {
                throw new Error('User not found');
            }

            // Verify password
            const isValidPassword = await this.verifyPassword(password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid password');
            }

            // Generate token
            const token = this.generateToken(user);

            // Save authentication data
            localStorage.setItem('fitnessToken', token);
            localStorage.setItem('fitnessUserData', JSON.stringify(user));

            // Update app state
            window.fitnessApp.currentUser = user;
            window.fitnessApp.showApp();
            window.fitnessApp.showNotification('Login successful!', 'success');

            // Clear form
            document.getElementById('login-form').reset();

        } catch (error) {
            window.fitnessApp.showNotification(error.message, 'error');
        }
    }

    async handleRegister() {
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        try {
            // Validate inputs
            if (!name || !email || !password || !confirmPassword) {
                throw new Error('Please fill in all fields');
            }

            if (!window.fitnessApp.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            if (!window.fitnessApp.validatePassword(password)) {
                throw new Error('Password must be at least 6 characters long');
            }

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Check if user already exists
            const users = this.getUsers();
            if (users.find(u => u.email === email)) {
                throw new Error('User with this email already exists');
            }

            // Hash password
            const hashedPassword = await this.hashPassword(password);

            // Create new user
            const newUser = {
                id: this.generateUserId(),
                name: name,
                email: email,
                password: hashedPassword,
                createdAt: new Date().toISOString(),
                profile: null
            };

            // Save user
            users.push(newUser);
            this.saveUsers(users);

            // Generate token
            const token = this.generateToken(newUser);

            // Save authentication data
            localStorage.setItem('fitnessToken', token);
            localStorage.setItem('fitnessUserData', JSON.stringify(newUser));

            // Update app state
            window.fitnessApp.currentUser = newUser;
            window.fitnessApp.showApp();
            window.fitnessApp.showNotification('Registration successful! Please complete your profile.', 'success');

            // Clear form
            document.getElementById('register-form').reset();

        } catch (error) {
            window.fitnessApp.showNotification(error.message, 'error');
        }
    }

    // Password hashing using bcrypt-like approach (simplified for client-side)
    async hashPassword(password) {
        // In a real application, this would be done server-side
        // For this demo, we'll use a simple hash function
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'fitness-salt-2024');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async verifyPassword(password, hashedPassword) {
        const hashedInput = await this.hashPassword(password);
        return hashedInput === hashedPassword;
    }

    generateToken(user) {
        // In a real application, this would be a JWT token
        // For this demo, we'll create a simple token
        const payload = {
            userId: user.id,
            email: user.email,
            exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };
        return btoa(JSON.stringify(payload));
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUsers() {
        const users = localStorage.getItem('fitnessUsers');
        return users ? JSON.parse(users) : [];
    }

    saveUsers(users) {
        localStorage.setItem('fitnessUsers', JSON.stringify(users));
    }

    loadUsers() {
        // Initialize with demo user if no users exist
        const users = this.getUsers();
        if (users.length === 0) {
            this.createDemoUser();
        }
    }

    async createDemoUser() {
        const demoUser = {
            id: 'demo_user_001',
            name: 'Demo User',
            email: 'demo@fitness.com',
            password: await this.hashPassword('demo123'),
            createdAt: new Date().toISOString(),
            profile: {
                name: 'Demo User',
                age: 25,
                weight: 70,
                height: 175,
                goal: 'build-muscle',
                experience: 'intermediate',
                medical: 'No medical conditions'
            }
        };

        const users = [demoUser];
        this.saveUsers(users);
    }

    // Token validation
    validateToken(token) {
        try {
            const payload = JSON.parse(atob(token));
            return payload.exp > Date.now();
        } catch (error) {
            return false;
        }
    }

    // Get current user from token
    getCurrentUser(token) {
        try {
            const payload = JSON.parse(atob(token));
            const users = this.getUsers();
            return users.find(u => u.id === payload.userId);
        } catch (error) {
            return null;
        }
    }

    // Logout
    logout() {
        localStorage.removeItem('fitnessToken');
        localStorage.removeItem('fitnessUserData');
        window.fitnessApp.currentUser = null;
        window.fitnessApp.showAuth();
    }
}

// Initialize authentication module
document.addEventListener('DOMContentLoaded', () => {
    window.authModule = new AuthModule();
});

// Export for use in other modules
window.AuthModule = AuthModule;
