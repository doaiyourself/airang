import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

const TYPE_INFO: Record<string, { icon: string; label: string; bg: string; accent: string }> = {
  diary:   { icon: "📔", label: "일기",   bg: "#FFF5F3", accent: "#FFB4A2" },
  photo:   { icon: "📸", label: "사진",   bg: "#F0F8FF", accent: "#7EC8E3" },
  exam:    { icon: "🏥", label: "검진",   bg: "#F0FFF8", accent: "#B5E4CA" },
  symptom: { icon: "🤒", label: "증상",   bg: "#FFF8F0", accent: "#FFD166" },
  emotion: { icon: "💭", label: "감정",   bg: "#F5F0FF", accent: "#C8B8E8" },
};

const INTENSITY_LABELS = ["", "아주 약해요", "약해요", "보통이에요", "심해요", "아주 심해요"];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RecordDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: record } = await supabase
    .from("records")
    .select("id, type, week_number, record_date, content, visibility, created_at, author_id")
    .eq("id", id)
    .single();

  if (!record) notFound();

  const info = TYPE_INFO[record.type] ?? { icon: "📄", label: record.type, bg: "#F5F5F5", accent: "#CCC" };
  const content = record.content as Record<string, unknown> | null;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FDFAF7" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b"
        style={{ backgroundColor: "#FDFAF7", borderColor: "#F5EBE0" }}>
        <Link href="/records"
          className="w-9 h-9 flex items-center justify-center rounded-full text-lg flex-shrink-0"
          style={{ backgroundColor: "#F5EBE0" }}>
          ←
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl">{info.icon}</span>
          <span className="font-semibold text-base" style={{ color: "#2D2A2E" }}>{info.label}</span>
        </div>
        {record.week_number && (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: "#FFB4A2" }}>
            {record.week_number}주차
          </span>
        )}
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        {/* 메타 정보 */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-base"
            style={{ backgroundColor: info.bg }}>
            {info.icon}
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: info.accent }}>{info.label}</p>
            <p className="text-xs" style={{ color: "#9C8FA0" }}>
              {new Date(record.created_at).toLocaleDateString("ko-KR", {
                year: "numeric", month: "long", day: "numeric", weekday: "short",
              })}
            </p>
          </div>
          {record.week_number && (
            <Link href={`/week/${record.week_number}`}
              className="ml-auto text-xs px-3 py-1 rounded-full"
              style={{ backgroundColor: "#F5EBE0", color: "#5C5860" }}>
              {record.week_number}주차 가이드 →
            </Link>
          )}
        </div>

        {/* 내용 카드 */}
        <div className="rounded-3xl p-5 space-y-4" style={{ backgroundColor: "white", border: "1px solid #F5EBE0" }}>
          {record.type === "diary" && content && (
            <>
              {content.emotion && (
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{content.emotion as string}</span>
                  <span className="text-sm" style={{ color: "#5C5860" }}>오늘의 기분</span>
                </div>
              )}
              {content.body && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#2D2A2E" }}>
                  {content.body as string}
                </p>
              )}
              {content.visibility && (
                <p className="text-xs" style={{ color: "#9C8FA0" }}>
                  {content.visibility === "family" ? "👨‍👩‍👧 가족 공개" : content.visibility === "couple" ? "💑 부부 공개" : "🔒 나만 보기"}
                </p>
              )}
            </>
          )}

          {record.type === "emotion" && content && (
            <>
              {content.emoji && <div className="text-5xl text-center py-2">{content.emoji as string}</div>}
              {content.memo && (
                <p className="text-sm text-center" style={{ color: "#5C5860" }}>{content.memo as string}</p>
              )}
            </>
          )}

          {record.type === "symptom" && content && (
            <>
              {Array.isArray(content.tags) && content.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(content.tags as string[]).map((tag) => (
                    <span key={tag} className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ backgroundColor: "#FFB4A2", color: "white" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {content.intensity && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: "#2D2A2E" }}>강도</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-5 h-5 rounded-full"
                        style={{
                          backgroundColor: (content.intensity as number) >= i ? "#FFB4A2" : "#F5EBE0",
                        }} />
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: "#5C5860" }}>
                    {INTENSITY_LABELS[content.intensity as number] ?? ""}
                  </span>
                </div>
              )}
              {content.memo && (
                <p className="text-sm" style={{ color: "#5C5860" }}>{content.memo as string}</p>
              )}
            </>
          )}

          {record.type === "exam" && content && (
            <>
              {content.exam_type && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: "#B5E4CA" }}>
                    🏥 {content.exam_type as string}
                  </span>
                </div>
              )}
              {content.hospital && (
                <p className="text-sm" style={{ color: "#5C5860" }}>📍 {content.hospital as string}</p>
              )}
              {Array.isArray(content.image_urls) && content.image_urls.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {(content.image_urls as string[]).map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full rounded-2xl object-cover" style={{ aspectRatio: "4/3" }} />
                  ))}
                </div>
              )}
              {content.doctor_note && (
                <div className="p-3 rounded-xl" style={{ backgroundColor: "#FDFAF7", border: "1px solid #F5EBE0" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "#9C8FA0" }}>의사 코멘트</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#2D2A2E" }}>{content.doctor_note as string}</p>
                </div>
              )}
            </>
          )}

          {record.type === "photo" && content && (
            <>
              {Array.isArray(content.photo_urls) && content.photo_urls.length > 0 && (
                <div className="space-y-2">
                  {(content.photo_urls as string[]).map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full rounded-2xl object-cover" />
                  ))}
                </div>
              )}
              {content.caption && (
                <p className="text-sm" style={{ color: "#5C5860" }}>{content.caption as string}</p>
              )}
              {content.category && (
                <p className="text-xs" style={{ color: "#9C8FA0" }}>
                  {content.category === "belly" ? "🤰 배 사진" :
                   content.category === "ultrasound" ? "🩻 초음파" :
                   content.category === "daily" ? "📷 일상" : "🏥 검진"}
                </p>
              )}
            </>
          )}
        </div>

        {/* 돌아가기 */}
        <div className="flex gap-3">
          <Link href="/records"
            className="flex-1 py-3 rounded-xl text-sm font-medium text-center"
            style={{ backgroundColor: "#F5EBE0", color: "#5C5860" }}>
            목록으로
          </Link>
          {record.week_number && (
            <Link href={`/week/${record.week_number}`}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-center"
              style={{ backgroundColor: "#FFB4A2", color: "white" }}>
              {record.week_number}주차 보기
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
