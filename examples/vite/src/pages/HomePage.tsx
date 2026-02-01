import { useTatchi } from "@tatchi-xyz/sdk/react";
import { Layout } from "../components/Layout";
import { NetworkToggle } from "../components/NetworkToggle";
import { Step1RegisterOrLogin } from "../components/Step1RegisterOrLogin";
import { Step2SetRecoveryEmails } from "../components/Step2SetRecoveryEmails";
import { Step3Logout } from "../components/Step3Logout";
import { Step4RecoverWithEmail } from "../components/Step4RecoverWithEmail";
import { Step5TestTransfer } from "../components/Step5TestTransfer";
import { TatchiProfileSettingsButton } from "../components/TatchiProfileSettingsButton";
import { useNetworkMode } from "../contexts/NetworkMode";
import { useAccountInputForContract } from "../hooks/useAccountInputForContract";

function HomePagePasskey() {
  const { loginState, tatchi } = useTatchi();

  const {
    inputUsername,
    displayPostfix,
    targetAccountId,
    setInputUsername,
    lastAccountId,
    isUsingExistingAccount,
    accountExists,
  } = useAccountInputForContract({
    tatchi,
    contractId: tatchi.configs.contractId,
    currentNearAccountId: loginState.nearAccountId,
    isLoggedIn: loginState.isLoggedIn,
  });

  const postfix = displayPostfix || `.${tatchi.configs.contractId}`;
  const shouldLogin = isUsingExistingAccount || accountExists;

  return (
    <div className="rows">
      <Step1RegisterOrLogin
        mode={shouldLogin ? "login" : "register"}
        inputUsername={inputUsername}
        postfix={postfix}
        targetAccountId={targetAccountId}
        onChangeUsername={setInputUsername}
      />

      <Step2SetRecoveryEmails targetAccountId={targetAccountId} />

      <Step3Logout />

      <Step4RecoverWithEmail targetAccountId={targetAccountId} lastAccountId={lastAccountId} />

      <Step5TestTransfer receiverId={tatchi.configs.contractId} />
    </div>
  );
}

export function HomePage() {
  const { loginState, tatchi } = useTatchi();
  const { networkMode } = useNetworkMode();

  const explorerBaseUrl = String(tatchi?.configs?.nearExplorerUrl || "https://testnet.nearblocks.io").replace(/\/$/, "");
  const loggedInExplorerUrl = loginState.nearAccountId ? `${explorerBaseUrl}/address/${loginState.nearAccountId}` : "";

  return (
    <Layout>
      <div className="top-center">
        <NetworkToggle />
      </div>
      <div className="top-right">
        <div className="top-right-menu">
          <TatchiProfileSettingsButton />
        </div>
      </div>
      <header className="hero">
        <div>
          <p className="eyebrow">Passkey Accounts + Outlayer example</p>
          <h1>Recovering Accounts with Emails on NEAR</h1>
          <p className="lede">
            {networkMode === "testnet" ? (
              <>
                Create a NEAR Passkey wallet with{" "}
                <a className="link" href="https://tatchi.xyz" target="_blank">
                  Tatchi Passkeys
                </a>
              </>
          ) : (
              <>Use a Passkey wallet on mainnet.</>
            )}
            <br />
            Use{" "}
            <a className="link" href="https://outlayer.fastnear.com/" target="_blank">
              Outlayer
            </a>{" "}
            to recover accounts with an email
          </p>
          {loginState.isLoggedIn && loginState.nearAccountId && loggedInExplorerUrl ? (
            <p className="wallet-status-fixed chip">
              Logged in as: &nbsp;
              <a className="mailto" href={loggedInExplorerUrl} target="_blank" rel="noopener noreferrer">
                {loginState.nearAccountId}
              </a>
            </p>
          ) : (
            loginState.isLoggedIn && <p className="wallet-status-fixed chip">Wallet status: logged in</p>
          )}
        </div>
      </header>

      <HomePagePasskey />

      <div className="row row-wide">
        <section className="panel flow-explainer span-columns">
          <div className="panel-header">
            <h2>What’s happening under the hood</h2>
          </div>
          <div className="stack">
            <ol className="helper">
              <li>
                An <span className="inline-highlight">EmailRecoverer</span> contract is set up for your account when you
                set a recovery email.
              </li>
              <li>You send a recovery email to a Cloudflare Worker (the relayer).</li>
              <li>
                The Worker encrypts the raw email using an encryption public key published by an Outlayer worker inside
                a TEE, then submits the encrypted email to your NEAR smart account, which forwards the email to Outlayer.
              </li>
              <li>
                Outlayer decrypts the email in the TEE, verifies DKIM signatures (using DNS TXT records), and returns a
                compact verification result.
              </li>
              <li>
                If verification passes, EmailRecoverer adds the new public key to your account (recovery complete).
              </li>
            </ol>

            <p className="helper">
              Passkey accounts are NEAR accounts derived from Passkeys. They use a local signer (no server required) or
              a threshold signer (server required). Your Passkey is your wallet.
            </p>

            <br />

            <div className="chip-row">
              <a
                className="link"
                href="https://github.com/web3-authn/email-dkim-verifier-contract"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub: Outlayer worker + email-dkim-verifier-contract
              </a>
            </div>
            <div className="chip-row">
              <a
                className="link"
                href="https://github.com/web3-authn/email-recoverer-contract"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub: email-recoverer-contract
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
