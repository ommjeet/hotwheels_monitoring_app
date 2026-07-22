# The Instamart Collector (Hot Wheels Core Monitor) — v1.2.4

An elegant, stealth-focused, production-ready React + TypeScript dashboard designed to monitor Swiggy Instamart inventory for rare collectibles (e.g., Hot Wheels) and simulate rapid checkout execution.

The frontend is fully responsive, featuring a pixel-perfect premium Win11-inspired aesthetics, interactive charts, comprehensive local parameters, system diagnostics, and streamlined watchlists.

---

## 🚀 Core Features & Highlights

1. **Watchlist & Automation Rules Engine**
   - Configure precise search items with strict price caps, minimum match-similarity thresholds (Jaro-Winkler/Levenshtein matching simulated), and target quantities.
   - **Stealth Checkout**: Automatically toggles instant automated purchase pathways per rule.

2. **Locked-In Cash on Delivery (COD)**
   - **Strict COD-Only Protocol**: Relational/gateway payments are locked and hidden. COD is forced across all automated routes as the ultimate safeguard against payment failures and rate-limiting issues.

3. **Stealth & Automation Profiles**
   - **Simulated GPS Location**: Map precise delivery anchors or local Dark Store coordinates (`Mumbai Central Area, Sector 4`, etc.) to bind regional Instamart scrapers.
   - **Organic Interaction Latency**: Adds randomized `150ms-400ms` human-like delay cycles to clicks and keyboard inputs.
   - **Headless Mode Toggle**: Option to launch Chromium headless or view execution steps live.
   - **Debug Port Mapper**: Connects to existing Chrome sessions via `--remote-debugging-port=9222`.

4. **Activity Stream & Live Stream Deck**
   - View detailed scan cycles, ingestion logs, jitter offsets, and system notifications in real-time.

5. **Screenshot Shelf**
   - Captures automated proof-of-work, shopping carts, and item-detection frames with full lightbox galleries.

6. **System Diagnostics**
   - Monitor simulated CPU loads, system uptime, and active scraping threads natively inside the control sidebar.

---

## 🗂️ Project Directory Structure

```text
├── assets/                  # Public visual and static assets
├── src/
│   ├── components/
│   │   ├── ActivityView.tsx         # Real-time scan and checkout streams
│   │   ├── DashboardView.tsx        # High-level controls & bento statistics
│   │   ├── NavigationSidebar.tsx    # Left side navigation & Diagnostics
│   │   ├── SchedulerView.tsx        # Ingestion timelines & calendar limits
│   │   ├── ScreenshotGalleryView.tsx# Lightbox proof-of-checkout cabinet
│   │   ├── SettingsView.tsx         # Geolocation, debugging port, and latencies
│   │   ├── StatisticsView.tsx       # Analytics Desk (D3 & Recharts dashboards)
│   │   ├── WatchlistView.tsx        # Watchlist table, bulk actions, and filters
│   │   └── WindowsFrame.tsx         # Operating system wrapper shell
│   ├── lib/
│   │   └── mockData.ts              # Local data store and initial states
│   ├── types.ts                     # Strict TypeScript interfaces and configurations
│   ├── index.css                    # Global tailwind configurations and styles
│   ├── App.tsx                      # Primary application entry and state-sync hub
│   └── main.tsx                     # React application mounting
├── .env.example             # Template for API keys and global environment variables
├── .gitignore               # System ignore files
├── index.html               # Main HTML viewport
├── package.json             # Core dependencies and runtime scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite Bundler with React & Tailwind plugins
```

---

## 🛠️ Local Installation & Development

To run this project on your machine, follow these steps:

### 1. Prerequisites
Ensure you have **Node.js (v18 or higher)** installed.

### 2. Install Dependencies
In the root directory of the project, run:
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env` and fill in any required variables:
```bash
cp .env.example .env
```

### 4. Spin Up the Local Server
Launch the local Vite server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
Compile and bundle the React + TypeScript assets for production output:
```bash
npm run build
```
The compiled files will sit cleanly in the `dist/` directory, ready to be hosted on Netlify, Vercel, Cloud Run, or any static file server.

---

## ⚡ Suggestions for Future Implementations

If you decide to extend or integrate this project further, here are the most impactful features we recommend implementing:

1. **Instant Telegram/Discord Webhooks**:
   - Integrate a server-side notification broker that posts photo frames directly to your private channel the moment a rare Hot Wheels is added to the checkout bucket.
2. **Persistent Storage (IndexedDB/Dexie.js)**:
   - Connect the watchlist and system logs to a local browser database, ensuring settings, screenshots, and logs survive browser refreshes or storage clear-outs.
3. **Rotating Proxy Pool Registry**:
   - Implement proxy rotation settings in the **System Parameters** panel to distribute network requests and completely bypass anti-bot scrapers.
4. **Desktop Audio Alerts**:
   - Utilize standard HTML5 audio APIs to trigger localized audio alarms when a target collectible is secured.
