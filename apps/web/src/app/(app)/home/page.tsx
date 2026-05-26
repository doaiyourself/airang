import { WeeklyContentSection } from "@/components/home/WeeklyContentSection";
import { TimelineNav } from "@/components/home/TimelineNav";
import { FloatingAddButton } from "@/components/home/FloatingAddButton";
import { AppHeader } from "@/components/home/AppHeader";
import { weeklyContentSeed } from "@/lib/seedData";

// 임시 데모 데이터 (Supabase 연결 전)
const DEMO_PREGNANCY = {
  id: "demo",
  owner_id: "demo-user",
  due_date: "2025-09-15",
  last_menstrual_period: "2024-12-09",
  baby_nickname: "봄이",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_CURRENT_WEEK = 24;

export default function HomePage() {
  const weekContent = weeklyContentSeed.find((w) => w.week_number === 20);
  const totalWeeks = 40;
  const progressPercent = Math.round((DEMO_CURRENT_WEEK / totalWeeks) * 100);
  const daysUntilDue = 168; // demo

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: "#FDFAF7" }}>
      <AppHeader babyNickname={DEMO_PREGNANCY.baby_nickname} />

      {/* Hero */}
      <section className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
        <div className="p-5 rounded-3xl shadow-sm" style={{ backgroundColor: "#FFB4A2" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white text-sm font-medium opacity-90">현재 주차</p>
              <h2 className="text-white text-4xl font-bold">{DEMO_CURRENT_WEEK}주차</h2>
              <p className="text-white text-sm opacity-90 mt-1">
                임신 6개월 · 출산까지 {daysUntilDue}일
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl">🍌</div>
              <p className="text-white text-xs opacity-80 mt-1">바나나 크기</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-white text-xs opacity-80 mb-1.5">
              <span>5주</span>
              <span>{progressPercent}%</span>
              <span>40주</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{ backgroundColor: "white", width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {DEMO_PREGNANCY.baby_nickname && (
            <p className="text-white text-sm mt-3 opacity-90">
              💕 {DEMO_PREGNANCY.baby_nickname}가 열심히 자라고 있어요
            </p>
          )}
        </div>
      </section>

      {/* Timeline Navigation */}
      <TimelineNav currentWeek={DEMO_CURRENT_WEEK} />

      {/* Weekly Content Sections */}
      <div className="px-4 max-w-2xl mx-auto space-y-4 mt-2">
        {weekContent ? (
          <WeeklyContentSection content={weekContent} week={DEMO_CURRENT_WEEK} />
        ) : (
          <WeeklyContentSection content={null} week={DEMO_CURRENT_WEEK} />
        )}
      </div>

      {/* Floating Add Button */}
      <FloatingAddButton />
    </div>
  );
}
