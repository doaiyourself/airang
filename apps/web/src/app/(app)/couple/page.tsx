import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CoupleMessageForm } from "@/components/couple/CoupleMessageForm";

interface Message {
  id: string;
  author_id: string;
  content: { message: string } | null;
  created_at: string;
  week_number: number | null;
}

export default async function CouplePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 임신 + 가족 구성원 조회
  const { data: memberships } = await supabase
    .from("family_members")
    .select("user_id, role, pregnancies(id, baby_nickname, owner_id)")
    .order("joined_at", { ascending: true });

  type PregData = { id: string; baby_nickname: string | null; owner_id: string };

  // 현재 유저가 속한 가장 최근 임신 찾기
  const myMembership = memberships?.find((m) => m.user_id === user.id);
  const pregRaw = myMembership?.pregnancies;
  const pregnancy = (Array.isArray(pregRaw) ? pregRaw[0] : pregRaw) as PregData | null ?? null;

  if (!pregnancy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center pb-28"
        style={{ backgroundColor: "#FDFAF7" }}>
        <p className="text-5xl mb-4">💌</p>
        <p className="font-bold text-lg mb-2" style={{ color: "#2D2A2E" }}>임신 정보가 없어요</p>
        <p className="text-sm mb-6" style={{ color: "#9C8FA0" }}>먼저 임신 정보를 등록해주세요</p>
        <Link href="/home" className="px-6 py-3 rounded-xl text-white font-semibold text-sm"
          style={{ backgroundColor: "#FFB4A2" }}>
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  // 이 임신에 속한 모든 구성원
  const partners = memberships?.filter((m) =>
    m.user_id !== user.id &&
    (Array.isArray(m.pregnancies)
      ? m.pregnancies.some((p: PregData) => p.id === pregnancy.id)
      : (m.pregnancies as PregData | null)?.id === pregnancy.id)
  ) ?? [];

  // 커플 메시지 조회
  const { data: rawMessages } = await supabase
    .from("records")
    .select("id, author_id, content, created_at, week_number")
    .eq("pregnancy_id", pregnancy.id)
    .eq("type", "couple_diary")
    .order("created_at", { ascending: true });

  const messages = (rawMessages ?? []) as Message[];

  return (
    <div className="min-h-screen flex flex-col pb-28" style={{ backgroundColor: "#FDFAF7" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b px-4 py-3"
        style={{ backgroundColor: "#FDFAF7", borderColor: "#F5EBE0" }}>
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex-1">
            <h1 className="font-bold text-base" style={{ color: "#2D2A2E" }}>💌 커플 비밀 일기</h1>
            <p className="text-xs" style={{ color: "#9C8FA0" }}>
              {partners.length > 0 ? "우리 둘만 볼 수 있어요" : "파트너가 아직 없어요"}
            </p>
          </div>
          {partners.length === 0 && (
            <Link href="/family"
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: "#FFB4A2" }}>
              파트너 초대
            </Link>
          )}
        </div>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-5xl mb-3">💝</p>
            <p className="font-medium text-sm mb-1" style={{ color: "#2D2A2E" }}>
              아직 대화가 없어요
            </p>
            <p className="text-xs" style={{ color: "#9C8FA0" }}>
              파트너에게 첫 메시지를 보내보세요
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => {
              const isMe = msg.author_id === user.id;
              const content = msg.content as { message: string } | null;
              if (!content?.message) return null;

              const showDate = idx === 0 ||
                new Date(messages[idx - 1].created_at).toDateString() !== new Date(msg.created_at).toDateString();

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-3">
                      <span className="px-3 py-1 rounded-full text-xs"
                        style={{ backgroundColor: "#F5EBE0", color: "#9C8FA0" }}>
                        {new Date(msg.created_at).toLocaleDateString("ko-KR", {
                          month: "long", day: "numeric", weekday: "short",
                        })}
                      </span>
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    {/* 아바타 */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: isMe ? "#FFB4A2" : "#B5E4CA" }}>
                      {isMe ? "👤" : "💑"}
                    </div>

                    <div className={`flex flex-col gap-1 max-w-[72%] ${isMe ? "items-end" : "items-start"}`}>
                      {/* 말풍선 */}
                      <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                        style={{
                          backgroundColor: isMe ? "#FFB4A2" : "white",
                          color: isMe ? "white" : "#2D2A2E",
                          border: isMe ? "none" : "1px solid #F5EBE0",
                          borderRadius: isMe ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                        }}>
                        {content.message}
                      </div>

                      {/* 메타 */}
                      <div className={`flex items-center gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                        {msg.week_number && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: "#F5EBE0", color: "#9C8FA0" }}>
                            {msg.week_number}주
                          </span>
                        )}
                        <span className="text-xs" style={{ color: "#C4B8B0" }}>
                          {new Date(msg.created_at).toLocaleTimeString("ko-KR", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 입력 폼 (고정) */}
      <div className="fixed left-0 right-0 z-40 border-t px-4 py-3"
        style={{
          backgroundColor: "white",
          borderColor: "#F5EBE0",
          bottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
        }}>
        <div className="max-w-lg mx-auto">
          <CoupleMessageForm pregnancyId={pregnancy.id} />
        </div>
      </div>
    </div>
  );
}
