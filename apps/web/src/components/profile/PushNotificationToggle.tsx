"use client";

import { useEffect, useState } from "react";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export function PushNotificationToggle() {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PermissionState);
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const result = await Notification.requestPermission();

      if (result !== "granted") {
        setPermission("denied");
        setLoading(false);
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { setLoading(false); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setPermission("granted");
    } catch {
      setPermission("denied");
    }
    setLoading(false);
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      }
      await fetch("/api/push/subscribe", { method: "DELETE" });
      setPermission("default");
    } catch {
      // ignore
    }
    setLoading(false);
  };

  if (permission === "unsupported") {
    return (
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔔</span>
          <div>
            <p className="text-sm font-medium" style={{ color: "#2D2A2E" }}>푸시 알림</p>
            <p className="text-xs" style={{ color: "#9C8FA0" }}>이 브라우저는 지원하지 않아요</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">🔔</span>
        <div>
          <p className="text-sm font-medium" style={{ color: "#2D2A2E" }}>푸시 알림</p>
          <p className="text-xs" style={{ color: "#9C8FA0" }}>
            {permission === "granted" ? "검진·주차 알림이 켜져 있어요" :
             permission === "denied" ? "브라우저 설정에서 허용해주세요" :
             "검진 일정, 주차 변경 알림"}
          </p>
        </div>
      </div>
      {permission !== "denied" && (
        <button
          onClick={permission === "granted" ? handleDisable : handleEnable}
          disabled={loading}
          className="relative w-12 h-6 rounded-full transition-colors duration-200 disabled:opacity-60"
          style={{ backgroundColor: permission === "granted" ? "#FFB4A2" : "#E2D9E2" }}>
          <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
            style={{ left: permission === "granted" ? "calc(100% - 22px)" : "2px" }} />
        </button>
      )}
    </div>
  );
}
