import React, { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { NetworkMode } from "../config/networkMode";

export type NetworkModeContextValue = {
  networkMode: NetworkMode;
  setNetworkMode: Dispatch<SetStateAction<NetworkMode>>;
};

const NetworkModeContext = createContext<NetworkModeContextValue | null>(null);

export function NetworkModeProvider({ value, children }: { value: NetworkModeContextValue; children: ReactNode }) {
  return <NetworkModeContext.Provider value={value}>{children}</NetworkModeContext.Provider>;
}

export function useNetworkMode(): NetworkModeContextValue {
  const ctx = useContext(NetworkModeContext);
  if (!ctx) throw new Error("useNetworkMode must be used within a NetworkModeProvider");
  return ctx;
}

