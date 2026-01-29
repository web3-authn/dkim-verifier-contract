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

OUTLAYER_CONTRACT_ID="${OUTLAYER_CONTRACT_ID:-}"
if [[ -z "${OUTLAYER_CONTRACT_ID}" ]]; then
  echo "OUTLAYER_CONTRACT_ID is not set in .env; please set it to the Outlayer account ID." >&2
  exit 1
fi

JSON_ARGS="$(jq -n --arg outlayer_contract_id "${OUTLAYER_CONTRACT_ID}" '{outlayer_contract_id: $outlayer_contract_id}')"

echo "Setting Outlayer contract ID on ${CONTRACT_ID}: ${OUTLAYER_CONTRACT_ID}"

near contract call-function as-transaction "$CONTRACT_ID" set_outlayer_contract_id \
  json-args "$JSON_ARGS" \
  prepaid-gas '100.0 Tgas' \
  attached-deposit '0 NEAR' \
  sign-as "$CONTRACT_ID" \
  network-config "$NEAR_NETWORK_ID" \
  sign-with-plaintext-private-key "$DEPLOYER_PRIVATE_KEY" \
  send

echo "Done. Current value:"
near contract call-function as-read-only "$CONTRACT_ID" get_outlayer_contract_id \
  json-args '{}' \
  network-config "$NEAR_NETWORK_ID"
