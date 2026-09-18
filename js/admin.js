/**
 * ==============================================================================
 * STALLION REALTIES - ADMIN DASHBOARD CONTROLLER
 * Full CRUD, Image FileReader Uploads, Live Metrics & Security
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Guard route: require authenticated session
  AuthManager.requireAuth();

  // 2. Set active user label
  const userLabel = document.getElementById('activeUserLabel');
  if (userLabel) {
    userLabel.textContent = AuthManager.getCurrentUser();
  }

  // 3. State management for image uploads
  let currentMainImage = '';
  let currentAdditionalImages = [];
  let pendingDeleteId = null;

  // Cache DOM elements
  const tableBody = document.getElementById('adminTableBody');
  const searchInput = document.getElementById('adminSearchInput');
  const statusFilter = document.getElementById('adminStatusFilter');
  const purposeFilter = document.getElementById('adminPurposeFilter');
  
  // Modals
  const propModal = document.getElementById('propertyModal');
  const deleteModal = document.getElementById('deleteModal');
  const passwordModal = document.getElementById('passwordModal');
  const propForm = document.getElementById('propertyForm');
  const passwordForm = document.getElementById('passwordForm');

  // Image Upload Controls
  const mainDropzone = document.getElementById('mainImageDropzone');
  const mainFileInput = document.getElementById('mainImageFileInput');
  const mainUrlInput = document.getElementById('propMainImageUrl');
  const mainPreviewWrap = document.getElementById('mainImagePreviewWrap');
  const mainPreviewImg = document.getElementById('mainImagePreviewImg');

  const addDropzone = document.getElementById('additionalImagesDropzone');
  const addFileInput = document.getElementById('additionalImagesFileInput');
  const addPreviewStrip = document.getElementById('additionalImagesPreviewStrip');

  /* ==========================================================================
     IMAGE RESIZING & FILEREADER HELPER
     Scales down high-res camera photos to avoid exceeding localStorage quota
     ========================================================================== */
  function fileToDataUrl(file, maxWidth = 1200, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // If image is already reasonably sized, return directly
          if (img.width <= maxWidth && img.height <= maxWidth) {
            resolve(e.target.result);
            return;
          }
          // Scale down via canvas
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ==========================================================================
     METRICS CALCULATION
     ========================================================================== */
  function updateMetrics(list) {
    const total = list.length;
    let available = 0, sold = 0, rented = 0, comingSoon = 0;

    list.forEach(p => {
      const avail = (p.availability || '').toLowerCase();
      if (avail === 'available') available++;
      else if (avail === 'sold') sold++;
      else if (avail === 'rented') rented++;
      else if (avail === 'coming soon') comingSoon++;
    });

    document.getElementById('metricTotal').textContent = total;
    document.getElementById('metricAvailable').textContent = available;
    document.getElementById('metricSold').textContent = sold;
    document.getElementById('metricRented').textContent = rented;
    document.getElementById('metricComingSoon').textContent = comingSoon;
  }

  /* ==========================================================================
     TABLE RENDERING & FILTERING
     ========================================================================== */
  function renderTable() {
    const all = PropertyStorage.getAll();
    updateMetrics(all);

    const query = (searchInput?.value || '').toLowerCase().trim();
    const statusVal = statusFilter?.value || 'all';
    const purposeVal = purposeFilter?.value || 'all';

    const filtered = all.filter(p => {
      // Query search
      if (query) {
        const matchTitle = (p.title || '').toLowerCase().includes(query);
        const matchLoc = (p.location || '').toLowerCase().includes(query);
        const matchId = (p.id || '').toLowerCase().includes(query);
        if (!matchTitle && !matchLoc && !matchId) return false;
      }

      // Status filter
      if (statusVal !== 'all') {
        if ((p.availability || '').toLowerCase() !== statusVal.toLowerCase()) return false;
      }

      // Purpose filter
      if (purposeVal !== 'all') {
        if ((p.purpose || '').toLowerCase() !== purposeVal.toLowerCase()) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 45px 20px; color: var(--text-muted);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--gold-primary)" style="margin-bottom: 8px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <div style="font-size: 1.05rem; font-weight: 600; color: #fff;">No property listings match your filters</div>
            <div style="font-size: 0.85rem; margin-top: 4px;">Click "+ Add New Property" above to create a listing.</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(p => {
      const avail = p.availability || 'Available';
      let availClass = 'badge-avail-available';
      if (avail.toLowerCase() === 'sold') availClass = 'badge-avail-sold';
      else if (avail.toLowerCase() === 'rented') availClass = 'badge-avail-rented';
      else if (avail.toLowerCase() === 'coming soon') availClass = 'badge-avail-coming-soon';

      const thumbUrl = p.mainImage || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80';
      const unit = p.areaUnit || 'sq. ft.';

      return `
        <tr data-id="${p.id}">
          <td>
            <img src="${thumbUrl}" alt="${p.title}" class="table-prop-thumb" loading="lazy" />
          </td>
          <td>
            <div class="table-prop-info">
              <span class="table-prop-title">${p.title}</span>
              <span class="table-prop-meta">ID: ${p.id} &bull; ${p.location}</span>
            </div>
          </td>
          <td><span class="badge badge-type">${p.type}</span></td>
          <td><strong style="color: #fff;">${p.purpose}</strong></td>
          <td><span style="color: var(--gold-light); font-weight: 700;">${p.priceDisplay}</span></td>
          <td>${p.area} ${unit}</td>
          <td><span class="badge ${availClass}">${avail}</span></td>
          <td style="text-align: right;">
              <button class="btn-action btn-share-row share-btn" data-id="${p.id}" title="Share Listing" style="color: var(--gold-light); border-color: rgba(212, 175, 55, 0.4);">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
                Share
              </button>

              <button class="btn-action btn-edit edit-btn" data-id="${p.id}" title="Edit Listing">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                Edit
              </button>

              <button class="btn-action btn-delete delete-btn" data-id="${p.id}" data-title="${p.title}" title="Delete Listing">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                Delete
              </button>

              <a href="property-details.html?id=${p.id}" target="_blank" class="btn-action btn-view-live" title="View Listing Live">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row button listeners
    document.querySelectorAll('.share-btn').forEach(b => {
      b.addEventListener('click', () => {
        if (window.PropertyShare) {
          window.PropertyShare.open(b.dataset.id);
        }
      });
    });

    document.querySelectorAll('.edit-btn').forEach(b => {
      b.addEventListener('click', () => openEditModal(b.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(b => {
      b.addEventListener('click', () => openDeleteModal(b.dataset.id, b.dataset.title));
    });
  }

  /* ==========================================================================
     IMAGE UPLOAD INTERFACES (MAIN & ADDITIONAL)
     ========================================================================== */
  // Main Image Click Trigger
  if (mainDropzone) {
    mainDropzone.addEventListener('click', () => mainFileInput.click());
  }

  if (mainFileInput) {
    mainFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const dataUrl = await fileToDataUrl(file);
        setMainImage(dataUrl);
      } catch (err) {
        alert('Could not read image file.');
      }
    });
  }

  if (mainUrlInput) {
    mainUrlInput.addEventListener('input', () => {
      const url = mainUrlInput.value.trim();
      if (url) setMainImage(url);
    });
  }

  function setMainImage(src) {
    currentMainImage = src;
    if (mainPreviewImg && mainPreviewWrap) {
      mainPreviewImg.src = src;
      mainPreviewWrap.style.display = 'block';
    }
  }

  // Additional Gallery Images Trigger
  if (addDropzone) {
    addDropzone.addEventListener('click', () => addFileInput.click());
  }

  if (addFileInput) {
    addFileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        try {
          const dataUrl = await fileToDataUrl(file);
          currentAdditionalImages.push(dataUrl);
        } catch (err) {
          console.warn('Skipped unreadable photo:', file.name);
        }
      }
      renderAdditionalImagesPreview();
      addFileInput.value = ''; // reset so same files can be re-added
    });
  }

  function renderAdditionalImagesPreview() {
    if (!addPreviewStrip) return;
    addPreviewStrip.innerHTML = currentAdditionalImages.map((src, index) => `
      <div class="preview-thumb-wrap">
        <img src="${src}" alt="Gallery ${index + 1}" />
        <button type="button" class="preview-remove-btn" data-index="${index}" title="Remove photo">&times;</button>
      </div>
    `).join('');

    addPreviewStrip.querySelectorAll('.preview-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index, 10);
        currentAdditionalImages.splice(idx, 1);
        renderAdditionalImagesPreview();
      });
    });
  }

  /* ==========================================================================
     MODAL CONTROLS: ADD / EDIT
     ========================================================================== */
  function openAddModal() {
    propForm.reset();
    document.getElementById('propId').value = '';
    document.getElementById('modalTitle').textContent = 'Add New Property Listing';
    document.getElementById('propFeatured').checked = true; // Automatically feature on home page
    currentMainImage = '';
    currentAdditionalImages = [];
    if (mainPreviewWrap) mainPreviewWrap.style.display = 'none';
    if (mainPreviewImg) mainPreviewImg.src = '';
    renderAdditionalImagesPreview();
    propModal.classList.add('open');
  }

  function openEditModal(id) {
    const prop = PropertyStorage.getById(id);
    if (!prop) return;

    propForm.reset();
    document.getElementById('modalTitle').textContent = `Edit Property: ${prop.title}`;
    document.getElementById('propId').value = prop.id;
    document.getElementById('propTitle').value = prop.title || '';
    document.getElementById('propPurpose').value = prop.purpose || 'For Sale';
    document.getElementById('propType').value = prop.type || 'House';
    document.getElementById('propPrice').value = prop.price || '';
    document.getElementById('propPriceDisplay').value = prop.priceDisplay || '';
    document.getElementById('propLocation').value = prop.location || '';
    document.getElementById('propArea').value = prop.area || '';
    document.getElementById('propAreaUnit').value = prop.areaUnit || 'sq. ft.';
    document.getElementById('propAvailability').value = prop.availability || 'Available';
    document.getElementById('propBedrooms').value = prop.bedrooms !== null ? prop.bedrooms : '';
    document.getElementById('propBathrooms').value = prop.bathrooms !== null ? prop.bathrooms : '';
    document.getElementById('propDescription').value = prop.shortDescription || prop.description || '';
    document.getElementById('propFeatures').value = (prop.features || []).join(', ');
    document.getElementById('propWhatsapp').value = prop.whatsappNumber && !prop.whatsappNumber.includes('[YOUR') ? prop.whatsappNumber : '';
    document.getElementById('propFeatured').checked = Boolean(prop.featured);

    // Set images
    currentMainImage = prop.mainImage || (prop.images && prop.images[0]) || '';
    if (currentMainImage) {
      setMainImage(currentMainImage);
      if (mainUrlInput) mainUrlInput.value = currentMainImage.startsWith('data:') ? '' : currentMainImage;
    } else {
      if (mainPreviewWrap) mainPreviewWrap.style.display = 'none';
    }

    currentAdditionalImages = (prop.additionalImages && prop.additionalImages.length > 0)
      ? [...prop.additionalImages]
      : (prop.images ? prop.images.slice(1) : []);
    renderAdditionalImagesPreview();

    propModal.classList.add('open');
  }

  function closeModal() {
    propModal.classList.remove('open');
  }

  // Handle Form Submit (Save Listing)
  propForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('propTitle').value.trim();
    const purpose = document.getElementById('propPurpose').value;
    const type = document.getElementById('propType').value;
    const price = Number(document.getElementById('propPrice').value);
    let priceDisplay = document.getElementById('propPriceDisplay').value.trim();
    const location = document.getElementById('propLocation').value.trim();
    const area = Number(document.getElementById('propArea').value);
    const areaUnit = document.getElementById('propAreaUnit').value;
    const availability = document.getElementById('propAvailability').value;
    const bedrooms = document.getElementById('propBedrooms').value ? Number(document.getElementById('propBedrooms').value) : null;
    const bathrooms = document.getElementById('propBathrooms').value ? Number(document.getElementById('propBathrooms').value) : null;
    const description = document.getElementById('propDescription').value.trim();
    const featuresRaw = document.getElementById('propFeatures').value;
    const whatsapp = document.getElementById('propWhatsapp').value.trim();
    const featured = document.getElementById('propFeatured').checked;
    const existingId = document.getElementById('propId').value;

    // Fallback display price if user left it blank
    if (!priceDisplay) {
      priceDisplay = purpose === 'For Rent' 
        ? `₹${price.toLocaleString()} / month`
        : `₹${price.toLocaleString()}`;
    }

    // Parse features list
    const features = featuresRaw
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    // Fallback main image if none selected
    const mainImg = currentMainImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
    const allImages = [mainImg, ...currentAdditionalImages];

    const propData = {
      id: existingId || ('stallion-' + Math.floor(100 + Math.random() * 900)),
      isSample: false,
      isDemo: false,
      title,
      purpose,
      type,
      price,
      priceDisplay,
      location,
      area,
      areaUnit,
      availability,
      bedrooms,
      bathrooms,
      shortDescription: description,
      description,
      features,
      mainImage: mainImg,
      heroImage: mainImg,
      additionalImages: currentAdditionalImages,
      images: allImages,
      whatsappNumber: whatsapp || '919925027051',
      featured
    };

    PropertyStorage.save(propData);
    closeModal();
    window.showToast(`Property "${title}" saved successfully!`, 'success');
    renderTable();
  });

  /* ==========================================================================
     MODAL CONTROLS: DELETE
     ========================================================================== */
  function openDeleteModal(id, title) {
    pendingDeleteId = id;
    document.getElementById('deleteModalMsg').textContent = 
      `Are you sure you want to permanently delete "${title}" (Ref ID: ${id})? It will be removed from all website pages.`;
    deleteModal.classList.add('open');
  }

  function closeDeleteModal() {
    deleteModal.classList.remove('open');
    pendingDeleteId = null;
  }

  document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
    if (pendingDeleteId) {
      PropertyStorage.delete(pendingDeleteId);
      closeDeleteModal();
      window.showToast('Listing removed successfully.', 'success');
      renderTable();
    }
  });

  /* ==========================================================================
     MODAL CONTROLS: CHANGE PASSWORD
     ========================================================================== */
  function openPasswordModal() {
    passwordForm.reset();
    passwordModal.classList.add('open');
  }

  function closePasswordModal() {
    passwordModal.classList.remove('open');
  }

  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = document.getElementById('currentPassInput').value;
    const newPass = document.getElementById('newPassInput').value;
    const confirmPass = document.getElementById('confirmPassInput').value;

    if (newPass !== confirmPass) {
      alert('New password and confirmation do not match.');
      return;
    }

    const result = await AuthManager.changePassword(current, newPass);
    if (result.success) {
      closePasswordModal();
      window.showToast(result.message, 'success');
    } else {
      alert(result.message);
    }
  });

  /* ==========================================================================
     TOOLBAR & GLOBAL EVENT BINDINGS
     ========================================================================== */
  document.getElementById('addNewPropBtn')?.addEventListener('click', openAddModal);
  document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);

  document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
  document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);

  document.getElementById('changePassBtn')?.addEventListener('click', openPasswordModal);
  document.getElementById('closePasswordModalBtn')?.addEventListener('click', closePasswordModal);
  document.getElementById('cancelPasswordBtn')?.addEventListener('click', closePasswordModal);

  document.getElementById('logoutBtn')?.addEventListener('click', () => AuthManager.logout());

  document.getElementById('exportDataBtn')?.addEventListener('click', () => {
    PropertyStorage.exportDataFile();
    window.showToast('Downloaded updated properties-data.js file!', 'success');
  });

  document.getElementById('resetDemoBtn')?.addEventListener('click', () => {
    if (confirm('Reset to original sample listings? Any custom properties added will be replaced by the original demo items.')) {
      PropertyStorage.resetToDefaults();
      renderTable();
      window.showToast('Restored default demo listings.', 'success');
    }
  });

  // Search & Filters live reactivity
  if (searchInput) searchInput.addEventListener('input', renderTable);
  if (statusFilter) statusFilter.addEventListener('change', renderTable);
  if (purposeFilter) purposeFilter.addEventListener('change', renderTable);

  // Close modals on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeDeleteModal();
      closePasswordModal();
    }
  });

  // Initial table render
  renderTable();
});
