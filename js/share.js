/**
 * ==============================================================================
 * STALLION REALTIES - PROPERTY SHARING ENGINE
 * Handles multi-platform sharing (WhatsApp, Web Share API, SMS, Socials & Copy)
 * ==============================================================================
 */

const PropertyShare = (() => {
  let modalOverlay = null;

  /**
   * Builds the absolute shareable URL for a given property ID (with self-hydrating payload)
   */
  function getShareUrl(propertyId) {
    if (typeof window === 'undefined') return '';
    
    // Use PropertyStorage's portable self-hydrating URL if available
    if (window.PropertyStorage && typeof window.PropertyStorage.getPropertyShareUrl === 'function') {
      const portableUrl = window.PropertyStorage.getPropertyShareUrl(propertyId);
      if (portableUrl) return portableUrl;
    }

    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const dir = pathname.substring(0, pathname.lastIndexOf('/') + 1);
    
    // In local file:// protocol or live web server
    if (window.location.protocol === 'file:') {
      const fullUrl = window.location.href.split('?')[0];
      const baseUrl = fullUrl.substring(0, fullUrl.lastIndexOf('/') + 1);
      return `${baseUrl}property-details.html?id=${encodeURIComponent(propertyId)}`;
    }
    return `${origin}${dir}property-details.html?id=${encodeURIComponent(propertyId)}`;
  }

  /**
   * Format comprehensive share message
   */
  function getShareContent(prop) {
    const title = prop.title || 'Exclusive Property in Ahmedabad';
    const price = prop.priceDisplay || 'Price on Request';
    const location = prop.location || 'Ahmedabad';
    const type = prop.type || 'Property';
    const purpose = prop.purpose || (prop.status === 'rent' ? 'For Rent' : 'For Sale');
    const shareUrl = getShareUrl(prop.id);

    const headline = `*${title}* (${purpose} | ${type})`;
    const body = `📍 Location: ${location}\n💰 Price: ${price}\n🏢 Stallion Realties Advisory`;
    const fullText = `Check out this property from Stallion Realties:\n\n${headline}\n${body}\n\n👉 View details here:\n${shareUrl}`;

    return {
      title: `${title} | Stallion Realties`,
      headline,
      price,
      location,
      type,
      purpose,
      url: shareUrl,
      text: fullText,
      encodedText: encodeURIComponent(fullText),
      encodedUrl: encodeURIComponent(shareUrl),
      encodedTitle: encodeURIComponent(title)
    };
  }

  /**
   * Lazily create and inject the share modal markup
   */
  function ensureModal() {
    if (modalOverlay) return modalOverlay;

    modalOverlay = document.createElement('div');
    modalOverlay.className = 'share-modal-overlay';
    modalOverlay.id = 'propertyShareModal';
    modalOverlay.innerHTML = `
      <div class="share-modal" role="dialog" aria-modal="true" aria-labelledby="shareModalTitle">
        <div class="share-modal-header">
          <div>
            <h3 class="share-modal-title" id="shareModalTitle">Share Property</h3>
            <p class="share-modal-subtitle">Share this listing with family, clients, or friends</p>
          </div>
          <button type="button" class="auth-close" id="closeShareModal" aria-label="Close share dialog">&times;</button>
        </div>

        <div class="share-prop-preview" id="sharePropPreview">
          <!-- Dynamically populated -->
        </div>

        <div class="share-channels-grid" id="shareChannelsGrid">
          <!-- Dynamically populated buttons -->
        </div>

        <div>
          <label style="display:block; font-size: 0.78rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 500;">
            Or copy direct listing link:
          </label>
          <div class="share-copy-box">
            <input type="text" id="shareLinkInput" class="share-copy-input" readonly />
            <button type="button" id="copyShareLinkBtn" class="share-copy-btn">
              Copy Link
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    // Event listeners for closing
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) close();
    });

    const closeBtn = modalOverlay.querySelector('#closeShareModal');
    if (closeBtn) closeBtn.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
        close();
      }
    });

    // Copy link button handler
    const copyBtn = modalOverlay.querySelector('#copyShareLinkBtn');
    const linkInput = modalOverlay.querySelector('#shareLinkInput');
    if (copyBtn && linkInput) {
      copyBtn.addEventListener('click', () => {
        copyToClipboard(linkInput.value, copyBtn);
      });
    }

    return modalOverlay;
  }

  /**
   * Helper to copy text to clipboard with fallback
   */
  function copyToClipboard(text, triggerBtn) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        onCopied(triggerBtn);
      }).catch(() => {
        fallbackCopy(text, triggerBtn);
      });
    } else {
      fallbackCopy(text, triggerBtn);
    }
  }

  function fallbackCopy(text, triggerBtn) {
    const input = document.getElementById('shareLinkInput');
    if (input) {
      input.select();
      input.setSelectionRange(0, 99999);
      try {
        document.execCommand('copy');
        onCopied(triggerBtn);
        return;
      } catch (e) {}
    }
    prompt('Copy property link:', text);
  }

  function onCopied(triggerBtn) {
    if (triggerBtn) {
      const orig = triggerBtn.textContent;
      triggerBtn.textContent = '✓ Copied!';
      triggerBtn.style.background = '#22c55e';
      triggerBtn.style.color = '#fff';
      setTimeout(() => {
        triggerBtn.textContent = orig;
        triggerBtn.style.background = '';
        triggerBtn.style.color = '';
      }, 2500);
    }
    if (typeof window.showToast === 'function') {
      window.showToast('Property link copied to clipboard!');
    }
  }

  /**
   * Close the share modal
   */
  function close() {
    if (modalOverlay) {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  /**
   * Open the share modal for a specific property ID or object
   */
  function open(propOrId) {
    let prop = null;
    if (typeof propOrId === 'object' && propOrId !== null) {
      prop = propOrId;
    } else if (typeof propOrId === 'string' && window.PropertyRepository) {
      prop = PropertyRepository.getById(propOrId);
    }

    if (!prop) {
      if (typeof window.showToast === 'function') {
        window.showToast('Property listing details unavailable', 'error');
      }
      return;
    }

    ensureModal();
    const shareData = getShareContent(prop);

    // Populate preview card
    const previewEl = document.getElementById('sharePropPreview');
    const thumbImg = prop.mainImage || (prop.images && prop.images[0]) || 'assets/images/stallion-horse-gold.png';
    previewEl.innerHTML = `
      <img src="${thumbImg}" alt="${prop.title}" class="share-prop-thumb" />
      <div class="share-prop-info">
        <h4>${prop.title}</h4>
        <p>${prop.priceDisplay} &bull; <span style="color: var(--text-muted); font-weight: normal;">${prop.location}</span></p>
      </div>
    `;

    // Populate link input
    const linkInput = document.getElementById('shareLinkInput');
    if (linkInput) linkInput.value = shareData.url;

    // Build social share URLs
    const waUrl = `https://api.whatsapp.com/send?text=${shareData.encodedText}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareData.encodedUrl}`;
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out ' + prop.title + ' via Stallion Realties: ')}&url=${shareData.encodedUrl}`;
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareData.encodedUrl}`;
    const emailSubject = encodeURIComponent(`Stallion Realties: ${prop.title}`);
    const emailUrl = `mailto:?subject=${emailSubject}&body=${shareData.encodedText}`;
    const smsUrl = `sms:?&body=${shareData.encodedText}`;

    const hasNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

    const channelsGrid = document.getElementById('shareChannelsGrid');
    channelsGrid.innerHTML = `
      <!-- WhatsApp -->
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="share-channel-item whatsapp" title="Share on WhatsApp">
        <div class="share-channel-icon" style="color: #25d366;">
          <svg viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.11 7.39C8.94 7.39 8.66 7.46 8.42 7.72C8.18 7.98 7.5 8.63 7.5 9.94C7.5 11.25 8.46 12.5 8.59 12.69C8.73 12.87 10.45 15.54 13.1 16.68C13.73 16.95 14.22 17.11 14.61 17.23C15.24 17.43 15.82 17.4 16.28 17.34C16.79 17.26 17.85 16.69 18.07 16.07C18.29 15.45 18.29 14.92 18.23 14.81C18.16 14.71 17.99 14.64 17.73 14.51C17.48 14.39 16.23 13.78 16 13.69C15.77 13.61 15.6 13.56 15.43 13.82C15.26 14.08 14.77 14.64 14.62 14.81C14.47 14.99 14.32 15.01 14.07 14.88C13.81 14.76 12.99 14.49 12.01 13.62C11.26 12.94 10.74 12.11 10.6 11.86C10.45 11.6 10.58 11.47 10.71 11.34C10.83 11.22 10.97 11.04 11.1 10.89C11.23 10.74 11.27 10.63 11.36 10.46C11.45 10.28 11.4 10.13 11.34 10.01C11.27 9.88 10.78 8.68 10.58 8.18C10.38 7.7 10.18 7.76 10.02 7.75C9.88 7.75 9.71 7.74 9.54 7.74C9.37 7.74 9.11 7.39 9.11 7.39Z"/></svg>
        </div>
        <span>WhatsApp</span>
      </a>

      <!-- Other Apps / System Share (if mobile or supported browser) -->
      ${hasNativeShare ? `
        <button type="button" id="btnNativeShare" class="share-channel-item native" title="Share via installed apps">
          <div class="share-channel-icon" style="color: var(--gold-light);">
            <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
          </div>
          <span>More Apps</span>
        </button>
      ` : ''}

      <!-- Email -->
      <a href="${emailUrl}" class="share-channel-item email" title="Share via Email">
        <div class="share-channel-icon" style="color: var(--gold-light);">
          <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </div>
        <span>Email</span>
      </a>

      <!-- SMS / Message -->
      <a href="${smsUrl}" class="share-channel-item sms" title="Share via SMS / Message">
        <div class="share-channel-icon" style="color: #34d399;">
          <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/></svg>
        </div>
        <span>SMS</span>
      </a>

      <!-- Facebook -->
      <a href="${fbUrl}" target="_blank" rel="noopener noreferrer" class="share-channel-item facebook" title="Share on Facebook">
        <div class="share-channel-icon" style="color: #1877f2;">
          <svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z"/></svg>
        </div>
        <span>Facebook</span>
      </a>

      <!-- Twitter / X -->
      <a href="${twUrl}" target="_blank" rel="noopener noreferrer" class="share-channel-item twitter" title="Share on X / Twitter">
        <div class="share-channel-icon" style="color: #1da1f2;">
          <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </div>
        <span>X / Twitter</span>
      </a>

      <!-- LinkedIn -->
      <a href="${liUrl}" target="_blank" rel="noopener noreferrer" class="share-channel-item linkedin" title="Share on LinkedIn">
        <div class="share-channel-icon" style="color: #0077b5;">
          <svg viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.5A1.6 1.6 0 0 0 6.2 8.1a1.6 1.6 0 0 0 1.63 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z"/></svg>
        </div>
        <span>LinkedIn</span>
      </a>
    `;

    // Hook up native Web Share API button if rendered
    const nativeBtn = document.getElementById('btnNativeShare');
    if (nativeBtn) {
      nativeBtn.addEventListener('click', async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: shareData.title,
              text: shareData.text,
              url: shareData.url
            });
            close();
          } catch (err) {
            // User cancelled or share failed silently
          }
        }
      });
    }

    // Display modal
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  return {
    open,
    close,
    getShareUrl,
    getShareContent
  };
})();

// Global Expose
window.PropertyShare = PropertyShare;
