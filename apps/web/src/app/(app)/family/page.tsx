import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { InviteCodeCard } from "@/components/family/InviteCodeCard";

const ROLE_LABEL: Record<string, string> = {
  mother: "👑 임신부",
  partner: "💑 파트너",
  family: "👨‍👩‍👧 가족",
};

export default async function FamilyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("family_members")
    .select("pregnancy_id, role, pregnancies(id, baby_nickname, owner_id)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })
    .limit(1)
    .single();

  type PregData = { id: string; baby_nickname: string | null; owner_id: string };
  const pregRaw = membership?.pregnancies;
  const pregnancy = (Array.isArray(pregRaw) ? pregRaw[0] : pregRaw) as PregData | null ?? null;

  if (!pregnancy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center pb-28"
        style={{ backgroundColor: "#FDFAF7" }}>
        <p className="text-5xl mb-4">👨‍👩‍👧</p>
        <p className="font-bold text-lg mb-2" style={{ color: "#2D2A2E" }}>임신 정보가 없어요</p>
        <Link href="/home" className="px-6 py-3 rounded-xl text-white font-semibold text-sm"
          style={{ backgroundColor: "#FFB4A2" }}>홈으로</Link>
      </div>
    );
  }

  // 가족 구성원 조회
  const { data: members } = await supabase
    .from("family_members")
    .select("user_id, role, joined_at")
    .eq("pregnancy_id", pregnancy.id)
    .order("joined_at", { ascending: true });

  // 각 멤버의 이메일/이름 조회
  const memberDetails: Array<{ user_id: string; role: string; display_name: string; joined_at: string }> = [];
  for (const m of members ?? []) {
    const { data: profile } = await supabase.auth.admin?.getUserById?.(m.user_id).catch?.(() => ({ data: null })) ?? { data: null };
    memberDetails.push({
      user_id: m.user_id,
      role: m.role,
      display_name: m.user_id === user.id ? "나" : `멤버`,
      joined_at: m.joined_at,
    });
  }

  const isOwner = pregnancy.owner_id === user.id;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "#FDFAF7" }}>
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: "#FDFAF7", borderColor: "#F5EBE0" }}>
        <Link href="/home" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#5C5860" }}>
          ← 홈
        </Link>
        <h1 className="font-bold text-base" style={{ color: "#2D2A2E" }}>가족 관리</h1>
        <div className="w-12" />
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        {/* 가족 구성원 */}
        <div className="rounded-3xl p-5" style={{ backgroundColor: "white", border: "1px solid #F5EBE0" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "#2D2A2E" }}>
            👨‍👩‍👧 구성원 {memberDetails.length}명
            {pregnancy.baby_nickname && (
              <span className="ml-2 font-normal" style={{ color: "#9C8FA0" }}>· {pregnancy.baby_nickname} 가족</span>
            )}
          </h2>
          <div className="space-y-3">
            {memberDetails.map((m) => (
              <div key={m.user_id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: m.user_id === user.id ? "#FFB4A2" : "#B5E4CA" }}>
                  {m.user_id === user.id ? "👤" : "👥"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "#2D2A2E" }}>{m.display_name}</p>
                  <p className="text-xs" style={{ color: "#9C8FA0" }}>{ROLE_LABEL[m.role] ?? m.role}</p>
                </div>
                {m.user_id === user.id && (
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#F5EBE0", color: "#5C5860" }}>나</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 초대 코드 카드 */}
        <InviteCodeCard />

        {/* 이미 계정이 있는 경우 코드 입력 */}
        <div className="rounded-3xl p-5" style={{ backgroundColor: "white", border: "1px solid #F5EBE0" }}>
          <h2 className="text-sm font-bold mb-2" style={{ color: "#2D2A2E" }}>💌 초대 코드 받으셨나요?</h2>
          <p className="text-xs mb-3" style={{ color: "#9C8FA0" }}>파트너에게 초대 코드를 받았으면 입력해서 가족으로 합류하세요</p>
          <Link href="/join"
            className="block w-full py-3 rounded-xl text-center text-sm font-medium"
            style={{ backgroundColor: "#F5EBE0", color: "#2D2A2E" }}>
            초대 코드 입력하기
          </Link>
        </div>
      </div>
    </div>
  );
}
