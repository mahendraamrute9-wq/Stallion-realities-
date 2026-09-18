/**
 * ==============================================================================
 * STALLION REALTIES - PROPERTY DETAILS SCRIPT
 * Dynamic property renderer, photo gallery switcher, WhatsApp builder & similar items
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initPropertyDetails();
});

let hasAttachedUpdateListener = false;

function initPropertyDetails() {
  const container = document.getElementById('propertyDetailsRoot');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('id') || 'stallion-001'; // default to first demo if empty

  let prop = window.PropertyRepository ? window.PropertyRepository.getById(propertyId) : null;
  if (!prop && window.PropertyStorage) {
    prop = window.PropertyStorage.getById(propertyId);
  }

  // Double fallback: if not in repository yet, decode pdata from URL directly
  if (!prop && urlParams.has('pdata') && window.PropertyStorage && typeof window.PropertyStorage.fromUrlBase64 === 'function') {
    try {
      const decoded = window.PropertyStorage.fromUrlBase64(urlParams.get('pdata'));
      if (decoded && (decoded.id || decoded.title)) {
        prop = window.PropertyStorage.save(decoded);
      }
    } catch (e) {
      console.warn('Direct pdata fallback parse failed:', e);
    }
  }

  if (!prop) {
    // If cloud database is configured, wait for fetch to complete
    const isCloudConfigured = window.PropertyStorage && window.PropertyStorage.getSheetApiUrl();
    if (isCloudConfigured) {
      container.innerHTML = `
        <div class="no-results-box" style="margin: 60px 0;">
          <div style="font-size: 1.2rem; font-weight: 600; color: var(--gold-light); margin-bottom: 8px;">Loading Property Listing...</div>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Fetching verified details from Stallion Realties database...</p>
        </div>
      `;
      // Timeout fallback if property really doesn't exist
      setTimeout(() => {
        const checkAgain = window.PropertyStorage ? window.PropertyStorage.getById(propertyId) : null;
        if (!checkAgain) {
          container.innerHTML = `
            <div class="no-results-box" style="margin: 60px 0;">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <h3>Property Listing Not Found</h3>
              <p style="color: var(--text-muted); margin-bottom: 24px;">
                The property you are looking for may have been updated or removed from the catalog.
              </p>
              <a href="properties.html" class="btn btn-gold">Browse All Properties</a>
            </div>
          `;
        }
      }, 4000);
    } else {
      container.innerHTML = `
        <div class="no-results-box" style="margin: 60px 0;">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <h3>Property Listing Not Found</h3>
          <p style="color: var(--text-muted); margin-bottom: 24px;">
            The property you are looking for may have been updated or removed from the demo catalog.
          </p>
          <a href="properties.html" class="btn btn-gold">Browse All Properties</a>
        </div>
      `;
    }
    return;
  }

  // Update document title
  document.title = `${prop.title} | Stallion Realties`;

  // Render full details page
  renderDetailsHTML(container, prop);
  initGallerySwitcher();
  initDetailsEnquiryForm(prop);
  renderSimilarProperties(prop.id);
}

// React to live database updates
if (!hasAttachedUpdateListener) {
  hasAttachedUpdateListener = true;
  window.addEventListener('properties-updated', () => {
    initPropertyDetails();
  });
}

function renderDetailsHTML(container, prop) {
  const purposeLabel = prop.purpose || (prop.status === 'rent' ? 'For Rent' : 'For Sale');
  const purposeClass = purposeLabel.toLowerCase().includes('rent') ? 'badge-status-rent' : 'badge-status-sale';
  const isHouseOrApartment = (prop.type || '').toLowerCase() === 'house' || (prop.type || '').toLowerCase() === 'apartment';
  const isDemo = prop.isSample !== undefined ? prop.isSample : prop.isDemo;

  // Availability Badge
  const avail = prop.availability || 'Available';
  let availClass = 'badge-avail-available';
  if (avail.toLowerCase() === 'sold') availClass = 'badge-avail-sold';
  else if (avail.toLowerCase() === 'rented') availClass = 'badge-avail-rented';
  else if (avail.toLowerCase() === 'coming soon') availClass = 'badge-avail-coming-soon';

  const unitText = prop.areaUnit || 'sq. ft.';
  const allImages = (prop.images && prop.images.length > 0) ? prop.images : [prop.mainImage];

  const imagesHTML = allImages.map((imgUrl, index) => `
    <div class="thumb-item ${index === 0 ? 'active' : ''}" data-src="${imgUrl}">
      <img src="${imgUrl}" alt="${prop.title} - View ${index + 1}" loading="lazy" />
    </div>
  `).join('');

  const featuresHTML = (prop.features || []).map(feat => `
    <div class="feature-check-item">
      <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      <span>${feat}</span>
    </div>
  `).join('');

  // Pre-filled WhatsApp message & URL
  const waText = encodeURIComponent(
    `Hello Stallion Realties! I am inquiring about "${prop.title}" (Ref ID: ${prop.id}, Price: ${prop.priceDisplay}, Status: ${avail}). Please provide more details.`
  );
  
  let waUrl = `https://wa.me/919925027051?text=${waText}`;
  if (prop.contactLink && prop.contactLink.trim() !== '') {
    waUrl = prop.contactLink;
  } else if (prop.whatsappNumber && !prop.whatsappNumber.includes('[YOUR')) {
    const cleanPhone = prop.whatsappNumber.replace(/[^0-9]/g, '');
    waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;
  }

  const isUnavailable = avail.toLowerCase() === 'sold' || avail.toLowerCase() === 'rented';

  container.innerHTML = `
    <!-- Breadcrumb -->
    <nav style="display: flex; gap: 8px; font-size: 0.88rem; color: var(--text-muted); margin-bottom: 20px; align-items: center;">
      <a href="index.html" style="color: var(--text-secondary);">Home</a>
      <span>/</span>
      <a href="properties.html" style="color: var(--text-secondary);">Properties</a>
      <span>/</span>
      <span style="color: var(--gold-light);">${prop.title}</span>
    </nav>

    <!-- Header info -->
    <div class="details-header-card">
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
        <span class="badge ${purposeClass}">${purposeLabel}</span>
        <span class="badge ${availClass}">${avail}</span>
        <span class="badge badge-type">Type: ${prop.type}</span>
        ${isDemo ? '<span class="badge badge-demo">Demo Listing</span>' : ''}
        <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: auto;">Ref ID: <strong>${prop.id}</strong></span>
      </div>

      <h1 class="details-title">${prop.title}</h1>

      <div class="details-location">
        <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        <span>${prop.location}</span>
      </div>
    </div>

    <!-- Main Details Layout Grid -->
    <div class="details-layout">
      <!-- Left Column: Media & Info -->
      <div class="details-main-content">
        <!-- Photo Gallery -->
        <div class="gallery-section">
          <div class="gallery-main-view">
            <img 
              id="mainGalleryImg" 
              src="${allImages[0]}" 
              alt="${prop.title}" 
              class="gallery-main-img" 
            />
            <div style="position: absolute; top: 16px; right: 16px; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); padding: 4px 12px; border-radius: var(--radius-sm); font-size: 0.8rem; color: #fff;">
              ${allImages.length} Photos Available
            </div>
          </div>
          <div class="gallery-thumbs">
            ${imagesHTML}
          </div>
        </div>

        <!-- Specifications Bar -->
        <div class="details-specs-bar">
          <div class="details-spec-item">
            <div class="details-spec-icon">
              <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>
            </div>
            <div class="details-spec-text">
              <span>Super Area</span>
              <strong>${prop.area} ${unitText}</strong>
            </div>
          </div>

          <div class="details-spec-item">
            <div class="details-spec-icon">
              <svg viewBox="0 0 24 24"><path d="M19 7h-8v6H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4zm2 7H5v-2h14c1.1 0 2 .9 2 2z"/></svg>
            </div>
            <div class="details-spec-text">
              <span>${isHouseOrApartment ? 'Bedrooms' : 'Configurations'}</span>
              <strong>${prop.bedrooms ? prop.bedrooms + ' BHK' : 'Custom Plot / Retail'}</strong>
            </div>
          </div>

          <div class="details-spec-item">
            <div class="details-spec-icon">
              <svg viewBox="0 0 24 24"><path d="M21 10.78V8c0-1.65-1.35-3-3-3h-4c-1.65 0-3 1.35-3 3v2.78c-.61.55-1 1.34-1 2.22v6c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-6c0-.88-.39-1.67-1-2.22z"/></svg>
            </div>
            <div class="details-spec-text">
              <span>Bathrooms</span>
              <strong>${prop.bathrooms ? prop.bathrooms + ' Fitted' : 'N/A'}</strong>
            </div>
          </div>

          <div class="details-spec-item">
            <div class="details-spec-icon">
              <svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/></svg>
            </div>
            <div class="details-spec-text">
              <span>Availability</span>
              <strong style="color: ${avail.toLowerCase() === 'sold' ? '#fca5a5' : (avail.toLowerCase() === 'rented' ? '#d8b4fe' : '#6ee7b7')};">${avail}</strong>
            </div>
          </div>
        </div>

        <!-- Overview & Description -->
        <div class="details-content-block">
          <h2 class="details-block-title">Property Overview</h2>
          <p style="font-size: 1.05rem; line-height: 1.8; color: var(--text-secondary); margin-bottom: 24px;">
            ${prop.shortDescription || prop.description}
          </p>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; background: rgba(0,0,0,0.25); padding: 18px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.06);">
            <div><span style="color: var(--text-muted); font-size: 0.85rem;">Property Type:</span> <strong style="color: #fff; margin-left: 6px;">${prop.type}</strong></div>
            <div><span style="color: var(--text-muted); font-size: 0.85rem;">Purpose:</span> <strong style="color: #fff; margin-left: 6px;">${purposeLabel}</strong></div>
            <div><span style="color: var(--text-muted); font-size: 0.85rem;">Area Measure:</span> <strong style="color: #fff; margin-left: 6px;">${prop.area} ${unitText}</strong></div>
            <div><span style="color: var(--text-muted); font-size: 0.85rem;">Current Status:</span> <strong style="color: #fff; margin-left: 6px;">${avail}</strong></div>
          </div>
        </div>

        <!-- Key Features & Amenities -->
        <div class="details-content-block">
          <h2 class="details-block-title">Features &amp; Highlights</h2>
          <div class="features-list">
            ${featuresHTML}
          </div>
        </div>
      </div>

      <!-- Right Column: Sticky Contact & Enquiry Sidebar -->
      <aside class="enquiry-sidebar">
        <div class="enquiry-card">
          <div class="enquiry-price-box">
            <div class="enquiry-price-label">${purposeLabel === 'For Rent' ? 'Monthly Rent' : 'Offered Price'}</div>
            <div class="enquiry-price-val">${prop.priceDisplay}</div>
            <div class="enquiry-price-sqft">Availability: <strong>${avail}</strong></div>
          </div>

          ${isUnavailable ? `
            <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 18px; font-size: 0.88rem; color: #fca5a5;">
              Notice: This property is currently <strong>${avail}</strong>. Contact us to inquire about upcoming or similar listings in this locality.
            </div>
          ` : ''}

          <div class="enquiry-actions">
            <!-- Share Property Button -->
            <button 
              type="button" 
              class="share-btn-details" 
              onclick="window.PropertyShare && window.PropertyShare.open('${prop.id}');"
              title="Share this property"
            >
              <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
              Share Property with Others
            </button>

            <!-- WhatsApp Direct Action Button -->
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="width: 100%;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.11 7.39C8.94 7.39 8.66 7.46 8.42 7.72C8.18 7.98 7.5 8.63 7.5 9.94C7.5 11.25 8.46 12.5 8.59 12.69C8.73 12.87 10.45 15.54 13.1 16.68C13.73 16.95 14.22 17.11 14.61 17.23C15.24 17.43 15.82 17.4 16.28 17.34C16.79 17.26 17.85 16.69 18.07 16.07C18.29 15.45 18.29 14.92 18.23 14.81C18.16 14.71 17.99 14.64 17.73 14.51C17.48 14.39 16.23 13.78 16 13.69C15.77 13.61 15.6 13.56 15.43 13.82C15.26 14.08 14.77 14.64 14.62 14.81C14.47 14.99 14.32 15.01 14.07 14.88C13.81 14.76 12.99 14.49 12.01 13.62C11.26 12.94 10.74 12.11 10.6 11.86C10.45 11.6 10.58 11.47 10.71 11.34C10.83 11.22 10.97 11.04 11.1 10.89C11.23 10.74 11.27 10.63 11.36 10.46C11.45 10.28 11.4 10.13 11.34 10.01C11.27 9.88 10.78 8.68 10.58 8.18C10.38 7.7 10.18 7.76 10.02 7.75C9.88 7.75 9.71 7.74 9.54 7.74C9.37 7.74 9.11 7.39 9.11 7.39Z"/></svg>
              Enquire on WhatsApp
            </a>

            <!-- Direct Call Action -->
            <a href="tel:+919925027051" class="btn btn-secondary" style="width: 100%;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.28-.27.36-.67.25-1.02A11.36 11.36 0 018.57 3.99c.07-.55-.38-1-.94-1H4.03c-.56 0-1.03.45-1 1.01C3.6 13.9 10.1 20.4 18.01 20.97c.56.03 1.01-.44 1.01-1v-3.59c0-.56-.45-1-1.01-1z"/></svg>
              Call Property Advisor (+91 99250 27051)
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 20px 0;" />

          <!-- Quick enquiry form -->
          <h4 style="font-family: var(--font-serif); font-size: 1.1rem; margin-bottom: 12px; color: var(--gold-light);">
            ${isUnavailable ? 'Inquire for Similar Options' : 'Schedule a Private Tour'}
          </h4>
          <form id="detailsQuickForm" class="quick-enquiry-form">
            <div class="form-field">
              <label for="detailName">Your Name</label>
              <input type="text" id="detailName" class="form-input" placeholder="e.g. Rahul Sharma" required />
            </div>
            
            <div class="form-field">
              <label for="detailPhone">Phone Number</label>
              <input type="tel" id="detailPhone" class="form-input" placeholder="+91 98765 43210" required />
            </div>

            <div class="form-field">
              <label for="detailNote">Preferred Date / Requirements</label>
              <input type="text" id="detailNote" class="form-input" placeholder="e.g. Looking for similar 3 BHK this month" />
            </div>

            <button type="submit" class="btn btn-gold" style="width: 100%; margin-top: 6px;">
              ${isUnavailable ? 'Submit Enquiry' : 'Request Tour Confirmation'}
            </button>
          </form>
        </div>
      </aside>
    </div>
  `;
}

function initGallerySwitcher() {
  const mainImg = document.getElementById('mainGalleryImg');
  const thumbs = document.querySelectorAll('.thumb-item');

  if (!mainImg || thumbs.length === 0) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      const newSrc = thumb.dataset.src;
      mainImg.style.opacity = '0.3';
      setTimeout(() => {
        mainImg.src = newSrc;
        mainImg.style.opacity = '1';
      }, 150);
    });
  });
}

function initDetailsEnquiryForm(prop) {
  const form = document.getElementById('detailsQuickForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('detailName').value.trim();
    const phone = document.getElementById('detailPhone').value.trim();

    if (!name || !phone) {
      alert('Please provide your name and phone number.');
      return;
    }

    // Success feedback
    window.showToast(`Thank you, ${name}! Your viewing request for "${prop.title}" has been registered. An advisor will contact you shortly.`, 'success');
    form.reset();
  });
}

function renderSimilarProperties(currentId) {
  const container = document.getElementById('similarPropertiesGrid');
  if (!container) return;

  const similar = PropertyRepository.getSimilar(currentId, 3);
  if (similar.length === 0) {
    container.closest('.section')?.remove();
    return;
  }

  container.innerHTML = similar.map(prop => renderPropertyCard(prop)).join('');
}
