/**
 * ==============================================================================
 * STALLION REALTIES - UNIVERSAL AUTH MODAL & NAVIGATION CONTROLLER
 * Handles User Login, Registration, Admin Login, and Navigation Bar Profile State
 * ==============================================================================
 */

(function () {
  // 1. Create Modal Markup if not in DOM
  function injectAuthModal() {
    if (document.getElementById('stallionAuthModalOverlay')) return;

    const modalHtml = `
    <div class="auth-overlay" id="stallionAuthModalOverlay" aria-modal="true" role="dialog">
      <div class="auth-modal">
        <div class="auth-modal-header">
          <button class="auth-close" id="authModalCloseBtn" aria-label="Close modal">&times;</button>
          <div class="auth-modal-logo"><img src="assets/images/stallion-horse-gold-clean.png" alt="Stallion Realties Horse Logo" style="width: 32px; height: auto; object-fit: contain;" /><span>Stallion Realties Portal</span></div>
          <div class="auth-tabs" role="tablist">
            <button type="button" class="auth-tab active" data-tab="user-login">Client Login</button>
            <button type="button" class="auth-tab" data-tab="user-register">Register</button>
            <button type="button" class="auth-tab" data-tab="admin-login">Admin Portal</button>
          </div>
        </div>

        <div class="auth-modal-body">
          <!-- 1. USER LOGIN PANEL -->
          <div class="auth-panel active" id="tabPanelUserLogin">
            <h3>Welcome Back</h3>
            <p class="auth-sub">Sign in to view your saved properties & inquiries</p>
            <form id="userLoginForm">
              <div class="auth-form-group">
                <label for="uLoginEmail">Email Address</label>
                <input type="email" id="uLoginEmail" placeholder="e.g. client@example.com" required autocomplete="email" />
              </div>
              <div class="auth-form-group">
                <label for="uLoginPassword">Password</label>
                <input type="password" id="uLoginPassword" placeholder="Enter your password" required autocomplete="current-password" />
              </div>
              <div class="auth-error" id="uLoginError"></div>
              <div class="auth-success" id="uLoginSuccess"></div>
              <button type="submit" class="auth-submit">Sign In to Client Account</button>
              <div class="auth-switch">
                Don't have an account? <a href="#" id="switchToRegister">Register here</a>
              </div>
            </form>
          </div>

          <!-- 2. USER REGISTER PANEL -->
          <div class="auth-panel" id="tabPanelUserRegister">
            <h3>Create Account</h3>
            <p class="auth-sub">Save favorite properties & schedule private viewings</p>
            <form id="userRegisterForm">
              <div class="auth-form-group">
                <label for="uRegName">Full Name</label>
                <input type="text" id="uRegName" placeholder="e.g. Rahul Sharma" required autocomplete="name" />
              </div>
              <div class="auth-form-group">
                <label for="uRegEmail">Email Address</label>
                <input type="email" id="uRegEmail" placeholder="e.g. client@example.com" required autocomplete="email" />
              </div>
              <div class="auth-form-group">
                <label for="uRegPhone">Phone Number</label>
                <input type="tel" id="uRegPhone" placeholder="e.g. +91 98765 43210" required autocomplete="tel" />
              </div>
              <div class="auth-form-group">
                <label for="uRegPassword">Create Password (min 6 characters)</label>
                <input type="password" id="uRegPassword" placeholder="Choose a password" minlength="6" required autocomplete="new-password" />
              </div>
              <div class="auth-error" id="uRegError"></div>
              <div class="auth-success" id="uRegSuccess"></div>
              <button type="submit" class="auth-submit">Create My Account</button>
              <div class="auth-switch">
                Already registered? <a href="#" id="switchToLogin">Sign in here</a>
              </div>
            </form>
          </div>

          <!-- 3. ADMIN LOGIN PANEL -->
          <div class="auth-panel" id="tabPanelAdminLogin">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span style="background:var(--gold-gradient); color:#000; font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:4px; text-transform:uppercase;">Authorized Staff</span>
              <h3 style="margin:0;">Admin Sign In</h3>
            </div>
            <p class="auth-sub">Manage property catalog, listings, and availability</p>
            <form id="adminModalLoginForm">
              <div class="auth-form-group">
                <label for="aLoginUsername">Admin Username</label>
                <input type="text" id="aLoginUsername" placeholder="e.g. admin" required autocomplete="username" />
              </div>
              <div class="auth-form-group">
                <label for="aLoginPassword">Admin Password</label>
                <input type="password" id="aLoginPassword" placeholder="Enter administrative password" required autocomplete="current-password" />
              </div>
              <div class="auth-error" id="aLoginError"></div>
              <div class="auth-success" id="aLoginSuccess"></div>
              <button type="submit" class="auth-submit" style="background: var(--gold-gradient); color: #0f172a;">Sign In to Admin Dashboard</button>
              <div style="text-align:center; margin-top:14px;">
                <a href="admin-login.html" style="font-size:0.8rem; color:var(--text-muted); text-decoration:underline;">Or open dedicated Admin Login Page &rarr;</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = modalHtml;
    document.body.appendChild(div.firstElementChild);
  }

  // 2. Open / Close Modal Logic
  function openModal(defaultTab = 'user-login') {
    const overlay = document.getElementById('stallionAuthModalOverlay');
    if (!overlay) return;
    switchTab(defaultTab);
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('stallionAuthModalOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function switchTab(tabId) {
    const tabs = document.querySelectorAll('.auth-tab');
    const panels = {
      'user-login': document.getElementById('tabPanelUserLogin'),
      'user-register': document.getElementById('tabPanelUserRegister'),
      'admin-login': document.getElementById('tabPanelAdminLogin')
    };

    tabs.forEach(t => {
      if (t.dataset.tab === tabId) t.classList.add('active');
      else t.classList.remove('active');
    });

    Object.keys(panels).forEach(key => {
      const p = panels[key];
      if (!p) return;
      if (key === tabId) p.classList.add('active');
      else p.classList.remove('active');
    });
  }

  // 3. Setup Events for Modal
  function bindModalEvents() {
    const overlay = document.getElementById('stallionAuthModalOverlay');
    if (!overlay) return;

    // Close button
    const closeBtn = document.getElementById('authModalCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Overlay background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });

    // Tab buttons
    document.querySelectorAll('.auth-tab').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // In-form tab switches
    const switchToRegister = document.getElementById('switchToRegister');
    if (switchToRegister) {
      switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('user-register');
      });
    }

    const switchToLogin = document.getElementById('switchToLogin');
    if (switchToLogin) {
      switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('user-login');
      });
    }

    // User Login Form Submit
    const userLoginForm = document.getElementById('userLoginForm');
    if (userLoginForm) {
      userLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('uLoginEmail').value;
        const pass = document.getElementById('uLoginPassword').value;
        const errEl = document.getElementById('uLoginError');
        const succEl = document.getElementById('uLoginSuccess');
        errEl.classList.remove('show');
        succEl.classList.remove('show');

        if (typeof UserAuth === 'undefined') {
          errEl.textContent = 'Auth service unavailable';
          errEl.classList.add('show');
          return;
        }

        const res = UserAuth.login(email, pass);
        if (res.ok) {
          succEl.textContent = `Welcome, ${res.user.name}! Reloading...`;
          succEl.classList.add('show');
          setTimeout(() => {
            closeModal();
            updateNavigationAuth();
            if (window.showToast) window.showToast(`Signed in as ${res.user.name}`);
          }, 600);
        } else {
          errEl.textContent = res.msg;
          errEl.classList.add('show');
        }
      });
    }

    // User Register Form Submit
    const userRegisterForm = document.getElementById('userRegisterForm');
    if (userRegisterForm) {
      userRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('uRegName').value;
        const email = document.getElementById('uRegEmail').value;
        const phone = document.getElementById('uRegPhone').value;
        const pass = document.getElementById('uRegPassword').value;
        const errEl = document.getElementById('uRegError');
        const succEl = document.getElementById('uRegSuccess');
        errEl.classList.remove('show');
        succEl.classList.remove('show');

        if (typeof UserAuth === 'undefined') {
          errEl.textContent = 'Auth service unavailable';
          errEl.classList.add('show');
          return;
        }

        const res = UserAuth.register(name, email, phone, pass);
        if (res.ok) {
          UserAuth.login(email, pass);
          succEl.textContent = `Account created! Welcome, ${res.user.name}!`;
          succEl.classList.add('show');
          setTimeout(() => {
            closeModal();
            updateNavigationAuth();
            if (window.showToast) window.showToast(`Account registered and signed in!`);
          }, 600);
        } else {
          errEl.textContent = res.msg;
          errEl.classList.add('show');
        }
      });
    }

    // Admin Modal Login Submit
    const adminForm = document.getElementById('adminModalLoginForm');
    if (adminForm) {
      adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('aLoginUsername').value;
        const password = document.getElementById('aLoginPassword').value;
        const errEl = document.getElementById('aLoginError');
        const succEl = document.getElementById('aLoginSuccess');
        const submitBtn = adminForm.querySelector('button[type="submit"]');

        errEl.classList.remove('show');
        succEl.classList.remove('show');

        if (typeof AuthManager === 'undefined') {
          errEl.textContent = 'Admin Auth service unavailable. Redirecting to admin page...';
          errEl.classList.add('show');
          setTimeout(() => { window.location.href = 'admin-login.html'; }, 800);
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying Credentials...';

        try {
          const res = await AuthManager.login(username, password);
          if (res.success) {
            succEl.textContent = 'Authentication successful! Redirecting to Admin Dashboard...';
            succEl.classList.add('show');
            setTimeout(() => {
              window.location.href = 'admin.html';
            }, 700);
          } else {
            errEl.textContent = res.message || 'Invalid credentials';
            errEl.classList.add('show');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In to Admin Dashboard';
          }
        } catch (err) {
          errEl.textContent = 'An unexpected authentication error occurred.';
          errEl.classList.add('show');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In to Admin Dashboard';
        }
      });
    }
  }

  // 4. Update Navigation Bar according to auth state
  function updateNavigationAuth() {
    const navActions = document.querySelector('.site-header .nav-actions');
    if (!navActions) return;

    let authMount = document.getElementById('navAuthMount');
    if (!authMount) {
      authMount = document.createElement('div');
      authMount.id = 'navAuthMount';
      authMount.style.display = 'inline-flex';
      authMount.style.alignItems = 'center';
      authMount.style.gap = '8px';
      // Insert right before Explore Properties button or phone
      const exploreBtn = navActions.querySelector('.btn-gold');
      if (exploreBtn) {
        navActions.insertBefore(authMount, exploreBtn);
      } else {
        navActions.appendChild(authMount);
      }
    }

    const isAdmin = typeof AuthManager !== 'undefined' && AuthManager.isAuthenticated();
    const userSession = typeof UserAuth !== 'undefined' ? UserAuth.getSession() : null;

    if (isAdmin) {
      authMount.innerHTML = `
        <div class="nav-profile-wrap">
          <button class="nav-profile-btn" id="navProfileTrigger" type="button" aria-haspopup="true">
            <span class="nav-avatar" style="background:linear-gradient(135deg,#aa820a,#ffd700); color:#000;">ADM</span>
            <span>Admin Active</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          <div class="profile-dropdown" id="navProfileDropdown">
            <div class="pd-name">Stallion Administrator</div>
            <a href="admin.html">&#9881; Admin Dashboard</a>
            <a href="admin.html#listingsTable">&#128221; Manage Properties</a>
            <button type="button" class="pd-logout" id="adminHeaderLogoutBtn">&#128682; Sign Out</button>
          </div>
        </div>
      `;
      setupDropdownEvents();
      const logoutBtn = document.getElementById('adminHeaderLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          sessionStorage.removeItem('STALLION_SESSION_TOKEN');
          window.location.reload();
        });
      }
    } else if (userSession) {
      const initial = userSession.name ? userSession.name.charAt(0).toUpperCase() : 'U';
      const firstName = userSession.name ? userSession.name.split(' ')[0] : 'User';
      authMount.innerHTML = `
        <div class="nav-profile-wrap">
          <button class="nav-profile-btn" id="navProfileTrigger" type="button" aria-haspopup="true">
            <span class="nav-avatar">${initial}</span>
            <span>${firstName}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          <div class="profile-dropdown" id="navProfileDropdown">
            <div class="pd-name">${userSession.name}</div>
            <a href="properties.html">&#127968; Browse Properties</a>
            <button type="button" id="btnShowSavedProps">&#11088; Saved Properties</button>
            <button type="button" class="pd-logout" id="userHeaderLogoutBtn">&#128682; Sign Out</button>
          </div>
        </div>
      `;
      setupDropdownEvents();
      const logoutBtn = document.getElementById('userHeaderLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          UserAuth.logout();
          updateNavigationAuth();
          if (window.showToast) window.showToast('You have been signed out.');
          else window.location.reload();
        });
      }
      const savedBtn = document.getElementById('btnShowSavedProps');
      if (savedBtn) {
        savedBtn.addEventListener('click', () => {
          const savedIds = UserAuth.getSavedProperties();
          if (savedIds.length === 0) {
            alert('You have not saved any properties yet. Click on the heart icon or contact button on any property card to save it!');
          } else {
            window.location.href = 'properties.html';
          }
        });
      }
    } else {
      authMount.innerHTML = `
        <button type="button" class="btn-login" id="headerLoginTrigger" title="Login as Client or Admin">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
          <span>Login / Portal</span>
        </button>
      `;
      const trigger = document.getElementById('headerLoginTrigger');
      if (trigger) {
        trigger.addEventListener('click', () => openModal('user-login'));
      }
    }

    // Also update mobile drawer
    updateMobileDrawerAuth(isAdmin, userSession);
  }

  function setupDropdownEvents() {
    const trigger = document.getElementById('navProfileTrigger');
    const dropdown = document.getElementById('navProfileDropdown');
    if (!trigger || !dropdown) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
    });
  }

  function updateMobileDrawerAuth(isAdmin, userSession) {
    const drawerLinks = document.querySelector('.mobile-drawer .drawer-links');
    if (!drawerLinks) return;

    let drawerAuth = document.getElementById('drawerAuthItem');
    if (!drawerAuth) {
      drawerAuth = document.createElement('div');
      drawerAuth.id = 'drawerAuthItem';
      drawerAuth.style.marginTop = '12px';
      drawerAuth.style.paddingTop = '12px';
      drawerAuth.style.borderTop = '1px solid rgba(255,255,255,0.08)';
      drawerLinks.appendChild(drawerAuth);
    }

    if (isAdmin) {
      drawerAuth.innerHTML = `
        <div style="font-size:0.75rem; text-transform:uppercase; color:var(--gold-primary); font-weight:700; margin-bottom:6px;">Admin Access</div>
        <a href="admin.html" class="drawer-link">&#9881; Admin Dashboard</a>
        <a href="#" id="drawerLogoutAdmin" class="drawer-link" style="color:var(--accent-red);">&#128682; Sign Out Admin</a>
      `;
      const btn = document.getElementById('drawerLogoutAdmin');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          sessionStorage.removeItem('STALLION_SESSION_TOKEN');
          window.location.reload();
        });
      }
    } else if (userSession) {
      drawerAuth.innerHTML = `
        <div style="font-size:0.75rem; text-transform:uppercase; color:var(--gold-primary); font-weight:700; margin-bottom:6px;">Logged In: ${userSession.name}</div>
        <a href="properties.html" class="drawer-link">&#127968; Properties</a>
        <a href="#" id="drawerLogoutUser" class="drawer-link" style="color:var(--accent-red);">&#128682; Sign Out</a>
      `;
      const btn = document.getElementById('drawerLogoutUser');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          UserAuth.logout();
          window.location.reload();
        });
      }
    } else {
      drawerAuth.innerHTML = `
        <button type="button" id="drawerLoginBtn" class="btn btn-secondary" style="width:100%; display:flex; justify-content:center; gap:8px; align-items:center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
          Sign In (Client / Admin)
        </button>
      `;
      const btn = document.getElementById('drawerLoginBtn');
      if (btn) {
        btn.addEventListener('click', () => {
          const drawer = document.querySelector('.mobile-drawer');
          const overlay = document.querySelector('.drawer-overlay');
          if (drawer) drawer.classList.remove('open');
          if (overlay) overlay.classList.remove('open');
          openModal('user-login');
        });
      }
    }
  }

  // 5. Expose globally
  window.StallionAuthModal = {
    open: openModal,
    close: closeModal,
    switchTab: switchTab,
    updateNav: updateNavigationAuth
  };

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    injectAuthModal();
    bindModalEvents();
    updateNavigationAuth();

    // Any trigger with data-open-auth-tab attribute can open the modal
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-open-auth-tab]');
      if (target) {
        e.preventDefault();
        const tab = target.getAttribute('data-open-auth-tab') || 'user-login';
        openModal(tab);
      }
    });
  });
})();

