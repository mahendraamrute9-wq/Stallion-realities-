/**
 * ==============================================================================
 * STALLION REALTIES - MAIN SCRIPTS
 * Navigation, Mobile Drawer, Card Rendering, Toast Notifications & Global Utils
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileDrawer();
  highlightActiveNav();
});

/* ==========================================================================
   NAVIGATION & SCROLL
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
      header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.6)';
      header.style.borderBottomColor = 'rgba(212, 175, 55, 0.35)';
    } else {
      header.classList.remove('scrolled');
      header.style.boxShadow = 'none';
      header.style.borderBottomColor = 'rgba(212, 175, 55, 0.28)';
    }
  });
}

function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  const closeBtn = document.querySelector('.drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (!drawer || !toggleBtn) return;

  function openDrawer() {
    drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

function highlightActiveNav() {
  const path = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll('.nav-link, .drawer-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href').toLowerCase();
    if (
      (href === 'index.html' && (path.endsWith('/') || path.endsWith('index.html') || path === '')) ||
      (href !== 'index.html' && path.includes(href))
    ) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ==========================================================================
   GLOBAL PROPERTY CARD GENERATOR
   Creates the uniform, accessible card UI used across Home, Catalog & Details
   ========================================================================== */
function renderPropertyCard(prop) {
  const isHouseOrApartment = (prop.type || '').toLowerCase() === 'house' || (prop.type || '').toLowerCase() === 'apartment';
  const purposeLabel = prop.purpose || (prop.status === 'rent' ? 'For Rent' : 'For Sale');
  const purposeClass = purposeLabel.toLowerCase().includes('rent') ? 'badge-status-rent' : 'badge-status-sale';

  // Availability Badge
  const avail = prop.availability || 'Available';
  let availClass = 'badge-avail-available';
  if (avail.toLowerCase() === 'sold') availClass = 'badge-avail-sold';
  else if (avail.toLowerCase() === 'rented') availClass = 'badge-avail-rented';
  else if (avail.toLowerCase() === 'coming soon') availClass = 'badge-avail-coming-soon';

  // Format specs
  const unitText = prop.areaUnit || 'sq. ft.';
  const bedText = prop.bedrooms ? `${prop.bedrooms} Beds` : (isHouseOrApartment ? 'Studio' : 'N/A');
  const bathText = prop.bathrooms ? `${prop.bathrooms} Baths` : 'N/A';
  const isDemo = prop.isSample !== undefined ? prop.isSample : prop.isDemo;

  return `
    <article class="property-card" data-id="${prop.id}">
      <div class="card-image-wrap">
        <img 
          src="${prop.mainImage || prop.heroImage || (prop.images && prop.images[0])}" 
          alt="${prop.title}" 
          class="card-image"
          loading="lazy"
        />
        <div class="card-badges-top">
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <span class="badge ${purposeClass}">${purposeLabel}</span>
            <span class="badge ${availClass}">${avail}</span>
          </div>
          ${isDemo ? '<span class="badge badge-demo">Demo Listing</span>' : ''}
        </div>
        <div class="card-price-tag">
          <span class="price-main">${prop.priceDisplay}</span>
        </div>
      </div>
      
      <div class="card-body">
        <h3 class="card-title">
          <a href="property-details.html?id=${prop.id}">${prop.title}</a>
        </h3>
        
        <div class="card-location">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <span>${prop.location}</span>
        </div>

        <div class="card-specs">
          <div class="spec-item">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>
            <span class="spec-val">${prop.area}</span>
            <span class="spec-lbl">${unitText}</span>
          </div>

          <div class="spec-item">
            <svg viewBox="0 0 24 24"><path d="M19 7h-8v6H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4zm2 7H5v-2h14c1.1 0 2 .9 2 2z"/></svg>
            <span class="spec-val">${bedText}</span>
            <span class="spec-lbl">${isHouseOrApartment ? 'Bedrooms' : 'Rooms'}</span>
          </div>

          <div class="spec-item">
            <svg viewBox="0 0 24 24"><path d="M21 10.78V8c0-1.65-1.35-3-3-3h-4c-1.65 0-3 1.35-3 3v2.78c-.61.55-1 1.34-1 2.22v6c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-6c0-.88-.39-1.67-1-2.22z"/></svg>
            <span class="spec-val">${bathText}</span>
            <span class="spec-lbl">Baths</span>
          </div>
        </div>

        <div class="card-footer">
          <span class="card-prop-type">Type: <strong>${prop.type}</strong></span>
          <a href="property-details.html?id=${prop.id}" class="btn btn-sm btn-gold">
            View Details
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          </a>
        </div>
      </div>
    </article>
  `;
}

/* ==========================================================================
   TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
    <div>${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global expose
window.renderPropertyCard = renderPropertyCard;
window.showToast = showToast;
