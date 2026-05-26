"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RecordFormLayout } from "@/components/records/RecordFormLayout";
import { usePregnancy } from "@/hooks/usePregnancy";

const CATEGORIES = [
  { value: "belly", label: "🤰 배 사진" },
  { value: "ultrasound", label: "🩻 초음파" },
  { value: "daily", label: "📷 일상" },
  { value: "checkup", label: "🏥 검진" },
];

function PhotoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekParam = parseInt(searchParams.get("week") ?? "0", 10);

  const { info, loading: pregnancyLoading } = usePregnancy();
  const [week, setWeek] = useState(weekParam || 0);

  useEffect(() => {
    if (info && !week) setWeek(info.currentWeek);
  }, [info]);

  const [images, setImages] = useState<File[]>([]);
  const [category, setCategory] = useState("daily");
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("family");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImages((prev) => [...prev, ...files].slice(0, 10));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 || !info?.pregnancyId) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const imageUrls: string[] = [];
    for (const file of images) {
      const ext = file.name.split(".").pop();
      const path = `records/${info.pregnancyId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("records").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("records").getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }
    }

    await supabase.from("records").insert({
      pregnancy_id: info.pregnancyId,
      author_id: user.id,
      type: "photo",
      week_number: week,
      record_date: new Date().toISOString().split("T")[0],
      visibility,
      content: { photo_urls: imageUrls, category, caption },
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
    <RecordFormLayout title="사진 올리기" emoji="📸" onBack={() => router.back()}
      week={week || null} onWeekChange={setWeek}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>사진 선택 (최대 10장)</label>
          <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed cursor-pointer"
            style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }}>
            <span className="text-4xl mb-1">📸</span>
            <span className="text-sm" style={{ color: "#5C5860" }}>
              {images.length > 0 ? `${images.length}장 선택됨` : "눌러서 사진 추가"}
            </span>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
          </label>
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={URL.createObjectURL(img)} alt="" className="w-full h-full rounded-xl object-cover" />
                  <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-xs flex items-center justify-center shadow">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>카테고리</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                className="py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                style={{
                  borderColor: category === cat.value ? "#FFB4A2" : "#EDD5C0",
                  backgroundColor: category === cat.value ? "#FFF5F3" : "white",
                  color: "#2D2A2E",
                }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>캡션 (선택)</label>
          <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)}
            placeholder="사진에 대한 한 줄 설명"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>공개 범위</label>
          <div className="flex gap-2">
            {[{ value: "family", label: "👨‍👩‍👧 가족" }, { value: "couple", label: "💑 부부" }, { value: "private", label: "🔒 나만" }].map((opt) => (
              <button key={opt.value} type="button" onClick={() => setVisibility(opt.value)}
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

        <button type="submit" disabled={loading || images.length === 0}
          className="w-full py-4 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#FFB4A2" }}>
          {loading ? "업로드 중..." : "사진 저장하기 📸"}
        </button>
      </form>
    </RecordFormLayout>
  );
}

export default function PhotoPage() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',backgroundColor:'#FDFAF7'}}><p style={{color:'#5C5860'}}>불러오는 중...</p></div>}>
      <PhotoForm />
    </Suspense>
  );
}
