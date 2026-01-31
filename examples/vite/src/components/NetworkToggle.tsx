import React, { useCallback } from "react";
import { useNetworkMode } from "../contexts/NetworkMode";
import type { NetworkMode } from "../config/networkMode";

export function NetworkToggle() {
  const { networkMode, setNetworkMode } = useNetworkMode();

  const setMode = useCallback(
    (mode: NetworkMode) => {
      if (mode === networkMode) return;

      setNetworkMode(mode);
      // The SDK's TatchiPasskey manager is intentionally treated as a singleton and ignores
      // config changes after initialization. Switching between testnet/mainnet therefore
      // requires a full reload to re-initialize the SDK with the new config.
      try {
        window.localStorage.setItem("w3a:network-mode", JSON.stringify(mode));
      } catch {
        // ignore (private mode, sandboxed iframe, etc.)
      }
      window.location.reload();
    },
    [networkMode, setNetworkMode],
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
