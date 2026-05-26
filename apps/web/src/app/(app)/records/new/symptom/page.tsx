"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RecordFormLayout } from "@/components/records/RecordFormLayout";

const SYMPTOM_TAGS = [
  "입덧", "피로", "요통", "부종", "불면", "두통", "속쓰림",
  "변비", "빈뇨", "현기증", "다리경련", "가슴통증", "코막힘",
];

function SymptomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pregnancyId = searchParams.get("pregnancyId") ?? "";

  const [tags, setTags] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(3);
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tags.length === 0) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    await supabase.from("records").insert({
      pregnancy_id: pregnancyId,
      author_id: user.id,
      type: "symptom",
      record_date: new Date().toISOString().split("T")[0],
      visibility: "family",
      content: { tags, intensity, memo },
    });

    router.push("/home");
    router.refresh();
  };

  const intensityLabels = ["", "아주 약해요", "약해요", "보통이에요", "심해요", "아주 심해요"];
  const intensityColors = ["", "#B5E4CA", "#B5E4CA", "#FFD166", "#FFB4A2", "#FF8FA3"];

  return (
    <RecordFormLayout title="증상 기록" emoji="🤒" onBack={() => router.back()}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: "#2D2A2E" }}>
            어떤 증상이 있나요? <span style={{ color: "#5C5860" }}>(복수 선택 가능)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_TAGS.map((tag) => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                className="px-4 py-2 rounded-full border-2 text-sm font-medium transition-all"
                style={{
                  borderColor: tags.includes(tag) ? "#FFB4A2" : "#EDD5C0",
                  backgroundColor: tags.includes(tag) ? "#FFB4A2" : "white",
                  color: tags.includes(tag) ? "white" : "#2D2A2E",
                }}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: "#2D2A2E" }}>
              얼마나 심한가요?
              <span className="ml-2 font-normal" style={{ color: intensityColors[intensity] }}>
                {intensityLabels[intensity]}
              </span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button key={level} type="button" onClick={() => setIntensity(level)}
                  className="flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all"
                  style={{
                    borderColor: intensity === level ? intensityColors[level] : "#EDD5C0",
                    backgroundColor: intensity === level ? intensityColors[level] : "white",
                    color: intensity === level ? "white" : "#2D2A2E",
                  }}>
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>메모 (선택)</label>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)}
            placeholder="추가로 기록하고 싶은 내용이 있으면 적어주세요"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
            style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }} />
        </div>

        <button type="submit" disabled={loading || tags.length === 0}
          className="w-full py-4 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#FFB4A2" }}>
          {loading ? "저장 중..." : "증상 기록하기 🤒"}
        </button>
      </form>
    </RecordFormLayout>
  );
}

export default function SymptomPage() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',backgroundColor:'#FDFAF7'}}><p style={{color:'#5C5860'}}>불러오는 중...</p></div>}>
      <SymptomForm />
    </Suspense>
  );
}
