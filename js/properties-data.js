/**
 * ==============================================================================
 * STALLION REALTIES - PROPERTY LISTINGS DATABASE
 * ==============================================================================
 * 
 * QUICK INSTRUCTIONS:
 * 1. To ADD a property: Copy any property block below, paste it into the array,
 *    and fill in your details.
 * 2. To EDIT a property: Update any value (price, description, availability, etc.).
 * 3. To REMOVE a property: Delete or comment out the property object.
 * 4. When adding real properties, change `isSample: true` to `isSample: false`.
 * 
 * FIELD REFERENCE:
 * - title:            Headline for the listing (e.g. "The Royal Oak Villa")
 * - purpose:          "For Sale" or "For Rent"
 * - type:             "House", "Apartment", "Shop", or "Plot"
 * - price:            Number for filtering (e.g. 28500000)
 * - priceDisplay:     Formatted text shown to users (e.g. "₹2.85 Cr" or "₹45,000 / month")
 * - location:         Locality and city
 * - area:             Area number (e.g. 4200 or 300)
 * - areaUnit:         "sq. ft." or "sq. yards"
 * - bedrooms:         Number of bedrooms (use null for shops/plots)
 * - bathrooms:        Number of bathrooms (use null for plots)
 * - shortDescription: Brief overview paragraph
 * - mainImage:        Primary photo URL or local path (e.g. "assets/images/prop1.jpg")
 * - additionalImages: Array of extra gallery photo URLs
 * - features:         Array of amenities (parking, furnished, road-facing, security, etc.)
 * - availability:     "Available" | "Sold" | "Rented" | "Coming Soon"
 * - whatsappNumber:   Your WhatsApp phone number with country code (e.g. "919876543210")
 * - contactLink:      (Optional) Custom enquiry link or leave blank for auto WhatsApp link
 * - isSample:         Set to true for demo listings, false for your real properties
 * - featured:         Set to true to highlight on the Home page
 * ==============================================================================
 */

const PROPERTIES_DATA = [
  /* --------------------------------------------------------------------------
     PROPERTY 1: Luxury House / Villa (For Sale - Available)
     -------------------------------------------------------------------------- */
  {
    id: "stallion-001",
    isSample: true,
    featured: true,
    title: "The Royal Oak Luxury Villa",
    purpose: "For Sale",
    type: "House",
    price: 28500000,
    priceDisplay: "₹2.85 Cr",
    location: "Greenwood Enclave, Phase 2, Metro City",
    area: 4200,
    areaUnit: "sq. ft.",
    bedrooms: 5,
    bathrooms: 5,
    shortDescription: "An extraordinary independent 5 BHK luxury villa with private pool, double-height living foyer, landscaped lawn, and Italian marble finishes in a gated community.",
    mainImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Private Swimming Pool",
      "Landscaped Private Garden",
      "3 Covered Car Parking",
      "Italian Modular Kitchen with Pantry",
      "24/7 Gated Security & CCTV",
      "100% DG Power Backup",
      "Vastu Compliant Architecture",
      "Wide 60ft Road Facing"
    ],
    availability: "Available",
    whatsappNumber: "919925027051",
    contactLink: "",
    // Confidential Owner Details (Admin Only)
    ownerName: "Vikram Rathore",
    ownerPhone: "+91 98250 44120",
    ownerEmail: "vikram.rathore@example.com",
    ownerNotes: "Immediate sale preferred; key available with clubhouse office."
  },

  /* --------------------------------------------------------------------------
     PROPERTY 2: Designer Apartment (For Rent - Available)
     -------------------------------------------------------------------------- */
  {
    id: "stallion-002",
    isSample: true,
    featured: true,
    title: "Aura Sky 3 BHK Designer Apartment",
    purpose: "For Rent",
    type: "Apartment",
    price: 48000,
    priceDisplay: "₹48,000 / month",
    location: "Skyline Boulevard, Tech Zone, Metro City",
    area: 1650,
    areaUnit: "sq. ft.",
    bedrooms: 3,
    bathrooms: 3,
    shortDescription: "Contemporary 3 BHK flat with expansive skyline balconies, fully furnished designer decor, and access to a premium 50,000 sq.ft society clubhouse.",
    mainImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Fully Furnished with Premium Interiors",
      "Reserved Covered Car Parking",
      "High Floor with Panoramic Balcony",
      "Infinity Rooftop Swimming Pool",
      "Clubhouse, Gym & Tennis Court",
      "High-Speed Fiber Internet Ready",
      "24/7 Security & Intercom",
      "500m from Metro Station"
    ],
    availability: "Available",
    whatsappNumber: "919925027051",
    contactLink: "",
    // Confidential Owner Details (Admin Only)
    ownerName: "Sunita & Arvind Mehta",
    ownerPhone: "+91 94260 88319",
    ownerEmail: "arvind.mehta@example.com",
    ownerNotes: "Prefers corporate or family tenants on 11-month registered lease."
  },

  /* --------------------------------------------------------------------------
     PROPERTY 3: Commercial High-Street Shop (For Rent - Rented)
     -------------------------------------------------------------------------- */
  {
    id: "stallion-003",
    isSample: true,
    featured: false,
    title: "Prime High-Street Retail Showroom",
    purpose: "For Rent",
    type: "Shop",
    price: 175000,
    priceDisplay: "₹1.75 Lakh / month",
    location: "Commercial Central, MG Road, Metro City",
    area: 1800,
    areaUnit: "sq. ft.",
    bedrooms: null,
    bathrooms: 2,
    shortDescription: "High-visibility commercial ground-floor showroom with 35-foot glass frontage on a high-footfall artery, perfectly suited for flagship retail or banks.",
    mainImage: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "35 Feet High-Visibility Glass Frontage",
      "Ground Floor Direct Walk-in Ingress",
      "Dedicated Customer Parking Slots",
      "High 14-ft Ceiling Height",
      "Centralized HVAC Provision",
      "Main Arterial Road Facing",
      "Heavy Load 3-Phase Electric Connection",
      "24/7 CCTV & Security Patrol"
    ],
    availability: "Rented",
    whatsappNumber: "919925027051",
    contactLink: ""
  },

  /* --------------------------------------------------------------------------
     PROPERTY 4: Gated Villa Plot (For Sale - Available)
     -------------------------------------------------------------------------- */
  {
    id: "stallion-004",
    isSample: true,
    featured: true,
    title: "Emerald Crest Gated Villa Plot",
    purpose: "For Sale",
    price: 9200000,
    priceDisplay: "₹92 Lakh",
    type: "Plot",
    location: "Emerald Hills Township, North Corridor, Metro City",
    area: 300,
    areaUnit: "sq. yards",
    bedrooms: null,
    bathrooms: null,
    shortDescription: "Freehold residential plot in a developed eco-township featuring wide 40ft asphalt roads, underground cabling, and landscaped parks.",
    mainImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "100% Clear Freehold Title",
      "Immediate Registry & Possession",
      "40 ft Wide Internal Blacktop Roads",
      "Corner East-Facing Plot",
      "Underground Drainage & Water Lines",
      "Gated Community with Guard Station",
      "Community Park & Children Play Zone",
      "Bank Loan Approved by Leading Banks"
    ],
    availability: "Available",
    whatsappNumber: "919925027051",
    contactLink: ""
  },

  /* --------------------------------------------------------------------------
     PROPERTY 5: Luxury Penthouse (For Sale - Sold)
     -------------------------------------------------------------------------- */
  {
    id: "stallion-005",
    isSample: true,
    featured: false,
    title: "The Imperial Crown Duplex Penthouse",
    purpose: "For Sale",
    type: "Apartment",
    price: 34000000,
    priceDisplay: "₹3.40 Cr",
    location: "Golf Links Promenade, Sector 54, Metro City",
    area: 4800,
    areaUnit: "sq. ft.",
    bedrooms: 4,
    bathrooms: 5,
    shortDescription: "Opulent duplex penthouse offering unhindered golf course views, double-height living foyer, private jacuzzi deck, and biometric private elevator.",
    mainImage: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Panoramic 360-Degree Golf Course Views",
      "Private Rooftop Jacuzzi Deck",
      "Private Biometric High-Speed Elevator",
      "Double Height Living Foyer",
      "3 Dedicated Basement Parking Slots",
      "Italian Marble & Timber Flooring",
      "Smart Home Automation",
      "Concierge & Valet Service"
    ],
    availability: "Sold",
    whatsappNumber: "919925027051",
    contactLink: ""
  },

  /* --------------------------------------------------------------------------
     PROPERTY 6: Modern Duplex House (For Sale - Coming Soon)
     -------------------------------------------------------------------------- */
  {
    id: "stallion-006",
    isSample: true,
    featured: true,
    title: "The Meadowlands Modern Duplex House",
    purpose: "For Sale",
    type: "House",
    price: 16500000,
    priceDisplay: "₹1.65 Cr",
    location: "Silver Oak Springs, West Bypass, Metro City",
    area: 2800,
    areaUnit: "sq. ft.",
    bedrooms: 4,
    bathrooms: 4,
    shortDescription: "Upcoming modern duplex home with private garden, open-plan gourmet kitchen, covered double garage, and energy-efficient solar water heating.",
    mainImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Brand New Architectural Construction",
      "Front Lawn & Private Backyard Garden",
      "Double Covered Car Porch",
      "Modular Open-Plan Gourmet Kitchen",
      "Solar Water Heating Installed",
      "Vastu Compliant Facing",
      "Quiet Tree-Lined Residential Avenue",
      "Possession Expected Soon"
    ],
    availability: "Coming Soon",
    whatsappNumber: "919925027051",
    contactLink: ""
  }
];

// Compatibility bridge: ensures properties seamlessly expose images array and status
PROPERTIES_DATA.forEach(p => {
  // Support both status ("sale"/"rent") and purpose ("For Sale"/"For Rent")
  if (!p.status) {
    p.status = (p.purpose && p.purpose.toLowerCase().includes('rent')) ? 'rent' : 'sale';
  }
  // Support both images array and mainImage + additionalImages
  if (!p.images || p.images.length === 0) {
    p.images = [p.mainImage, ...(p.additionalImages || [])];
  }
  if (!p.heroImage) {
    p.heroImage = p.mainImage || (p.images && p.images[0]);
  }
  if (!p.description) {
    p.description = p.shortDescription || '';
  }
  if (!p.isDemo) {
    p.isDemo = (p.isSample !== undefined) ? p.isSample : true;
  }
});

// Sanitize helper to protect confidential owner info when public visitors query default repository
function sanitizePropertyForPublic(p) {
  if (!p) return null;
  if (typeof window !== 'undefined' && window.AuthManager && window.AuthManager.isAuthenticated && window.AuthManager.isAuthenticated()) {
    return p;
  }
  const clone = { ...p };
  delete clone.ownerName;
  delete clone.ownerPhone;
  delete clone.ownerEmail;
  delete clone.ownerNotes;
  return clone;
}

// Helper repository for querying and filtering listings
const PropertyRepository = {
  getAll: () => PROPERTIES_DATA.map(p => sanitizePropertyForPublic(p)),
  
  getById: (id) => {
    if (!id) return null;
    const found = PROPERTIES_DATA.find(p => p.id.toLowerCase() === id.toLowerCase());
    return found ? sanitizePropertyForPublic(found) : null;
  },
  
  getFeatured: () => {
    return PROPERTIES_DATA.filter(p => p.featured).map(p => sanitizePropertyForPublic(p));
  },
  
  getSimilar: (currentId, limit = 3) => {
    const current = PropertyRepository.getById(currentId);
    if (!current) return PROPERTIES_DATA.slice(0, limit).map(p => sanitizePropertyForPublic(p));
    return PROPERTIES_DATA
      .filter(p => p.id !== current.id && (
        p.type.toLowerCase() === current.type.toLowerCase() || 
        p.purpose.toLowerCase() === current.purpose.toLowerCase()
      ))
      .slice(0, limit)
      .map(p => sanitizePropertyForPublic(p));
  },
  
  filter: ({ purpose, status, type, location, minPrice, maxPrice, bedrooms, maxArea, availability }) => {
    return PROPERTIES_DATA.filter(p => {
      // Filter by Purpose / Status (For Sale / For Rent)
      const targetPurpose = purpose || status;
      if (targetPurpose && targetPurpose !== 'all') {
        const pStatus = p.status.toLowerCase();
        const pPurpose = p.purpose.toLowerCase();
        const target = targetPurpose.toLowerCase();

        if (target === 'buy' || target === 'sale' || target === 'for sale') {
          if (pStatus !== 'sale' && !pPurpose.includes('sale')) return false;
        } else if (target === 'rent' || target === 'for rent') {
          if (pStatus !== 'rent' && !pPurpose.includes('rent')) return false;
        }
      }

      // Filter by Availability (Available, Sold, Rented, Coming Soon)
      if (availability && availability !== 'all') {
        if (p.availability.toLowerCase() !== availability.toLowerCase()) return false;
      }
      
      // Filter by Property Type (House, Apartment, Shop, Plot)
      if (type && type !== 'all' && p.type.toLowerCase() !== type.toLowerCase()) {
        return false;
      }
      
      // Filter by Location keyword
      if (location && location.trim() !== '') {
        const query = location.toLowerCase().trim();
        const match = p.location.toLowerCase().includes(query) || 
                      p.title.toLowerCase().includes(query);
        if (!match) return false;
      }
      
      // Filter by Price range
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      
      // Filter by Bedrooms
      if (bedrooms && bedrooms !== 'all') {
        if (!p.bedrooms) return false;
        if (bedrooms === '4+' && p.bedrooms < 4) return false;
        if (bedrooms !== '4+' && p.bedrooms !== Number(bedrooms)) return false;
      }
      
      // Filter by Max Area
      if (maxArea && p.area > Number(maxArea)) return false;
      
      return true;
    }).map(p => sanitizePropertyForPublic(p));
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.PROPERTIES_DATA = PROPERTIES_DATA;
  window.PropertyRepository = PropertyRepository;
}
