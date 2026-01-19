## Tatchi email recovery example (Vite)

Local demo app for registering/logging in with Passkeys and testing the email-based recovery flow against deployed contracts + relayer.

### Prereqs

- `pnpm`
- `caddy` (for local HTTPS on `*.localhost`)

### Setup

1. Configure env:
   - `cp env.example .env`
   - Edit `.env` as needed (contracts, relayer, wallet origin).
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
