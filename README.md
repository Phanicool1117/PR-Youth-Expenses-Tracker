<div align="center">
  <img src="public/Logo.png" alt="PR Youth Logo" width="120" />
  <h1>Penumuli Perantalamma Youth — Expenses Tracker</h1>
  <p><strong>A modern, glassmorphic financial management web application built for the PR Youth Committee.</strong></p>

  <p>
    <a href="https://github.com/Phanicool1117/PR-Youth-Expenses-Tracker"><strong>Explore Codebase »</strong></a>
    &nbsp;·&nbsp;
    <a href="https://vercel.com/new/clone?repository-url=https://github.com/Phanicool1117/PR-Youth-Expenses-Tracker"><strong>Deploy on Vercel »</strong></a>
  </p>
</div>

---

## 🌟 Key Features

### 👤 Member Portal
- **Out-of-Pocket Expense Check-in**: Members quickly log personal committee purchases (Decoration, Pooja, Crackers, Lights, DJ, Prasadam, Travel, Banners).
- **Quick-Add Category Carousel**: Interactive horizontal category selector with custom icons.
- **Personal Expense History**: Filtered, search-enabled, and paginated 10-per-page receipt ledger.
- **Live Sync**: Instant background polling and tab-focus syncing.

### 🛡️ Executive Admin Portal
- **Financial Ledger Overview**: Hierarchical display of Net Committee Balance, Total Donations, and Total Expenses.
- **Central Donations Portal**: Record central QR code donations and received sponsor funds.
- **Members Directory Management**: Live committee directory with dynamic **Active (Green)** vs **Inactive (Red)** status badges and 1-click status toggling.
- **Committee Audit Stream**: Full activity ledger with real-time text search, category filters, and 10-per-page pagination (`1–10 of X`).

### 📱 Premium UX & Mobile Design
- **Responsive Mobile Layout**: Centered card stack architecture with horizontal touch scrolling for mobile tabs.
- **Universal Web Haptics**: Subtle 15ms tactile vibration on every button tap & tab selection.
- **Apple-Style Audio Chime**: Offline Web Audio API double-chime (notes E5 → A5) on successful form submission.
- **Clean Animations**: Fast auto-disappearing toast notifications (1.2s) and smooth checkmark tick feedback.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS v4
- **Icons & UI**: Lucide React Icons, Custom Popover Selects & Date Pickers
- **Audio & Haptics**: Web Audio API, Web Haptic Vibration API
- **Backend Sync**: Google Apps Script (GAS) Web App & Google Sheets Ledger API

---

## 🚀 Quick Start & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Phanicool1117/PR-Youth-Expenses-Tracker.git
cd PR-Youth-Expenses-Tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## ⚡ Disabling Vercel Deployment Protection

If Vercel prompts for password authentication or deployment protection on preview links:

1. Open your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Select **PR Youth Expenses Tracker**.
3. Go to **Settings** → **Deployment Protection**.
4. Set **Vercel Authentication** to **Disabled**.
5. Click **Save**.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Built for Penumuli Perantalamma Youth Team</sub>
</div>
