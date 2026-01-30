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
: "${OUTLAYER_WORKER_PROJECT_ID:?Set OUTLAYER_WORKER_PROJECT_ID in .env (e.g. w3a-v1.near/tatchi-xyz-email-recovery)}"
: "${NEAR_NETWORK_ID:?Set NEAR_NETWORK_ID in .env (e.g. testnet, mainnet)}"
: "${DEPLOYER_PRIVATE_KEY:?Set DEPLOYER_PRIVATE_KEY in .env to the contract signer private key}"

JSON_ARGS="$(jq -n --arg project_id "${OUTLAYER_WORKER_PROJECT_ID}" '{project_id: $project_id}')"

echo "Setting Outlayer worker project ID on ${CONTRACT_ID} to ${OUTLAYER_WORKER_PROJECT_ID}"

near contract call-function as-transaction "$CONTRACT_ID" set_outlayer_worker_project_id \
  json-args "$JSON_ARGS" \
  prepaid-gas '100.0 Tgas' \
  attached-deposit '0 NEAR' \
  sign-as "$CONTRACT_ID" \
  network-config "$NEAR_NETWORK_ID" \
  sign-with-plaintext-private-key "$DEPLOYER_PRIVATE_KEY" \
  send

echo "Done. Current value:"
near contract call-function as-read-only "$CONTRACT_ID" get_outlayer_worker_project_id \
  json-args '{}' \
  network-config "$NEAR_NETWORK_ID"

