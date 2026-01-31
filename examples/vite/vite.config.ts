import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { tatchiApp } from '@tatchi-xyz/sdk/plugins/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'


export default defineConfig(({ mode }) => {
  // If you ship a single build with a testnet/mainnet toggle, the host page must delegate
  // WebAuthn + clipboard to BOTH wallet origins (Permissions-Policy).
  const walletOrigins = [
    'https://wallet-staging.web3authn.org',
    'https://wallet-mainnet.web3authn.org',
  ];
  return {
    clearScreen: false,
    logLevel: 'info',
    envPrefix: ['VITE_', 'RECOVER_'],
    server: {
      port: 5174,
      // Allow access via reverse-proxied hosts (Caddy) and Bonjour (.local)
      allowedHosts: ['example.localhost', 'wallet.example.localhost', 'pta-m4.local'],
    },
    plugins: [
      nodePolyfills({
        globals: { Buffer: true, global: true, process: true },
        protocolImports: true,
      }),
      react(),
      // Cross‑origin dev (serve): headers only. Build (emitHeaders=true): emit _headers
      // for COOP/COEP/CORP + Permissions‑Policy; wallet HTML gets strict CSP.
      tatchiApp({
        walletOrigins,
        enableDebugRoutes: true,
        // Needed if you ship a single build with a testnet/mainnet toggle.
        emitHeaders: true,
      }),
    ],
    define: {
      'process.env': {},
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['buffer', 'process', 'util'],
    },
  }
})
