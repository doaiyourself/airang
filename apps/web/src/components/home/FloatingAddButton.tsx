"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RECORD_TYPES = [
  { icon: "📔", label: "일기", href: "/records/new/diary" },
  { icon: "📸", label: "사진", href: "/records/new/photo" },
  { icon: "🏥", label: "검사", href: "/records/new/exam" },
  { icon: "🤒", label: "증상", href: "/records/new/symptom" },
  { icon: "💭", label: "감정", href: "/records/new/emotion" },
];

export function FloatingAddButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* FAB + Options */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
        {/* Record type options */}
        {open && (
          <div className="flex flex-col items-end gap-2 mb-1">
            {RECORD_TYPES.map((type) => (
              <button
                key={type.href}
                onClick={() => {
                  setOpen(false);
                  router.push(type.href);
                }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-lg transition-all hover:scale-105"
                style={{ backgroundColor: "white" }}
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="text-sm font-medium" style={{ color: "#2D2A2E" }}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white text-2xl transition-all hover:scale-105"
          style={{ backgroundColor: "#FFB4A2" }}
        >
          <span
            className="transition-transform duration-200"
            style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          >
            +
          </span>
        </button>
      </div>
    </>
  );
}
