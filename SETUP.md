# QoL DApp – Setup Guide

A friendly, copy‑paste guide to get you running on any machine — fast and reliably.

## 1) Prerequisites

- Node.js 18+ (LTS recommended)
- npm 8+
- Browser: Chrome/Brave/Edge or Firefox
- Phantom Wallet extension installed and unlocked
- Internet access (Leaflet tiles + Solana RPC)

Optional (for later):
- Solana CLI + a devnet wallet with a little SOL (only if you’ll mint real tokens)

## 2) One‑Command Quickstart (after cloning)

```bash
cd qol-dapp && npm install && npm start
```

- Opens `http://localhost:3000`.
- First run can take ~1 minute.

## 3) Full Install (with cloning)

Windows (PowerShell):
```powershell
cd D:\Colosseum
git clone https://github.com/Mustafa02yusuf28/QOL-Dapp.git qol-dapp
cd qol-dapp
npm install
npm start
```

macOS/Linux:
```bash
cd ~/workspace
git clone https://github.com/Mustafa02yusuf28/QOL-Dapp.git qol-dapp
cd qol-dapp
npm install
npm start
```

## 4) Connect Phantom

- Click “Connect Phantom”. If it doesn’t prompt:
  - Ensure Phantom is enabled for the site
  - Refresh and try again
  - Temporarily disable other wallet extensions

No env files required — the app detects `window.solana` automatically.

## 4.1) Install connected services (Phantom, Solana) — step by step

1) Install Phantom Wallet (browser extension)
- Chrome Web Store: search “Phantom Wallet” (official by Phantom Technologies)
- Create a new wallet, set a password, securely store the secret phrase
- Pin the extension for quick access

2) Switch Phantom to Devnet (for testing)
- Open Phantom → Settings → Developer Settings → Change network → Devnet
- Or click the network label in the wallet header and pick Devnet

3) Fund your Devnet wallet (optional, only for token scripts)
- Visit https://faucet.solana.com → choose Devnet → paste your wallet address → Request Airdrop

4) (Optional) Install Solana CLI
- macOS/Linux:
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
solana --version
solana config set --url https://api.devnet.solana.com
solana airdrop 2 # if eligible
```
- Windows: use WSL (Ubuntu) then run the same commands above

5) (Optional) Install ts-node to run scripts
```bash
npm install --global ts-node typescript
```

6) (Optional) Run the token helper script (devnet)
```bash
# Edit scripts/create-token.ts with your funded devnet keypair per comments
npx ts-node scripts/create-token.ts
```

7) Browser permissions
- Allow location (for on-site verification)
- Ensure Phantom is enabled for the site
- If multiple wallets installed, make Phantom the default handler

## 5) What you should see

- Map View: Mohali (140307) with dark, glass UI and a subtle 3D background
- Submit Audit: Choose metric, add rating/details/proof (rewards tracked in UI)
- Verify Data: Only enabled when:
  - Wallet connected
  - Within ≤ 200m (Geolocation → Haversine distance)
  - Not your own audit and not previously verified by you
  - A short on‑site comment is provided

## 6) Geolocation tips

- “Use my location” requests GPS via the browser
- Desktop accuracy varies; mobile is better
- `localhost` counts as a secure context for Geolocation in most browsers
- If denied, re‑enable in site settings

## 7) Configuration knobs (optional)

- Token service: `src/services/tokenService.ts`
  - `TOKEN_MINT`, `RPC_ENDPOINT` (for real tokens later)
- Map/data: `src/components/InteractiveMap.tsx`, `src/data/metrics.ts`
- Theme: `src/index.css`

## 8) Build a production bundle

```bash
npm run build
```

- Outputs to `build/`
- Serve on HTTPS (recommended for Geolocation)

## 9) Common issues & fixes (copy‑paste)

- Phantom doesn’t open:
```bash
# Reload page and click Connect again; ensure Phantom is enabled
```

- Webpack 5 polyfill errors (crypto/stream/buffer/util):
```bash
rm -rf node_modules package-lock.json # macOS/Linux
del /s /q node_modules\* & del package-lock.json # Windows CMD
npm install
```

- `@solana/spl-token` not found:
```bash
npm install @solana/spl-token
```

- TypeScript deprecation warning about moduleResolution:
```json
// tsconfig.json already uses "moduleResolution": "bundler"
```

- Geolocation inaccurate/blocked:
```bash
# Allow location permission in the browser; try on mobile for better GPS
```

- Layout overlaps / extra scroll:
```bash
# Header spacing and overflow are tuned in index.css and App; avoid changing fixed heights
```

## 10) Making token rewards real (later)

Steps (high level):
1. Create an SPL token mint on devnet (or mainnet later)
2. Fund a treasury wallet with tokens
3. Set `TOKEN_MINT` and RPC in `src/services/tokenService.ts`
4. Move transfer signing to a tiny backend (never put keys in frontend)
5. Uncomment transfer logic (create ATA + transfer) and call your backend

Docs:
- `idea/TOKEN_SETUP_GUIDE.md`
- `idea/IMPLEMENT_REAL_TOKENS.md`

## 11) What’s included vs not (demo mode)

Included:
- Real Phantom connection + verification guards
- Modern UI (dark glassmorphism), Leaflet map, 3D background under blur
- On‑site gating for verification (Geolocation + distance)

Not included (by design for safety):
- On‑chain data storage
- Real SPL transfers (scaffolded, easily enabled later)
- Backend APIs (plug in Firestore/Express if needed)

## 12) Customize quickly

- Change verification radius in `VerificationQueue.tsx` (default 200m)
- Extend metrics/locations in `src/data/metrics.ts`
- Replace mock fetch/verify with your API when ready

---

Happy building — and happy auditing! 🏙️✨
