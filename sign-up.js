        const step1 = document.getElementById('step1');
        const step2 = document.getElementById('step2');
        const step3 = document.getElementById('step3');
        const dots = document.querySelectorAll('.step-dot');
        const lines = document.querySelectorAll('.step-line');

        const employeeIdInput = document.getElementById('employeeId');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const togglePassword = document.getElementById('togglePassword');
        const signupBtn = document.getElementById('signupBtn');
        const backToStep1 = document.getElementById('backToStep1');
        const verifyBtn = document.getElementById('verifyBtn');
        const resendBtn = document.getElementById('resendBtn');
        const resendTimer = document.getElementById('resendTimer');
        const dashboardBtn = document.getElementById('dashboardBtn');

        const verifyEmailDisplay = document.getElementById('verifyEmailDisplay');
        const otpInputs = document.querySelectorAll('#otpGroup input');
        const otpError = document.getElementById('otpError');

        const strengthSegments = document.querySelectorAll('#strengthContainer .segment');
        const strengthLabel = document.getElementById('strengthLabel');
        const strengthCount = document.getElementById('strengthCount');
        const rules = document.querySelectorAll('#passwordRules .rule');

        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('.toast-icon');

        let toastTimeout = null;

        // ============================================================
        //  STATE
        // ============================================================
        let currentStep = 1;
        let selectedRole = 'Employee';
        let registeredEmail = '';
        let isVerifying = false;
        let resendCooldown = false;
        let resendTimerInterval = null;
        let generatedOTP = '';

        // ============================================================
        //  STEP MANAGEMENT
        // ============================================================
        function goToStep(step) {
            currentStep = step;
            document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));

            if (step === 1) step1.classList.add('active');
            else if (step === 2) step2.classList.add('active');
            else if (step === 3) step3.classList.add('active');

            // Update dots & lines
            dots.forEach((dot, i) => {
                const idx = i + 1;
                dot.classList.remove('active', 'done');
                if (idx === step) dot.classList.add('active');
                else if (idx < step) dot.classList.add('done');
            });

            lines.forEach((line, i) => {
                const idx = i + 1;
                line.classList.toggle('done', idx < step);
            });

            // Update progressbar
            const progressbar = document.querySelector('.steps-indicator');
            progressbar.setAttribute('aria-valuenow', step);

            // Focus management
            if (step === 1) {
                setTimeout(() => employeeIdInput.focus(), 300);
            } else if (step === 2) {
                setTimeout(() => otpInputs[0].focus(), 400);
            }
        }

        // ============================================================
        //  TOAST
        // ============================================================
        function showToast(message, type = 'info', duration = 3500) {
            if (toastTimeout) {
                clearTimeout(toastTimeout);
                toast.classList.remove('show');
            }

            toast.className = 'toast';
            toast.classList.add(type);
            toastMessage.textContent = message;

            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-circle',
                info: 'fas fa-info-circle'
            };
            toastIcon.className = 'toast-icon ' + (icons[type] || icons.info);

            // Force reflow
            void toast.offsetWidth;
            toast.classList.add('show');

            toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
                toastTimeout = null;
            }, duration);
        }

        // ============================================================
        //  VALIDATION HELPERS
        // ============================================================
        function setFieldError(input, errorEl, message) {
            const wrapper = input.closest('.input-wrapper');
            if (message) {
                wrapper?.classList.add('error');
                errorEl.innerHTML = `<span class="error-icon"><i class="fas fa-circle-exclamation"></i></span> ${message}`;
            } else {
                wrapper?.classList.remove('error');
                errorEl.innerHTML = '';
            }
        }

        function validateEmployeeId() {
            const val = employeeIdInput.value.trim();
            if (!val) {
                setFieldError(employeeIdInput, document.getElementById('employeeIdError'), 'Employee ID is required');
                return false;
            }
            if (val.length < 3) {
                setFieldError(employeeIdInput, document.getElementById('employeeIdError'), 'At least 3 characters');
                return false;
            }
            setFieldError(employeeIdInput, document.getElementById('employeeIdError'), '');
            return true;
        }

        function validateEmail() {
            const val = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!val) {
                setFieldError(emailInput, document.getElementById('emailError'), 'Email is required');
                return false;
            }
            if (!emailRegex.test(val)) {
                setFieldError(emailInput, document.getElementById('emailError'), 'Please enter a valid email address');
                return false;
            }
            setFieldError(emailInput, document.getElementById('emailError'), '');
            return true;
        }

        function validatePassword() {
            const val = passwordInput.value;
            if (!val) {
                setFieldError(passwordInput, document.getElementById('passwordError'), 'Password is required');
                return false;
            }
            if (val.length < 8) {
                setFieldError(passwordInput, document.getElementById('passwordError'), 'At least 8 characters');
                return false;
            }
            if (!/[A-Z]/.test(val)) {
                setFieldError(passwordInput, document.getElementById('passwordError'), 'Needs an uppercase letter');
                return false;
            }
            if (!/[a-z]/.test(val)) {
                setFieldError(passwordInput, document.getElementById('passwordError'), 'Needs a lowercase letter');
                return false;
            }
            if (!/[0-9]/.test(val)) {
                setFieldError(passwordInput, document.getElementById('passwordError'), 'Needs a number');
                return false;
            }
            if (!/[^A-Za-z0-9]/.test(val)) {
                setFieldError(passwordInput, document.getElementById('passwordError'), 'Needs a special character');
                return false;
            }
            setFieldError(passwordInput, document.getElementById('passwordError'), '');
            return true;
        }

        function validateRole() {
            const selected = document.querySelector('input[name="role"]:checked');
            if (!selected) {
                document.getElementById('roleError').innerHTML =
                    `<span class="error-icon"><i class="fas fa-circle-exclamation"></i></span> Please select a role`;
                return false;
            }
            document.getElementById('roleError').innerHTML = '';
            return true;
        }

        // ============================================================
        //  PASSWORD STRENGTH & RULES
        // ============================================================
        function checkPasswordRules(password) {
            const checks = {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[^A-Za-z0-9]/.test(password),
            };

            rules.forEach(rule => {
                const key = rule.dataset.rule;
                const valid = checks[key] || false;
                rule.classList.toggle('valid', valid);
                const icon = rule.querySelector('.rule-icon i');
                if (icon) {
                    icon.className = valid ? 'fas fa-check-circle' : 'fas fa-circle';
                }
            });

            return checks;
        }

        function updateStrength(password) {
            const checks = checkPasswordRules(password);
            const score = Object.values(checks).filter(Boolean).length;

            // Update segments
            const levels = ['weak', 'fair', 'good', 'strong'];
            const levelMap = {
                0: 'weak',
                1: 'weak',
                2: 'fair',
                3: 'good',
                4: 'good',
                5: 'strong'
            };
            const level = levelMap[score] || 'weak';
            const filledCount = Math.min(score, 4);

            strengthSegments.forEach((seg, i) => {
                seg.className = 'segment';
                if (i < filledCount) {
                    seg.classList.add('filled', level);
                }
            });

            // Label
            const labels = {
                weak: 'Weak — try adding more variety',
                fair: 'Fair — getting there!',
                good: 'Good — almost perfect!',
                strong: 'Strong — great password!'
            };
            strengthLabel.textContent = password ? labels[level] : 'Enter a password';
            strengthLabel.className = 'label' + (password ? ' ' + level : '');

            strengthCount.textContent = password ? `${password.length} / 8+` : '0 / 8+';

            return { score, level, checks };
        }

        // ============================================================
        //  OTP / VERIFICATION
        // ============================================================
        function generateOTP() {
            return String(Math.floor(100000 + Math.random() * 900000));
        }

        function handleOTPInput(e) {
            const input = e.target;
            const index = Array.from(otpInputs).indexOf(input);
            if (input.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            // Auto-submit when all filled
            const allFilled = Array.from(otpInputs).every(inp => inp.value.length === 1);
            if (allFilled) {
                setTimeout(() => verifyBtn.click(), 300);
            }
            otpError.textContent = '';
        }

        function handleOTPKeydown(e) {
            const input = e.target;
            const index = Array.from(otpInputs).indexOf(input);
            if (e.key === 'Backspace' && !input.value && index > 0) {
                otpInputs[index - 1].focus();
            }
            if (e.key === 'ArrowLeft' && index > 0) {
                otpInputs[index - 1].focus();
                e.preventDefault();
            }
            if (e.key === 'ArrowRight' && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
                e.preventDefault();
            }
            // Allow only digits
            if (!/^[0-9]$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' &&
                e.key !== 'Delete' && e.key !== 'Tab') {
                e.preventDefault();
            }
        }

        function getOTPValue() {
            return Array.from(otpInputs).map(inp => inp.value).join('');
        }

        function startResendTimer(seconds = 30) {
            resendCooldown = true;
            resendBtn.disabled = true;
            let remaining = seconds;
            resendTimer.textContent = `(${remaining}s)`;

            if (resendTimerInterval) clearInterval(resendTimerInterval);
            resendTimerInterval = setInterval(() => {
                remaining--;
                resendTimer.textContent = `(${remaining}s)`;
                if (remaining <= 0) {
                    clearInterval(resendTimerInterval);
                    resendTimerInterval = null;
                    resendCooldown = false;
                    resendBtn.disabled = false;
                    resendTimer.textContent = '';
                }
            }, 1000);
        }

        // ============================================================
        //  ROLE SELECTOR
        // ============================================================
        document.querySelectorAll('.role-option').forEach(opt => {
            opt.addEventListener('click', function() {
                const radio = this.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    document.querySelectorAll('.role-option').forEach(o => {
                        o.classList.remove('active');
                        o.setAttribute('aria-checked', 'false');
                    });
                    this.classList.add('active');
                    this.setAttribute('aria-checked', 'true');
                    selectedRole = radio.value;
                    document.getElementById('roleError').innerHTML = '';
                }
            });

            opt.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // ============================================================
        //  TOGGLE PASSWORD
        // ============================================================
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            const icon = this.querySelector('i');
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });

        togglePassword.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });

        // ============================================================
        //  PASSWORD REAL-TIME
        // ============================================================
        passwordInput.addEventListener('input', function() {
            updateStrength(this.value);
            // Clear error while typing
            setFieldError(this, document.getElementById('passwordError'), '');
        });

        // ============================================================
        //  OTP EVENTS
        // ============================================================
        otpInputs.forEach(inp => {
            inp.addEventListener('input', handleOTPInput);
            inp.addEventListener('keydown', handleOTPKeydown);
            inp.addEventListener('paste', function(e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text').trim();
                if (/^\d{6}$/.test(paste)) {
                    const digits = paste.split('');
                    otpInputs.forEach((inp, i) => {
                        if (digits[i]) inp.value = digits[i];
                    });
                    // Auto-submit
                    setTimeout(() => verifyBtn.click(), 200);
                }
            });
        });

        // ============================================================
        //  STEP 1 → STEP 2 (SIGN UP)
        // ============================================================
        step1.addEventListener('submit', function(e) {
            e.preventDefault();

            const isEmpValid = validateEmployeeId();
            const isEmailValid = validateEmail();
            const isPassValid = validatePassword();
            const isRoleValid = validateRole();

            if (!isEmpValid || !isEmailValid || !isPassValid || !isRoleValid) {
                // Shake invalid fields
                document.querySelectorAll('.input-wrapper.error').forEach(el => {
                    el.classList.add('shake');
                    setTimeout(() => el.classList.remove('shake'), 500);
                });
                showToast('Please fix the errors before continuing.', 'error');
                return;
            }

            // Store email for verification
            registeredEmail = emailInput.value.trim();
            verifyEmailDisplay.textContent = registeredEmail;

            // Generate OTP
            generatedOTP = generateOTP();

            // Simulate sending email
            signupBtn.disabled = true;
            signupBtn.querySelector('.btn-text').textContent = 'Sending...';
            const spinner = document.createElement('span');
            spinner.className = 'btn-spinner';
            signupBtn.querySelector('i')?.remove();
            signupBtn.appendChild(spinner);

            setTimeout(() => {
                signupBtn.disabled = false;
                signupBtn.querySelector('.btn-text').textContent = 'Create Account';
                spinner.remove();
                const icon = document.createElement('i');
                icon.className = 'fas fa-arrow-right';
                signupBtn.appendChild(icon);

                // Show toast with OTP (in real app, this would be sent via email)
                showToast(`📧 Verification code sent to ${registeredEmail}`, 'info', 4000);
                // For demo, show OTP in console and toast
                console.log('🔑 Your OTP:', generatedOTP);
                showToast(`🔑 Your OTP: ${generatedOTP} (check console)`, 'info', 5000);

                // Reset OTP inputs
                otpInputs.forEach(inp => inp.value = '');
                otpError.textContent = '';
                startResendTimer(30);

                // Go to step 2
                goToStep(2);
            }, 1200);
        });

        // ============================================================
        //  BACK TO STEP 1
        // ============================================================
        backToStep1.addEventListener('click', function() {
            goToStep(1);
            if (resendTimerInterval) {
                clearInterval(resendTimerInterval);
                resendTimerInterval = null;
                resendCooldown = false;
                resendBtn.disabled = false;
                resendTimer.textContent = '';
            }
        });

        // ============================================================
        //  VERIFY OTP
        // ============================================================
        verifyBtn.addEventListener('click', function() {
            if (isVerifying) return;

            const otp = getOTPValue();
            if (otp.length !== 6) {
                otpError.innerHTML =
                    `<span class="error-icon"><i class="fas fa-circle-exclamation"></i></span> Please enter all 6 digits`;
                otpInputs.forEach(inp => {
                    if (!inp.value) inp.closest('.input-wrapper')?.classList.add('error');
                });
                showToast('Please enter the complete 6-digit code.', 'error');
                return;
            }

            isVerifying = true;
            verifyBtn.disabled = true;
            verifyBtn.querySelector('.btn-text').textContent = 'Verifying...';
            const spinner = document.createElement('span');
            spinner.className = 'btn-spinner';
            verifyBtn.querySelector('i')?.remove();
            verifyBtn.appendChild(spinner);

            setTimeout(() => {
                isVerifying = false;
                verifyBtn.disabled = false;
                verifyBtn.querySelector('.btn-text').textContent = 'Verify';
                spinner.remove();
                const icon = document.createElement('i');
                icon.className = 'fas fa-check';
                verifyBtn.appendChild(icon);

                if (otp === generatedOTP) {
                    // SUCCESS
                    otpError.textContent = '';
                    showToast('✅ Email verified successfully!', 'success', 3000);
                    // Show success step
                    const roleDisplay = document.getElementById('successRoleBadge');
                    roleDisplay.textContent = selectedRole;
                    goToStep(3);
                    // Cleanup
                    if (resendTimerInterval) {
                        clearInterval(resendTimerInterval);
                        resendTimerInterval = null;
                    }
                } else {
                    otpError.innerHTML =
                        `<span class="error-icon"><i class="fas fa-circle-exclamation"></i></span> Invalid code. Please try again.`;
                    showToast('❌ Invalid verification code', 'error');
                    otpInputs.forEach(inp => {
                        inp.value = '';
                        inp.focus();
                    });
                    otpInputs[0].focus();
                }
            }, 1000);
        });

        // ============================================================
        //  RESEND OTP
        // ============================================================
        resendBtn.addEventListener('click', function() {
            if (resendCooldown) return;
            generatedOTP = generateOTP();
            console.log('🔑 New OTP:', generatedOTP);
            showToast(`📧 New code sent: ${generatedOTP} (check console)`, 'info', 4000);
            otpInputs.forEach(inp => inp.value = '');
            otpError.textContent = '';
            otpInputs[0].focus();
            startResendTimer(30);
        });

        // ============================================================
        //  DASHBOARD BUTTON
        // ============================================================
        dashboardBtn.addEventListener('click', function() {
            showToast('🚀 Welcome to your dashboard!', 'success', 3000);
            // Reset to step 1 after a moment (for demo)
            setTimeout(() => {
                goToStep(1);
                step1.reset();
                passwordInput.type = 'password';
                togglePassword.querySelector('i').className = 'fas fa-eye';
                updateStrength('');
                document.querySelectorAll('.input-wrapper.error').forEach(el => el.classList.remove('error'));
                document.querySelectorAll('.form-error').forEach(el => el.innerHTML = '');
                document.querySelector('input[name="role"][value="Employee"]').checked = true;
                document.querySelectorAll('.role-option').forEach(o => {
                    o.classList.toggle('active', o.querySelector('input[type="radio"]').checked);
                });
                selectedRole = 'Employee';
                otpInputs.forEach(inp => inp.value = '');
                if (resendTimerInterval) {
                    clearInterval(resendTimerInterval);
                    resendTimerInterval = null;
                    resendCooldown = false;
                    resendBtn.disabled = false;
                    resendTimer.textContent = '';
                }
                showToast('🔄 Demo reset — ready for next signup', 'info', 2500);
            }, 800);
        });


        employeeIdInput.addEventListener('blur', validateEmployeeId);
        emailInput.addEventListener('blur', validateEmail);
        passwordInput.addEventListener('blur', validatePassword);

       
        //  KEYBOARD SHORTCUT: Enter on OTP submits
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && currentStep === 2) {
                const active = document.activeElement;
                if (active && active.closest('#otpGroup')) {
                    e.preventDefault();
                    verifyBtn.click();
                }
            }
        });

        
        goToStep(1);
        updateStrength('');
        console.log('🔐 Sign-up form ready — OTP will be shown in console & toast.');
        console.log('💡 For demo purposes, the OTP is displayed in a toast notification.');