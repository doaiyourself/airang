import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TimelineNav } from "@/components/home/TimelineNav";
import { FloatingAddButton } from "@/components/home/FloatingAddButton";
import { AppHeader } from "@/components/home/AppHeader";
import { weeklyGuide } from "@/lib/weeklyGuide";
import Link from "next/link";

function calculateWeek(lmp: string): { week: number; daysUntilDue: number; dueDate: Date } {
  const lmpDate = new Date(lmp);
  const today = new Date();
  const daysElapsed = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.max(1, Math.floor(daysElapsed / 7) + 1);
  const dueDate = new Date(lmpDate);
  dueDate.setDate(dueDate.getDate() + 280);
  const daysUntilDue = Math.max(0, Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  return { week, daysUntilDue, dueDate };
}

function getStageLabel(week: number): string {
  if (week <= 13) return "초기";
  if (week <= 27) return "중기";
  return "후기";
}

function getNextExam(currentWeek: number) {
  const upcoming = weeklyGuide
    .filter((g) => g.week_number >= currentWeek && g.exam_info)
    .sort((a, b) => a.week_number - b.week_number);
  return upcoming[0] ?? null;
}

const TYPE_INFO: Record<string, { icon: string; label: string; color: string }> = {
  diary:   { icon: "📔", label: "일기",   color: "#FFF5F3" },
  photo:   { icon: "📸", label: "사진",   color: "#F0F8FF" },
  exam:    { icon: "🏥", label: "검진",   color: "#F0FFF8" },
  symptom: { icon: "🤒", label: "증상",   color: "#FFF8F0" },
  emotion: { icon: "💭", label: "감정",   color: "#F5F0FF" },
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("family_members")
    .select("pregnancy_id, role, pregnancies(id, baby_nickname, last_menstrual_period, due_date, owner_id)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })
    .limit(1)
    .single();

  type PregnancyData = { id: string; baby_nickname: string | null; last_menstrual_period: string; due_date: string; owner_id: string };
  const pregnancyRaw = membership?.pregnancies;
  const pregnancy = (Array.isArray(pregnancyRaw) ? pregnancyRaw[0] : pregnancyRaw) as PregnancyData | null ?? null;
  if (!pregnancy) redirect("/onboarding");

  const { week: currentWeek, daysUntilDue, dueDate } = calculateWeek(pregnancy.last_menstrual_period);
  const progressPercent = Math.min(100, Math.round(((currentWeek - 5) / 35) * 100));

  const guide = weeklyGuide.find((g) => g.week_number === currentWeek)
    ?? weeklyGuide.reduce((prev, curr) =>
      Math.abs(curr.week_number - currentWeek) < Math.abs(prev.week_number - currentWeek) ? curr : prev
    );

  const nextExam = getNextExam(currentWeek);

  // 최근 기록 5개 (전체 주차)
  const { data: recentRecords } = await supabase
    .from("records")
    .select("id, type, week_number, content, created_at")
    .eq("pregnancy_id", pregnancy.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // 현재 주차 기록 수
  const { count: thisWeekCount } = await supabase
    .from("records")
    .select("id", { count: "exact", head: true })
    .eq("pregnancy_id", pregnancy.id)
    .eq("week_number", currentWeek);

  const dueDateStr = dueDate.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: "#FDFAF7" }}>
      <AppHeader babyNickname={pregnancy.baby_nickname} userId={user.id} />

      {/* Hero */}
      <section className="px-4 pt-6 pb-2 max-w-2xl mx-auto">
        <div className="p-5 rounded-3xl" style={{ background: "linear-gradient(135deg, #FFB4A2 0%, #FF8FA3 100%)" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white text-xs font-medium opacity-80 mb-0.5">{getStageLabel(currentWeek)} · {Math.ceil(currentWeek / 4)}개월차</p>
              <h2 className="text-white text-5xl font-bold leading-none">{currentWeek}<span className="text-2xl font-semibold ml-1">주차</span></h2>
              {pregnancy.baby_nickname && (
                <p className="text-white text-sm opacity-90 mt-1.5">💕 {pregnancy.baby_nickname}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-5xl">{guide.baby_info.size_comparison.includes("참깨") ? "🌱" : "🌸"}</div>
              <p className="text-white text-xs opacity-80 mt-1">{guide.baby_info.size_comparison}</p>
              {guide.baby_info.weight_g > 0 && (
                <p className="text-white text-xs opacity-70">
                  {guide.baby_info.weight_g < 1000 ? `${guide.baby_info.weight_g}g` : `${(guide.baby_info.weight_g / 1000).toFixed(1)}kg`}
                </p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-white text-xs opacity-70 mb-1">
              <span>5주</span>
              <span>출산까지 {daysUntilDue}일 ({dueDateStr})</span>
              <span>40주</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
              <div className="h-2 rounded-full transition-all" style={{ backgroundColor: "white", width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* 빠른 기록 */}
      <section className="px-4 pt-4 pb-2 max-w-2xl mx-auto">
        <p className="text-xs font-semibold mb-2.5 px-1" style={{ color: "#9C8FA0" }}>오늘 기록하기</p>
        <div className="grid grid-cols-5 gap-2">
          {(["diary","photo","exam","symptom","emotion"] as const).map((type) => {
            const info = TYPE_INFO[type];
            return (
              <Link key={type} href={`/records/new/${type}?week=${currentWeek}`}
                className="flex flex-col items-center gap-1 py-3 rounded-2xl transition-all hover:scale-105"
                style={{ backgroundColor: info.color }}>
                <span className="text-2xl">{info.icon}</span>
                <span className="text-xs font-medium" style={{ color: "#5C5860" }}>{info.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Timeline Navigation */}
      <TimelineNav currentWeek={currentWeek} />

      <div className="px-4 max-w-2xl mx-auto space-y-4 mt-2">

        {/* 이번 주 아기 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: "#FFF5F3" }}>🍼</div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: "#2D2A2E" }}>이번 주 아기</h3>
              <p className="text-xs" style={{ color: "#9C8FA0" }}>{guide.baby_info.size_comparison} 크기</p>
            </div>
            <Link href={`/week/${currentWeek}`} className="ml-auto text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "#F5EBE0", color: "#5C5860" }}>
              자세히 →
            </Link>
          </div>
          <div className="flex gap-4 mb-3 p-3 rounded-xl" style={{ backgroundColor: "#FFF5F3" }}>
            {guide.baby_info.length_cm > 0 && (
              <div className="text-center flex-1">
                <p className="text-xl font-bold" style={{ color: "#FFB4A2" }}>{guide.baby_info.length_cm}cm</p>
                <p className="text-xs" style={{ color: "#9C8FA0" }}>키</p>
              </div>
            )}
            {guide.baby_info.length_cm > 0 && guide.baby_info.weight_g > 0 && (
              <div className="w-px" style={{ backgroundColor: "#EDD5C0" }} />
            )}
            {guide.baby_info.weight_g > 0 && (
              <div className="text-center flex-1">
                <p className="text-xl font-bold" style={{ color: "#FFB4A2" }}>
                  {guide.baby_info.weight_g < 1000 ? `${guide.baby_info.weight_g}g` : `${(guide.baby_info.weight_g / 1000).toFixed(1)}kg`}
                </p>
                <p className="text-xs" style={{ color: "#9C8FA0" }}>몸무게</p>
              </div>
            )}
          </div>
          <ul className="space-y-1.5">
            {guide.baby_info.development.slice(0, 3).map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#5C5860" }}>
                <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#FFB4A2" }} />
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* 이번 주 이야기 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: "#F0FFF8" }}>📖</div>
            <h3 className="font-semibold text-sm" style={{ color: "#2D2A2E" }}>이번 주 이야기</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#5C5860" }}>{guide.essay}</p>
        </div>

        {/* 체크리스트 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: "#F5EBE0" }}>✅</div>
            <h3 className="font-semibold text-sm" style={{ color: "#2D2A2E" }}>이번 주 할 일</h3>
          </div>
          <ul className="space-y-2">
            {guide.checklist.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: "#B5E4CA" }} />
                <span className="text-sm" style={{ color: "#2D2A2E" }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 다가오는 검진 */}
        {nextExam && (
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFF5F3", border: "1px solid #FFB4A2" }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏥</span>
              <div>
                <p className="text-xs font-medium" style={{ color: "#9C8FA0" }}>
                  {nextExam.week_number === currentWeek ? "이번 주 검진" : `${nextExam.week_number}주차 검진`}
                </p>
                <h3 className="font-bold text-sm" style={{ color: "#2D2A2E" }}>{nextExam.exam_info!.name}</h3>
              </div>
              {nextExam.week_number > currentWeek && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: "#FFB4A2", color: "white" }}>
                  {nextExam.week_number - currentWeek}주 후
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: "#9C8FA0" }}>시기: {nextExam.exam_info!.timing}</p>
            <p className="text-sm mt-1" style={{ color: "#5C5860" }}>{nextExam.exam_info!.purpose}</p>
          </div>
        )}

        {/* 최근 기록 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: "#F5EBE0" }}>📝</div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: "#2D2A2E" }}>나의 기록</h3>
                <p className="text-xs" style={{ color: "#9C8FA0" }}>이번 주 {thisWeekCount ?? 0}개</p>
              </div>
            </div>
            <Link href="/records" className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "#F5EBE0", color: "#5C5860" }}>
              전체 보기 →
            </Link>
          </div>

          {recentRecords && recentRecords.length > 0 ? (
            <ul className="space-y-2">
              {recentRecords.map((record) => {
                const info = TYPE_INFO[record.type] ?? { icon: "📄", label: record.type, color: "#F5EBE0" };
                const contentText = typeof record.content === "object" && record.content !== null
                  ? (record.content as Record<string, unknown>).text as string ?? (record.content as Record<string, unknown>).note as string ?? ""
                  : String(record.content ?? "");
                return (
                  <li key={record.id}>
                    <Link href={`/records/${record.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: "#FDFAF7" }}>
                      <span className="text-xl">{info.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium" style={{ color: "#9C8FA0" }}>{info.label}</span>
                          <span className="text-xs" style={{ color: "#C4B8B0" }}>{record.week_number}주차</span>
                        </div>
                        {contentText && (
                          <p className="text-sm truncate" style={{ color: "#5C5860" }}>{contentText}</p>
                        )}
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: "#C4B8B0" }}>
                        {new Date(record.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">✏️</p>
              <p className="text-sm" style={{ color: "#5C5860" }}>아직 기록이 없어요.<br />오늘의 이야기를 남겨볼까요?</p>
            </div>
          )}
        </div>

      </div>

      <FloatingAddButton pregnancyId={pregnancy.id} />
    </div>
  );
}
