/**
 * ==============================================================================
 * STALLION REALTIES - PROPERTY STORAGE & PERSISTENCE ENGINE
 * Bridges local data file, browser localStorage, and live dynamic reactivity
 * ==============================================================================
 */

const PropertyStorage = (() => {
  const STORAGE_KEY = 'STALLION_PROPERTIES_STORE';

  /**
   * Normalize property object to ensure all required fields are populated
   */
  function normalizeProperty(p) {
    const isRent = (p.purpose && p.purpose.toLowerCase().includes('rent')) || (p.status && p.status.toLowerCase() === 'rent');
    const purpose = p.purpose || (isRent ? 'For Rent' : 'For Sale');
    const status = isRent ? 'rent' : 'sale';

    const images = (p.images && p.images.length > 0) 
      ? p.images 
      : [p.mainImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

    return {
      id: p.id || 'stallion-' + Math.floor(100 + Math.random() * 900),
      isSample: p.isSample !== undefined ? p.isSample : false,
      isDemo: p.isDemo !== undefined ? p.isDemo : false,
      featured: Boolean(p.featured),
      title: p.title || 'Untitled Property',
      purpose: purpose,
      status: status,
      type: p.type || 'House',
      price: Number(p.price) || 0,
      priceDisplay: p.priceDisplay || (p.price ? '₹' + Number(p.price).toLocaleString() : 'Price on Request'),
      location: p.location || 'Metro City',
      area: Number(p.area) || 0,
      areaUnit: p.areaUnit || 'sq. ft.',
      bedrooms: p.bedrooms !== undefined && p.bedrooms !== null && p.bedrooms !== '' ? Number(p.bedrooms) : null,
      bathrooms: p.bathrooms !== undefined && p.bathrooms !== null && p.bathrooms !== '' ? Number(p.bathrooms) : null,
      shortDescription: p.shortDescription || p.description || '',
      description: p.description || p.shortDescription || '',
      mainImage: p.mainImage || images[0],
      heroImage: p.mainImage || images[0],
      additionalImages: p.additionalImages || images.slice(1),
      images: images,
      features: Array.isArray(p.features) ? p.features : [],
      availability: p.availability || 'Available',
      whatsappNumber: (!p.whatsappNumber || p.whatsappNumber.includes('[YOUR')) ? '919925027051' : p.whatsappNumber,
      contactLink: p.contactLink || '',
      // Owner Confidential Details (Admin Only)
      ownerName: p.ownerName ? String(p.ownerName).trim() : '',
      ownerPhone: p.ownerPhone ? String(p.ownerPhone).trim() : '',
      ownerEmail: p.ownerEmail ? String(p.ownerEmail).trim() : '',
      ownerNotes: p.ownerNotes ? String(p.ownerNotes).trim() : ''
    };
  }

  /**
   * Strip sensitive owner confidential details for public visitors & payloads
   */
  function sanitizeForPublic(prop) {
    if (!prop) return null;
    // If admin is currently logged in, allow viewing owner details
    if (typeof window !== 'undefined' && window.AuthManager && window.AuthManager.isAuthenticated()) {
      return prop;
    }
    // Deep clone and remove owner details
    const sanitized = { ...prop };
    delete sanitized.ownerName;
    delete sanitized.ownerPhone;
    delete sanitized.ownerEmail;
    delete sanitized.ownerNotes;
    return sanitized;
  }

  /**
   * Prepare compact public payload for URL sharing (strictly strips owner confidential info)
   */
  function getPublicPayload(p) {
    if (!p) return null;
    const cleanImg = (p.mainImage && !p.mainImage.startsWith('data:')) 
      ? p.mainImage 
      : (p.images && p.images[0] && !p.images[0].startsWith('data:') 
          ? p.images[0] 
          : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');

    const cleanImages = (p.images && Array.isArray(p.images))
      ? p.images.filter(img => typeof img === 'string' && !img.startsWith('data:') && img.length < 500)
      : [];

    return {
      id: p.id,
      title: p.title,
      purpose: p.purpose,
      status: p.status,
      type: p.type,
      price: Number(p.price) || 0,
      priceDisplay: p.priceDisplay || (p.price ? '₹' + Number(p.price).toLocaleString() : 'Price on Request'),
      location: p.location,
      area: Number(p.area) || 0,
      areaUnit: p.areaUnit || 'sq. ft.',
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      description: p.description || p.shortDescription || '',
      shortDescription: p.shortDescription || p.description || '',
      features: Array.isArray(p.features) ? p.features : [],
      availability: p.availability || 'Available',
      whatsappNumber: p.whatsappNumber || '919925027051',
      contactLink: p.contactLink || '',
      mainImage: cleanImg,
      heroImage: cleanImg,
      images: cleanImages.length > 0 ? cleanImages : [cleanImg],
      additionalImages: cleanImages.slice(1),
      isSample: false,
      isDemo: false
    };
  }

  /**
   * UTF-8 URL-safe base64 encoder
   */
  function toUrlBase64(data) {
    try {
      const jsonStr = JSON.stringify(data);
      const bytes = new TextEncoder().encode(jsonStr);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    } catch (e) {
      console.error('Error encoding data to URL-safe base64:', e);
      return '';
    }
  }

  /**
   * UTF-8 URL-safe base64 decoder
   */
  function fromUrlBase64(base64Str) {
    try {
      if (!base64Str) return null;
      let str = base64Str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) {
        str += '=';
      }
      const binary = atob(str);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonStr = new TextDecoder().decode(bytes);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn('Could not decode URL-safe base64 data:', e);
      return null;
    }
  }

  /**
   * Automatically unpack properties passed in the URL (pdata for single, catalog for multi)
   */
  function hydrateFromUrl() {
    if (typeof window === 'undefined' || !window.location || !window.location.search) return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let changed = false;
      const currentList = loadProperties();

      // Case 1: Direct single property payload
      const pdata = urlParams.get('pdata');
      if (pdata) {
        const decoded = fromUrlBase64(pdata);
        if (decoded && (decoded.id || decoded.title)) {
          const normalized = normalizeProperty(decoded);
          const existingIdx = currentList.findIndex(p => p.id.toLowerCase() === normalized.id.toLowerCase());
          if (existingIdx >= 0) {
            currentList[existingIdx] = { ...currentList[existingIdx], ...normalized };
          } else {
            currentList.unshift(normalized);
          }
          changed = true;
          console.log('[Stallion] Successfully hydrated shared property from URL:', normalized.title);
        }
      }

      // Case 2: Multi-property catalog payload
      const catalogData = urlParams.get('catalog');
      if (catalogData) {
        const decodedCatalog = fromUrlBase64(catalogData);
        if (Array.isArray(decodedCatalog) && decodedCatalog.length > 0) {
          decodedCatalog.forEach(item => {
            if (item && (item.id || item.title)) {
              const normalized = normalizeProperty(item);
              const existingIdx = currentList.findIndex(p => p.id.toLowerCase() === normalized.id.toLowerCase());
              if (existingIdx >= 0) {
                currentList[existingIdx] = { ...currentList[existingIdx], ...normalized };
              } else {
                currentList.unshift(normalized);
              }
              changed = true;
            }
          });
          console.log('[Stallion] Successfully hydrated catalog from URL with', decodedCatalog.length, 'listings.');
        }
      }

      if (changed) {
        saveToLocalStorage(currentList);
      }
    } catch (e) {
      console.warn('[Stallion] URL hydration error:', e);
    }
  }

  /**
   * Load raw properties from storage or fallback to bundled PROPERTIES_DATA
   */
  function loadProperties() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeProperty);
        }
      }
    } catch (e) {
      console.warn('Could not read properties from localStorage:', e);
    }

    // Default fallback from properties-data.js
    if (typeof window !== 'undefined' && Array.isArray(window.PROPERTIES_DATA)) {
      const normalized = window.PROPERTIES_DATA.map(normalizeProperty);
      saveToLocalStorage(normalized);
      return normalized;
    }

    return [];
  }

  function saveToLocalStorage(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      // Keep in-memory mirror updated
      if (typeof window !== 'undefined') {
        window.PROPERTIES_DATA = list;
      }
    } catch (e) {
      console.error('Storage quota exceeded or storage unavailable:', e);
    }
  }

  // Run immediate hydration upon script initialization
  hydrateFromUrl();

  return {
    /**
     * Get all active properties
     */
    getAll() {
      return loadProperties();
    },

    /**
     * Get single property by ID
     */
    getById(id) {
      if (!id) return null;
      const all = loadProperties();
      return all.find(p => p.id.toLowerCase() === id.toLowerCase()) || null;
    },

    /**
     * Save property (create new or update existing)
     */
    save(propData) {
      const all = loadProperties();
      const normalized = normalizeProperty(propData);

      const existingIndex = all.findIndex(p => p.id.toLowerCase() === normalized.id.toLowerCase());

      if (existingIndex >= 0) {
        // Update existing
        all[existingIndex] = normalized;
      } else {
        // Prepend new listing to top
        all.unshift(normalized);
      }

      saveToLocalStorage(all);
      this.syncRepository();
      return normalized;
    },

    /**
     * Delete property by ID
     */
    delete(id) {
      if (!id) return false;
      const all = loadProperties();
      const filtered = all.filter(p => p.id.toLowerCase() !== id.toLowerCase());
      if (filtered.length === all.length) return false; // nothing removed

      saveToLocalStorage(filtered);
      this.syncRepository();
      return true;
    },

    /**
     * Reset to default demo listings from properties-data.js
     */
    resetToDefaults() {
      localStorage.removeItem(STORAGE_KEY);
      if (typeof window !== 'undefined' && Array.isArray(window.PROPERTIES_DATA)) {
        saveToLocalStorage(window.PROPERTIES_DATA);
      }
      this.syncRepository();
      return this.getAll();
    },

    /**
     * Generate downloadable JS file content for permanent properties-data.js backup
     */
    exportDataFile() {
      const fileContent = this.generatePropertiesDataJs();
      const blob = new Blob([fileContent], { type: 'application/javascript;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = 'properties-data.js';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
    },

    /**
     * Sync dynamic storage with PropertyRepository used by existing pages
     */
    syncRepository() {
      const self = this;
      if (typeof window !== 'undefined') {
        const allProps = self.getAll();
        window.PROPERTIES_DATA = allProps;

        if (window.PropertyRepository) {
          window.PropertyRepository.getAll = () => self.getAll().map(p => sanitizeForPublic(p));
          window.PropertyRepository.getById = (id) => sanitizeForPublic(self.getById(id));
          
          // Home page display: Always prioritize custom admin-added properties first!
          window.PropertyRepository.getFeatured = () => {
            const all = self.getAll().map(p => sanitizeForPublic(p));
            const custom = all.filter(p => !p.isSample);
            const featured = all.filter(p => p.featured);
            
            const result = [];
            const seen = new Set();
            
            // 1. Any property added from the admin portal appears first!
            custom.forEach(p => {
              if (!seen.has(p.id)) {
                result.push(p);
                seen.add(p.id);
              }
            });
            
            // 2. Curated featured listings
            featured.forEach(p => {
              if (!seen.has(p.id)) {
                result.push(p);
                seen.add(p.id);
              }
            });
            
            // 3. Other portfolio listings to keep home page full
            all.forEach(p => {
              if (!seen.has(p.id)) {
                result.push(p);
                seen.add(p.id);
              }
            });
            
            return result;
          };

          // Catalog filter: Filter across all live stored properties
          window.PropertyRepository.filter = (criteria = {}) => {
            const all = self.getAll();
            const { purpose, status, type, location, minPrice, maxPrice, bedrooms, maxArea, availability } = criteria;
            return all
              .filter(p => {
                const targetPurpose = purpose || status;
                if (targetPurpose && targetPurpose !== 'all') {
                  const pStatus = (p.status || '').toLowerCase();
                  const pPurpose = (p.purpose || '').toLowerCase();
                  const target = targetPurpose.toLowerCase();

                  if (target === 'buy' || target === 'sale' || target === 'for sale') {
                    if (pStatus !== 'sale' && !pPurpose.includes('sale')) return false;
                  } else if (target === 'rent' || target === 'for rent') {
                    if (pStatus !== 'rent' && !pPurpose.includes('rent')) return false;
                  }
                }

                if (availability && availability !== 'all') {
                  if ((p.availability || '').toLowerCase() !== availability.toLowerCase()) return false;
                }
                
                if (type && type !== 'all' && (p.type || '').toLowerCase() !== type.toLowerCase()) {
                  return false;
                }
                
                if (location && location.trim() !== '') {
                  const query = location.toLowerCase().trim();
                  const match = (p.location || '').toLowerCase().includes(query) || 
                                (p.title || '').toLowerCase().includes(query);
                  if (!match) return false;
                }
                
                if (minPrice && p.price < Number(minPrice)) return false;
                if (maxPrice && p.price > Number(maxPrice)) return false;
                
                if (bedrooms && bedrooms !== 'all') {
                  if (!p.bedrooms) return false;
                  if (bedrooms === '4+' && p.bedrooms < 4) return false;
                  if (bedrooms !== '4+' && p.bedrooms !== Number(bedrooms)) return false;
                }
                
                if (maxArea && p.area > Number(maxArea)) return false;
                
                return true;
              })
              .map(p => sanitizeForPublic(p));
          };

          window.PropertyRepository.getSimilar = (currentId, limit = 3) => {
            const current = self.getById(currentId);
            const all = self.getAll();
            if (!current) return all.slice(0, limit).map(p => sanitizeForPublic(p));
            return all
              .filter(p => p.id !== current.id && (
                (p.type || '').toLowerCase() === (current.type || '').toLowerCase() ||
                (p.purpose || '').toLowerCase() === (current.purpose || '').toLowerCase()
              ))
              .slice(0, limit)
              .map(p => sanitizeForPublic(p));
          };
        }

        // Notify open pages that properties were updated
        window.dispatchEvent(new CustomEvent('properties-updated', { detail: allProps }));
      }
    },

    /**
     * Expose payload utilities
     */
    toUrlBase64,
    fromUrlBase64,
    getPublicPayload,

    /**
     * Generate permanent URL for a specific property (clean, consistent link)
     */
    getPropertyShareUrl(id) {
      if (typeof window === 'undefined') return '';
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      const dir = pathname.substring(0, pathname.lastIndexOf('/') + 1);
      const baseUrl = (window.location.protocol === 'file:')
        ? window.location.href.split('?')[0].substring(0, window.location.href.split('?')[0].lastIndexOf('/') + 1)
        : `${origin}${dir}`;

      return `${baseUrl}property-details.html?id=${encodeURIComponent(id)}`;
    },

    /**
     * Generate permanent URL for website / catalog (clean, consistent link)
     */
    getCatalogShareUrl(targetPage = 'properties.html') {
      if (typeof window === 'undefined') return '';
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      const dir = pathname.substring(0, pathname.lastIndexOf('/') + 1);
      const baseUrl = (window.location.protocol === 'file:')
        ? window.location.href.split('?')[0].substring(0, window.location.href.split('?')[0].lastIndexOf('/') + 1)
        : `${origin}${dir}`;

      return `${baseUrl}${targetPage}`;
    },

    /**
     * Generate clean properties-data.js content string for GitHub sync or file export
     */
    generatePropertiesDataJs() {
      // For the public repository file, strip owner confidential information!
      const currentList = this.getAll().map(p => {
        const sanitized = { ...p };
        delete sanitized.ownerName;
        delete sanitized.ownerPhone;
        delete sanitized.ownerEmail;
        delete sanitized.ownerNotes;
        return sanitized;
      });
      const jsonContent = JSON.stringify(currentList, null, 2);

      return `/**
 * ==============================================================================
 * STALLION REALTIES - PROPERTY LISTINGS DATABASE (LIVE REPOSITORY)
 * Last Synchronized: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
 * ==============================================================================
 */

const PROPERTIES_DATA = ${jsonContent};

// Global & browser compatibility
if (typeof window !== 'undefined') {
  window.PROPERTIES_DATA = PROPERTIES_DATA;
}
`;
    }
  };
})();

// Auto-sync on script load
if (typeof window !== 'undefined') {
  window.PropertyStorage = PropertyStorage;
  PropertyStorage.syncRepository();
}
