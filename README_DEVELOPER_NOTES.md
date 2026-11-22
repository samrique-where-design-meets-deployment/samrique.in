# Samrique Internal Developer & Architecture Notes 🛠️

This document stores internal engineering notes, package dependency declarations, technical trade-offs, and architecture roadmap items for the Samrique Flutter studio repositories.

---

## 1. Samrique Mama (Pregnancy & Maternal Health Companion)

### Authentication & Token Storage
- **Package:** `flutter_secure_storage` & `shared_preferences`
- **Current State:** Basic session persistence is handled via `shared_preferences`. `flutter_secure_storage` is integrated in the build configuration for hardware-backed keystore/keychain token encryption.
- **Roadmap:**
  - Complete migration of refresh tokens and biometrics to `flutter_secure_storage` with Android Keystore & iOS Keychain backing.
  - Implement biometric (Face ID / Fingerprint) unlock gate on app startup.

### Community & Social Discussions
- **Current State:** Community discussions and peer advice threads are backed by local reactive state and cached fixtures.
- **Roadmap:**
  - Real-time backend synchronization via Supabase / Firebase Cloud Firestore.
  - Content moderation queue and automated spam filtering before public display.

---

## 2. Samrique E-Marketplace

### Digital Assets & Payment Flow
- **Payment Gateway:** Razorpay Flutter SDK (test/sandbox mode ready).
- **Download Security:** Temporary signed URLs (AWS S3 / Cloudflare R2) generated on payment webhook confirmation.
- **KYC Pipeline:** File upload via `image_picker` / `file_picker` directly to secure object storage with admin verification dashboard.

---

## 3. Zipi Bike Taxi (Transit & Mobility Platform)

### Real-Time Dispatch & WebSockets
- **Geolocation:** `geolocator` with background location permissions configured for captain dispatch.
- **Mapping:** `google_maps_flutter` with polyline decoding and animated marker interpolation.
- **Order Radar:** WebSocket event listener with fallback to periodic polling if connection degrades.

---

## 4. Samrique Money Manager

### Offline-First Architecture
- **Local Storage:** SQLite / Hive reactive local ledger.
- **Data Export:** CSV generation via `csv` package and native file sharing using `file_saver`.
- **Currency & Internationalization:** `intl` package initialized for INR (`₹`) and global currency symbols.

