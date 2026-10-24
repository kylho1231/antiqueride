# AntiqueRide — Smart Transportation and Tricycle Booking Platform

[![Next.js](https://img.shields.io/badge/Framework-Next.js_16_Turbopack-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-WebAPK_Ready-2563EB?style=flat&logo=pwa&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Tests](https://img.shields.io/badge/Tests-35%2F35_Passing-brightgreen?style=flat&logo=checkmarx&logoColor=white)](https://github.com/kylho1231/antiqueride)

**Tagline:** Your Ride. Your Antique.  
**Initial Operating Area:** San Jose de Buenavista, Antique, Philippines  
**Phase 2 Expansion:** Sibalom and Hamtic, subject to inter-municipal authorizations  
**Platform Architecture:** Progressive Web Application (PWA) + Next.js App Router + TypeScript + Tailwind CSS + OpenStreetMap (Leaflet GIS)  
**Compliance Standard:** Philippine Data Privacy Act (RA 10173), Municipal Tricycle Franchise (MTOP), Statutory 20% Transport Discounts (RA 10642 / RA 9994 / RA 9442).

---

## 🚀 Live Web Application

* 🌐 **Live Production Deployment:** [https://antiqueride.vercel.app](https://antiqueride.vercel.app) *(or your deployed Vercel URL)*  
  *(Works directly on iPhone Safari, Android Chrome, and desktop browsers with full PWA home screen installation!)*

---

## 1. Overview & Problem Solved

AntiqueRide modernizes public transportation in the Province of Antique, starting with authorized tricycle services in San Jose de Buenavista:
1. **Difficulty finding available tricycles:** Real-time driver presence and interactive GPS dispatch.
2. **Terminal obscurity:** Verified terminal outposts with capacity, operating hours, and TODA queue (pila) tracking.
3. **Fare uncertainty:** Version-controlled official fare rules engine audited against Sangguniang Bayan ordinances (Municipal Ordinance No. 2023-014).
4. **Prank bookings & safety risks:** 4-digit security pickup PIN matching, encrypted document verification, and direct hotlines to San Jose Police (PNP) and Antique PDRRMO 911.
5. **Strict Portal Separation:** Dedicated isolated portals for **Commuters**, **TODA Drivers**, and **Super Administrators** with separate registration and login.
6. **TODA Queue Discipline:** Does not bypass local transport associations; supports both **Station Queue (Pila) Mode** and **Authorized On-Demand Mode**.

---

## 2. Key Portals & Role Structure

### 🚶 Commuter Portal (`/commuter`)
- **Interactive OpenStreetMap Navigation:** Real-time terminal pins, nearby available tricycles, route indicators.
- **Service Tier Selector:**
  - *Regular / Shared Trip:* Official municipal tariff (₱15.00 base for first 2.0 km + ₱2.50 per succeeding km).
  - *Special Trip (Pakyaw):* Exclusive chartered tricycle (₱50.00 base).
- **Mandatory 20% Discount Engine:** Instant discount computation for verified Students (RA 10642), Senior Citizens (RA 9994), and PWDs (RA 9442).
- **4-Digit Pickup PIN:** Generated upon booking; commuter presents PIN to driver before boarding.
- **Passenger Safety Desk:** Share Trip live tracking link, emergency call triggers, and incident reporting.

### 🛵 Driver Portal (`/driver`)
- **Shift Status Toggle:** Seamless Online / Offline control with battery and GPS accuracy readouts.
- **Terminal Queue Position:** Real-time queue number (e.g. *Tradetown Dalipe Terminal — Position #1*).
- **Incoming Ride Radar:** Real-time alert with route, agreed fare, and one-tap Accept/Decline.
- **Step-by-Step Dispatch Workflow:**
  1. `ACCEPTED` → Start Heading to Pickup
  2. `HEADING_TO_PICKUP` → Mark as Arrived
  3. `ARRIVED` → Enter & Verify Passenger's 4-digit PIN
  4. `TRIP_STARTED` → Complete Trip & Collect Cash (₱XX.XX)
- **Live GPS Telemetry:** Adaptive GPS update reporting with simulation mode for road testing.

### 🛡️ Super Admin Workspace (`/admin`)
- **Executive Operations KPI Cards:** Live online drivers, active bookings, completed trips, pending applications, and safety grievances.
- **Driver Verification Desk:** Inspect LTO driver licenses, OR/CR, MTOP franchise permits, and TODA memberships.
- **Terminal & Queue Mode Manager:** Configure capacity, coordinates, and toggle between Queue (Pila) and On-Demand dispatch.
- **Municipal Fare Matrix Engine:** Edit base fare, distance rates, and log Sangguniang Bayan ordinance numbers.
- **Safety & Incident Desk:** Triage passenger complaints, lost belongings, and record formal resolution notes.
- **System Audit Trail:** Chronological immutable event stream of all administrative actions.

---

## 3. Verified Antique Geographic Data

### Active Pilot Terminals (San Jose de Buenavista)
1. **Tradetown Dalipe Terminal:** `10.7483° N, 121.9442° E` — TODA: *TTODA*
2. **San Jose Public Plaza & Cathedral Station:** `10.7445° N, 121.9395° E` — TODA: *SJP-CTODA*
3. **Antique National School (ANS) Gate Station:** `10.7510° N, 121.9420° E` — TODA: *UNS-R-TODA*
4. **San Pedro Fishing Port & Boulevard:** `10.7380° N, 121.9350° E` — TODA: *SPCTA*
5. **Funda-Dalipe Crossroads Junction:** `10.7550° N, 121.9490° E` — TODA: *TTODA*

### Phase 2 Expansion Candidates (Field Verification Pending)
6. **Sibalom Public Market & Bus Terminal:** `10.7850° N, 122.0125° E` — Subject to inter-municipal franchise approval.
7. **Barangay Guintas Hamtic Crossing:** `10.7020° N, 121.9800° E` — Subject to Hamtic municipal regulation.

---

## 4. Database Schema & PostGIS Migrations

The complete database schema is located at `supabase/migrations/20261024_init_antiqueride_postgis.sql`:
- **PostGIS Extension:** Spatial indexing via `GIST (location)` on terminals, driver presence, and ride pickup/dropoff points.
- **Spatial Dispatch Function:** `find_nearby_available_drivers(lat, lng, radius_km, max_drivers)` utilizes `ST_DWithin` and `ST_Distance` on geography points.
- **Row Level Security (RLS):** Strict data segregation; commuter identity documents and driver coordinates outside active trips are protected from public exposure.

---

## 5. Getting Started & Testing

### Installation & Build
```bash
# Install dependencies
npm install

# Run automated 20-criteria test suite
npm test

# Build production bundle (Turbopack)
npm run build

# Start development server
npm run dev
```

Visit `http://localhost:3000` to launch the platform.

### Running Acceptance Tests
The automated test suite verifies all 35 production acceptance criteria defined across portal isolation, PWA WebAPK compliance, fare transparency, and dispatch synchronization:
```bash
npm test
```

Result:
```
================================================================
  ANTIQUERIDE — MANDATORY E2E & DOMAIN ACCEPTANCE TEST SUITE
  Initial Municipality: San Jose de Buenavista, Antique, Philippines
================================================================
  [PASS] Test 1: Commuter can register with valid profile data
  [PASS] Test 2: Commuter student verification entitles mandatory 20% discount (RA 10642)
  [PASS] Test 3: Driver registration captures required compliance data
  [PASS] Test 4: Administrator can approve an eligible driver
  [PASS] Test 5: Verified driver can switch to online availability
  [PASS] Test 6: Commuter discovers authorized San Jose de Buenavista terminals
  [PASS] Test 7: Valid booking matches an authorized online driver
  [PASS] Test 8: Exactly one driver can accept a booking (atomic assignment)
  [PASS] Test 9: Drivers with PENDING or REJECTED status cannot accept bookings
  [PASS] Test 10: Agreed fare is frozen on trip fare snapshot
  [PASS] Test 11: Driver on an ongoing ride cannot receive new ride offers
  [PASS] Test 12: 4-digit PIN verification before trip start and rating completion
  [PASS] Test 13: Expired license or permit marks driver restricted
  [PASS] Test 14: Stale GPS (>45 seconds) is detected and flagged
  [PASS] Test 15: Manual location fallback uses San Jose Plaza default
  [PASS] Test 16: Commuter identity documents are kept private
  [PASS] Test 17: Driver cannot inspect private location history outside authorized trips
  [PASS] Test 18: Duplicate active requests are rejected
  [PASS] Test 19: Phase 2 intermunicipal routes (Sibalom/Hamtic) require field verification
  [PASS] Test 20: PWA manifest parameters and service worker defined correctly
  [PASS] Test 21: Authentication Guard: Unauthenticated user is barred from all protected portals
  [PASS] Test 22: Strict Portal Isolation: Commuter role cannot access Driver or Admin portals
  [PASS] Test 23: Strict Portal Isolation: Driver role cannot access Commuter or Admin portals
  [PASS] Test 24: Super Admin Portal: Privileged access restricted exclusively to SUPER_ADMIN
  [PASS] Test 25: Session Logout & Invalidation: Logging out clears session credentials and denies portal access
  [PASS] Test 26: Find a Tricycle: Generates broadcast dispatch with 4-digit PIN and frozen fare snapshot
  [PASS] Test 27: Driver Notification: Online verified driver receives dispatch offer and can accept
  [PASS] Test 28: Commuter Registration: Validates Legal Name, Mobile Number, Email, and School / Gov ID
  [PASS] Test 29: Driver Registration: Enforces Government ID, MTOP, LTO License, and Body Number
  [PASS] Test 30: Profile Settings: Updates avatar photo and personal credentials
  [PASS] Test 31: Commuter Portal Isolation: Dedicated commuter register and login prevent driver crossover
  [PASS] Test 32: Driver Portal Isolation: Dedicated driver register and login prevent commuter crossover
  [PASS] Test 33: Super Admin Isolation: Admin workspace is isolated from commuter and driver interfaces
  [PASS] Test 34: PWA Icon & Asset Compliance: 192px/512px PNGs and maskables exist for WebAPK install
  [PASS] Test 35: PWA Manifest & Service Worker: Web app manifest and SW precache are synchronized
----------------------------------------------------------------
  SUMMARY: 35 / 35 TESTS PASSED (100% SUCCESS)
----------------------------------------------------------------
```

---

## 6. Progressive Web App (PWA) Capabilities

- **Manifest:** Configured at `/manifest.json` with standalone mode and Royal Blue `#2563EB` branding.
- **True WebAPK Icons:** 192×192px and 512×512px PNG icons, apple-touch-icon, and maskable assets.
- **Service Worker (`/sw.js`):** Pre-caches essential app shell, OpenStreetMap tiles (up to 120 cached tiles), and provides offline fallback at `/offline`.
- **Install Prompt Banner:** Automatically prompts users on Android Chrome, desktop browsers, and provides step-by-step "Add to Home Screen" instructions for iOS Safari.
- **Live Online / Offline Detection:** Real-time toast alerts notifying users when network connectivity changes.

---

## 👨‍💻 Author

**Jhon Kylho Estrabo**  
*BS Information Technology · St. Anthony's College*  
San Jose de Buenavista, Antique, Philippines  
* **GitHub:** [@kylho1231](https://github.com/kylho1231)  
* **Email:** [jhonkylhoestraboofficial@gmail.com](mailto:jhonkylhoestraboofficial@gmail.com)

---

## 7. License & Compliance

Copyright © 2026 AntiqueRide. Developed for the Province of Antique, Philippines.  
Compliance under Republic Act No. 10173 (Philippine Data Privacy Act), LGU San Jose de Buenavista Municipal Ordinances, and Land Transportation Franchising & Regulatory Board (LTFRB) guidelines.
