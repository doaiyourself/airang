"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RecordFormLayout } from "@/components/records/RecordFormLayout";
import { usePregnancy } from "@/hooks/usePregnancy";

const EMOTIONS = [
  { emoji: "😊", label: "행복" },
  { emoji: "🥰", label: "설레" },
  { emoji: "😴", label: "피곤" },
  { emoji: "🤢", label: "입덧" },
  { emoji: "😢", label: "울적" },
  { emoji: "😐", label: "무덤덤" },
];

const VISIBILITY_OPTIONS = [
  { value: "family", label: "👨‍👩‍👧 가족 모두" },
  { value: "couple", label: "💑 부부만" },
  { value: "private", label: "🔒 나만" },
];

function DiaryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekParam = parseInt(searchParams.get("week") ?? "0", 10);

  const { info, loading: pregnancyLoading } = usePregnancy();
  const [week, setWeek] = useState(weekParam || 0);

  useEffect(() => {
    if (info && !week) setWeek(info.currentWeek);
  }, [info]);

  const [emotion, setEmotion] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState("family");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) { setError("일기 내용을 입력해주세요."); return; }
    if (!info?.pregnancyId) { setError("임신 정보를 불러올 수 없어요."); return; }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error: insertError } = await supabase.from("records").insert({
      pregnancy_id: info.pregnancyId,
      author_id: user.id,
      type: "diary",
      week_number: week,
      record_date: new Date().toISOString().split("T")[0],
      visibility,
      content: { emotion, body },
    });

    if (insertError) {
      setError("저장 중 오류가 발생했어요.");
      setLoading(false);
      return;
    }

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
    <RecordFormLayout title="일기 쓰기" emoji="📔" onBack={() => router.back()}
      week={week || null} onWeekChange={setWeek}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FFF0F0", color: "#E53E3E" }}>{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: "#2D2A2E" }}>오늘의 기분</label>
          <div className="flex gap-2 flex-wrap">
            {EMOTIONS.map((e) => (
              <button key={e.emoji} type="button"
                onClick={() => setEmotion(emotion === e.emoji ? "" : e.emoji)}
                className="flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: emotion === e.emoji ? "#FFB4A2" : "#EDD5C0",
                  backgroundColor: emotion === e.emoji ? "#FFF5F3" : "white",
                }}>
                <span className="text-2xl">{e.emoji}</span>
                <span className="text-xs" style={{ color: "#5C5860" }}>{e.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>오늘의 이야기</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="오늘 어떤 하루였나요? 아기에게, 혹은 나에게 편지를 써보세요 💕"
            rows={8}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none leading-relaxed"
            style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>공개 범위</label>
          <div className="flex gap-2">
            {VISIBILITY_OPTIONS.map((opt) => (
              <button key={opt.value} type="button"
                onClick={() => setVisibility(opt.value)}
                className="flex-1 py-2.5 rounded-xl border-2 text-xs font-medium transition-all"
                style={{
                  borderColor: visibility === opt.value ? "#FFB4A2" : "#EDD5C0",
                  backgroundColor: visibility === opt.value ? "#FFF5F3" : "white",
                  color: "#2D2A2E",
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#FFB4A2" }}>
          {loading ? "저장 중..." : "일기 저장하기 📔"}
        </button>
      </form>
    </RecordFormLayout>
  );
}

export default function DiaryPage() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',backgroundColor:'#FDFAF7'}}><p style={{color:'#5C5860'}}>불러오는 중...</p></div>}>
      <DiaryForm />
    </Suspense>
  );
}
