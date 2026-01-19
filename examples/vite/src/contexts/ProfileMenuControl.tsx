import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { HighlightedProfileMenuItem } from "@tatchi-xyz/sdk/react";

type ProfileMenuControlValue = {
  isMenuOpen: boolean;
  highlightedMenuItem: HighlightedProfileMenuItem | null;
  setMenuOpen: (open: boolean) => void;
  setHighlightedMenuItem: (item: HighlightedProfileMenuItem | null) => void;
  clearHighlight: () => void;
};

const ProfileMenuControlContext = createContext<ProfileMenuControlValue | null>(null);

export function ProfileMenuControlProvider({ children }: { children: ReactNode }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [highlightedMenuItem, setHighlightedMenuItem] = useState<HighlightedProfileMenuItem | null>(null);

  const clearHighlight = useCallback(() => setHighlightedMenuItem(null), []);

  const value = useMemo<ProfileMenuControlValue>(
    () => ({
      isMenuOpen,
      highlightedMenuItem,
      setMenuOpen,
      setHighlightedMenuItem,
      clearHighlight,
    }),
    [isMenuOpen, highlightedMenuItem, clearHighlight],
  );

  return <ProfileMenuControlContext.Provider value={value}>{children}</ProfileMenuControlContext.Provider>;
}

export function useProfileMenuControl(): ProfileMenuControlValue {
  const ctx = useContext(ProfileMenuControlContext);
  if (!ctx) throw new Error("useProfileMenuControl must be used within a ProfileMenuControlProvider");
  return ctx;
}

