# Quality of Life (QoL) Index: Verified City Audits on Solana

## Project Overview

The Quality of Life (QoL) Index is a Decentralized Physical Infrastructure Network (DePIN) built on Solana. We directly challenge the opaque real-estate market by providing transparent, immutable, crowdsourced data about local living conditions.

Residents submit geo‑tagged audits (e.g., road quality, drainage), and community verifiers confirm the proof on‑site. This verifiable, human-sourced data is anchored on Solana, producing a trustworthy QoL score that informs consumers, investors, and city planners.

## 💡 The Core Value Proposition

### The Problem

Real-estate prices are often detached from local realities. Critical data—traffic congestion, energy sufficiency, real facility quality—is scattered, centralized, and sometimes manipulated. Buyers and renters pay premiums based on speculation rather than verifiable facts.

### The Solution: A Trustless Feedback Loop

We use Solana’s speed and low cost to build a continuous, trustless verification system:

- **Submission**: A resident submits an audit with photo proof and a rating.
- **On‑site verification**: A separate community member visits the geo‑tagged location and verifies on-site.
- **Immutability**: After three unique verifiers reach consensus, the record is final; $QOL rewards are issued.
- **Blended score**: On‑chain verified UGC blends with static data (e.g., hospital/population) for a complete index.

### The Impact: Market Transparency

Transparent, tamper‑resistant facts shift pricing power from speculation to fundamentals. Cities and developers are nudged to improve real conditions; consumers gain negotiating leverage; planners and investors get truthful signals.

## 🎯 Hackathon MVP: Proof of Concept

We start with Mohali (140307) to prove the loop end‑to‑end: Submit → Verify (on‑site) → Consensus → Reward → Score Update. Small scope; real signal; clear path to scale.

## Core Architecture & Technologies

| Element      | Description |
| --- | --- |
| Frontend | React + TypeScript; Dark purple glassmorphism UI (responsive, non‑scrolling landing) |
| Blockchain | Solana (Web3.js) with Phantom via `window.solana` |
| Data/State | In‑memory mocks for demo; scaffolding ready to flip to Anchor/PDA |
| Aesthetics | Leaflet map, performant Three.js background behind blur, fixed header |
| Dependencies | Webpack 5 polyfills for crypto/stream/buffer/util (CRA compatible) |

## The Verification Gateway: Anti‑Fraud Rules

Verification is enabled only if:

- Verifier is within ≤ 200m of the audit location (Geolocation + Haversine)
- Verifier is not the audit’s author (anti‑self‑verify)
- Verifier hasn’t verified this audit before (anti‑double‑verify)
- A short on‑site comment is provided

## 🛠️ Implementation Status

| Feature Area | Component/Service | Status | Detail |
| --- | --- | --- | --- |
| Wallet & UI | `WalletProvider.tsx`, UI Components | REAL | Phantom connection, responsive UI, fixed header, Leaflet map, Rewards panel (simulated ledger), Three.js background |
| Verification Logic | `VerificationQueue.tsx` | REAL | Anti‑fraud rules, on‑site geolocation gating, 3/3 consensus tracking |
| Data Logic | `rewardService.ts`, `tokenService.ts` | SIMULATED | Audits/verifications data, SPL transfers, rewards math kept in memory for demo |
| Token Transfer | `tokenService.ts` | SIMULATED | Real SPL transfer code scaffolded and commented; returns a simulated tx id |

## ⚙️ Development Guide

### Quick Start

```bash
cd qol-dapp
npm install
npm start
```

Built with ❤️ for the Solana ecosystem

## Further reading

- See the full setup and troubleshooting guide in [SETUP.md](./SETUP.md)
