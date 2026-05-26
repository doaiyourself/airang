import { createClient } from "@/lib/supabase/server";
import { PublicVerticalTimeline } from "@/components/timeline/PublicVerticalTimeline";
import Link from "next/link";

function calculateWeek(lmp: string): number {
  const lmpDate = new Date(lmp);
  const today = new Date();
  const daysElapsed = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(daysElapsed / 7) + 1);
}

export default async function TimelinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let currentWeek: number | null = null;
  let recordsByWeek: Record<number, string[]> = {};
  let pregnancyId: string | null = null;

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
      currentWeek = calculateWeek(pregnancy.last_menstrual_period);

      const { data: records } = await supabase
        .from("records")
        .select("week_number, type")
        .eq("pregnancy_id", pregnancy.id);

      (records ?? []).forEach((r) => {
        if (r.week_number) {
          if (!recordsByWeek[r.week_number]) recordsByWeek[r.week_number] = [];
          recordsByWeek[r.week_number].push(r.type);
        }
      });
    }
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "#FDFAF7" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: "#FDFAF7", borderColor: "#F5EBE0" }}>
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-xl">🌸</span>
            <span className="text-lg font-bold" style={{ color: "#2D2A2E" }}>아이랑</span>
          </Link>
        </div>
        {user ? (
          <Link href="/home"
            className="px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: "#F5EBE0", color: "#2D2A2E" }}>
            홈으로
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ color: "#5C5860" }}>
              로그인
            </Link>
            <Link href="/signup"
              className="px-4 py-1.5 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: "#FFB4A2" }}>
              시작하기
            </Link>
          </div>
        )}
      </header>

      {/* 타이틀 */}
      <div className="px-4 pt-6 pb-2 text-center max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#2D2A2E" }}>
          40주 임신 여정 🌸
        </h1>
        <p className="text-sm" style={{ color: "#5C5860" }}>
          {user
            ? "나의 임신 기록과 함께 40주를 확인해보세요"
            : "5주부터 40주까지, 아기의 성장 이야기를 만나보세요"}
        </p>
        {!user && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
            style={{ backgroundColor: "#FFF5F3", color: "#FFB4A2" }}>
            <span>🔒</span>
            <span>9주차부터는 로그인 후 무료로 볼 수 있어요</span>
          </div>
        )}
      </div>

      <PublicVerticalTimeline
        currentWeek={currentWeek}
        recordsByWeek={recordsByWeek}
        pregnancyId={pregnancyId}
        isLoggedIn={!!user}
      />
    </div>
  );
}
