# Color Palette-Based Graphical Password Authentication System

This project is a secure, passwordless authentication web portal designed to replace traditional textual credentials with a **5-step sequence of visual colors**. It features precision tuning, colorblind accessibility, custom Argon2 key derivation over quantized RGB coordinates, and an administrative console to monitor logins and manage lockouts.

---

## 📁 Repository Structure

```text
ColorPassword-main/
├── .env                       # Environment variables (shared by client and API)
├── README.md                  # Project entry instructions
├── project_explanation.md     # System architecture & cryptographic walkthrough (this file)
├── backend/                   # Node.js + Express.js API Server
│   ├── config/                # Database connection handlers
│   ├── controllers/           # Auth flow, security checks & admin operations
│   ├── models/                # MongoDB Mongoose Schemas (User & LoginHistory)
│   ├── middleware/            # JWT auth & route guards
│   ├── routes/                # Endpoint paths (/api/auth & /api/admin)
│   ├── utils/                 # Cryptography (Argon2id, quantization) & SMTP relaying
│   ├── package.json           # Backend dependency configuration
│   └── server.js              # Server entry point & administrative auto-seeding
└── frontend/                  # React.js + Tailwind CSS Client
    ├── dist/                  # Production builds
    ├── src/
    │   ├── components/        # ColorPicker grid, custom RGB tuning editor, and sliding Captcha
    │   ├── context/           # AuthContext (session, accessibility, HMR routes)
    │   ├── pages/             # Layouts: Landing, Login, Register, ForgotPassword, Dashboard, AdminPanel
    │   ├── App.jsx            # Route dispatcher & global SVG matrices for colorblind filters
    │   ├── index.css          # Tailwind configurations & glassmorphic layout tokens
    │   └── main.jsx           # App wrapper
    └── package.json           # Frontend scripts & bundler dependencies
```

---

## 🔐 Cryptographic Password Authentication Protocol

Traditional textual passwords undergo standard key derivation (like bcrypt or PBKDF2) to match exact character sequences. In a graphical layout, exact mouse-click coordinates or slider positions are mathematically hard to repeat precisely. 

This system solves this challenge using **Quantized Coordinate Hashing** coupled with **Argon2id Key Derivation**:

```mermaid
graph TD
    A[User Selects 5 Colors] --> B[RGB Coordinates: R, G, B]
    B --> C[Quantization: Round to nearest multiple of 10]
    C --> D[Format String: R-G-B|R-G-B|...]
    D --> E[Argon2id Key Derivation]
    E --> F[Verification / Hash Storage]
```

### 1. The Quantization Algorithm (±5 Tolerance Binning)
Before hashing, each RGB value is clamped between $0$ and $255$ and rounded to the nearest multiple of $10$. This allows for slight coordinate differences of up to $\pm 5$ units during input while ensuring the values map to the exact same hash:

$$C_{quantized} = \text{round}\left(\frac{\text{clamp}(0, 255, C_{input})}{10}\right) \times 10$$

For example:
- A registered color with coordinates $R=152$, $G=3$, $B=245$ rounds to $R=150$, $G=0$, $B=250$.
- If the user re-enters the color during login as $R=148$, $G=1$, $B=249$, it also rounds to $R=150$, $G=0$, $B=250$.
- Because both round to the same bin, they generate the exact same string, resulting in successful verification.

Implementation in [colorAuth.js](file:///d:/ColorPassword-main/backend/utils/colorAuth.js):
```javascript
const quantizeComponent = (val) => {
  const num = parseInt(val, 10);
  if (isNaN(num)) return 0;
  const clamped = Math.max(0, Math.min(255, num));
  return Math.round(clamped / 10) * 10;
};
```

### 2. Sequence Serializer
The five selected colors are quantized and concatenated using a delimiter to preserve order:

$$\text{"R1-G1-B1|R2-G2-B2|R3-G3-B3|R4-G4-B4|R5-G5-B5"}$$

### 3. Argon2id Key Derivation
This serialized string is processed using **Argon2id** (the profile recommended by the password-hashing competition for resisting side-channel and GPU-bracing attacks) with secure hardware parameters:
- **Memory Cost**: $64 \text{ MB}$ ($2^{16} \text{ KB}$)
- **Time Cost**: 3 iterations
- **Parallelism**: 4 threads

---

## 💾 Database Schemas

MongoDB stores the data model in two main schemas:

### 1. `User` Schema
Tracks profiles, security counters, status, and authentication credentials.

| Field | Type | Description |
| :--- | :--- | :--- |
| `username` | String | Lowercased, unique username. |
| `email` | String | Unique email address. |
| `colorHash` | String | The secure Argon2id hash containing the quantized color password. |
| `failedAttempts`| Number | Counter incremented on incorrect login attempts. |
| `lockedUntil` | Date | Timestamp indicating when an account is locked. |
| `isAdmin` | Boolean | Determines access to the Administrative Panel. |
| `resetOtp` | String | Verification code for password resets. |
| `resetOtpExpires`| Date | Validity limit (10 minutes) of the reset code. |

### 2. `LoginHistory` Schema
Audit log mapping all auth events.

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | ObjectId | Reference to the `User` document. |
| `username` | String | Username recorded at access event. |
| `ip` | String | IPv4/IPv6 client IP. |
| `browser` | String | User Agent browser. |
| `os` | String | User Agent operating system. |
| `status` | String | Outcome (`success`, `failed`, `locked`). |
| `timestamp` | Date | Date and time of the attempt. |

---

## 🛡️ Authentication Workflows

### Login Protocol
```
User Enters Username
   │
   ├─► Check lock status: If current time < User.lockedUntil ──► Reject (403 Locked)
   │
   ├─► Check failed attempts: If User.failedAttempts >= 5 ────► Require Slider CAPTCHA
   │
   └─► Display Color Grid Challenge
         │
         ▼
User Selects 5 Colors ──► Quantize ──► Argon2 Verify 
         │
         ├───► [Match] ──► Reset attempts to 0, generate JWT token, login success.
         │
         └───► [Mismatch] ──► Increment attempts by 1.
                                If attempts >= 5 ──► Set lock lockOut (15 mins).
```

### Password Reset (OTP Flow)
1. **Request Reset**: Enters username/email. If matching profile is found, the system generates a 6-digit numeric OTP, saves it in the database with a 10-minute expiry, and dispatches it via nodemailer using the configured SMTP server (Gmail with App Password).
2. **Confirm Reset**: The user enters the OTP. Upon success, they are guided to input a new 5-color sequence, which is quantized and saved as the new Argon2id hash.

---

## 🎨 Accessibility Features

### Colorblind Filters
The application uses SVG color-matrix color conversion filters to simulate and aid users experiencing protanopia, deuteranopia, or tritanopia color weaknesses. 

For example, the Protanopia matrix shifts red intensities towards green/blue spectra:
```xml
<filter id="protanopia-filter">
  <feColorMatrix
    type="matrix"
    values="0.567, 0.433, 0,     0, 0
            0.558, 0.442, 0,     0, 0
            0,     0.242, 0.758, 0, 0
            0,     0,     0,     1, 0"
  />
</filter>
```
*These filters run client-side inside the main viewport container, automatically adjusting the theme palette.*

### Layout Magnification
An accessibility scaler shifts global sizes by adding text offsets and scaling elements up for users with sight impairments.

---

## ⚙️ Administration & Monitoring Console

The **Administrative Panel** serves as the security dashboard for system monitoring:

* **Real-time Metrics**: Total registered accounts, currently locked-out accounts, aggregate attempts, and success rate.
* **Access Integrity Gauge**: A concentric radial donut chart reflecting success versus failure rates.
* **Threat Feed**: Highlights suspicious IPs logging multiple consecutive authentication failures.
* **User Management Utilities**:
  - Administrative Account Unlock (manually overrides `lockedUntil` timestamp to `null` and resets attempts to 0).
  - Manual Lockout (lets administrators preemptively lock a user profile for 1, 2, 6, or 24 hours).
  - Role Promotion/Demotion (changes administrative levels).
  - Temporary Reset OTP generation (bypasses automatic email relays).
  - Profile Deletion.
* **Security Logs**: A complete list of all authentications searchable by username and IP address.
