/**
 * ==============================================================================
 * STALLION REALTIES - GOOGLE SHEETS LIVE DATABASE BACKEND (GOOGLE APPS SCRIPT)
 * ==============================================================================
 * 
 * INSTRUCTIONS TO DEPLOY IN 3 SIMPLE STEPS:
 * 1. Go to https://sheets.new (create a new blank Google Sheet).
 *    Name the sheet: "Stallion Realties Database"
 * 2. Click "Extensions" > "Apps Script" in the top menu.
 * 3. Delete any code in the editor, paste this entire file, and click "Deploy" > "New deployment".
 *    - Select type: "Web app"
 *    - Description: "Stallion Live API"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone"  <-- CRITICAL: Select "Anyone" so your website can read listings
 * 4. Click "Deploy", authorize access, and COPY the "Web App URL" provided!
 * ==============================================================================
 */

// Admin verification password (matches your Stallion Admin login)
var ADMIN_PASSWORD = "Stallion@2026";
var SHEET_NAME = "Properties";

var HEADERS = [
  "id",
  "title",
  "purpose",
  "status",
  "type",
  "price",
  "priceDisplay",
  "location",
  "area",
  "areaUnit",
  "bedrooms",
  "bathrooms",
  "shortDescription",
  "description",
  "mainImage",
  "heroImage",
  "additionalImages",
  "images",
  "features",
  "availability",
  "whatsappNumber",
  "contactLink",
  "isSample",
  "featured",
  "ownerName",
  "ownerPhone",
  "ownerEmail",
  "ownerNotes",
  "updatedAt"
];

/**
 * Get or create the active Properties sheet
 */
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Remove default Sheet1 if empty
    var defaultSheet = ss.getSheetByName("Sheet1");
    if (defaultSheet && defaultSheet.getLastRow() === 0) {
      try { ss.deleteSheet(defaultSheet); } catch (e) {}
    }
  }

  // Setup headers if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setBackground("#1A233A")
      .setFontColor("#C9A050")
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Public GET request: fetches properties JSON for website visitors
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    if (params.action === "ping") {
      return jsonResponse({ success: true, message: "Stallion Realties Database API is online and connected." });
    }
    var isAdmin = params.password === ADMIN_PASSWORD;
    var sheet = getOrCreateSheet();
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return jsonResponse([]);
    }

    var headers = data[0];
    var properties = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var prop = {};
      
      for (var h = 0; h < headers.length; h++) {
        var key = headers[h];
        var val = row[h];

        // Parse JSON stored fields (features, images, additionalImages)
        if (key === "features" || key === "images" || key === "additionalImages") {
          try {
            prop[key] = (typeof val === "string" && val.trim().startsWith("[")) ? JSON.parse(val) : [];
          } catch (err) {
            prop[key] = val ? String(val).split(",").map(function(s) { return s.trim(); }) : [];
          }
        } else if (key === "price" || key === "area" || key === "bedrooms" || key === "bathrooms") {
          prop[key] = val === "" || val === null ? null : Number(val);
        } else if (key === "isSample" || key === "featured") {
          prop[key] = String(val).toLowerCase() === "true" || val === true;
        } else {
          prop[key] = val !== undefined && val !== null ? String(val) : "";
        }
      }

      // Ensure required image fields
      if (!prop.mainImage && prop.images && prop.images.length > 0) {
        prop.mainImage = prop.images[0];
      }
      if (!prop.heroImage) {
        prop.heroImage = prop.mainImage;
      }

      // Owner confidentiality filter: NEVER expose owner details to public visitors
      if (!isAdmin) {
        delete prop.ownerName;
        delete prop.ownerPhone;
        delete prop.ownerEmail;
        delete prop.ownerNotes;
      }

      if (prop.id && prop.title) {
        properties.push(prop);
      }
    }

    return jsonResponse(properties);
  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

/**
 * Admin POST request: Saves, updates, or deletes properties
 */
function doPost(e) {
  try {
    var raw = e ? e.postData.contents : "";
    var body = {};
    try {
      body = JSON.parse(raw);
    } catch (parseErr) {
      body = e.parameter || {};
    }

    // Security check: verify admin password
    if (body.password !== ADMIN_PASSWORD) {
      return jsonResponse({ success: false, message: "Unauthorized: Invalid admin password." });
    }

    var action = body.action || "saveProperty";
    var sheet = getOrCreateSheet();

    if (action === "saveProperty") {
      var prop = body.property;
      if (!prop || !prop.id) {
        return jsonResponse({ success: false, message: "Invalid property payload." });
      }
      saveSingleProperty(sheet, prop);
      return jsonResponse({ success: true, message: "Property saved successfully!", id: prop.id });
    } 
    else if (action === "deleteProperty") {
      var idToDelete = body.id;
      if (!idToDelete) {
        return jsonResponse({ success: false, message: "Missing property ID to delete." });
      }
      var deleted = deletePropertyById(sheet, idToDelete);
      return jsonResponse({ success: deleted, message: deleted ? "Property deleted." : "Property not found." });
    }
    else if (action === "syncAll") {
      var list = body.properties || [];
      syncAllProperties(sheet, list);
      return jsonResponse({ success: true, message: "Synchronized " + list.length + " properties successfully!" });
    }

    return jsonResponse({ success: false, message: "Unknown action: " + action });
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() });
  }
}

/**
 * Save or update single property in sheet
 */
function saveSingleProperty(sheet, prop) {
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === String(prop.id).toLowerCase()) {
      rowIndex = i + 1; // 1-indexed in Sheets
      break;
    }
  }

  var row = buildRowFromProperty(prop);

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

/**
 * Delete property by ID
 */
function deletePropertyById(sheet, id) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === String(id).toLowerCase()) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

/**
 * Replace entire sheet with given properties list
 */
function syncAllProperties(sheet, list) {
  // Clear existing data below header
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).clearContent();
  }

  if (list && list.length > 0) {
    var rows = list.map(function(prop) {
      return buildRowFromProperty(prop);
    });
    sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
  }
}

/**
 * Convert property object into ordered spreadsheet row
 */
function buildRowFromProperty(p) {
  return [
    p.id || "",
    p.title || "Untitled Property",
    p.purpose || "For Sale",
    p.status || "sale",
    p.type || "House",
    p.price || 0,
    p.priceDisplay || "",
    p.location || "",
    p.area || 0,
    p.areaUnit || "sq. ft.",
    p.bedrooms !== undefined && p.bedrooms !== null ? p.bedrooms : "",
    p.bathrooms !== undefined && p.bathrooms !== null ? p.bathrooms : "",
    p.shortDescription || p.description || "",
    p.description || "",
    p.mainImage || "",
    p.heroImage || p.mainImage || "",
    JSON.stringify(p.additionalImages || []),
    JSON.stringify(p.images || [p.mainImage]),
    JSON.stringify(p.features || []),
    p.availability || "Available",
    p.whatsappNumber || "919925027051",
    p.contactLink || "",
    p.isSample === true,
    p.featured === true,
    p.ownerName || "",
    p.ownerPhone || "",
    p.ownerEmail || "",
    p.ownerNotes || "",
    new Date().toISOString()
  ];
}

/**
 * Helper to return clean CORS-enabled JSON
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
