import type { CSSProperties } from "react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DeviceLinkingPhase,
  DeviceLinkingStatus,
  type DeviceLinkingSSEEvent,
  useTatchi,
} from "@tatchi-xyz/sdk/react";
import { AccountMenuButton } from "@tatchi-xyz/sdk/react/profile";
import { useProfileMenuControl } from "../contexts/ProfileMenuControl";

export interface TatchiProfileSettingsButtonProps {
  className?: string;
  style?: CSSProperties;
}

const TOAST_OPTIONS = { classNames: { closeButton: "toast-close-button" } } as const;

export function TatchiProfileSettingsButton({ className, style }: TatchiProfileSettingsButtonProps) {
  const { loginState, tatchi } = useTatchi();
  const [isMobile, setIsMobile] = useState(false);
  const { isMenuOpen, highlightedMenuItem, setMenuOpen, clearHighlight } = useProfileMenuControl();

  const handleDeviceLinkingEvents = (event: DeviceLinkingSSEEvent) => {
    switch (event.phase) {
      case DeviceLinkingPhase.STEP_2_SCANNING:
        toast.loading("Scanning QR code...", { id: "device-linking", ...TOAST_OPTIONS });
        return;
      case DeviceLinkingPhase.STEP_3_AUTHORIZATION:
        toast.loading("Authorizing new account keys...", { id: "device-linking", ...TOAST_OPTIONS });
        return;
      case DeviceLinkingPhase.STEP_6_REGISTRATION:
        if (event.status === DeviceLinkingStatus.SUCCESS) {
          toast.success("New device keys added!", { id: "device-linking", ...TOAST_OPTIONS });
        }
        return;
      case DeviceLinkingPhase.REGISTRATION_ERROR:
      case DeviceLinkingPhase.LOGIN_ERROR:
      case DeviceLinkingPhase.DEVICE_LINKING_ERROR:
        if (event.status === DeviceLinkingStatus.ERROR) {
          toast.dismiss("device-linking");
          toast.error(event.message || "Device linking failed", { id: "device-linking", ...TOAST_OPTIONS });
        }
        return;
      case DeviceLinkingPhase.STEP_7_LINKING_COMPLETE:
        if (event.status === DeviceLinkingStatus.SUCCESS) {
          toast.success(event.message || "Device linking complete!", { id: "device-linking", ...TOAST_OPTIONS });
        }
        return;
      default:
        if (event.status === DeviceLinkingStatus.PROGRESS) {
          toast.message(event.message || "Processing...", {
            id: "device-linking",
            duration: 4000,
            dismissible: true,
            ...TOAST_OPTIONS,
          });
        } else if (event.status === DeviceLinkingStatus.ERROR) {
          toast.dismiss("device-linking");
          toast.error(event.message || "Operation failed", { id: "device-linking", ...TOAST_OPTIONS });
        }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (!loginState.isLoggedIn) {
      clearHighlight();
      setMenuOpen(false);
    }
  }, [loginState.isLoggedIn, clearHighlight, setMenuOpen]);

  if (!loginState.isLoggedIn || !loginState.nearAccountId) return null;

  const explorerBaseUrl = String(tatchi?.configs?.nearExplorerUrl || "https://testnet.nearblocks.io").replace(/\/$/, "");

  return (
    <div className="tatchi-profile-button-container" style={style}>
      <AccountMenuButton
        nearAccountId={loginState.nearAccountId}
        nearExplorerBaseUrl={explorerBaseUrl}
        hideUsername={isMobile}
        className={className}
        deviceLinkingScannerParams={{
          fundingAmount: "0.05",
          onDeviceLinked: (result: any) => {
            toast.success(`Device linked successfully to ${result.linkedToAccount}!`, TOAST_OPTIONS);
          },
          onError: (error: Error) => {
            toast.dismiss("device-linking");
            toast.error(`Device linking failed: ${error.message}`, { id: "device-linking", ...TOAST_OPTIONS });
          },
          onClose: () => {
            toast.dismiss();
          },
          onEvent: handleDeviceLinkingEvents,
        }}
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setMenuOpen}
        highlightedMenuItem={highlightedMenuItem}
      />
    </div>
  );
}

export default TatchiProfileSettingsButton;
