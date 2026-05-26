import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const TYPE_INFO: Record<string, { icon: string; label: string; bg: string; accent: string }> = {
  diary:   { icon: "📔", label: "일기",   bg: "#FFF5F3", accent: "#FFB4A2" },
  photo:   { icon: "📸", label: "사진",   bg: "#F0F8FF", accent: "#7EC8E3" },
  exam:    { icon: "🏥", label: "검진",   bg: "#F0FFF8", accent: "#B5E4CA" },
  symptom: { icon: "🤒", label: "증상",   bg: "#FFF8F0", accent: "#FFD166" },
  emotion: { icon: "💭", label: "감정",   bg: "#F5F0FF", accent: "#C8B8E8" },
};

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function RecordsPage({ searchParams }: Props) {
  const { type: typeFilter } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("family_members")
    .select("pregnancies(id)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })
    .limit(1)
    .single();

  type PregData = { id: string };
  const pregRaw = membership?.pregnancies;
  const pregnancy = (Array.isArray(pregRaw) ? pregRaw[0] : pregRaw) as PregData | null ?? null;

  let records: Array<{
    id: string;
    type: string;
    week_number: number | null;
    record_date: string;
    content: Record<string, unknown> | null;
    created_at: string;
  }> = [];

  if (pregnancy) {
    let query = supabase
      .from("records")
      .select("id, type, week_number, record_date, content, created_at")
      .eq("pregnancy_id", pregnancy.id)
      .order("created_at", { ascending: false });

    if (typeFilter && TYPE_INFO[typeFilter]) {
      query = query.eq("type", typeFilter);
    }

    const { data } = await query;
    records = data ?? [];
  }

  const counts = Object.fromEntries(
    Object.keys(TYPE_INFO).map((t) => [t, records.filter((r) => r.type === t).length])
  );

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FDFAF7" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: "#FDFAF7", borderColor: "#F5EBE0" }}>
        <Link href="/home" className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "#5C5860" }}>
          ← 홈
        </Link>
        <h1 className="font-bold text-base" style={{ color: "#2D2A2E" }}>나의 기록</h1>
        <div className="w-12" />
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        {/* 타입 필터 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <Link href="/records"
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all"
            style={{
              borderColor: !typeFilter ? "#FFB4A2" : "#EDD5C0",
              backgroundColor: !typeFilter ? "#FFB4A2" : "white",
              color: !typeFilter ? "white" : "#5C5860",
            }}>
            전체 {records.length > 0 && !typeFilter ? `${records.length}` : ""}
          </Link>
          {Object.entries(TYPE_INFO).map(([type, info]) => (
            <Link key={type}
              href={typeFilter === type ? "/records" : `/records?type=${type}`}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all"
              style={{
                borderColor: typeFilter === type ? info.accent : "#EDD5C0",
                backgroundColor: typeFilter === type ? info.bg : "white",
                color: "#2D2A2E",
              }}>
              <span>{info.icon}</span>
              <span>{info.label}</span>
              {counts[type] > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: info.accent, color: "white" }}>
                  {counts[type]}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* 기록 없음 */}
        {records.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm font-medium mb-1" style={{ color: "#2D2A2E" }}>
              {typeFilter ? `${TYPE_INFO[typeFilter]?.label} 기록이 없어요` : "아직 기록이 없어요"}
            </p>
            <p className="text-xs mb-5" style={{ color: "#9C8FA0" }}>첫 기록을 남겨보세요</p>
            <Link href="/home"
              className="inline-block px-5 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: "#FFB4A2" }}>
              기록 추가하기
            </Link>
          </div>
        )}

        {/* 기록 목록 */}
        {records.length > 0 && (
          <div className="space-y-3">
            {records.map((record) => {
              const info = TYPE_INFO[record.type] ?? { icon: "📄", label: record.type, bg: "#F5F5F5", accent: "#CCC" };
              const content = record.content as Record<string, unknown> | null;
              const preview = getPreview(record.type, content);

              return (
                <Link key={record.id} href={`/records/${record.id}`}
                  className="flex items-start gap-3 p-4 rounded-2xl border transition-all hover:opacity-80"
                  style={{ backgroundColor: "white", borderColor: "#F5EBE0" }}>
                  {/* 아이콘 */}
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ backgroundColor: info.bg }}>
                    {info.icon}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold" style={{ color: info.accent }}>{info.label}</span>
                      {record.week_number && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: "#F5EBE0", color: "#5C5860" }}>
                          {record.week_number}주차
                        </span>
                      )}
                    </div>
                    {preview && (
                      <p className="text-sm truncate" style={{ color: "#2D2A2E" }}>{preview}</p>
                    )}
                    {record.type === "photo" && content != null && Array.isArray(content.photo_urls) && (content.photo_urls as string[]).length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {(content.photo_urls as string[]).slice(0, 3).map((url, i) => (
                          <img key={i} src={url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                        ))}
                        {(content.photo_urls as string[]).length > 3 && (
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: "#F5EBE0", color: "#5C5860" }}>
                            +{(content.photo_urls as string[]).length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 날짜 */}
                  <span className="text-xs flex-shrink-0" style={{ color: "#C4B8B0" }}>
                    {new Date(record.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/home"
          className="flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold text-sm shadow-lg"
          style={{ backgroundColor: "#FFB4A2" }}>
          <span className="text-lg">+</span>
          기록 추가
        </Link>
      </div>
    </div>
  );
}

function getPreview(type: string, content: Record<string, unknown> | null): string {
  if (!content) return "";
  switch (type) {
    case "diary":    return (content.body as string) ?? "";
    case "emotion":  return [(content.emoji as string) ?? "", (content.memo as string) ?? ""].filter(Boolean).join(" ");
    case "symptom":  return Array.isArray(content.tags) ? (content.tags as string[]).join(", ") : "";
    case "exam":     return [(content.exam_type as string) ?? "", (content.hospital as string) ?? ""].filter(Boolean).join(" · ");
    case "photo":    return (content.caption as string) ?? (content.category as string) ?? "";
    default:         return "";
  }
}
