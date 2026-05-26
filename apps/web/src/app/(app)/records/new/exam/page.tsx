"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RecordFormLayout } from "@/components/records/RecordFormLayout";

const EXAM_TYPES = ["NT 검사", "정밀 초음파", "임당 검사", "혈액 검사", "소변 검사", "태동 검사 (NST)", "기타"];

function ExamForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pregnancyId = searchParams.get("pregnancyId") ?? "";

  const [examType, setExamType] = useState("");
  const [hospital, setHospital] = useState("");
  const [doctorNote, setDoctorNote] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examType) { setError("검사 종류를 선택해주세요."); return; }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // 이미지 업로드
    const imageUrls: string[] = [];
    for (const file of images) {
      const ext = file.name.split(".").pop();
      const path = `records/${pregnancyId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("records").upload(path, file);
      if (!uploadError) {
        const { data } = supabase.storage.from("records").getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }
    }

    const { data: record, error: insertError } = await supabase.from("records").insert({
      pregnancy_id: pregnancyId,
      author_id: user.id,
      type: "exam",
      record_date: new Date().toISOString().split("T")[0],
      visibility: "couple",
      content: { exam_type: examType, hospital, image_urls: imageUrls, doctor_note: doctorNote },
    }).select().single();

    if (insertError) {
      setError("저장 중 오류가 발생했어요.");
      setLoading(false);
      return;
    }

    router.push(imageUrls.length > 0 ? `/records/${record.id}?analyze=true` : "/home");
    router.refresh();
  };

  return (
    <RecordFormLayout title="검사 기록" emoji="🏥" onBack={() => router.back()}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FFF0F0", color: "#E53E3E" }}>{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>검사 종류</label>
          <div className="flex flex-wrap gap-2">
            {EXAM_TYPES.map((type) => (
              <button key={type} type="button" onClick={() => setExamType(type)}
                className="px-4 py-2 rounded-full border-2 text-sm transition-all"
                style={{
                  borderColor: examType === type ? "#FFB4A2" : "#EDD5C0",
                  backgroundColor: examType === type ? "#FFB4A2" : "white",
                  color: examType === type ? "white" : "#2D2A2E",
                }}>
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>병원명 (선택)</label>
          <input type="text" value={hospital} onChange={(e) => setHospital(e.target.value)}
            placeholder="예: 서울 산부인과"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>
            검사지 / 초음파 사진 <span style={{ color: "#5C5860" }}>(최대 5장)</span>
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:opacity-80"
            style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }}>
            <span className="text-3xl mb-1">📎</span>
            <span className="text-sm" style={{ color: "#5C5860" }}>
              {images.length > 0 ? `${images.length}장 선택됨` : "사진을 눌러서 추가하세요"}
            </span>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
          </label>
          {images.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {images.map((img, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img src={URL.createObjectURL(img)} alt="" className="w-16 h-16 rounded-xl object-cover" />
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
          <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>의사 코멘트 메모 (선택)</label>
          <textarea value={doctorNote} onChange={(e) => setDoctorNote(e.target.value)}
            placeholder="의사 선생님이 하신 말씀이나 궁금한 점을 적어두세요"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
            style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }} />
        </div>

        <div className="p-3 rounded-xl text-xs" style={{ backgroundColor: "#FFF5F3", color: "#5C5860" }}>
          💡 사진을 올리면 AI가 측정값을 분석해드려요 (저장 후 분석 버튼 클릭)
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#FFB4A2" }}>
          {loading ? "저장 중..." : "검사 기록 저장하기 🏥"}
        </button>
      </form>
    </RecordFormLayout>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',backgroundColor:'#FDFAF7'}}><p style={{color:'#5C5860'}}>불러오는 중...</p></div>}>
      <ExamForm />
    </Suspense>
  );
}
