# Smart Police Complaint Registration and Tracking Management System

A full-stack, modern, secure, and responsive civic-technology web application designed to empower citizens to register crime and incident grievances online, pinpoint exact crime locations on interactive maps, automatically discover nearby police stations, upload supporting photo evidence, receive unique tracking identifiers, download official acknowledgment slips, and track investigation progress in real-time.

---

## 🏛️ System Architecture & Technology Stack

### Frontend
- **Framework:** React.js with Vite & TypeScript
- **Styling:** Tailwind CSS (Navy Blue and Gold government civic service theme)
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Mapping:** Leaflet & OpenStreetMap (Interactive pin locator, GPS detection, custom markers)
- **PDF Generation:** jsPDF (Official Electronic Complaint Acknowledgment Slips)

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Architecture:** Modular RESTful APIs with Controllers, Services, and Middlewares
- **Authentication:** JWT (JSON Web Tokens) with role-based access control (RBAC)
- **Security:** Helmet, CORS, Express-Rate-Limit, Bcrypt password hashing, Input Sanitization
- **File Uploads:** Multer with Cloudinary CDN integration and private local disk fallback

### Database & Storage
- **Primary Database:** MongoDB Atlas / Local MongoDB with Mongoose ODM
- **Resilient Fallback:** Auto-activating in-memory store for instantaneous zero-configuration local development
- **Evidence Storage:** Cloudinary CDN or private authenticated local storage (`server/uploads/evidence`)

---

## 🌟 Key Features Across Portals

### 1. Citizen Portal
- **Secure Registration & Profile:** Full name, mobile number, email, address, city, state, PIN code with password strength validation.
- **Incident Complaint Registration (Sections A through F):**
  - **Section A (Personal Info):** Auto-prefilled from user profile with editing capabilities.
  - **Section B (Incident Info):** Categorization across 12 crime types (Theft, Robbery, Cyber Crime, Fraud, Harassment, Missing Person, Assault, Domestic Violence, Property Dispute, Vehicle Theft, Online Scam, Other), narrative description, date, time, suspect & witness particulars.
  - **Section C (Crime Location):** Browser Geolocation API detection, Leaflet interactive draggable marker, reverse geocoding via OpenStreetMap Nominatim, decoupled crime location from current user location.
  - **Section D (Police Station Selection):** Haversine distance calculations in kilometers, real-time nearest station recommendation, station addresses & phone numbers, and manual override.
  - **Section E (Crime Evidence Upload):** Multi-file photo upload (JPG, PNG, WEBP, up to 10MB each), preview cards, file removal.
  - **Section F (Summary & Confirmation):** Comprehensive dossier review, statutory legal declaration, instantaneous unique tracking ID generation (`CMP-YYYY-XXXXX`), and one-click PDF acknowledgment slip download.
- **Public & Authenticated Live Tracking:**
  - Multi-stage investigation timeline across 11 formal statuses:
    1. *Submitted*
    2. *Under Verification*
    3. *Verified*
    4. *Assigned to Police Station*
    5. *Forwarded*
    6. *Acknowledged by Police*
    7. *Investigation in Progress*
    8. *Action Taken*
    9. *Resolved*
    10. *Closed*
    11. *Rejected (with statutory reason)*
  - Officer remarks, official GD / acknowledgment references, action taken notes, and complete event audit feed.
- **Nearest Police Station Finder:** Standalone interactive OpenStreetMap directory of police stations with GPS "Locate Nearest" functionality, phone dials, and search by city/name.
- **Citizen Dashboard:** Statistics cards, recent filing history, quick-action shortcuts.
- **Real-Time Notifications:** Unread notification badge, live alerts upon status updates, simulated/SMTP email dispatch.
- **Emergency 112 Section:** Dedicated emergency hotlines matrix (112 National Helpline, 1930 Cyber Fraud, 1091 Women in Distress, 108 Ambulance, 101 Fire) with tap-to-call links and explicit disclaimers.

### 2. Police & Administrative Portal
- **Admin Dashboard:** Real-time analytics cards, crime category bar charts, monthly submission trends, city-wise distribution, and station case allocations.
- **20-Column Master Complaint Registry:**
  - Full tabular records with all 20 required parameters:
    1. *Complaint ID*
    2. *Citizen Name*
    3. *Age*
    4. *Gender*
    5. *Mobile Number*
    6. *Email*
    7. *Title*
    8. *Category*
    9. *Description*
    10. *Incident Date*
    11. *Incident Location*
    12. *Latitude*
    13. *Longitude*
    14. *Evidence Photos*
    15. *Police Station*
    16. *Current Status*
    17. *Submission Date*
    18. *Last Updated Date*
    19. *Assigned Administrator*
    20. *Actions (Dossier Inspection, Status Update, Jurisdiction Assignment)*
  - Filters by category, status, police station, date range, and text search.
  - Export permitted records to CSV.
  - Confidential officer notes (hidden from citizens).
- **Police Station Management (CRUD):** Add, update, deactivate police stations, configure coordinates, contacts, and jurisdiction boundaries.
- **User Directory:** Citizen profiles and roles.
- **Reports & Analytics:** Strategic executive summary, closure efficiency rates, printable reports.

---

## 🔑 Default Credentials for Development Testing

### 1. Initial Administrator
- **Username:** `harsha`
- **Password:** `harsha@123`
- **Email:** `harsha@policeportal.gov.in`
- **Role:** `admin`

### 2. Sample Citizen (Demo)
- **Email:** `citizen@example.com`
- **Password:** `citizen@123`
- **Role:** `citizen`

### 3. Sample Complaint Tracking IDs
- `CMP-2026-08492` (Vehicle Theft - Under Verification)
- `CMP-2026-03184` (Cyber Crime - Forwarded with GD Ref)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### 1. Setup Backend
```bash
cd server
npm install
npm run seed     # (Optional) Seeds MongoDB when running with active MongoDB
npm start        # Launches Express server on http://localhost:5000
```

### 2. Setup Frontend
```bash
cd client
npm install
npm run dev      # Launches Vite dev server on http://localhost:5173
```

Open your browser at `http://localhost:5173`.

---

## ⚙️ Environment Variables

### `server/.env`
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection String (Atlas or Local)
MONGODB_URI=mongodb://127.0.0.1:27017/smart_police_complaint_db

# JWT Security
JWT_SECRET=police_complaint_super_secret_jwt_key_2026_secured
JWT_EXPIRES_IN=7d

# Initial Admin Credentials
INITIAL_ADMIN_USERNAME=harsha
INITIAL_ADMIN_EMAIL=harsha@policeportal.gov.in
INITIAL_ADMIN_PASSWORD=harsha@123

# Cloudinary Storage (Optional - falls back to secure local storage if blank)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# SMTP Email Service (Optional - falls back to console logger if blank)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Smart Police Portal <no-reply@policeportal.gov.in>"
```

---

## 🌐 Deployment Instructions

### Frontend Deployment (Vercel)
1. Push the code to GitHub.
2. In Vercel, import the repository and set the **Root Directory** to `client`.
3. Set Build Command: `npm run build` and Output Directory: `dist`.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com/api`

### Backend Deployment (Render / Railway / VPS)
1. In Render, create a new **Web Service** connected to your repository.
2. Set **Root Directory** to `server`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure Environment Variables in Render Dashboard (`MONGODB_URI`, `JWT_SECRET`, `INITIAL_ADMIN_USERNAME`, `INITIAL_ADMIN_PASSWORD`, `CLOUDINARY_...`).
6. MongoDB Atlas: Whitelist incoming IP (`0.0.0.0/0`) in Atlas Network Access.

---

## ⚖️ Legal & Privacy Disclaimer

1. **Non-Emergency Nature:** This web application is for non-emergency public intimation and grievance tracking only. It is **not** an emergency dispatch terminal. For imminent threats or ongoing crimes, citizens must contact emergency services at **112**.
2. **FIR Registration Protocol:** Electronic submission generates an official intimation tracking receipt. Formal First Information Reports (FIR) under Section 154 CrPC are registered by the authorized Station House Officer after jurisdiction and evidentiary verification.
