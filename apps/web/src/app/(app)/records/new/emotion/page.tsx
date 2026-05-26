"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RecordFormLayout } from "@/components/records/RecordFormLayout";
import { usePregnancy } from "@/hooks/usePregnancy";

const EMOTIONS = [
  { emoji: "😊", label: "행복해요" },
  { emoji: "🥰", label: "설레요" },
  { emoji: "😴", label: "피곤해요" },
  { emoji: "🤢", label: "입덧해요" },
  { emoji: "😢", label: "울적해요" },
  { emoji: "😐", label: "무덤덤해요" },
  { emoji: "😡", label: "짜증나요" },
  { emoji: "🥺", label: "불안해요" },
  { emoji: "😌", label: "평온해요" },
  { emoji: "🤩", label: "신나요" },
];

function EmotionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekParam = parseInt(searchParams.get("week") ?? "0", 10);

  const { info, loading: pregnancyLoading } = usePregnancy();
  const [week, setWeek] = useState(weekParam || 0);

  useEffect(() => {
    if (info && !week) setWeek(info.currentWeek);
  }, [info]);

  const [emoji, setEmoji] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emoji || !info?.pregnancyId) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    await supabase.from("records").insert({
      pregnancy_id: info.pregnancyId,
      author_id: user.id,
      type: "emotion",
      week_number: week,
      record_date: new Date().toISOString().split("T")[0],
      visibility: "family",
      content: { emoji, memo },
    });

    router.push(`/week/${week}`);
    router.refresh();
  };

  if (pregnancyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FDFAF7" }}>
        <p style={{ color: "#5C5860" }}>불러오는 중...</p>
      </div>
    );
  }

  return (
    <RecordFormLayout title="감정 기록" emoji="💭" onBack={() => router.back()}
      week={week || null} onWeekChange={setWeek}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-medium mb-4 text-center" style={{ color: "#2D2A2E" }}>지금 기분이 어떠세요?</p>
          <div className="grid grid-cols-5 gap-3">
            {EMOTIONS.map((e) => (
              <button key={e.emoji} type="button"
                onClick={() => setEmoji(emoji === e.emoji ? "" : e.emoji)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: emoji === e.emoji ? "#FFB4A2" : "#EDD5C0",
                  backgroundColor: emoji === e.emoji ? "#FFF5F3" : "white",
                }}>
                <span className="text-3xl">{e.emoji}</span>
                <span className="text-xs" style={{ color: "#5C5860" }}>{e.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>한 줄 메모 (선택)</label>
          <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)}
            placeholder="지금 이 기분을 한 마디로..."
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }} />
        </div>

        <button type="submit" disabled={loading || !emoji}
          className="w-full py-4 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#FFB4A2" }}>
          {loading ? "저장 중..." : "감정 기록하기 💭"}
        </button>
      </form>
    </RecordFormLayout>
  );
}

export default function EmotionPage() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',backgroundColor:'#FDFAF7'}}><p style={{color:'#5C5860'}}>불러오는 중...</p></div>}>
      <EmotionForm />
    </Suspense>
  );
}
