import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { PushNotificationToggle } from "@/components/profile/PushNotificationToggle";

function calculateWeek(lmp: string) {
  const lmpDate = new Date(lmp);
  const today = new Date();
  const daysElapsed = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.max(1, Math.min(40, Math.floor(daysElapsed / 7) + 1));
  const dueDate = new Date(lmpDate);
  dueDate.setDate(dueDate.getDate() + 280);
  const daysUntilDue = Math.max(0, Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  return { week, dueDate, daysUntilDue };
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("family_members")
    .select("role, pregnancies(id, baby_nickname, last_menstrual_period, owner_id)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })
    .limit(1)
    .single();

  type PregData = { id: string; baby_nickname: string | null; last_menstrual_period: string; owner_id: string };
  const pregRaw = membership?.pregnancies;
  const pregnancy = (Array.isArray(pregRaw) ? pregRaw[0] : pregRaw) as PregData | null ?? null;

  const { count: totalRecordCount } = await supabase
    .from("records")
    .select("id", { count: "exact", head: true })
    .eq("pregnancy_id", pregnancy?.id ?? "");

  const pregStats = pregnancy ? calculateWeek(pregnancy.last_menstrual_period) : null;

  const displayName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "사용자";
  const isOwner = pregnancy?.owner_id === user.id;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "#FDFAF7" }}>
      {/* Header */}
      <header className="px-4 pt-12 pb-6 text-center"
        style={{ background: "linear-gradient(180deg, #FFF5F3 0%, #FDFAF7 100%)" }}>
        <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl"
          style={{ backgroundColor: "#FFB4A2" }}>
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : "👤"}
        </div>
        <h1 className="font-bold text-xl mb-0.5" style={{ color: "#2D2A2E" }}>{displayName}</h1>
        <p className="text-sm" style={{ color: "#9C8FA0" }}>{user.email}</p>
        {membership?.role && (
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: "#F5EBE0", color: "#5C5860" }}>
            {isOwner ? "👑 임신부" : "👥 가족 구성원"}
          </span>
        )}
      </header>

      <div className="max-w-lg mx-auto px-4 space-y-4">
        {/* 임신 정보 */}
        {pregStats && pregnancy && (
          <div className="rounded-3xl p-5" style={{ backgroundColor: "white", border: "1px solid #F5EBE0" }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: "#2D2A2E" }}>🤰 임신 정보</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl" style={{ backgroundColor: "#FFF5F3" }}>
                <p className="text-2xl font-bold" style={{ color: "#FFB4A2" }}>{pregStats.week}</p>
                <p className="text-xs mt-0.5" style={{ color: "#9C8FA0" }}>현재 주차</p>
              </div>
              <div className="p-3 rounded-2xl" style={{ backgroundColor: "#F0FFF8" }}>
                <p className="text-2xl font-bold" style={{ color: "#B5E4CA" }}>{pregStats.daysUntilDue}</p>
                <p className="text-xs mt-0.5" style={{ color: "#9C8FA0" }}>출산까지 (일)</p>
              </div>
              <div className="p-3 rounded-2xl" style={{ backgroundColor: "#F5F0FF" }}>
                <p className="text-2xl font-bold" style={{ color: "#C8B8E8" }}>{totalRecordCount ?? 0}</p>
                <p className="text-xs mt-0.5" style={{ color: "#9C8FA0" }}>총 기록 수</p>
              </div>
            </div>
            {pregnancy.baby_nickname && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ backgroundColor: "#FFF5F3" }}>
                <span className="text-lg">👶</span>
                <span className="text-sm font-medium" style={{ color: "#2D2A2E" }}>
                  아기 이름: {pregnancy.baby_nickname}
                </span>
              </div>
            )}
            <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ backgroundColor: "#F5EBE0" }}>
              <span className="text-sm" style={{ color: "#5C5860" }}>
                출산 예정일: {pregStats.dueDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          </div>
        )}

        {/* 메뉴 */}
        <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "white", border: "1px solid #F5EBE0" }}>
          <Link href="/records"
            className="flex items-center justify-between px-5 py-4 border-b transition-opacity hover:opacity-70"
            style={{ borderColor: "#F5EBE0" }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">📔</span>
              <span className="text-sm font-medium" style={{ color: "#2D2A2E" }}>나의 기록</span>
            </div>
            <span style={{ color: "#C4B8B0" }}>›</span>
          </Link>
          <Link href="/timeline"
            className="flex items-center justify-between px-5 py-4 border-b transition-opacity hover:opacity-70"
            style={{ borderColor: "#F5EBE0" }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">📅</span>
              <span className="text-sm font-medium" style={{ color: "#2D2A2E" }}>40주 타임라인</span>
            </div>
            <span style={{ color: "#C4B8B0" }}>›</span>
          </Link>
          <Link href="/couple"
            className="flex items-center justify-between px-5 py-4 transition-opacity hover:opacity-70">
            <div className="flex items-center gap-3">
              <span className="text-xl">💌</span>
              <span className="text-sm font-medium" style={{ color: "#2D2A2E" }}>커플 비밀 일기</span>
            </div>
            <span style={{ color: "#C4B8B0" }}>›</span>
          </Link>
        </div>

        {/* 알림 설정 */}
        <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "white", border: "1px solid #F5EBE0" }}>
          <PushNotificationToggle />
        </div>

        {/* 로그아웃 */}
        <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "white", border: "1px solid #F5EBE0" }}>
          <LogoutButton />
        </div>

        <p className="text-center text-xs pb-2" style={{ color: "#C4B8B0" }}>아이랑 v0.1.0 · 40주, 우리가 함께 쓰는 일기</p>
      </div>
    </div>
  );
}
