# 🎨 PR Youth Expenses Tracker — Design System & Style Guide
**Version:** 2.4.0  
**Application:** Penumuli Perantalamma Youth Tracker & Digital Receipt Suite  
**Platform:** Progressive Web App (React + Vite + Tailwind CSS + Canvas 2D)  
**Design Paradigm:** Modern Apple Human Interface Guidelines (HIG) + Material 3 Glassmorphism

---

## 1. 🌈 Color Palette & Design Tokens

### 1.1 Primary Brand Colors (Royal Blue & Identity)
Used for primary navigation, submit buttons, branding headers, and logo accents.

| Token Name | Hex Code | Tailwind Equivalent | Role & Usage |
| :--- | :--- | :--- | :--- |
| `--color-primary` | `#0F52BA` | `bg-[#0f52ba]` | Primary brand color, logo crest, top accent stripes |
| `--color-primary-dark` | `#1E40AF` | `bg-blue-800` | Active states, high-contrast headings |
| `--color-primary-light`| `#DBEAFE` | `bg-blue-100` | Light button fills, subtle highlight containers |
| `--color-primary-subtle`| `#EFF6FF` | `bg-blue-50/80` | Logo badge backdrop, card tinting |
| `--color-primary-border`| `#93C5FD` | `border-blue-300` | Primary action button borders |

---

### 1.2 Accent & Festive Saffron Colors (Laddu Auction & Winners)
Used specifically for the Ganesh Laddu Auction, winner names, festive badges, and highlights.

| Token Name | Hex Code | Tailwind Equivalent | Role & Usage |
| :--- | :--- | :--- | :--- |
| `--color-saffron` | `#EA580C` | `text-orange-600` | Devotee/Winner highlighted name in receipts |
| `--color-saffron-vibrant`| `#F97316` | `bg-orange-500` | Festive stars, sparkle icons, active toggle indicators |
| `--color-saffron-bg` | `#FFF7ED` | `bg-orange-50` | Male Laddu winner aura backdrop, card highlight |
| `--color-saffron-border` | `#FED7AA` | `border-orange-200` | Laddu pill borders, subtle festive containers |

---

### 1.3 Semantic Success & Financial Income (Donations & Chanda)
Used for positive financial inflow, Chanda receipt badges, amount received pills, and copy/download success states.

| Token Name | Hex Code | Tailwind Equivalent | Role & Usage |
| :--- | :--- | :--- | :--- |
| `--color-emerald-deep` | `#047857` | `text-emerald-700` | Receipt header badges, amount received text |
| `--color-emerald-primary`| `#059669`| `bg-emerald-600` | Share Receipt action button, success states |
| `--color-emerald-light`| `#ECFDF5` | `bg-emerald-50` | Amount Received pill background, Chanda badge |
| `--color-emerald-border`| `#A7F3D0` | `border-emerald-200`| Amount pill borders, Official Receipt border |
| `--color-emerald-female`| `#F0FDF4` | `bg-emerald-50/80` | Female Laddu winner aura backdrop |

---

### 1.4 Semantic Danger & Financial Outflow (Expenses & Destructive)
Used for expense entries, negative balances, delete actions, and form validation errors.

| Token Name | Hex Code | Tailwind Equivalent | Role & Usage |
| :--- | :--- | :--- | :--- |
| `--color-rose-deep` | `#E11D48` | `text-rose-600` | Expense amounts (-₹), delete button hover |
| `--color-rose-primary` | `#F43F5E` | `bg-rose-500` | Admin badge, error toast indicators |
| `--color-rose-bg` | `#FFF1F2` | `bg-rose-50` | Expense card backdrops, error containers |
| `--color-rose-border` | `#FECDD3` | `border-rose-200` | Error input borders, danger alert cards |

---

### 1.5 Neutral & Surface Scale (Slate Hierarchy)
Provides structure, depth, contrast, and effortless legibility across light and dark elements.

| Token Name | Hex Code | Tailwind Equivalent | Role & Usage |
| :--- | :--- | :--- | :--- |
| `--color-text-primary` | `#0F172A` | `text-slate-900` | Primary page headers, donor names, key values |
| `--color-text-secondary`| `#334155` | `text-slate-700` | Subheadings, body copy, form labels |
| `--color-text-muted` | `#64748B` | `text-slate-500` | Timestamps, payment modes, metadata lines |
| `--color-text-subtle` | `#94A3B8` | `text-slate-400` | Committee blessings footer, disabled states |
| `--color-border-subtle`| `#E2E8F0` | `border-slate-200` | Card borders, dashed divider lines |
| `--color-border-input` | `#CBD5E1` | `border-slate-300` | Form input borders |
| `--color-bg-surface` | `#FFFFFF` | `bg-white` | Modal dialogs, receipt cards, input fields |
| `--color-bg-canvas-1` | `#DCEBFA` | `from-[#dcebfa]` | Gradient top sky start |
| `--color-bg-canvas-2` | `#EDF5FC` | `via-[#edf5fc]` | Gradient middle body transition |
| `--color-bg-canvas-3` | `#F5F9FD` | `to-[#f5f9fd]` | Gradient bottom subtle finish |

---

## 2. 🔤 Typography System

### 2.1 Primary Typeface
```css
font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```
- **Heading Character:** Geometric sans-serif with friendly open counters, distinct numerals, and modern digital punch.
- **Body Character:** Highly legible at micro-sizes (8px–11px) with anti-aliasing optimizations.

### 2.2 Typographic Hierarchy & Scale

| Style / Level | Font Size | Weight | Tracking | Line Height | Usage Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `24px – 28px` | `900 (Black)` | `-0.025em` | `1.2` | Net Balance display, Dashboard total |
| **Page Title (H1)**| `20px – 24px` | `800 (ExtraBold)`| `-0.02em` | `1.25` | "Committee Expenses Tracker", Admin Panel |
| **Card Title (H2)**| `16px – 18px` | `800 (ExtraBold)`| `-0.015em`| `1.3` | "Penumuli Perantalamma Youth" (Receipt Header) |
| **Section Title (H3)**| `14px – 16px`| `700 (Bold)` | `-0.01em` | `1.4` | "Recent Transactions", "Add Expense" |
| **Receipt Body Large**| `13.5px – 15px`| `500 / 900` | `normal` | `1.65` | Chanda Contribution statement (Mr/Miss: Name garu) |
| **Standard Body** | `13px – 14px` | `500 (Medium)` | `normal` | `1.5` | Form inputs, category dropdowns, description |
| **Metadata & Subtext**| `10px – 11.5px`| `600 (SemiBold)`| `normal` | `1.4` | `31 Aug 2026 • 11:21 AM • UPI Transfer` |
| **Pill Badges** | `8.5px – 10px` | `800 / 900` | `+0.05em` | `1.0` | `OFFICIAL DONATION RECEIPT`, `AMOUNT RECEIVED:` |
| **Micro Caption** | `8px – 9px` | `500 / 600` | `normal` | `1.3` | "Authorized Digital Receipt · Penumuli Youth" |

### 2.3 Cultural & Respectful Telugu Honorific Rules
- **Donor / Winner Name Formatting:**
  - `Title Prefix`: `Mr/Miss:` (Bold `#0F172A`)
  - `Devotee Name`: `Bhimavarapu Phaneendra Reddy` (ExtraBold `#EA580C` Saffron)
  - `Respectful Honorific`: `garu` (Bold `#0F172A` Slate Dark — never orange, matching sentence context)

---

## 3. 📐 Layout, Surfaces & Elevation

### 3.1 Layout Grid & Containers
- **Mobile Container Maximum Width:** `36rem` (`576px`) — centered for native mobile and responsive tablet/desktop presentation.
- **Card Padding Hierarchy:**
  - Mobile screen padding: `p-3.5` (`14px`) to `p-4` (`16px`)
  - Desktop container padding: `p-6` (`24px`) to `p-8` (`32px`)

### 3.2 Corner Radius System
- **Pills / Badges / Buttons:** `rounded-full` (`9999px`)
- **Main Glass Cards:** `rounded-[28px]` or `rounded-3xl` (`24px – 28px`)
- **Input Fields & Select Boxes:** `rounded-2xl` (`16px`)
- **Action Buttons & Modals:** `rounded-2xl` (`16px`) to `rounded-3xl` (`24px`)

### 3.3 Shadows & Elevation
- **Card Soft Elevation:** `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02);`
- **Hover Micro-lift:** `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06); transform: translateY(-1px);`
- **Modal Backdrop:** `bg-slate-900/70 backdrop-blur-xs`
- **Glassmorphism:** `bg-white/90 backdrop-blur-md border border-white/80`

---

## 4. 🧩 Core Component Specifications

### 4.1 Apple-Style Input Fields (`.apple-input`)
- **Visual Design:** Pure white background, `1px solid #CBD5E1` border, `16px` border-radius.
- **Focus Ring:** `#0284C7` (Sky Blue) border with `3px` translucent ring `rgba(2, 132, 199, 0.15)`.
- **Icon Protection Rule:** Whenever an input contains a leading icon or `₹` currency symbol, `.apple-input-with-icon` enforces `padding-left: 2.75rem !important` (44px), guaranteeing zero text-icon overlap.

### 4.2 Buttons Hierarchy
1. **Primary Brand Button:**
   - Background: `linear-gradient(180deg, #0F52BA 0%, #1D4ED8 100%)`
   - Text: White, ExtraBold `text-xs`, shadow-sm
   - Click feedback: `active:scale-98` with haptic tap
2. **Success / Share Button:**
   - Background: `bg-emerald-600 hover:bg-emerald-700`
   - Text: White, Bold `text-xs`
3. **Pill Action Filter Buttons:**
   - Active: `bg-[#0F52BA] text-white shadow-xs`
   - Inactive: `bg-slate-100 text-slate-600 hover:bg-slate-200`
4. **Destructive Delete Button:**
   - Background: `text-slate-400 hover:text-rose-600 hover:bg-rose-50`

### 4.3 Transaction Ledger Card (`TransactionItem.jsx`)
- **Left Icon:** Dynamic category badge (Decoration, Pooja, DJ, Crackers, Banner, Prasadam, Travel, Lights).
- **Center Body:** Category/Description title, Devotee name, Date and Time metadata.
- **Right Amount:**
  - Expense: `-₹{amount}` in bold `#E11D48`
  - Donation: `+₹{amount}` in bold `#047857`
- **Receipt Trigger Pill:** Unified `Receipt` pill button with standard `Receipt` icon (Orange for Laddu, Emerald for Chanda).

---

## 5. 🖼️ Canvas 2D Digital Receipt Engine

Both the preview modal and exported high-resolution PNG canvas share an identical mathematical layout:

### 5.1 Canvas Dimensions & Scale
- **Resolution Scale:** `scale = 3` (300 DPI ultra-crisp Retina PNG output)
- **Base Width:** `390px`
- **Chanda Receipt Base Height:** `418px` (zero bottom dead space)
- **Laddu Receipt Base Height:** `635px` (contains full devotee illustration and festive glow)

### 5.2 Chanda Receipt Spatial Blueprint
1. **Top Accent Stripe:** `Y = 0` to `5px` (`#0F52BA`)
2. **Logo Emblem:** Centered at `X = 195`, `Y = 36`, Radius `18px`
3. **Header Titles:** `Y = 72` ("Penumuli Perantalamma Youth"), `Y = 87` (Location)
4. **Official Badge:** Centered pill `Y = 98`, `W = 190`, `H = 20` (`#ECFDF5`)
5. **Dashed Divider:** `Y = 126`, `[4, 4]` dash pattern
6. **Subtle Top Metadata:** `Y = 144` (`31 Aug 2026 • 11:21 AM • UPI Transfer`, `#64748B`)
7. **Contribution Statement:** `Y = 172` (5 lines, `lineHeight = 24px`, font size `14.5px / 16.5px`)
8. **Dynamically Centered Amount Pill:**
   - Width auto-calculated: `Label Width + Amount Width + 36px padding`
   - Pill centered at `X = 195 - (PillWidth / 2)`
   - Background `#ECFDF5`, Border `#A7F3D0`
9. **Thanking Note:** `Y = 356` (`#0F52BA`)
10. **Authorized Committee Footer:** `Y = 380`, `Y = 394` (`#64748B` / `#94A3B8`)

---

## 6. 🔊 Sound & Haptic Feedback Tokens

Operates via the Web Audio API synthesizer and device vibration motor (`src/utils/hapticsSound.js`):

- **Light Selection Tap:** `triggerHaptic(10)` / `10ms` pulse (Tab switches, date picks, filter clicks)
- **Form Submit / Action Trigger:** `triggerHaptic(15)` / `15ms` pulse (Modal open, export start)
- **Celebration & Success:** `triggerHaptic([30, 50, 30])` + `playSuccessSound()`
  - Tone 1: `C5` (523.25 Hz) $\rightarrow$ Duration 0.12s
  - Tone 2: `E5` (659.25 Hz) $\rightarrow$ Duration 0.12s
  - Tone 3: `G5` (783.99 Hz) $\rightarrow$ Duration 0.25s (Harmonic major chord resolution)

---

## 7. 📱 Quick Copy Design Tokens (CSS Variables)

```css
:root {
  /* Primary */
  --pr-primary: #0f52ba;
  --pr-primary-dark: #1e40af;
  --pr-primary-light: #dbeafe;
  --pr-primary-subtle: #eff6ff;

  /* Saffron & Laddu */
  --pr-saffron: #ea580c;
  --pr-saffron-vibrant: #f97316;
  --pr-saffron-bg: #fff7ed;

  /* Emerald & Donations */
  --pr-emerald: #047857;
  --pr-emerald-vibrant: #059669;
  --pr-emerald-bg: #ecfdf5;
  --pr-emerald-border: #a7f3d0;

  /* Rose & Expenses */
  --pr-rose: #e11d48;
  --pr-rose-vibrant: #f43f5e;
  --pr-rose-bg: #fff1f2;

  /* Slate Neutrals */
  --pr-slate-900: #0f172a;
  --pr-slate-700: #334155;
  --pr-slate-500: #64748b;
  --pr-slate-400: #94a3b8;
  --pr-slate-200: #e2e8f0;
  --pr-slate-100: #f1f5f9;

  /* Canvas Gradient */
  --pr-gradient-canvas: linear-gradient(180deg, #dcebfa 0%, #edf5fc 40%, #f5f9fd 100%);
}
```
