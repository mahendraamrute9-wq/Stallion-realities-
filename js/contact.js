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

    // Submit Simulation & Feedback
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
        <path d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8z"/>
      </svg>
      Sending Enquiry...
    `;

    const waText = 
      `*New Contact Enquiry - Stallion Realties*\n\n` +
      `• *Name:* ${name}\n` +
      `• *Phone:* ${phone}\n` +
      `• *Email:* ${email}\n` +
      `• *Interest:* ${interest || 'Property Inquiry'}\n` +
      `• *Message:* ${message}\n\n` +
      `Please get in touch with me regarding this enquiry.`;

    const waUrl = `https://wa.me/919925027051?text=${encodeURIComponent(waText)}`;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      contactForm.reset();

      window.showToast(`Thank you, ${name}! Redirecting to WhatsApp to send your enquiry...`, 'success');
      window.open(waUrl, '_blank');
    }, 600);
  });
}
