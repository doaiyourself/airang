"use client";

import Link from "next/link";

interface AppHeaderProps {
  babyNickname: string | null;
}

export function AppHeader({ babyNickname }: AppHeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
      style={{ backgroundColor: "#FDFAF7", borderColor: "#F5EBE0" }}
    >
      <Link href="/" className="flex items-center gap-1.5">
        <span className="text-xl">🌸</span>
        <span className="text-lg font-bold" style={{ color: "#2D2A2E" }}>
          아이랑
        </span>
        {babyNickname && (
          <span className="text-sm" style={{ color: "#5C5860" }}>
            · {babyNickname}
          </span>
        )}
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/family"
          className="w-9 h-9 flex items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: "#F5EBE0" }}
        >
          👨‍👩‍👧
        </Link>
        <Link
          href="/profile"
          className="w-9 h-9 flex items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: "#F5EBE0" }}
        >
          👤
        </Link>
      </div>
    </header>
  );
}
