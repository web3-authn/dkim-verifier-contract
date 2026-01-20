import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import { TatchiPasskeyProvider, type TatchiConfigsInput } from "@tatchi-xyz/sdk/react";
import "@tatchi-xyz/sdk/react/styles";

import { HomePage } from "./pages/HomePage";
import { ProfileMenuControlProvider } from "./contexts/ProfileMenuControl";
import "./index.css";

// Note: Vite requires using `import.meta.env` exactly; optional chaining breaks env injection.
const env = import.meta.env;

const config: TatchiConfigsInput = {
  contractId: env.VITE_WEBAUTHN_CONTRACT_ID || "w3a-v1.testnet",
  nearNetwork: env.VITE_NEAR_NETWORK || "testnet",
  nearRpcUrl: env.VITE_NEAR_RPC_URL || "https://test.rpc.fastnear.com",
  nearExplorerUrl: env.VITE_NEAR_EXPLORER || "https://testnet.nearblocks.io",
  relayer: {
    url: env.VITE_RELAYER_URL || "https://relay.tatchi.xyz",
    emailRecovery: {
      mailtoAddress: env.VITE_RECOVER_EMAIL_RECIPIENT || "recover-testnet@web3authn.org",
    },
  },
  emailRecoveryContracts: {
    emailRecovererGlobalContract: env.VITE_EMAIL_RECOVERER_CONTRACT_ID || "w3a-email-recoverer-v1.testnet",
    emailDkimVerifierContract: env.VITE_DKIM_VERIFIER_CONTRACT_ID || "email-dkim-verifier-v1.testnet",
  },
  iframeWallet: {
    walletOrigin: env.VITE_WALLET_ORIGIN || "https://wallet.web3authn.org",
    walletServicePath: env.VITE_WALLET_SERVICE_PATH || "/wallet-service",
    sdkBasePath: env.VITE_SDK_BASE_PATH || "/sdk",
    rpIdOverride: env.VITE_RP_ID_BASE || "wallet.web3authn.org",
  },
};

const appRoot = document.getElementById("app-root");

type ThemeMode = "light" | "dark";

const getInitialTheme = (): ThemeMode => {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-w3a-theme") === "dark" ? "dark" : "light";
};

function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-w3a-theme", theme);
  }, [theme]);

  return (
    <TatchiPasskeyProvider config={config} theme={{ theme, setTheme }}>
      <Toaster richColors closeButton />
      <ProfileMenuControlProvider>
        <HomePage />
      </ProfileMenuControlProvider>
    </TatchiPasskeyProvider>
  );
}

createRoot(appRoot).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
