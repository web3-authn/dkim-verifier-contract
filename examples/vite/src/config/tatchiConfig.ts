import type { TatchiConfigsInput } from "@tatchi-xyz/sdk/react";
import type { NetworkMode } from "./networkMode";

const DEFAULTS_BY_NETWORK: Record<
  NetworkMode,
  {
    recoverEmailRecipient: string;
    relayerUrl: string;
    relayerAccountId: string;
    nearNetwork: NetworkMode;
    nearRpcUrl: string;
    nearExplorerUrl: string;
    walletOrigin: string;
    webauthnContractId: string;
    emailRecovererContractId: string;
    dkimVerifierContractId: string;
    zkEmailVerifierContractId: string;
  }
> = {
  testnet: {
    recoverEmailRecipient: "recover-testnet@tatchi.xyz",
    relayerUrl: "https://relay-staging.tatchi.xyz",
    relayerAccountId: "w3a-relayer.testnet",
    nearNetwork: "testnet",
    nearRpcUrl: "https://test.rpc.fastnear.com",
    nearExplorerUrl: "https://testnet.nearblocks.io",
    walletOrigin: "https://wallet-staging.tatchi.xyz",
    webauthnContractId: "w3a-v1.testnet",
    emailRecovererContractId: "w3a-email-recoverer-v1.testnet",
    dkimVerifierContractId: "w3a-email-dkim-verifier-v1.testnet",
    zkEmailVerifierContractId: "zk-email-verifier-v1.testnet",
  },
  mainnet: {
    recoverEmailRecipient: "recover-mainnet@tatchi.xyz",
    relayerUrl: "https://relay-mainnet.tatchi.xyz",
    relayerAccountId: "w3a-relayer.near",
    nearNetwork: "mainnet",
    nearRpcUrl: "https://free.rpc.fastnear.com",
    nearExplorerUrl: "https://nearblocks.io",
    walletOrigin: "https://wallet-mainnet.tatchi.xyz",
    webauthnContractId: "w3a-v1.near",
    emailRecovererContractId: "email-recoverer-v1.near",
    dkimVerifierContractId: "w3a-email-dkim-verifier-v1.near",
    zkEmailVerifierContractId: "zk-email-verifier-v1.near",
  },
};

export function buildTatchiConfig(networkMode: NetworkMode): TatchiConfigsInput {
  const defaults = DEFAULTS_BY_NETWORK[networkMode] ?? DEFAULTS_BY_NETWORK.testnet;
  return {
    contractId: defaults.webauthnContractId,
    nearNetwork: defaults.nearNetwork,
    nearRpcUrl: defaults.nearRpcUrl,
    nearExplorerUrl: defaults.nearExplorerUrl,
    relayer: {
      url: defaults.relayerUrl,
      emailRecovery: {
        mailtoAddress: defaults.recoverEmailRecipient,
      },
    },
    signerMode: {
      mode: "threshold-signer",
      behavior: "fallback",
    },
    emailRecoveryContracts: {
      emailRecovererGlobalContract: defaults.emailRecovererContractId,
      emailDkimVerifierContract: defaults.dkimVerifierContractId,
      zkEmailVerifierContract: defaults.zkEmailVerifierContractId,
    },
    iframeWallet: {
      walletOrigin: defaults.walletOrigin,
      walletServicePath: "/wallet-service",
      sdkBasePath: "/sdk",
      rpIdOverride: "tatchi.xyz",
    },
  };
}
