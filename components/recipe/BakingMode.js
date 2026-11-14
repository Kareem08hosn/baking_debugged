"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Does this browser support keeping the screen awake? The server can't
// know (it has no "navigator"), so it says no; the browser then says yes
// or no. useSyncExternalStore handles that hand-over without a flash.
const noSubscription = () => () => {};
function useWakeLockSupport() {
  return useSyncExternalStore(noSubscription, () => "wakeLock" in navigator, () => false);
}

// "Baking mode": keeps the screen from going dark while you bake, so you
// don't have to tap a floury phone. Uses the browser's Screen Wake Lock;
// browsers without it simply don't show the switch.
export default function BakingMode() {
  const isSupported = useWakeLockSupport();
  const [isOn, setIsOn] = useState(false);
  const lockRef = useRef(null);

  // The browser drops the lock when you switch tabs; take it again when
  // you come back, if baking mode is still on.
  useEffect(() => {
    if (!isOn) {
      return;
    }
    let cancelled = false;
    async function lock() {
      try {
        lockRef.current = await navigator.wakeLock.request("screen");
      } catch {
        if (!cancelled) setIsOn(false); // refused (e.g. low battery)
      }
    }
    function handleVisibility() {
      if (document.visibilityState === "visible") lock();
    }
    lock();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      lockRef.current?.release();
      lockRef.current = null;
    };
  }, [isOn]);

  if (!isSupported) {
    return null;
  }
  return (
    <button type="button" className="btn-quiet" aria-pressed={isOn} onClick={() => setIsOn(!isOn)}>
      {isOn ? "Baking mode on: screen stays awake" : "Baking mode"}
    </button>
  );
}
