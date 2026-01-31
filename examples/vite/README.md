## Tatchi email recovery example (Vite)

Local demo app for registering/logging in with Passkeys and testing the email-based recovery flow against deployed contracts + relayer.

### Prereqs

- `pnpm`
- `caddy` (for local HTTPS on `*.localhost`)

### Setup

1. Configure:
   - Defaults are hardcoded in `examples/vite/src/config/tatchiConfig.ts` and selected via the in-app network toggle (testnet/mainnet).
2. Install deps:
   - `pnpm install`

### Run (recommended)

Runs three processes in parallel:
- app dev server (Vite): `https://example.localhost`
- wallet dev server (Vite): `https://wallet.example.localhost`
- HTTPS reverse proxy (Caddy): terminates TLS + routes the above

Command:
- `pnpm dev`

### Notes

- `VITE_RECOVER_EMAIL_RECIPIENT` is public and only used to generate a `mailto:` link in the UI.
- To show explorer links in the UI, set:
  - `VITE_EMAIL_RECOVERER_CONTRACT_ID`
  - `VITE_DKIM_VERIFIER_CONTRACT_ID`
- Production deployments must send a `Permissions-Policy` header that delegates WebAuthn (`publickey-credentials-create/get`) to the wallet iframe origin(s). The SDK Vite plugin emits a Cloudflare Pages/Netlify-compatible `dist/_headers` at build time via `tatchiApp({ emitHeaders: true, walletOrigins: [...] })` (needed if you ship a single build with a testnet/mainnet toggle).

### Network modes

- Use the toggle in the top-right to switch between:
  - **Testnet**: Passkey register/login flow (Tatchi SDK) + Steps 1–5.
  - **Mainnet**:
    - Passkey register/login flow (Tatchi SDK) + Steps 1–5.

Design notes live in `docs/`.
