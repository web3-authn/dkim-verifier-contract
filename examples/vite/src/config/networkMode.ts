export const NETWORK_MODES = ["testnet", "mainnet"] as const;

export type NetworkMode = (typeof NETWORK_MODES)[number];

export function isNetworkMode(value: unknown): value is NetworkMode {
  return value === "testnet" || value === "mainnet";
}

