      (function() {
            'use strict';

            // ─── DOM refs ───
            const authWrapper = document.getElementById('authWrapper');
            const authCard = document.getElementById('authCard');
            const dashboard = document.getElementById('dashboard');

            const form = document.getElementById('signinForm');
            const emailInput = document.getElementById('email');
            const passInput = document.getElementById('password');
            const emailWrap = document.getElementById('emailWrap');
            const passWrap = document.getElementById('passWrap');
            const emailError = document.getElementById('emailError');
            const passError = document.getElementById('passError');
            const signinBtn = document.getElementById('signinBtn');
            const togglePass = document.getElementById('togglePass');
            const toggleIcon = document.getElementById('toggleIcon');
            const rememberCheck = document.getElementById('remember');

            const dashUser = document.getElementById('dashUser');
            const dashEmail = document.getElementById('dashEmail');
            const signoutBtn = document.getElementById('signoutBtn');

            const toast = document.getElementById('toast');
            const toastMsg = document.getElementById('toastMsg');

            // ─── State ───
            let isSubmitting = false;

            // ─── Helpers ───
            function showToast(message, type = 'success') {
                const icon = toast.querySelector('i');
                if (type === 'success') {
                    icon.className = 'fas fa-circle-check';
                    toast.className = 'toast success show';
                } else {
                    icon.className = 'fas fa-circle-exclamation';
                    toast.className = 'toast error show';
                }
                toastMsg.textContent = message;
                clearTimeout(toast._timer);
                toast._timer = setTimeout(() => {
                    toast.classList.remove('show');
                }, 3800);
            }

            function clearErrors() {
                emailWrap.classList.remove('error');
                passWrap.classList.remove('error');
                emailError.innerHTML = '';
                passError.innerHTML = '';
            }

            function setFieldError(wrap, errorEl, message) {
                wrap.classList.add('error');
                errorEl.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${message}`;
            }

            function setLoading(state) {
                isSubmitting = state;
                signinBtn.disabled = state;
                signinBtn.classList.toggle('loading', state);
            }

            // ─── Toggle password ───
            togglePass.addEventListener('click', function() {
                const type = passInput.type === 'password' ? 'text' : 'password';
                passInput.type = type;
                toggleIcon.className = type === 'password' ? 'far fa-eye' : 'far fa-eye-slash';
            });

            // ─── Live clear error on focus ───
            emailInput.addEventListener('focus', () => {
                emailWrap.classList.remove('error');
                emailError.innerHTML = '';
            });
            passInput.addEventListener('focus', () => {
                passWrap.classList.remove('error');
                passError.innerHTML = '';
            });

            // ─── Validate single field ───
            function validateEmail() {
                const val = emailInput.value.trim();
                if (!val) {
                    setFieldError(emailWrap, emailError, 'Email is required');
                    return false;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                    setFieldError(emailWrap, emailError, 'Please enter a valid email address');
                    return false;
                }
                emailWrap.classList.remove('error');
                emailError.innerHTML = '';
                return true;
            }

            function validatePassword() {
                const val = passInput.value;
                if (!val) {
                    setFieldError(passWrap, passError, 'Password is required');
                    return false;
                }
                if (val.length < 4) {
                    setFieldError(passWrap, passError, 'Password must be at least 4 characters');
                    return false;
                }
                passWrap.classList.remove('error');
                passError.innerHTML = '';
                return true;
            }

            // ─── Submit handler ───
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                clearErrors();

                // Validate both
                const isEmailValid = validateEmail();
                const isPassValid = validatePassword();

                if (!isEmailValid || !isPassValid) {
                    // focus first invalid
                    if (!isEmailValid) emailInput.focus();
                    else if (!isPassValid) passInput.focus();
                    return;
                }

                const email = emailInput.value.trim();
                const password = passInput.value;

                setLoading(true);

                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1200));

                // ─── Credentials check ───
                // Demo: accept "demo@nexus.com" / "demo123"  or "admin@nexus.com" / "admin123"
                const validUsers = [
                    { email: 'demo@nexus.com', password: 'demo123' },
                    { email: 'admin@nexus.com', password: 'admin123' }
                ];

                const match = validUsers.find(
                    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
                );

                if (!match) {
                    // Incorrect credentials
                    setFieldError(emailWrap, emailError, ' ');
                    setFieldError(passWrap, passError, ' ');
                    // show a combined error
                    emailError.innerHTML = `<i class="fas fa-circle-exclamation"></i> Invalid email or password`;
                    passError.innerHTML = `<i class="fas fa-circle-exclamation"></i> Please try again`;
                    // shake both
                    emailWrap.classList.add('error');
                    passWrap.classList.add('error');
                    setLoading(false);
                    showToast('Invalid credentials. Please try again.', 'error');
                    return;
                }

                // ─── SUCCESS ───
                setLoading(false);
                showToast(`Welcome back, ${email.split('@')[0]}!`, 'success');

                // Show dashboard
                authWrapper.style.display = 'none';
                dashboard.classList.add('active');

                // Populate dashboard
                const name = email.split('@')[0];
                dashUser.textContent = name.charAt(0).toUpperCase() + name.slice(1);
                dashEmail.textContent = email;

                // Remember me: store in localStorage
                if (rememberCheck.checked) {
                    localStorage.setItem('nexus_remember', email);
                } else {
                    localStorage.removeItem('nexus_remember');
                }
            });

            // ─── Sign Out ───
            signoutBtn.addEventListener('click', function() {
                dashboard.classList.remove('active');
                authWrapper.style.display = 'block';
                // Reset form
                form.reset();
                clearErrors();
                // set default demo values
                emailInput.value = 'demo@nexus.com';
                passInput.value = 'demo123';
                // Reset password toggle icon
                if (passInput.type !== 'password') {
                    passInput.type = 'password';
                    toggleIcon.className = 'far fa-eye';
                }
                showToast('Signed out successfully.', 'success');
                // focus email
                setTimeout(() => emailInput.focus(), 300);
            });

            // ─── Remember me on load ───
            (function init() {
                const remembered = localStorage.getItem('nexus_remember');
                if (remembered) {
                    emailInput.value = remembered;
                    rememberCheck.checked = true;
                    // Auto-focus password if email is filled
                    if (remembered) passInput.focus();
                }
            })();

            // ─── Ripple effect on button ───
            signinBtn.addEventListener('click', function(e) {
                if (this.disabled) return;
                const rect = this.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                ripple.className = 'ripple';
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });

            // ─── Keyboard shortcut: Ctrl+Enter to submit ───
            document.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    if (authWrapper.style.display !== 'none') {
                        form.dispatchEvent(new Event('submit'));
                    }
                }
            });

            console.log('🔐 Nexus Sign-In ready. Use demo@nexus.com / demo123');
        })();