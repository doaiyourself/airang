"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // 코드 유효성 검사
    const { data: invite } = await supabase
      .from("invite_codes")
      .select("id, pregnancy_id, expires_at, used_by")
      .eq("code", code.toUpperCase())
      .single();

    if (!invite) {
      setError("존재하지 않는 초대 코드예요."); setLoading(false); return;
    }
    if (invite.used_by) {
      setError("이미 사용된 초대 코드예요."); setLoading(false); return;
    }
    if (new Date(invite.expires_at) < new Date()) {
      setError("만료된 초대 코드예요."); setLoading(false); return;
    }

    // 이미 이 임신에 가입되어 있는지 확인
    const { data: existing } = await supabase
      .from("family_members")
      .select("id")
      .eq("pregnancy_id", invite.pregnancy_id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      setError("이미 이 가족에 참여하고 있어요."); setLoading(false); return;
    }

    // 가족 구성원으로 추가
    const { error: insertError } = await supabase.from("family_members").insert({
      pregnancy_id: invite.pregnancy_id,
      user_id: user.id,
      role: "partner",
    });

    if (insertError) { setError("참여 중 오류가 발생했어요."); setLoading(false); return; }

    // 코드 사용 처리
    await supabase.from("invite_codes").update({
      used_by: user.id,
      used_at: new Date().toISOString(),
    }).eq("id", invite.id);

    setSuccess(true);
    setTimeout(() => router.push("/home"), 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FDFAF7" }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🌸</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "#2D2A2E" }}>가족으로 합류했어요!</h2>
          <p className="text-sm" style={{ color: "#5C5860" }}>홈으로 이동 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FDFAF7" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/home" className="text-sm" style={{ color: "#9C8FA0" }}>← 돌아가기</Link>
          <div className="text-5xl my-4">💌</div>
          <h1 className="text-xl font-bold" style={{ color: "#2D2A2E" }}>초대 코드 입력</h1>
          <p className="text-sm mt-1" style={{ color: "#5C5860" }}>파트너에게 받은 6자리 코드를 입력하세요</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FFF0F0", color: "#E53E3E" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="예: A3F9K2"
              maxLength={6}
              className="w-full px-4 py-4 rounded-xl border text-2xl text-center outline-none tracking-[0.4em] font-mono font-bold"
              style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7", color: "#FFB4A2" }}
              required
            />
            <button type="submit" disabled={loading || code.length < 6}
              className="w-full py-4 rounded-xl text-white font-semibold disabled:opacity-60"
              style={{ backgroundColor: "#FFB4A2" }}>
              {loading ? "확인 중..." : "가족으로 합류하기 💕"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><p>불러오는 중...</p></div>}>
      <JoinForm />
    </Suspense>
  );
}
