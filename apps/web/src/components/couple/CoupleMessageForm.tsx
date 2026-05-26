"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePregnancy } from "@/hooks/usePregnancy";

interface Props {
  pregnancyId: string;
}

export function CoupleMessageForm({ pregnancyId }: Props) {
  const router = useRouter();
  const { info } = usePregnancy();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const text = message.trim();
    if (!text || sending) return;
    setSending(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    await supabase.from("records").insert({
      pregnancy_id: pregnancyId,
      author_id: user.id,
      type: "couple_diary",
      week_number: info?.currentWeek ?? null,
      record_date: new Date().toISOString().split("T")[0],
      visibility: "couple",
      content: { message: text },
    });

    setMessage("");
    setSending(false);
    router.refresh();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="파트너에게 메시지를 보내보세요 💕"
        rows={1}
        className="flex-1 px-4 py-3 rounded-2xl border text-sm outline-none resize-none leading-relaxed"
        style={{
          borderColor: "#EDD5C0",
          backgroundColor: "#FDFAF7",
          maxHeight: "120px",
          overflowY: "auto",
        }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
        }}
      />
      <button
        onClick={handleSend}
        disabled={!message.trim() || sending}
        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
        style={{ backgroundColor: "#FFB4A2" }}>
        {sending ? (
          <span className="text-white text-xs">...</span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )}
      </button>
    </div>
  );
}
