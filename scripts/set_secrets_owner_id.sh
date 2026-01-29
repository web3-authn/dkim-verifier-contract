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

JSON_ARGS="$(jq -n --arg secrets_owner_id "${CONTRACT_ID}" '{secrets_owner_id: $secrets_owner_id}')"

echo "Setting secrets owner ID on ${CONTRACT_ID} to ${CONTRACT_ID}"

near contract call-function as-transaction "$CONTRACT_ID" set_secrets_owner_id \
  json-args "$JSON_ARGS" \
  prepaid-gas '100.0 Tgas' \
  attached-deposit '0 NEAR' \
  sign-as "$CONTRACT_ID" \
  network-config "$NEAR_NETWORK_ID" \
  sign-with-plaintext-private-key "$DEPLOYER_PRIVATE_KEY" \
  send

echo "Done. Current value:"
near contract call-function as-read-only "$CONTRACT_ID" get_secrets_owner_id \
  json-args '{}' \
  network-config "$NEAR_NETWORK_ID"
