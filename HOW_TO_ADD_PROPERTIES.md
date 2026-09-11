# How to Add, Edit, and Manage Properties
### Stallion Realties Website Guide

Welcome to the property management guide for **Stallion Realties**. 

You do **not** need a database, code compiler, or server to manage your properties. Everything is controlled from a single, clean file:

📁 **`js/properties-data.js`**

---

## 1. Fast Summary: How It Works

1. Open `js/properties-data.js` in any text editor (VS Code, Notepad, etc.).
2. You will see an array named `PROPERTIES_DATA = [ ... ];`
3. Each property is enclosed inside curly braces `{ ... }` separated by a comma `,`.
4. Save the file and refresh your browser. The website will automatically update on the **Home page**, **Properties catalog**, and **Property Details page**!

---

## 2. Copy-and-Paste Template for a New Property

To add a new property, copy the template below and paste it inside the `PROPERTIES_DATA = [` array in `js/properties-data.js`:

```javascript
  {
    id: "stallion-101",
    isSample: false, // Set to false for your real properties
    featured: true,  // Set to true to show in the Featured section on the Home page
    title: "Magnolia Heights 3 BHK Luxury Apartment",
    purpose: "For Sale", // "For Sale" or "For Rent"
    type: "Apartment",   // "House", "Apartment", "Shop", or "Plot"
    price: 13500000,     // Price as a number (used for budget filters)
    priceDisplay: "₹1.35 Cr", // Text shown to users (e.g. "₹1.35 Cr" or "₹35,000 / month")
    location: "Green Valley Boulevard, Sector 62, Metro City",
    area: 1950,          // Area number
    areaUnit: "sq. ft.", // "sq. ft." or "sq. yards"
    bedrooms: 3,         // Number of bedrooms (use null for shops/plots)
    bathrooms: 3,        // Number of bathrooms (use null for plots)
    shortDescription: "A spacious sunlit 3 BHK apartment on the 14th floor with panoramic city views, modular kitchen, and clubhouse access.",
    mainImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Covered Car Parking",
      "Modular Kitchen with Chimney",
      "Swimming Pool & Gym",
      "24/7 Gated Security & Intercom",
      "100% Power Backup",
      "East-Facing Balcony",
      "Walking distance to Metro"
    ],
    availability: "Available", // "Available" | "Sold" | "Rented" | "Coming Soon"
    whatsappNumber: "919876543210", // Your WhatsApp number with country code
    contactLink: "" // (Optional) Leave empty for auto WhatsApp message
  },
```

---

## 3. Field Explanation & Options

| Field | Description | Allowed Values / Examples |
| :--- | :--- | :--- |
| **`id`** | Unique identifier for each listing. Must be unique. | `"stallion-007"`, `"prop-villa-12"` |
| **`isSample`** | Marks whether it is a demo listing. When `true`, shows a "Demo Listing" badge. | `true` or `false` |
| **`featured`** | Whether to highlight this property in the "Featured Properties" section on the Home page. | `true` or `false` |
| **`title`** | The public headline of the property. | e.g. `"The Royal Oak Villa"` |
| **`purpose`** | Whether the property is for buying or renting. | `"For Sale"` or `"For Rent"` |
| **`type`** | The category of property. Matches the filter buttons. | `"House"`, `"Apartment"`, `"Shop"`, or `"Plot"` |
| **`price`** | Clean numeric amount without symbols. Used for price filters. | `28500000`, `45000`, `9500000` |
| **`priceDisplay`** | The readable price formatted however you like. | `"₹2.85 Cr"`, `"₹45,000 / month"`, `"$350,000"` |
| **`location`** | The neighborhood, locality, and city. | `"Greenwood Enclave, Sector 45"` |
| **`area`** | Numerical size of the property. | `4200`, `1800`, `300` |
| **`areaUnit`** | Measurement unit. | `"sq. ft."` or `"sq. yards"` |
| **`bedrooms`** | Number of bedrooms. Use `null` for shops and plots. | `1`, `2`, `3`, `4`, `5`, or `null` |
| **`bathrooms`** | Number of bathrooms. Use `null` for plots. | `1`, `2`, `3`, `4`, `null` |
| **`shortDescription`** | Overview paragraph describing the property highlights. | Any text describing views, quality, location, etc. |
| **`mainImage`** | Primary photo displayed on cards and details header. | Image URL or local file path |
| **`additionalImages`** | Array of extra photos for the interactive thumbnail gallery. | `["image2.jpg", "image3.jpg"]` |
| **`features`** | List of amenities & selling points shown with checkmarks. | `["Covered Parking", "24/7 Security", ...]` |
| **`availability`** | Current commercial status. Controls the badge color. | `"Available"`, `"Sold"`, `"Rented"`, or `"Coming Soon"` |
| **`whatsappNumber`** | Your WhatsApp number with country code (no `+` or spaces). | `"919876543210"` |
| **`contactLink`** | Optional custom link (e.g. Google Form or Calendly). | `""` or `"https://..."` |

---

## 4. How to Add Your Own Photos

You have two easy options for adding photos:

### Option A: Local Photos on Your Computer (Recommended for offline use)
1. Place your photo files in the folder:  
   📁 `assets/images/` (e.g. `assets/images/villa-front.jpg`, `assets/images/villa-living.jpg`).
2. Reference them in `js/properties-data.js`:
   ```javascript
   mainImage: "assets/images/villa-front.jpg",
   additionalImages: [
     "assets/images/villa-living.jpg",
     "assets/images/villa-kitchen.jpg",
     "assets/images/villa-bedroom.jpg"
   ],
   ```

### Option B: Online Web Images
Paste any direct image URL (from Cloudinary, Imgur, your company CDN, or Unsplash):
```javascript
mainImage: "https://example.com/photos/apartment-1.jpg",
```

---

## 5. How to Update Availability (Sold, Rented, Coming Soon)

When a deal closes, you don't have to delete the listing! You can change the `availability` field:

- **Active Listing**: `availability: "Available"` *(Shows green badge)*
- **Sold Out**: `availability: "Sold"` *(Shows red badge and suggests similar properties to buyers)*
- **Leased Out**: `availability: "Rented"` *(Shows purple badge and suggests other rental options)*
- **Pre-Launch**: `availability: "Coming Soon"` *(Shows amber badge for upcoming projects)*

---

## 6. How to Edit or Remove a Property

- **To Edit**: Simply change any text or number in `js/properties-data.js` and save.
- **To Temporarily Hide**: Put `//` at the start of each line of that property, or set `availability: "Sold"`.
- **To Permanently Remove**: Select the `{ ... }` block for that property (including its comma) and delete it.

---

## 7. Need Help with WhatsApp Inquiries?

When a customer clicks the **"Enquire on WhatsApp"** button on any property page:
- The website automatically opens WhatsApp.
- It pre-populates a polite message with the property title, ID, price, and status:
  > *"Hello Stallion Realties! I am inquiring about 'The Royal Oak Luxury Villa' (Ref ID: stallion-001, Price: ₹2.85 Cr, Status: Available). Please provide more details."*

To route inquiries directly to your phone, replace `whatsappNumber: "[YOUR WHATSAPP NUMBER]"` with your actual number (e.g. `"919876543210"`).
