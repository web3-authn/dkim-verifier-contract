import { useState, type FormEvent } from "react";
import {
  ActionPhase,
  ActionStatus,
  type ActionSSEEvent,
  useTatchi,
} from "@tatchi-xyz/sdk/react";
import { toast } from "sonner";
import { useOutputLog } from "../hooks/useOutputLog";
import { Output } from "./Output";
import { getErrorMessage } from "../utils/errors";
import {
  extractNearTransactionHash,
  getNearExplorerBaseUrl,
  getNearTransactionExplorerUrl,
} from "../utils/nearExplorer";

const PROCESSING_TOAST_OPTIONS = {
  duration: 4000,
  dismissible: true,
  classNames: { closeButton: "toast-close-button" },
} as const;

type Step2SetRecoveryEmailsProps = {
  targetAccountId: string;
};

export function Step2SetRecoveryEmails({ targetAccountId }: Step2SetRecoveryEmailsProps) {
  const { tatchi, loginState } = useTatchi();
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const log = useOutputLog();
  const explorerBaseUrl = getNearExplorerBaseUrl(tatchi?.configs?.nearExplorerUrl);

  const onSetRecoveryEmailEvents = (event: ActionSSEEvent) => {
    const toastId = "set-recovery-email";
    if (
      event.phase === ActionPhase.ACTION_ERROR ||
      event.phase === ActionPhase.WASM_ERROR ||
      event.status === ActionStatus.ERROR
    ) {
      const message = getErrorMessage(
        (event as { error?: unknown }).error ?? event.message ?? "Failed to set recovery email",
      );
      log.setOutputText("error", message);
      toast.error(message, { id: toastId, classNames: { closeButton: "toast-close-button" } });
      return;
    }

    switch (event.phase) {
      case ActionPhase.STEP_1_PREPARATION:
        log.appendOutput("idle", event.message || String(event.phase));
        toast.loading(event.message || "Preparing transaction...", { id: toastId });
        return;
      case ActionPhase.STEP_2_USER_CONFIRMATION:
        log.appendOutput("idle", event.message || String(event.phase));
        toast.loading(event.message || "Awaiting confirmation...", { id: toastId });
        return;
      case ActionPhase.STEP_3_WEBAUTHN_AUTHENTICATION:
        log.appendOutput("idle", event.message || String(event.phase));
        toast.loading(event.message || "Authenticating...", { id: toastId });
        return;
      case ActionPhase.STEP_5_TRANSACTION_SIGNING_PROGRESS:
        log.appendOutput("idle", event.message || String(event.phase));
        toast.loading(event.message || "Signing transaction...", { id: toastId });
        return;
      case ActionPhase.STEP_7_BROADCASTING:
        log.appendOutput("idle", event.message || String(event.phase));
        toast.loading(event.message || "Broadcasting transaction...", { id: toastId });
        return;
      case ActionPhase.STEP_8_ACTION_COMPLETE:
        {
          const message = event.message || "Recovery email saved.";
          log.appendOutput("ok", message);
          const txHash = extractNearTransactionHash(message);
          const txUrl = getNearTransactionExplorerUrl(explorerBaseUrl, txHash);
          toast.success(
            txUrl ? (
              <a className="mailto" href={txUrl} target="_blank" rel="noopener noreferrer">
                {message}
              </a>
            ) : (
              message
            ),
            { id: toastId },
          );
        }
        return;
      default:
        log.appendOutput("idle", event.message || String(event.phase));
        toast.message(event.message || "Processing...", { id: toastId, ...PROCESSING_TOAST_OPTIONS });
    }
  };

  const isBlocked = !loginState.isLoggedIn;
  const isDisabled = isBlocked || isLoading;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginState.isLoggedIn) {
      log.setOutputText("error", "Login required to set recovery email.");
      return;
    }
    if (!targetAccountId) {
      log.setOutputText("error", "Missing account id.");
      return;
    }
    if (!recoveryEmail) {
      log.setOutputText("error", "Missing recovery email.");
      return;
    }
    if (isLoading) return;

    const toastId = "set-recovery-email";

    setIsLoading(true);
    log.clearOutput();
    toast.loading("Saving recovery email…", { id: toastId });

    try {
      await tatchi.setRecoveryEmails(targetAccountId, [recoveryEmail], {
        onEvent: onSetRecoveryEmailEvents,
        confirmerText: {
          title: "Set Recovery Email",
          body: "Add a recovery email address for account recovery",
        },
      });
    } catch (error) {
      const message = getErrorMessage(error);
      log.setOutputText("error", message);
      toast.error(message || "Failed to set recovery email", {
        id: toastId,
        classNames: { closeButton: "toast-close-button" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row">
      <aside className={`panel note ${isBlocked ? "is-disabled" : ""}`}>
        <h3>02 Set recovery email</h3>
        <p className="helper">
          Add email recovery functionality to your NEAR account and add a recovery email.
        </p>
      </aside>
      <section className={`panel ${isBlocked ? "is-disabled" : ""}`}>
        <div className="panel-header">
          <h2>Set Recovery Email</h2>
        </div>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            Recovery email
            <input
              value={recoveryEmail}
              onChange={(event) => setRecoveryEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={isDisabled}
            />
          </label>
          <button type="submit" disabled={isDisabled} aria-busy={isLoading}>
            {isLoading && <span className="spinner" aria-hidden="true" />}
            {isLoading ? "Submitting..." : "Save Recovery Email"}
          </button>
          {loginState.nearAccountId && <p className="helper pad-left-05">Logged in as {loginState.nearAccountId}.</p>}
        </form>
        {isBlocked && <p className="helper">Login required to set recovery email.</p>}
        <Output state={log.output} />
      </section>
    </div>
  );
}
