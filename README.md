# Color Palette-Based Graphical Password Authentication System

A secure, modern, full-stack cybersecurity portal featuring a 5-step **Color Palette-Based Graphical Password Authentication System** with fine-tuning RGB editors and precision tolerance hashing. 

Traditional password-based access has been completely removed and replaced by graphical color-sequence authentication.

---

## 🚀 Key Features

* **Passwordless Authentication**: Traditional text passwords, strength meters, reset fields, and toggle options are replaced with 5 sequential color selections.
* **RGB Precision Adjuster**: Clicking any color in the picker loads a custom Photoshop-like color editor (Hue vertical slider, Canvas saturation/value chart, direct RGB and HEX text inputs, and current vs. new color swatches).
* **Quantized Color Hashing**: Implements a $\pm 5$ RGB tolerance. RGB values are rounded to the nearest multiple of 10 during registration and login, ensuring minor coordinate deviations map to the exact same hash bin before undergoing Argon2 key derivation.
* **Randomized Grid Sections**: Every login shuffles the visual order of the hue families (sections) of the palette grid to mitigate screen-capture/shoulder-surfing vectors while preserving colors.
* **Slider CAPTCHA**: Lock-out protection triggers a sliding security verification challenge after 5 failed authentication attempts.
* **Security Administration Dashboard**: Aggregate system statistics, review login logs (detailing timestamp, IP, OS, Browser, Status), and unlock blocked profiles.
* **Tailored Accessibility**: Built-in support for Color Blind modes (Protanopia, Deuteranopia, Tritanopia filters via SVG matrices), layout magnification accessibility mode, and color name helpers.

---

## 📂 Project Structure

```text
Colour palatte/
├── django_backup/         # Archived Django legacy code
├── backend/               # Node.js + Express.js Backend
│   ├── config/            # DB connection configurations
│   ├── controllers/       # Registration, Login & Admin logic
│   ├── models/            # User & LoginHistory schemas
│   ├── middleware/        # JWT & Admin route authorization
│   ├── routes/            # REST API route endpoints
│   ├── utils/             # Quantization & Argon2 hashing utils
│   ├── package.json       # Backend configurations & scripts
│   └── server.js          # App entry & admin auto-seeding
├── frontend/              # React.js + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/    # ColorPicker, Captcha
│   │   ├── context/       # AuthContext (session, customization)
│   │   ├── pages/         # Login, Register, Dashboard, AdminPanel
│   │   ├── App.jsx        # Routing & global SVG filters
│   │   ├── index.css      # Tailwind & Glassmorphic variables
│   │   └── main.jsx       # AuthProvider wrapping mount
│   ├── tailwind.config.js # Tailwind compilation config
│   ├── postcss.config.js  # PostCSS autoprefixer config
│   └── package.json       # Frontend scripts and assets
└── .env                   # Shared configurations & JWT Secret
```

---

## 🛠️ Installation Guide

### Prerequisites
* **Node.js** (v18.x or later recommended)
* **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### Step 1: Configuration
Ensure you have a `.env` file at the root of the project with the following contents:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/color_auth
JWT_SECRET=super-secret-key-12345
```

### Step 2: Run Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Start the development server (runs auto-seeding script for `admin`):
   ```bash
   npm run dev
   ```

### Step 3: Run Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the local Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser to the URL displayed in the terminal (usually `http://localhost:5173`).

---

## 🔑 Default Seed Admin Credentials

An admin account is automatically seeded into the database on server start:
* **Username**: `admin`
* **Email**: `admin@demo.com`
* **Color Password Sequence (Select in order)**:
  1. 🔴 **Red**     `(255, 0, 0)`
  2. 🟢 **Green**   `(0, 255, 0)`
  3. 🔵 **Blue**    `(0, 0, 255)`
  4. 🟡 **Yellow**  `(255, 255, 0)`
  5. ⚪ **White**   `(255, 255, 255)`

*To log in as admin, click the corresponding preset color in the palette and select "Confirm Color" inside the fine-tuner editor. You can adjust the RGB sliders by $\pm 5$ units, and the login will still match successfully due to the quantization algorithm.*
