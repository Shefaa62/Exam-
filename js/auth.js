'use strict';

const AUTH = (() => {
  // Storage Keys
  const TOKEN_KEY  = 'soleStep_token';
  const USER_KEY   = 'soleStep_user';

  // Token Management
  /** Get stored auth token */
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Check if user is logged in */
  function isLoggedIn() {
    return !!getToken();
  }

  // User Data
  /** Get stored user name */
  function getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Clear all auth state */
  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Auth Actions
  /**
   * Register a new user via Noroff API
   * @param {string} name - No spaces allowed
   * @param {string} email - Must end in @noroff.no or @stud.noroff.no
   * @param {string} password - Min 8 characters
   */
  async function registerUser(name, email, password) {
    const response = await fetch('https://v2.api.noroff.dev/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      const msg = result.errors?.[0]?.message || result.message || 'Registration failed.';
      throw new Error(msg);
    }

    return result;
  }

  /**
   * Login via Noroff API
   * @param {string} email
   * @param {string} password
   * @returns {boolean} true on success
   */
  async function loginUser(email, password) {
    const response = await fetch('https://v2.api.noroff.dev/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      const msg = result.errors?.[0]?.message || result.message || 'Login failed.';
      throw new Error(msg);
    }

    // Save token and user name
    localStorage.setItem(TOKEN_KEY, result.data.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify({ name: result.data.name, email: result.data.email }));

    // Update header UI
    updateHeaderAuth();
    if (window.CART && window.CART.updateCartBadge) {
      window.CART.updateCartBadge();
    }

    return true;
  }

  /**
   * Logout: clear storage, update header, redirect to login
   */
  function logoutUser() {
    clearAuth();
    updateHeaderAuth();
    if (window.CART && window.CART.updateCartBadge) {
      window.CART.updateCartBadge();
    }
    window.location.href = 'login.html';
  }

  // Header Auth UI
  /**
   * Update header auth button based on login state
   * (Called on every page load)
   */
  function updateHeaderAuth() {
    const loginBtn  = document.getElementById('header-login-btn');
    const registerBtn = document.getElementById('header-register-btn');
    const logoutBtn = document.getElementById('header-logout-btn');
    const userChip  = document.getElementById('header-user-chip');
    const mobileLoginBtn  = document.getElementById('mobile-login-btn');
    const mobileRegisterBtn = document.getElementById('mobile-register-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    if (isLoggedIn()) {
      const user = getUser();
      if (loginBtn)  loginBtn.style.display  = 'none';
      if (registerBtn) registerBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      if (mobileLoginBtn)  mobileLoginBtn.style.display  = 'none';
      if (mobileRegisterBtn) mobileRegisterBtn.style.display = 'none';
      if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'flex';

      if (userChip && user) {
        userChip.style.display    = 'flex';
        userChip.querySelector('.user-name').textContent = user.name || 'User';
      }
    } else {
      if (loginBtn)  loginBtn.style.display  = 'inline-flex';
      if (registerBtn) registerBtn.style.display = 'inline-flex';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (mobileLoginBtn)  mobileLoginBtn.style.display  = 'flex';
      if (mobileRegisterBtn) mobileRegisterBtn.style.display = 'flex';
      if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
      if (userChip)  userChip.style.display  = 'none';
    }
  }

  // Init
  function init() {
    updateHeaderAuth();
    if (window.CART && window.CART.updateCartBadge) {
      window.CART.updateCartBadge();
    }

    // Attach logout handler
    document.addEventListener('click', (e) => {
      if (e.target.closest('#header-logout-btn') ||
          e.target.closest('#mobile-logout-btn')) {
        e.preventDefault();
        logoutUser();
      }
    });

    // Highlight active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  return {
    getToken,
    isLoggedIn,
    getUser,
    clearAuth,
    registerUser,
    loginUser,
    logoutUser,
    updateHeaderAuth,
  };
})();

window.AUTH = AUTH;
