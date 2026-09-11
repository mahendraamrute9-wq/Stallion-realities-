/**
 * ==============================================================================
 * STALLION REALTIES - PROPERTIES CATALOG SCRIPT
 * Multi-criteria filter controller, URL parameter parser, and catalog renderer
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initPropertiesCatalog();
});

function initPropertiesCatalog() {
  const catalogGrid = document.getElementById('catalogGrid');
  const resultsCountEl = document.getElementById('resultsCount');
  
  if (!catalogGrid) return;

  // Filter elements
  const statusToggleBtns = document.querySelectorAll('.catalog-status-btn');
  const typeSelect = document.getElementById('filterType');
  const locationInput = document.getElementById('filterLocation');
  const priceSelect = document.getElementById('filterPrice');
  const bedroomsSelect = document.getElementById('filterBedrooms');
  const areaSelect = document.getElementById('filterArea');
  const availabilitySelect = document.getElementById('filterAvailability');
  const clearBtn = document.getElementById('clearFiltersBtn');

  // Filter state
  const state = {
    status: 'all',
    type: 'all',
    location: '',
    minPrice: null,
    maxPrice: null,
    bedrooms: 'all',
    maxArea: null,
    availability: 'all'
  };

  // 1. Parse URL Query Parameters on page load (from Home hero search)
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.has('status')) {
    state.status = urlParams.get('status').toLowerCase();
  }
  if (urlParams.has('type')) {
    state.type = urlParams.get('type').toLowerCase();
    if (typeSelect) typeSelect.value = state.type;
  }
  if (urlParams.has('location')) {
    state.location = urlParams.get('location');
    if (locationInput) locationInput.value = state.location;
  }
  if (urlParams.has('budget')) {
    state.maxPrice = urlParams.get('budget');
    if (priceSelect) priceSelect.value = state.maxPrice;
  }
  if (urlParams.has('availability')) {
    state.availability = urlParams.get('availability');
    if (availabilitySelect) availabilitySelect.value = state.availability;
  }

  // Set active toggle state
  statusToggleBtns.forEach(btn => {
    if (btn.dataset.status === state.status) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 2. Event Listeners for Filters
  statusToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      statusToggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.status = btn.dataset.status;
      applyFilters();
    });
  });

  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      state.type = typeSelect.value;
      applyFilters();
    });
  }

  if (locationInput) {
    locationInput.addEventListener('input', () => {
      state.location = locationInput.value;
      applyFilters();
    });
  }

  if (priceSelect) {
    priceSelect.addEventListener('change', () => {
      state.maxPrice = priceSelect.value ? Number(priceSelect.value) : null;
      applyFilters();
    });
  }

  if (bedroomsSelect) {
    bedroomsSelect.addEventListener('change', () => {
      state.bedrooms = bedroomsSelect.value;
      applyFilters();
    });
  }

  if (areaSelect) {
    areaSelect.addEventListener('change', () => {
      state.maxArea = areaSelect.value ? Number(areaSelect.value) : null;
      applyFilters();
    });
  }

  if (availabilitySelect) {
    availabilitySelect.addEventListener('change', () => {
      state.availability = availabilitySelect.value;
      applyFilters();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      // Reset state
      state.status = 'all';
      state.type = 'all';
      state.location = '';
      state.maxPrice = null;
      state.bedrooms = 'all';
      state.maxArea = null;
      state.availability = 'all';

      // Reset controls
      statusToggleBtns.forEach(b => b.classList.remove('active'));
      document.querySelector('.catalog-status-btn[data-status="all"]')?.classList.add('active');
      if (typeSelect) typeSelect.value = 'all';
      if (locationInput) locationInput.value = '';
      if (priceSelect) priceSelect.value = '';
      if (bedroomsSelect) bedroomsSelect.value = 'all';
      if (areaSelect) areaSelect.value = '';
      if (availabilitySelect) availabilitySelect.value = 'all';

      applyFilters();
    });
  }

  // 3. Apply Filters and Render Cards
  function applyFilters() {
    const filtered = PropertyRepository.filter(state);

    if (resultsCountEl) {
      resultsCountEl.innerHTML = `Showing <strong>${filtered.length}</strong> demo properties`;
    }

    if (filtered.length === 0) {
      catalogGrid.innerHTML = `
        <div class="no-results-box">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <h3>No matching properties found</h3>
          <p style="color: var(--text-muted); margin-bottom: 20px;">
            We couldn't find any demo listings matching your current filter criteria.
          </p>
          <button id="resetFromEmptyBtn" class="btn btn-gold btn-sm">Reset All Filters</button>
        </div>
      `;

      document.getElementById('resetFromEmptyBtn')?.addEventListener('click', () => {
        clearBtn?.click();
      });
      return;
    }

    catalogGrid.innerHTML = filtered.map(prop => renderPropertyCard(prop)).join('');
  }

  // Initial render
  applyFilters();

  // Listen for admin changes across tabs or windows
  window.addEventListener('storage', (e) => {
    if (e.key === 'STALLION_PROPERTIES' && window.PropertyStorage) {
      PropertyStorage.syncRepository();
      applyFilters();
    }
  });
  window.addEventListener('properties-updated', () => {
    applyFilters();
  });
}
