/*
  DEVELOPMENT ONLY
  - This config starts a dedicated wallet dev server so the app can connect to a
    different wallet origin during local development (cross‑origin).
  - In production, this example uses a remote wallet origin (cross‑origin) for
    security and does not co‑host the wallet on the app server.
  - Do not deploy this server with the app. Instead, deploy the wallet site
    separately and point VITE_WALLET_ORIGIN at that remote origin. The app
  dev server remains app‑only via `tatchiAppServer` in `vite.config.ts`.
*/
import { defineConfig } from 'vite'
import { tatchiWallet } from '@tatchi-xyz/sdk/plugins/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// Dedicated wallet dev server. Serves /wallet-service and /sdk/* under the
// wallet origin while the app dev server uses tatchiAppServer (headers only).
// Caddy proxies wallet.example.localhost → localhost:5175.

export default defineConfig(({ mode }) => {
  const walletOrigins = ['https://wallet.example.localhost']
  const walletServicePath = '/wallet-service'
  const sdkBasePath = '/sdk'

  return {
    clearScreen: false,
    logLevel: 'info',
    server: {
      port: 5175,
      allowedHosts: ['wallet.example.localhost', 'pta-m4.local'],
    },
    plugins: [
      nodePolyfills({
        globals: { Buffer: true, global: true, process: true },
        protocolImports: true,
      }),
      tatchiWallet({
        walletOrigins,
        walletServicePath,
        sdkBasePath,
        enableDebugRoutes: true,
        emitHeaders: true
      }),
    ],
    define: {
      'process.env': {},
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['buffer', 'process', 'util'],
    },
    cacheDir: 'node_modules/.vite-wallet',
    // Use cacheDir to avoid lock contention with vite.config.ts (app-server).
  }
})
