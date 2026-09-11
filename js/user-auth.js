/* ==========================================================================
   STALLION REALTIES — USER AUTH SYSTEM
   Handles customer registration, login, session management via localStorage
   ========================================================================== */

const UserAuth = (() => {
  const USERS_KEY   = "STALLION_USERS";
  const SESSION_KEY = "STALLION_USER_SESSION";

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
    catch(e) { return []; }
  }
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function register(name, email, phone, password) {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, msg: "An account with this email already exists." };
    }
    if (password.length < 6) {
      return { ok: false, msg: "Password must be at least 6 characters." };
    }
    const user = {
      id: "usr_" + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passwordHash: btoa(unescape(encodeURIComponent(password))),
      createdAt: new Date().toISOString(),
      savedProperties: []
    };
    users.push(user);
    saveUsers(users);
    return { ok: true, user };
  }

  function login(email, password) {
    const users = getUsers();
    const hash = btoa(unescape(encodeURIComponent(password)));
    const user = users.find(u =>
      u.email.toLowerCase() === email.trim().toLowerCase() &&
      u.passwordHash === hash
    );
    if (!user) return { ok: false, msg: "Incorrect email or password." };
    const session = { id: user.id, name: user.name, email: user.email, phone: user.phone };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, user: session };
  }

  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
    catch(e) { return null; }
  }

  function logout() { sessionStorage.removeItem(SESSION_KEY); }

  function isLoggedIn() { return getSession() !== null; }

  function toggleSaved(propId) {
    const session = getSession();
    if (!session) return false;
    const users = getUsers();
    const user = users.find(u => u.id === session.id);
    if (!user) return false;
    user.savedProperties = user.savedProperties || [];
    const idx = user.savedProperties.indexOf(propId);
    if (idx === -1) user.savedProperties.push(propId);
    else user.savedProperties.splice(idx, 1);
    saveUsers(users);
    return idx === -1;
  }

  function isSaved(propId) {
    const session = getSession();
    if (!session) return false;
    const users = getUsers();
    const user = users.find(u => u.id === session.id);
    return user ? (user.savedProperties || []).includes(propId) : false;
  }

  function getSavedProperties() {
    const session = getSession();
    if (!session) return [];
    const users = getUsers();
    const user = users.find(u => u.id === session.id);
    return user ? (user.savedProperties || []) : [];
  }

  return { register, login, logout, getSession, isLoggedIn, toggleSaved, isSaved, getSavedProperties };
})();
