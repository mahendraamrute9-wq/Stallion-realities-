# Stallion Realties - Admin Credentials & Portal Guide

This document contains private credentials and security instructions for the **Stallion Realties Admin Portal**.

---

## 1. Default Login Credentials

| Credential | Value |
| :--- | :--- |
| **Login URL** | [`admin-login.html`](file:///C:/Users/SHIVAM/.gemini/antigravity/scratch/stallion-realties/admin-login.html) |
| **Username** | `admin` |
| **Default Password** | `Stallion@2026` |

> [!IMPORTANT]
> **Password Security Guarantee**:
> The plaintext password `Stallion@2026` is **NEVER** stored directly in the frontend website code. 
> Instead, authentication uses the browser's native **Web Crypto API with a salted SHA-256 hash** (`b25afc3f0bab6c835aec1920d1efc8a9f7b0827eacb3c6c420a9b7dabfda480e`).
> Anyone viewing the source code of your website will only see the cryptographic hash, making it secure against inspection.

---

## 2. How to Access the Admin Portal

You have two discreet ways to open the Admin Portal:

1. **Direct File / URL Access**:
   - Open `admin-login.html` directly in your browser.
2. **Discreet Footer Link ("Staff Portal")**:
   - Scroll to the bottom of any page on the website.
   - In the very bottom copyright bar on the right side, there is a subtle link labeled:  
     `Designed for Trust, Excellence & Performance • Staff Portal`
   - Clicking **"Staff Portal"** opens the admin login screen.
   - It is styled with muted contrast so regular visitors will not notice it.

---

## 3. How to Change Your Admin Password

1. Log in to the Admin Dashboard (`admin.html`).
2. In the top right corner of the dashboard, click the **"Security"** button.
3. Enter:
   - Your **Current Password** (`Stallion@2026` by default)
   - Your **New Password** (minimum 6 characters)
   - Confirm your new password
4. Click **"Update Password"**.
5. Your new password will be hashed and stored in your browser's secure storage immediately.

---

## 4. Admin Dashboard Capabilities

### A. Real-Time Metric Counters
The dashboard displays live counts for:
- **Total Properties**
- **Available Now** (Green)
- **Sold Properties** (Red)
- **Rented Properties** (Purple)
- **Coming Soon** (Amber)

### B. Adding a New Property
1. Click **"+ Add New Property"**.
2. Fill out the form fields:
   - **Title**: Headline for listing
   - **Purpose**: For Sale or For Rent
   - **Property Type**: House, Apartment, Shop, or Plot
   - **Price**: Number (for budget filters) and Display Text (e.g. `₹2.85 Cr`)
   - **Location**: Specific sector/city
   - **Area**: Number and unit (`sq. ft.` or `sq. yards`)
   - **Bedrooms & Bathrooms**: Optional for commercial shops/plots
   - **Description**: Summary of highlights
   - **Features**: Comma-separated list (e.g. `Private Pool, 24/7 Security, Covered Parking`)
   - **Photos**:
     - **Main Photo**: Click the box to pick an image file from your computer (auto-converts to optimized preview) or paste a web URL.
     - **Additional Gallery Photos**: Click to pick multiple image files. Each photo appears in a preview strip with a remove (`×`) button.
   - **Availability Status**: `Available`, `Sold`, `Rented`, or `Coming Soon`.
   - **Custom WhatsApp Number**: Direct routing to your phone.
   - **Feature on Homepage**: Highlight in the Featured section of `index.html`.
3. Click **"Save Property Listing"**. The property will appear instantly in your dashboard and on the public website!

### C. Editing an Existing Property
1. In the property table, click **"Edit"** on any property.
2. The form pre-fills with all current data, images, and features.
3. Change any value (e.g. switch status from `Available` to `Sold` or `Rented`).
4. Click **"Save Property Listing"**.

### D. Deleting a Property
1. Click **"Delete"** next to the property.
2. A confirmation modal will ask you to verify the deletion.
3. Click **"Confirm Delete"**. The property is immediately removed from all pages.

### E. Exporting Your Data File (Backup & Permanent Sync)
- Changes made in the Admin Dashboard are saved in `localStorage` and show live immediately on the website in your browser.
- Whenever you want to make these changes permanent across all computers and devices, click **"Export Data File"** in the top toolbar.
- This will download a new `properties-data.js` file with all your latest properties. Simply place it in your `js/` folder!

---

## 5. Security Protections
- **Brute-Force Rate Limiting**: After 5 consecutive failed login attempts, the portal locks out login attempts for 60 seconds.
- **Session Expiry**: Sessions are kept in `sessionStorage` and automatically expire when you close the tab or after 12 hours.
- **Route Guard**: Any attempt to access `admin.html` without logging in redirects straight to `admin-login.html`.
