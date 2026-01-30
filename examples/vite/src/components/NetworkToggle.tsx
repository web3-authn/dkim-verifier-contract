import React, { useCallback } from "react";
import { useNetworkMode } from "../contexts/NetworkMode";
import type { NetworkMode } from "../config/networkMode";

export function NetworkToggle() {
  const { networkMode, setNetworkMode } = useNetworkMode();

  const setMode = useCallback(
    (mode: NetworkMode) => {
      setNetworkMode(mode);
    },
    [setNetworkMode],
  );

  return (
    <div className="network-toggle" role="group" aria-label="Network mode">
      <button type="button" aria-pressed={networkMode === "testnet"} onClick={() => setMode("testnet")}>
        Testnet
      </button>
      <button type="button" aria-pressed={networkMode === "mainnet"} onClick={() => setMode("mainnet")}>
        Mainnet
      </button>
    </div>
  );
}

