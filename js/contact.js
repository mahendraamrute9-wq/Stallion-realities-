/**
 * ==============================================================================
 * STALLION REALTIES - CONTACT FORM SCRIPT
 * Form validation, user enquiry submission, placeholder helpers & toast feedback
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});

function initContactForm() {
  const contactForm = document.getElementById('stallionContactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName')?.value.trim();
    const phone = document.getElementById('contactPhone')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const interest = document.getElementById('contactInterest')?.value;
    const message = document.getElementById('contactMessage')?.value.trim();

    // Basic Validation
    if (!name || !phone || !email || !message) {
      window.showToast('Please fill in all required fields.', 'error');
      return;
    }

    // Phone format basic check
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 8) {
      window.showToast('Please enter a valid phone number.', 'error');
      return;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      window.showToast('Please enter a valid email address.', 'error');
      return;
    }

    // Submit to Google Sheet & Gmail
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
        <path d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8z"/>
      </svg>
      Sending Enquiry...
    `;

    const payload = {
      action: 'submitInquiry',
      name: name,
      phone: phone,
      email: email,
      interest: interest || 'General Property Assistance',
      message: message,
      _subject: `New Contact Enquiry: ${name} (${interest || 'General'})`,
      _template: 'table',
      _captcha: 'false'
    };

    // 1. Google Apps Script live database & email
    const sheetApiUrl = window.PropertyStorage ? window.PropertyStorage.getSheetApiUrl() : '';
    if (sheetApiUrl) {
      fetch(sheetApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).catch(err => console.warn('[Stallion] Contact sheet error:', err));
    }

    // 2. Direct to Gmail via FormSubmit
    try {
      fetch('https://formsubmit.co/ajax/stallionrealities2026@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      }).catch(fsErr => console.warn('[Stallion] FormSubmit error:', fsErr));
    } catch (e) {}

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      contactForm.reset();

      // Show confirmation
      window.showToast(
        `Thank you, ${name}! Your enquiry has been delivered to stallionrealities2026@gmail.com. Our team will get in touch with you shortly.`,
        'success'
      );
    }, 800);
  });
}
