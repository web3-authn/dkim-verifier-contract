import { useCallback, useEffect, useMemo, useState } from "react";

type RecentLogin = {
  nearAccountId: string;
};

type RecentLoginsResult = {
  accountIds: string[];
  lastUsedAccount?: RecentLogin | null;
};

function normalizeUsername(input: string): string {
  return String(input || "").trim().toLowerCase();
}

function splitAccountId(accountId: string): { username: string; domain: string } {
  const parts = String(accountId || "").split(".");
  const username = parts[0] || "";
  const domain = parts.length > 1 ? `.${parts.slice(1).join(".")}` : "";
  return { username, domain };
}

function matchesContract(accountId: string, contractId: string): boolean {
  if (!accountId || !contractId) return false;
  return accountId.endsWith(`.${contractId}`);
}

export type AccountInputState = {
  inputUsername: string;
  lastLoggedInUsername: string;
  lastLoggedInDomain: string;
  targetAccountId: string;
  displayPostfix: string;
  isUsingExistingAccount: boolean;
  accountExists: boolean;
  indexDBAccounts: string[];
};

export type UseAccountInputForContractOptions = {
  tatchi: any;
  contractId: string;
  currentNearAccountId?: string | null;
  isLoggedIn: boolean;
};

export type UseAccountInputForContractReturn = AccountInputState & {
  setInputUsername: (username: string) => void;
  refreshAccountData: () => Promise<void>;
};

export function useAccountInputForContract({
  tatchi,
  contractId,
  currentNearAccountId,
  isLoggedIn,
}: UseAccountInputForContractOptions): UseAccountInputForContractReturn {
  const [inputUsername, setInputUsernameState] = useState("");
  const [indexDBAccounts, setIndexDBAccounts] = useState<string[]>([]);
  const [lastLoggedInUsername, setLastLoggedInUsername] = useState("");
  const [lastLoggedInDomain, setLastLoggedInDomain] = useState("");
  const [targetAccountId, setTargetAccountId] = useState("");
  const [displayPostfix, setDisplayPostfix] = useState("");
  const [isUsingExistingAccount, setIsUsingExistingAccount] = useState(false);
  const [accountExists, setAccountExists] = useState(false);

  const contractSuffix = useMemo(() => (contractId ? `.${contractId}` : ""), [contractId]);

  const refreshAccountData = useCallback(async () => {
    try {
      const res = (await tatchi?.getRecentLogins?.()) as RecentLoginsResult | undefined;
      const accountIds = Array.isArray(res?.accountIds) ? res!.accountIds : [];
      const filtered = accountIds.filter((accountId) => matchesContract(accountId, contractId));
      setIndexDBAccounts(filtered);

      const lastUsed = res?.lastUsedAccount?.nearAccountId;
      if (lastUsed && matchesContract(lastUsed, contractId)) {
        const parts = splitAccountId(lastUsed);
        setLastLoggedInUsername(parts.username);
        setLastLoggedInDomain(parts.domain);
      } else {
        setLastLoggedInUsername("");
        setLastLoggedInDomain("");
      }
    } catch (error) {
      console.warn("Error loading recent logins:", error);
      setIndexDBAccounts([]);
      setLastLoggedInUsername("");
      setLastLoggedInDomain("");
    }
  }, [contractId, tatchi]);

  const checkAccountExists = useCallback(
    async (accountId: string) => {
      if (!accountId) {
        setAccountExists(false);
        return;
      }
      try {
        const hasCredential = await tatchi?.hasPasskeyCredential?.(accountId as any);
        setAccountExists(Boolean(hasCredential));
      } catch (error) {
        console.warn("Error checking credentials:", error);
        setAccountExists(false);
      }
    },
    [tatchi],
  );

  useEffect(() => {
    refreshAccountData();
  }, [refreshAccountData]);

  useEffect(() => {
    if (!isLoggedIn || !currentNearAccountId) return;
    if (!matchesContract(currentNearAccountId, contractId)) return;
    setInputUsernameState(splitAccountId(currentNearAccountId).username);
  }, [contractId, currentNearAccountId, isLoggedIn]);

  useEffect(() => {
    const uname = normalizeUsername(inputUsername);
    if (!uname || !contractId) {
      setTargetAccountId("");
      setDisplayPostfix("");
      setIsUsingExistingAccount(false);
      setAccountExists(false);
      return;
    }

    const existing = indexDBAccounts.find(
      (accountId) => matchesContract(accountId, contractId) && splitAccountId(accountId).username.toLowerCase() === uname,
    );
    const accountId = existing ?? `${uname}${contractSuffix}`;

    setTargetAccountId(accountId);
    setDisplayPostfix(splitAccountId(accountId).domain || contractSuffix);
    setIsUsingExistingAccount(Boolean(existing));
    checkAccountExists(accountId);
  }, [checkAccountExists, contractId, contractSuffix, indexDBAccounts, inputUsername]);

  const setInputUsername = useCallback((username: string) => {
    setInputUsernameState(normalizeUsername(username));
  }, []);

  return {
    inputUsername,
    lastLoggedInUsername,
    lastLoggedInDomain,
    targetAccountId,
    displayPostfix,
    isUsingExistingAccount,
    accountExists,
    indexDBAccounts,
    setInputUsername,
    refreshAccountData,
  };
}
