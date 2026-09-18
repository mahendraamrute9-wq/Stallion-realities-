/**
 * ==============================================================================
 * STALLION REALTIES - SECURE AUTHENTICATION ENGINE
 * Cryptographic SHA-256 Salted Hashing & Session Route Guard
 * ==============================================================================
 */

const AuthManager = (() => {
  // Built-in initial credentials (Stored ONLY as salted SHA-256 hash)
  const DEFAULT_SALT = 'stallion_salt_2026_secure';
  const DEFAULT_USER = 'admin';
  const DEFAULT_HASH = 'b25afc3f0bab6c835aec1920d1efc8a9f7b0827eacb3c6c420a9b7dabfda480e'; // Salted hash for initial setup

  const STORAGE_KEYS = {
    USER: 'STALLION_AUTH_USER',
    HASH: 'STALLION_AUTH_HASH',
    SALT: 'STALLION_AUTH_SALT',
    ATTEMPTS: 'STALLION_AUTH_ATTEMPTS',
    LOCKOUT: 'STALLION_AUTH_LOCKOUT',
    SESSION: 'STALLION_SESSION_TOKEN'
  };

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds
  const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours

  /**
   * Cryptographically hashes a string using browser's native Web Crypto API
   */
  async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getStoredUser() {
    return localStorage.getItem(STORAGE_KEYS.USER) || DEFAULT_USER;
  }

  function getStoredSalt() {
    return localStorage.getItem(STORAGE_KEYS.SALT) || DEFAULT_SALT;
  }

  function getStoredHash() {
    return localStorage.getItem(STORAGE_KEYS.HASH) || DEFAULT_HASH;
  }

  function isLockedOut() {
    const lockoutUntil = parseInt(localStorage.getItem(STORAGE_KEYS.LOCKOUT) || '0', 10);
    const now = Date.now();
    if (lockoutUntil > now) {
      const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
      return { locked: true, remainingSec };
    }
    return { locked: false, remainingSec: 0 };
  }

  function recordFailedAttempt() {
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '0', 10) + 1;
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, current.toString());
    if (current >= MAX_ATTEMPTS) {
      localStorage.setItem(STORAGE_KEYS.LOCKOUT, (Date.now() + LOCKOUT_DURATION_MS).toString());
      localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    }
  }

  function clearFailedAttempts() {
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT);
  }

  return {
    /**
     * Authenticate admin with username & password
     */
    async login(username, password) {
      const lockoutCheck = isLockedOut();
      if (lockoutCheck.locked) {
        return {
          success: false,
          message: `Too many failed attempts. Please wait ${lockoutCheck.remainingSec} seconds before trying again.`
        };
      }

      if (!username || !password) {
        return { success: false, message: 'Please enter both username and password.' };
      }

      const expectedUser = getStoredUser();
      const salt = getStoredSalt();
      const expectedHash = getStoredHash();

      if (username.trim().toLowerCase() !== expectedUser.toLowerCase()) {
        recordFailedAttempt();
        return { success: false, message: 'Invalid username or password.' };
      }

      const inputHash = await hashString(salt + password);

      if (inputHash === expectedHash) {
        clearFailedAttempts();
        const sessionPayload = {
          user: expectedUser,
          timestamp: Date.now(),
          token: await hashString(salt + Date.now() + Math.random())
        };
        sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionPayload));
        return { success: true };
      } else {
        recordFailedAttempt();
        const currentAttempts = parseInt(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '1', 10);
        const remaining = Math.max(0, MAX_ATTEMPTS - currentAttempts);
        return { 
          success: false, 
          message: remaining > 0 
            ? `Invalid username or password. (${remaining} attempts remaining)`
            : `Too many failed attempts. Locked out for 60 seconds.` 
        };
      }
    },

    /**
     * Check if currently authenticated
     */
    isAuthenticated() {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
        if (!raw) return false;
        const session = JSON.parse(raw);
        if (!session.timestamp || (Date.now() - session.timestamp > SESSION_MAX_AGE_MS)) {
          sessionStorage.removeItem(STORAGE_KEYS.SESSION);
          return false;
        }
        return true;
      } catch (e) {
        return false;
      }
    },

    /**
     * Verify admin password (matches login credentials)
     */
    async verifyPassword(password) {
      if (!password) return false;
      const salt = getStoredSalt();
      const expectedHash = getStoredHash();
      const inputHash = await hashString(salt + password);
      return inputHash === expectedHash;
    },

    /**
     * Get active logged in username
     */
    getCurrentUser() {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
        if (!raw) return 'Admin';
        const session = JSON.parse(raw);
        return session.user || 'Admin';
      } catch (e) {
        return 'Admin';
      }
    },

    /**
     * Guard protected pages (like admin.html)
     */
    requireAuth() {
      if (!this.isAuthenticated()) {
        window.location.href = 'admin-login.html';
      }
    },

    /**
     * Logout and destroy session
     */
    logout() {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
      window.location.href = 'admin-login.html';
    },

    /**
     * Update admin password from within dashboard
     */
    async changePassword(currentPassword, newPassword) {
      const salt = getStoredSalt();
      const expectedHash = getStoredHash();
      const currentHash = await hashString(salt + currentPassword);

      if (currentHash !== expectedHash) {
        return { success: false, message: 'Current password is incorrect.' };
      }

      if (!newPassword || newPassword.length < 6) {
        return { success: false, message: 'New password must be at least 6 characters long.' };
      }

      // Generate new salt
      const newSalt = 'stallion_' + Math.random().toString(36).substring(2, 12);
      const newHash = await hashString(newSalt + newPassword);

      localStorage.setItem(STORAGE_KEYS.SALT, newSalt);
      localStorage.setItem(STORAGE_KEYS.HASH, newHash);

      return { success: true, message: 'Password updated successfully!' };
    }
  };
})();

// Expose globally
if (typeof window !== 'undefined') {
  window.AuthManager = AuthManager;
}
