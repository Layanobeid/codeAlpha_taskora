// frontend/js/auth.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token && window.location.pathname.includes('index.html')) {
        window.location.href = 'dashboard.html';
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const messageDiv = document.getElementById('authMessage');

            try {
                const response = await window.TaskoraAPI.login(email, password);
                
                if (response.success) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.data));
                    messageDiv.className = 'auth-message success';
                    messageDiv.textContent = 'Login successful! Redirecting...';
                    messageDiv.style.display = 'block';
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }
            } catch (error) {
                messageDiv.className = 'auth-message error';
                messageDiv.textContent = error.message || 'Login failed. Please try again.';
                messageDiv.style.display = 'block';
            }
        });
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const messageDiv = document.getElementById('authMessage');

            try {
                const response = await window.TaskoraAPI.register(name, email, password);
                
                if (response.success) {
                    messageDiv.className = 'auth-message success';
                    messageDiv.textContent = 'Account created! You can now login.';
                    messageDiv.style.display = 'block';
                    
                    // Clear form
                    registerForm.reset();
                    
                    // Switch to login view (optional)
                    setTimeout(() => {
                        document.getElementById('registerForm').style.display = 'none';
                        document.getElementById('loginForm').style.display = 'block';
                    }, 1500);
                }
            } catch (error) {
                messageDiv.className = 'auth-message error';
                messageDiv.textContent = error.message || 'Registration failed. Please try again.';
                messageDiv.style.display = 'block';
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }

    // Auto-logout if no token
    if (!localStorage.getItem('token') && !window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
    }
});