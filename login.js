console.log('login.js loaded');
// --- Client-side JS for Login/Signup Page ---
document.addEventListener('DOMContentLoaded', function () {
  const tabSignin = document.getElementById('tab-signin');
  const tabSignup = document.getElementById('tab-signup');
  const authForm = document.getElementById('auth-form');
  const authBtn = document.getElementById('auth-btn');
  const demoBtn = document.getElementById('demo-btn');
  const signupPassword2 = document.getElementById('signup-password2');

  if (tabSignin && tabSignup && authForm) {
    // Tab switching
    tabSignin.addEventListener('click', () => {
      tabSignin.classList.add('active');
      tabSignup.classList.remove('active');
      signupPassword2.style.display = 'none';
      authBtn.textContent = 'Sign In';
    });
    tabSignup.addEventListener('click', () => {
      tabSignup.classList.add('active');
      tabSignin.classList.remove('active');
      signupPassword2.style.display = 'block';
      authBtn.textContent = 'Sign Up';
    });

    // Auth form submit
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Form submit handler running');
      try {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const isSignup = tabSignup.classList.contains('active');
        if (isSignup) {
          const password2 = signupPassword2.value;
          if (password !== password2) {
            alert('Passwords do not match!');
            return;
          }
        }
      const endpoint = isSignup ? 'http://localhost:5000/api/signup' : 'http://localhost:5000/api/signin';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
          window.location.href = 'dashboard.html';
        } else {
          alert(data.message || 'Error');
        }
      } catch (err) {
        console.error('Form handler error:', err);
        alert('Network error');
      }
    });

    // Demo button
    demoBtn.addEventListener('click', () => {
      document.getElementById('username').value = 'demo';
      document.getElementById('password').value = 'demo123';
      if (signupPassword2) signupPassword2.value = 'demo123';
    });
  }
});
