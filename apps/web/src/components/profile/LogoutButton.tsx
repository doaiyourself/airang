"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button onClick={handleLogout}
      className="w-full flex items-center gap-3 px-5 py-4 transition-opacity hover:opacity-70 text-left">
      <span className="text-xl">🚪</span>
      <span className="text-sm font-medium" style={{ color: "#E53E3E" }}>로그아웃</span>
    </button>
  );
}
