import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { weeklyGuide } from "@/lib/weeklyGuide";

const FREE_WEEKS_LIMIT = 8;

const TYPE_ICONS: Record<string, string> = {
  diary: "📔", photo: "📸", exam: "🏥", symptom: "🤒", emotion: "💭",
};

const TYPE_LABELS: Record<string, string> = {
  diary: "일기", photo: "사진", exam: "검진", symptom: "증상", emotion: "감정",
};

interface Props {
  params: Promise<{ number: string }>;
}

export default async function WeekDetailPage({ params }: Props) {
  const { number } = await params;
  const week = parseInt(number, 10);

  if (isNaN(week) || week < 5 || week > 40) {
    redirect("/timeline");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && week > FREE_WEEKS_LIMIT) {
    redirect("/signup");
  }

  const guide = weeklyGuide.find((g) => g.week_number === week) ?? null;

  // For logged-in users, fetch pregnancy + records
  let pregnancyId: string | null = null;
  let weekRecords: Array<{ id: string; type: string; content: string | null; created_at: string }> = [];
  let currentWeek: number | null = null;

  if (user) {
    const { data: membership } = await supabase
      .from("family_members")
      .select("pregnancies(id, last_menstrual_period)")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false })
      .limit(1)
      .single();

    type PregData = { id: string; last_menstrual_period: string };
    const pregRaw = membership?.pregnancies;
    const pregnancy = (Array.isArray(pregRaw) ? pregRaw[0] : pregRaw) as PregData | null ?? null;

    if (pregnancy) {
      pregnancyId = pregnancy.id;
      const lmpDate = new Date(pregnancy.last_menstrual_period);
      const today = new Date();
      const daysElapsed = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
      currentWeek = Math.max(1, Math.floor(daysElapsed / 7) + 1);

      const { data: records } = await supabase
        .from("records")
        .select("id, type, content, created_at")
        .eq("pregnancy_id", pregnancy.id)
        .eq("week_number", week)
        .order("created_at", { ascending: false });

      weekRecords = records ?? [];
    }
  }

  const isCurrent = currentWeek === week;
  const isPast = currentWeek !== null && week < currentWeek;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "#FDFAF7" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: "#FDFAF7", borderColor: "#F5EBE0" }}>
        <Link href="/timeline" className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "#5C5860" }}>
          ← 타임라인
        </Link>
        {!user ? (
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-3 py-1.5 rounded-full text-sm" style={{ color: "#5C5860" }}>
              로그인
            </Link>
            <Link href="/signup" className="px-3 py-1.5 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: "#FFB4A2" }}>
              시작하기
            </Link>
          </div>
        ) : (
          <Link href="/home" className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: "#F5EBE0", color: "#2D2A2E" }}>
            홈으로
          </Link>
        )}
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        {/* Hero */}
        <div className="rounded-3xl p-6 text-center"
          style={{ backgroundColor: isCurrent ? "#FFF5F3" : "#F5EBE0" }}>
          <div className="text-6xl mb-3">{guide?.baby_info.size_comparison ? getEmoji(week) : "🌸"}</div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-bold" style={{ color: "#2D2A2E" }}>
              {week}주차
            </h1>
            {isCurrent && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: "#FFB4A2" }}>
                지금
              </span>
            )}
            {isPast && !isCurrent && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: "#B5E4CA", color: "#2D2A2E" }}>
                지난 주차
              </span>
            )}
          </div>
          {guide && (
            <>
              <p className="text-base mb-3" style={{ color: "#5C5860" }}>
                {guide.baby_info.size_comparison} 크기예요
              </p>
              <div className="flex items-center justify-center gap-4 text-sm" style={{ color: "#9C8FA0" }}>
                {guide.baby_info.length_cm > 0 && <span>키 {guide.baby_info.length_cm}cm</span>}
                {guide.baby_info.weight_g > 0 && (
                  <span>
                    몸무게 {guide.baby_info.weight_g < 1000
                      ? `${guide.baby_info.weight_g}g`
                      : `${(guide.baby_info.weight_g / 1000).toFixed(1)}kg`}
                  </span>
                )}
              </div>
            </>
          )}
          {guide?.exam_info && (
            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full"
              style={{ backgroundColor: "#B5E4CA" }}>
              <span>🏥</span>
              <span className="text-sm font-medium" style={{ color: "#2D2A2E" }}>{guide.exam_info.name}</span>
            </div>
          )}
        </div>

        {guide ? (
          <>
            {/* Essay */}
            <div className="rounded-3xl p-5" style={{ backgroundColor: "white", border: "1px solid #F5EBE0" }}>
              <p className="text-sm leading-relaxed" style={{ color: "#5C5860" }}>
                {guide.essay}
              </p>
            </div>

            {/* Baby development */}
            <div className="rounded-3xl p-5" style={{ backgroundColor: "white", border: "1px solid #F5EBE0" }}>
              <h2 className="text-sm font-bold mb-3" style={{ color: "#2D2A2E" }}>
                👶 아기 발달
              </h2>
              <ul className="space-y-2">
                {guide.baby_info.development.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#5C5860" }}>
                    <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#FFB4A2" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mom changes */}
            <div className="rounded-3xl p-5" style={{ backgroundColor: "white", border: "1px solid #F5EBE0" }}>
              <h2 className="text-sm font-bold mb-3" style={{ color: "#2D2A2E" }}>
                🤱 엄마 몸의 변화
              </h2>
              <div className="space-y-2">
                {[...guide.mom_info.body_changes, ...guide.mom_info.common_symptoms].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "#5C5860" }}>
                    <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#B5E4CA" }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Exam info */}
            {guide.exam_info && (
              <div className="rounded-3xl p-5" style={{ backgroundColor: "#FFF5F3", border: "1px solid #FFB4A2" }}>
                <h2 className="text-sm font-bold mb-2" style={{ color: "#2D2A2E" }}>
                  🏥 {guide.exam_info.name}
                </h2>
                <p className="text-xs mb-2" style={{ color: "#9C8FA0" }}>시기: {guide.exam_info.timing}</p>
                <p className="text-sm" style={{ color: "#5C5860" }}>{guide.exam_info.purpose}</p>
              </div>
            )}

            {/* Checklist */}
            <div className="rounded-3xl p-5" style={{ backgroundColor: "white", border: "1px solid #F5EBE0" }}>
              <h2 className="text-sm font-bold mb-3" style={{ color: "#2D2A2E" }}>
                ✅ 이번 주 할 일
              </h2>
              <ul className="space-y-2">
                {guide.checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#5C5860" }}>
                    <span className="w-4 h-4 rounded border flex-shrink-0 mt-0.5"
                      style={{ borderColor: "#EDD5C0" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="rounded-3xl p-5 text-center" style={{ backgroundColor: "white", border: "1px solid #F5EBE0" }}>
            <p className="text-sm" style={{ color: "#9C8FA0" }}>이 주차의 가이드를 준비 중이에요 🌸</p>
          </div>
        )}

        {/* My records (logged in) */}
        {user && (
          <div className="rounded-3xl p-5" style={{ backgroundColor: "white", border: "1px solid #F5EBE0" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold" style={{ color: "#2D2A2E" }}>📔 나의 기록</h2>
              {weekRecords.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#B5E4CA", color: "#2D2A2E" }}>
                  {weekRecords.length}개
                </span>
              )}
            </div>
            {weekRecords.length > 0 ? (
              <div className="space-y-2">
                {weekRecords.map((record) => (
                  <div key={record.id}
                    className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ backgroundColor: "#FDFAF7" }}>
                    <span className="text-xl">{TYPE_ICONS[record.type] ?? "📄"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: "#9C8FA0" }}>
                        {TYPE_LABELS[record.type] ?? record.type}
                      </p>
                      {record.content && (
                        <p className="text-sm truncate" style={{ color: "#5C5860" }}>
                          {typeof record.content === "string" ? record.content : JSON.stringify(record.content)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: "#C4B8B0" }}>
                      {new Date(record.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-2" style={{ color: "#C4B8B0" }}>아직 기록이 없어요</p>
            )}
          </div>
        )}

        {/* Login CTA */}
        {!user && (
          <div className="rounded-3xl p-5 text-center" style={{ backgroundColor: "white", border: "2px solid #FFB4A2" }}>
            <div className="text-3xl mb-2">🌸</div>
            <p className="font-bold text-sm mb-1" style={{ color: "#2D2A2E" }}>나의 임신 기록을 남겨보세요</p>
            <p className="text-xs mb-4" style={{ color: "#5C5860" }}>
              일기, 사진, 검진 기록을 40주 내내 간직할 수 있어요
            </p>
            <Link href="/signup"
              className="block w-full py-3 rounded-xl text-white font-semibold text-sm"
              style={{ backgroundColor: "#FFB4A2" }}>
              무료로 시작하기
            </Link>
          </div>
        )}

        {/* Week navigation */}
        <div className="flex justify-between pt-2 pb-4">
          {week > 5 ? (
            <Link href={`/week/${week - 1}`}
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: "#F5EBE0", color: "#5C5860" }}>
              ← {week - 1}주차
            </Link>
          ) : <div />}
          {week < 40 ? (
            <Link
              href={!user && week + 1 > FREE_WEEKS_LIMIT ? "/signup" : `/week/${week + 1}`}
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: "#F5EBE0", color: "#5C5860" }}>
              {week + 1}주차 →
            </Link>
          ) : <div />}
        </div>
      </div>

      {/* FAB */}
      {user && pregnancyId && (
        <div className="fixed bottom-20 right-6 z-50">
          <Link
            href={`/records/new/diary?week=${week}`}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold text-sm shadow-lg"
            style={{ backgroundColor: "#FFB4A2" }}>
            <span className="text-lg">+</span>
            기록 추가
          </Link>
        </div>
      )}
    </div>
  );
}

function getEmoji(week: number): string {
  const map: Record<number, string> = {
    5: "🌱", 6: "🌱", 7: "🫐", 8: "🫐",
    9: "🍇", 10: "🍓", 11: "🍋", 12: "🍋",
    13: "🍑", 14: "🍑", 15: "🥭", 16: "🥭",
    17: "🍐", 18: "🍐", 19: "🥑", 20: "🍌",
    21: "🍌", 22: "🌽", 23: "🌽", 24: "🌽",
    25: "🥦", 26: "🥦", 27: "🥬", 28: "🍆",
    29: "🍆", 30: "🥕", 31: "🥕", 32: "🥥",
    33: "🥥", 34: "🍍", 35: "🍍", 36: "🍉",
    37: "🍉", 38: "🎃", 39: "🎃", 40: "👶",
  };
  return map[week] ?? "🌸";
}
