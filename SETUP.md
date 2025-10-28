# QoL DApp – Setup Guide

A friendly, thorough guide to get you running locally fast — and reliably.

## 1) Prerequisites

- Node.js 18+ (LTS recommended)
- npm 8+
- A Chromium-based browser (Chrome/Brave/Edge) or Firefox
- Phantom Wallet extension installed and unlocked
- Internet access (Leaflet tiles + Solana RPC)

Optional (for later, when making tokens real):
- Solana CLI + a devnet wallet with a little SOL

## 2) Clone & Install

```bash
# from your workspace directory
cd qol-dapp
npm install
```

This installs React, TypeScript, Leaflet, React Query, Solana libs, and the required Webpack polyfills.

## 3) Start the App

```bash
npm start
```

- Opens `http://localhost:3000` (CRA default).
- If it doesn’t open automatically, visit the URL manually.

Tip: First run may take a minute while the dev server builds.

## 4) Connect Phantom

- Open the app and click “Connect Phantom”.
- If Phantom doesn’t prompt:
  - Ensure the extension is installed and enabled for this site.
  - Refresh the page and try again.
  - If you have multiple wallets, Phantom may need to be the default handler.

No extra config is required; the app detects `window.solana` at runtime.

## 5) Pages & Expected Behavior

- Map View: Mohali (140307) with a dark glass UI and a lightweight 3D background.
- Submit Audit: Choose category/metric, add rating/details/proof. Rewards are tracked (simulated).
- Verify Data: See audits not authored by you. Verification requires:
  - Wallet connected
  - On‑site presence (≤ 200m) via browser Geolocation
  - A short on‑site comment
  - Not previously verified by you

## 6) Geolocation Notes

- The “Use my location” button requests your GPS coordinates via the browser.
- On desktop, accuracy varies (Wi‑Fi/IP based). On mobile, it’s much better.
- HTTPS is typically required for Geolocation on the web. `localhost` is treated like secure context by most browsers.
- If you deny permission, verification will remain disabled until you allow it.

## 7) Configuration You Might Care About

- Token settings: `src/services/tokenService.ts`
  - `TOKEN_MINT`, `RPC_ENDPOINT` (currently set for simulated flow)
- Map/locations: `src/components/InteractiveMap.tsx` and `src/data/metrics.ts`
- Theme: `src/index.css` (glassmorphism tokens and globals)

No `.env` is required for the demo flow.

## 8) Build for Production

```bash
npm run build
```

- Outputs production assets to `build/`.
- Serve with any static host (Netlify/Vercel/Nginx). For Geolocation, prefer HTTPS.

## 9) Windows-Specific Tips

- If you’re using PowerShell/CMD and scripts don’t start, ensure you’re inside the `qol-dapp` directory before running `npm start`.
- If another process already uses port 3000, CRA will prompt to use a different port.

## 10) Troubleshooting

- Phantom doesn’t open
  - Refresh the page and click Connect again
  - Ensure Phantom is the active wallet extension
  - Try disabling other wallet extensions temporarily

- White screen / Webpack errors about `crypto` or `stream`
  - We ship Webpack 5 polyfills via `config-overrides.js`
  - Clean install: delete `node_modules/` and run `npm install`

- `@solana/spl-token` not found
  - Run `npm install @solana/spl-token`
  - Ensure Node 18+ and reinstall if necessary

- Geolocation blocked or inaccurate
  - Allow location in the browser prompt and site settings
  - Use a mobile device for better GPS accuracy
  - Remember: verification requires ≤ 200m proximity

- “Still scrolling under the header” or layout overlaps
  - This project sets global `overflow`/`z-index` and fixed header spacing in `index.css` and `App.tsx`
  - If you changed heights, adjust the main padding-top or card heights accordingly

## 11) Making Token Rewards Real (Later)

Right now, token transfers are simulated for safety. When you’re ready:

1. Create an SPL token mint for $QOL (devnet to start)
2. Fund a treasury wallet with tokens
3. Configure `TOKEN_MINT` and RPC in `src/services/tokenService.ts`
4. Move transfer signing to a minimal backend (don’t expose private keys in the frontend)
5. Uncomment the transfer logic (ATA creation + transfer) and point the frontend to your backend API

See:
- `TOKEN_SETUP_GUIDE.md`
- `IMPLEMENT_REAL_TOKENS.md`

## 12) What’s Included vs. What’s Not

Included:
- Real Phantom connection and guards around verification
- Modern UI with dark glassmorphism
- Leaflet map and 3D background under blur
- On‑site gating for verification (Geolocation + distance)

Not included (by design, for demo safety):
- On‑chain data storage
- Real SPL transfers (scaffolded and easy to enable later)
- Backend APIs (you can add Firestore/Express as needed)

## 13) Contributing / Customizing

- Adjust the verification radius in `VerificationQueue.tsx` (default 200m)
- Add more metrics and locations in `src/data/metrics.ts`
- Wire a real data source (Firestore/your API) by replacing the mock fetch functions

If you get stuck, open an issue with your OS, Node version, and the exact error text. We’ll help you get unblocked quickly.

---

Happy building — and happy auditing! 🏙️✨
