# Stallion Realties - Google Sheets Live Sync Setup (3 Minutes)

This turns a private Google Sheet into your website's **live database**. When you add/edit properties, they are automatically saved to your sheet, and every visitor to `https://mahendraamrute9-wq.github.io/Stallion-realities-/` sees them in real-time.

---

### Step 1: Create a New Google Sheet
1. Open [https://sheets.new](https://sheets.new) in your browser.
2. At the top left, change the title from *Untitled spreadsheet* to:
   **`Stallion Realties Database`**

---

### Step 2: Paste the Backend Script
1. In the Google Sheets top menu, click **Extensions** &rarr; **Apps Script**.
2. Delete any existing lines in the code editor (e.g. `function myFunction() {}`).
3. Open [`google-apps-script.js`](file:///C:/Users/SHIVAM/.gemini/antigravity/scratch/stallion-realties/google-apps-script.js), copy the entire code, and paste it into the editor.
4. Click the **Save** floppy icon (or press `Ctrl + S`).

---

### Step 3: Deploy as Web App
1. At the top right of the Apps Script window, click the blue **Deploy** button &rarr; **New deployment**.
2. Beside *Select type*, click the gear icon ⚙️ and choose **Web app**.
3. Fill in these settings:
   - **Description**: `Stallion Live API`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone`  *(Critical: This allows your website visitors to view your listings)*
4. Click **Deploy**.
5. Click **Authorize access** and choose your Google account.
   *(If Google shows "Google hasn't verified this app", click **Advanced** &rarr; **Go to Untitled project (unsafe)** &rarr; **Allow**).*
6. Copy the **Web App URL** provided (it looks like `https://script.google.com/macros/s/.../exec`).

---

### Step 4: Connect to your Admin Portal
1. Open your Admin Portal: [admin.html](file:///C:/Users/SHIVAM/.gemini/antigravity/scratch/stallion-realties/admin.html)
2. In the top banner, click **"Configure Live Database"** (or **"Live Sync"**).
3. Paste your Google Web App URL and click **Save & Connect**.

**That's it!**
- All properties added in your Admin Portal will now be stored in your Google Sheet.
- All website visitors on `https://mahendraamrute9-wq.github.io/Stallion-realities-/` will automatically see your latest properties on the exact same clean link!
