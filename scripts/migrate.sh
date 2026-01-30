#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo ".env file not found in repo root; please create it from env.example."
  exit 1
fi

source .env
: "${CONTRACT_ID:?Set CONTRACT_ID in .env to the deployed EmailDkimVerifier contract account ID}"
: "${NEAR_NETWORK_ID:?Set NEAR_NETWORK_ID in .env (e.g. testnet, mainnet)}"
: "${DEPLOYER_PRIVATE_KEY:?Set DEPLOYER_PRIVATE_KEY in .env to the contract signer private key}"

echo "Migrating contract state for ${CONTRACT_ID} on ${NEAR_NETWORK_ID}..."

near contract call-function as-transaction "$CONTRACT_ID" migrate \
  json-args '{}' \
  prepaid-gas '100.0 Tgas' \
  attached-deposit '0 NEAR' \
  sign-as "$CONTRACT_ID" \
  network-config "$NEAR_NETWORK_ID" \
  sign-with-plaintext-private-key "$DEPLOYER_PRIVATE_KEY" \
  send

