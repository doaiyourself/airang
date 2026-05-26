import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WeeklyContentSection } from "@/components/home/WeeklyContentSection";
import { TimelineNav } from "@/components/home/TimelineNav";
import { FloatingAddButton } from "@/components/home/FloatingAddButton";
import { AppHeader } from "@/components/home/AppHeader";
import { weeklyContentSeed } from "@/lib/seedData";

function calculateWeek(lmp: string): { week: number; daysUntilDue: number } {
  const lmpDate = new Date(lmp);
  const today = new Date();
  const daysElapsed = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.max(1, Math.floor(daysElapsed / 7) + 1);
  const dueDate = new Date(lmpDate);
  dueDate.setDate(dueDate.getDate() + 280);
  const daysUntilDue = Math.max(0, Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  return { week, daysUntilDue };
}

const WEEK_FRUIT: Record<number, string> = {
  5: "씨앗", 8: "블루베리", 10: "딸기", 12: "라임", 16: "아보카도",
  20: "바나나", 24: "옥수수", 28: "가지", 32: "코코넛", 36: "파파야", 40: "수박",
};

function getFruitLabel(week: number): string {
  const keys = Object.keys(WEEK_FRUIT).map(Number).sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (week >= keys[i]) return WEEK_FRUIT[keys[i]];
  }
  return "씨앗";
}

function getFruitEmoji(week: number): string {
  if (week <= 8) return "🫐";
  if (week <= 10) return "🍓";
  if (week <= 14) return "🍋";
  if (week <= 20) return "🍌";
  if (week <= 24) return "🌽";
  if (week <= 30) return "🍆";
  if (week <= 35) return "🥥";
  if (week <= 38) return "🍉";
  return "👶";
}

function getPregnancyStage(week: number): string {
  const month = Math.ceil(week / 4);
  if (week <= 13) return `임신 ${month}개월 · 초기`;
  if (week <= 27) return `임신 ${month}개월 · 중기`;
  return `임신 ${month}개월 · 후기`;
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 사용자의 pregnancy 조회
  const { data: membership } = await supabase
    .from("family_members")
    .select("pregnancy_id, role, pregnancies(id, baby_nickname, last_menstrual_period, due_date, owner_id)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })
    .limit(1)
    .single();

  type PregnancyData = {
    id: string;
    baby_nickname: string | null;
    last_menstrual_period: string;
    due_date: string;
    owner_id: string;
  };
  const pregnancyRaw = membership?.pregnancies;
  const pregnancy = (Array.isArray(pregnancyRaw) ? pregnancyRaw[0] : pregnancyRaw) as PregnancyData | null ?? null;

  if (!pregnancy) redirect("/onboarding");

  const { week: currentWeek, daysUntilDue } = calculateWeek(pregnancy.last_menstrual_period);
  const progressPercent = Math.min(100, Math.round((currentWeek / 40) * 100));

  // 현재 주차 콘텐츠 (시드에서 가장 가까운 주차)
  const seedWeeks = weeklyContentSeed.map((w) => w.week_number);
  const closestWeek = seedWeeks.reduce((prev, curr) =>
    Math.abs(curr - currentWeek) < Math.abs(prev - currentWeek) ? curr : prev
  );
  const weekContent = weeklyContentSeed.find((w) => w.week_number === closestWeek);

  // 현재 주차 기록 조회
  const { data: records } = await supabase
    .from("records")
    .select("id, type, record_date, content, visibility, created_at")
    .eq("pregnancy_id", pregnancy.id)
    .eq("week_number", currentWeek)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: "#FDFAF7" }}>
      <AppHeader babyNickname={pregnancy.baby_nickname} userId={user.id} />

      {/* Hero */}
      <section className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
        <div className="p-5 rounded-3xl shadow-sm" style={{ backgroundColor: "#FFB4A2" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white text-sm font-medium opacity-90">현재 주차</p>
              <h2 className="text-white text-4xl font-bold">{currentWeek}주차</h2>
              <p className="text-white text-sm opacity-90 mt-1">
                {getPregnancyStage(currentWeek)} · 출산까지 {daysUntilDue}일
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl">{getFruitEmoji(currentWeek)}</div>
              <p className="text-white text-xs opacity-80 mt-1">{getFruitLabel(currentWeek)} 크기</p>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-white text-xs opacity-80 mb-1.5">
              <span>5주</span>
              <span>{progressPercent}%</span>
              <span>40주</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
              <div className="h-2 rounded-full" style={{ backgroundColor: "white", width: `${progressPercent}%` }} />
            </div>
          </div>

          {pregnancy.baby_nickname && (
            <p className="text-white text-sm mt-3 opacity-90">
              💕 {pregnancy.baby_nickname}가 열심히 자라고 있어요
            </p>
          )}
        </div>
      </section>

      {/* Timeline Navigation */}
      <TimelineNav currentWeek={currentWeek} />

      {/* Weekly Content */}
      <div className="px-4 max-w-2xl mx-auto space-y-4 mt-2">
        <WeeklyContentSection
          content={weekContent}
          week={currentWeek}
          records={records ?? []}
          pregnancyId={pregnancy.id}
        />
      </div>

      <FloatingAddButton pregnancyId={pregnancy.id} />
    </div>
  );
}
