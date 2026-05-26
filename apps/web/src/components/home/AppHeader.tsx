"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AppHeaderProps {
  babyNickname: string | null;
  userId: string;
}

export function AppHeader({ babyNickname, userId }: AppHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
      style={{ backgroundColor: "#FDFAF7", borderColor: "#F5EBE0" }}
    >
      <Link href="/home" className="flex items-center gap-1.5">
        <span className="text-xl">🌸</span>
        <span className="text-lg font-bold" style={{ color: "#2D2A2E" }}>아이랑</span>
        {babyNickname && (
          <span className="text-sm" style={{ color: "#5C5860" }}>· {babyNickname}</span>
        )}
      </Link>

      <div className="flex items-center gap-2">
        <Link href="/family"
          className="w-9 h-9 flex items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: "#F5EBE0" }}>
          👨‍👩‍👧
        </Link>
        <button
          onClick={handleSignOut}
          className="w-9 h-9 flex items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: "#F5EBE0" }}
          title="로그아웃"
        >
          👤
        </button>
      </div>
    </header>
  );
}
