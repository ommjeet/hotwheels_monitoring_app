# HOT WHEELS MONITOR - ENTERPRISE DESKTOP SYSTEM SPECIFICATION
**Version:** 1.0.0 (MVP Core Spec)  
**Target Platform:** Windows 11 Desktop (PySide6 / Qt)  
**Role Context:** Lead Product Designer & Product Manager  

---

## 1. Product Review
The "Hot Wheels Monitor" is a professional Windows desktop utility designed for a single collector who requires high-fidelity local browser automation to scan Swiggy Instamart inventory feeds and execute checkout operations.

### Strategic Evaluation:
*   **The Shift from Web App to Desktop App:** E-commerce sites aggressively block traditional cloud-hosted scrapers. A local desktop app utilizing the user's authentic browser context (session cookies, real residential IP, and genuine TLS fingerprints) is the only reliable way to sustain automation.
*   **Target Audience:** Collectors who leave their systems running for hours. The UI must be dark, extremely low-contrast, highly legible, and structured around structured system events rather than consumer "gamified" badges.
*   **Design Paradigm:** Moving away from a "SaaS dashboard with big colorful metrics." Instead, the layout borrows the architectural, solid, tool-oriented patterns of **GitHub Desktop**, **Linear**, and **Raycast**, using a fixed sidebar, a structured central slate, and resizable layout modules.

---

## 2. Missing Features
During analysis of the core user flow (Launch → Configuration → Monitoring → Acquisition), we identified critical gaps required to make the application reliable in a real production environment:

1.  **Local Chrome Instance Lifecycle Anchor:**
    *   *Why it is needed:* The automation relies on a browser session. If the user doesn't know how to launch Chrome with remote debugging active (`--remote-debugging-port=9222`), the app will fail silently.
    *   *Solution:* A "Launch Connected Browser" action that spawns a dedicated chromium instance directly from the PySide6 app using local subprocess execution.
2.  **State Recovery on System Wake/Crash:**
    *   *Why it is needed:* Windows PCs can sleep, update, or lose internet connectivity. If the app is left running for 14 hours, it must handle network dropouts gracefully.
    *   *Solution:* Persistent Session State. The application automatically saves its scanning toggle states, scheduler timers, and watchlist thresholds to a local config file (`config.json`) after every modification.
3.  **Local Disk Space Sentinel (Guard Rails):**
    *   *Why it is needed:* Automatically capturing high-fidelity PNG screenshots of every matched item can fill a user's hard drive if left unchecked during a massive stock drop.
    *   *Solution:* An automatic storage cleanup daemon configured to keep the gallery size under 500MB (or up to 100 screenshots max, with rolling auto-deletion).

---

## 3. Features to Remove
To align strictly with the "Personal Single-User Utility" directive, several speculative or secondary features must be completely pruned:

1.  **Duplicate Log Layers (Pruning Logs vs Activity):**
    *   *Action:* Merge "System Logs" and "Activity Log Timeline" into a single, high-fidelity chronological stream. Having two separate views for logs and chronological timelines is redundant for a single-user workflow.
2.  **Complex Relational Statistics (Removing Chart Bloat):**
    *   *Action:* Remove complex multi-series line charts, area charts, and hourly breakdown graphs. Replace with simple, clean numeric counters (Total Scans, Successful Match Detections, and Local Browser Port latency indicators).
3.  **External Discord/Telegram Webhook Editors:**
    *   *Action:* Completely remove any webhook, notification channels, or remote bot fields. Communication must remain purely local to the host operating system using native Windows Toast Notifications.

---

## 4. UX Improvements
We have restructured several layout elements to make the interface easier to use for long monitoring sessions:

1.  **Split-Pane Main Console (The Split View):**
    *   Instead of separate pages for logs and current scanning streams, we utilize a horizontal or vertical resizable split pane. The left pane shows the live parsed product feed, while the right pane shows the scrolling raw log stream.
2.  **"Status-Sync" Title Bar:**
    *   The top application bar acts as a permanent, high-level status indicator. No matter what tab is active (Settings, Watchlist, etc.), the user can immediately see if the engine is running and if the browser bridge is healthy.
3.  **One-Click "Safe Stop" Panic Button:**
    *   A persistent, high-visibility global hotkey or button that instantly kills all active browser automation, page reloads, and scheduled checkouts, immediately reverting the system to an idle state.

---

## 5. Final MVP Feature List
To maintain a tight, zero-bloat product definition, Version 1 contains exactly these operational modules:

### A. Local Browser Bridge Status (Dashboard)
*   **Uptime Indicator:** Real-time uptime of the scanning loop.
*   **Bridge Status:** Visual verification of the local Chrome process socket.
*   **Immediate Action Panel:** Single-click Start/Stop toggle button.

### B. Product Watchlist (Filter Rules)
*   **Target Keywords:** Exact-match or Contains-match keywords.
*   **Similarity Thresholds:** Prevents false positives from minor product typos.
*   **Max Price Guard:** Prevents checkout automation if pricing exceeds collector valuation (essential to prevent unwanted expensive purchases).
*   **Auto-Checkout Toggle:** Boolean flag per keyword rule.

### C. Screenshot Gallery & Audit Logs
*   **Image Previews:** Local PNG captures of the item listing at the exact millisecond of matching.
*   **Disk Path Connector:** A native button to open the local folder path directly in Windows File Explorer.
*   **Log Console:** Clean scrolling monospace list of scanning, matching, and checkout statuses.

### D. Session Scheduler
*   **Estimated Runtime Calculator:** Shows expected duration based on interval timing rules.
*   **Working Hours Selector:** Start and stop time windows to mimic organic human activity.

---

## 6. Product Information Architecture
A flat navigation model optimized to prevent navigation fatigue.

```
[Main Application Frame]
 ├── Title Bar (Status Pill, Remote Chrome Port Indicator, Panic Kill Switch)
 ├── Navigation Sidebar (Flat List, No Nested Accordions)
 │    ├── Scan Console (Split pane: Live Feed | Active Terminal Logs)
 │    ├── Watchlist Manager (Target search, rule grid, adding target forms)
 │    ├── Scheduler & Timers (Time bounds, countdown interval slider)
 │    ├── Screenshot Gallery (Bento-grid list, local folder triggers)
 │    └── System Settings (Browser port details, storage guards, debug flags)
 └── System Status Footer (API ping rate, total items processed counters)
```

---

## 7. Design Principles
Our aesthetic guidelines are modeled after professional tools.

1.  **Achromatic Base Color Palette:**
    *   The UI is constructed from slate-grays and obsidian-blacks.
    *   Pure white text is avoided to reduce ocular strain; we use high-contrast soft gray (`#E2E8F0`) for text.
2.  **Functional Accent Pigments:**
    *   **Hot Wheels Orange (`#FF5A00`):** Used strictly for matching detections, target keywords, and active scan loops.
    *   **System Emerald Green (`#10B981`):** Used only for healthy connections and successful checkout confirmations.
3.  **Density Over Decoration:**
    *   Avoid spacious layouts, large padding blocks, or massive margins.
    *   Data is displayed in compact tabular formats with 8px paddings and tight rows.

---

## 8. Design System Reference
A unified set of core building blocks.

*   **Containers:** Flat dark surfaces (`#0E121A`) with single-pixel solid borders (`#1E2430`). No rounded gradients.
*   **Action Elements:** Compact buttons with precise hover states. Primary actions utilize `#FF5A00`.
*   **Monospace Typography:** System telemetry, timestamps, and product catalog sizes are locked to `JetBrains Mono` or `Consolas` at `11px`.

---

## 9. Desktop UX Guidelines
Ensuring the software feels like a native Windows application.

*   **Keyboard Accelerators:**
    *   `Spacebar` toggles the active scanning engine state.
    *   `Ctrl + N` launches the target keyword addition dialog.
    *   `Ctrl + K` clears the scrolling system terminal logs.
*   **Context Menus (Right-Click):**
    *   Right-clicking an item in the watchlist exposes immediate actions: *Enable, Disable, Duplicate, Delete*.
    *   Right-clicking a console log enables copying the exact text to the clipboard.
*   **Native Tooltips:**
    *   Hovering over status pills explains connection protocols immediately.

---

## 10. Final Recommendation
This specification represents a robust, highly optimized blueprint for a single-user desktop utility. By discarding enterprise team features and focusing purely on single-user execution speed and local session reliability, we ensure maximum development clarity and long-term usability. 

We are ready to proceed with implementing these user interfaces.
