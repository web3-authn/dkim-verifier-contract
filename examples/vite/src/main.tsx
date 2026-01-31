import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import { TatchiPasskeyProvider } from "@tatchi-xyz/sdk/react";
import "@tatchi-xyz/sdk/react/styles";

import { HomePage } from "./pages/HomePage";
import { ProfileMenuControlProvider } from "./contexts/ProfileMenuControl";
import { NetworkModeProvider } from "./contexts/NetworkMode";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import type { NetworkMode } from "./config/networkMode";
import { buildTatchiConfig } from "./config/tatchiConfig";
import "./index.css";

const appRoot = document.getElementById("app-root");
if (!appRoot) throw new Error('Missing root element: #app-root');

type ThemeMode = "light" | "dark";

const getInitialTheme = (): ThemeMode => {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-w3a-theme") === "dark" ? "dark" : "light";
};

function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [networkMode, setNetworkMode] = useLocalStorageState<NetworkMode>("w3a:network-mode", "testnet");
  const config = buildTatchiConfig(networkMode);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-w3a-theme", theme);
  }, [theme]);

  return (
    <NetworkModeProvider value={{ networkMode, setNetworkMode }}>
      <TatchiPasskeyProvider config={config} theme={{ theme, setTheme }}>
        <Toaster richColors closeButton />
        <ProfileMenuControlProvider>
          <HomePage />
        </ProfileMenuControlProvider>
      </TatchiPasskeyProvider>
    </NetworkModeProvider>
  );
}

createRoot(appRoot).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
