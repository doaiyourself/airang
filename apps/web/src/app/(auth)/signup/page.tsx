"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "account" | "pregnancy" | "done";
const STEPS = ["account", "pregnancy"] as const;

export default function SignupPage() {
  const [step, setStep] = useState<Step>("account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "mother" as "mother" | "invite",
    babyNickname: "",
    lmp: "",
    dueDate: "",
    lmpOrDue: "lmp" as "lmp" | "due",
    inviteCode: "",
  });
  const router = useRouter();

  const handleAccountNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    // 1. 회원가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { display_name: form.displayName },
      },
    });

    if (authError) {
      setError(authError.message === "User already registered"
        ? "이미 사용 중인 이메일이에요."
        : "회원가입 중 오류가 발생했어요.");
      setLoading(false);
      return;
    }

    if (form.role === "invite") {
      if (!form.inviteCode) {
        setError("초대 코드를 입력해주세요.");
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data: invite } = await supabase
        .from("invite_codes")
        .select("id, pregnancy_id, expires_at, used_by")
        .eq("code", form.inviteCode.toUpperCase())
        .single();

      if (!invite || invite.used_by || new Date(invite.expires_at) < new Date()) {
        setError("유효하지 않은 초대 코드예요.");
        setLoading(false);
        return;
      }

      await supabase.from("family_members").insert({
        pregnancy_id: invite.pregnancy_id,
        user_id: authData.user!.id,
        role: "partner",
      });

      await supabase.from("invite_codes").update({
        used_by: authData.user!.id,
        used_at: new Date().toISOString(),
      }).eq("id", invite.id);

      setStep("done");
      setTimeout(() => router.push("/home"), 1500);
    } else {
      setStep("pregnancy");
    }

    setLoading(false);
  };

  const handlePregnancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("세션이 만료됐어요. 다시 로그인해주세요.");
      setLoading(false);
      return;
    }

    // 마지막 생리일 또는 예정일로 두 날짜 모두 계산
    let lmp: string;
    let dueDate: string;

    if (form.lmpOrDue === "lmp") {
      lmp = form.lmp;
      const lmpDate = new Date(form.lmp);
      lmpDate.setDate(lmpDate.getDate() + 280);
      dueDate = lmpDate.toISOString().split("T")[0];
    } else {
      dueDate = form.dueDate;
      const dueDateObj = new Date(form.dueDate);
      dueDateObj.setDate(dueDateObj.getDate() - 280);
      lmp = dueDateObj.toISOString().split("T")[0];
    }

    // pregnancies 생성
    const { data: pregnancy, error: pregError } = await supabase
      .from("pregnancies")
      .insert({
        owner_id: user.id,
        due_date: dueDate,
        last_menstrual_period: lmp,
        baby_nickname: form.babyNickname || null,
      })
      .select()
      .single();

    if (pregError || !pregnancy) {
      setError("임신 정보 저장 중 오류가 발생했어요.");
      setLoading(false);
      return;
    }

    // family_members에 mother로 추가
    await supabase.from("family_members").insert({
      pregnancy_id: pregnancy.id,
      user_id: user.id,
      role: "mother",
    });

    setStep("done");
    setLoading(false);
    setTimeout(() => router.push("/home"), 1500);
  };

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FDFAF7" }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🌸</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#2D2A2E" }}>환영해요!</h2>
          <p className="text-sm mb-6" style={{ color: "#5C5860" }}>이제 아이랑과 함께 소중한 시간을 기록해요</p>
          <div className="text-sm" style={{ color: "#5C5860" }}>홈으로 이동 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FDFAF7" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🌸</span>
            <span className="text-2xl font-bold" style={{ color: "#2D2A2E" }}>아이랑</span>
          </Link>
          <h1 className="text-xl font-bold" style={{ color: "#2D2A2E" }}>
            {step === "account" ? "아이랑을 시작해요 🌱" : "임신 정보를 알려주세요 🤰"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#5C5860" }}>
            {step === "account" ? "계정을 만들어보세요" : "주차 계산에 필요해요"}
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((s) => (
            <div key={s} className="w-2 h-2 rounded-full transition-colors"
              style={{ backgroundColor: step === s ? "#FFB4A2" : "#EDD5C0" }} />
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FFF0F0", color: "#E53E3E" }}>
              {error}
            </div>
          )}

          {step === "account" && (
            <form onSubmit={handleAccountNext} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2D2A2E" }}>닉네임</label>
                <input type="text" value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="예: 봄이 엄마"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }} required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2D2A2E" }}>이메일</label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }} required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2D2A2E" }}>비밀번호</label>
                <input type="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="8자 이상"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }}
                  minLength={8} required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>어떻게 참여하세요?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "mother", label: "🤰", desc: "임신 정보 직접 등록" },
                    { value: "invite", label: "💌", desc: "초대 코드로 가족 가입" },
                  ].map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => setForm({ ...form, role: opt.value as "mother" | "invite" })}
                      className="p-3 rounded-xl border-2 text-center transition-all"
                      style={{
                        borderColor: form.role === opt.value ? "#FFB4A2" : "#EDD5C0",
                        backgroundColor: form.role === opt.value ? "#FFF5F3" : "#FDFAF7",
                      }}>
                      <div className="text-2xl mb-1">{opt.label}</div>
                      <div className="text-xs" style={{ color: "#5C5860" }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {form.role === "invite" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#2D2A2E" }}>초대 코드</label>
                  <input type="text" value={form.inviteCode}
                    onChange={(e) => setForm({ ...form, inviteCode: e.target.value.toUpperCase() })}
                    placeholder="예: A3F9K2" maxLength={6}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none tracking-widest text-center font-mono"
                    style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }} required />
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 mt-2"
                style={{ backgroundColor: "#FFB4A2" }}>
                {loading ? "처리 중..." : form.role === "invite" ? "가족으로 참여하기" : "다음"}
              </button>
            </form>
          )}

          {step === "pregnancy" && (
            <form onSubmit={handlePregnancySubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2D2A2E" }}>태명 (선택)</label>
                <input type="text" value={form.babyNickname}
                  onChange={(e) => setForm({ ...form, babyNickname: e.target.value })}
                  placeholder="예: 봄이, 해님이"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>주차 계산 방법</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { value: "lmp", label: "마지막 생리일" },
                    { value: "due", label: "예정일" },
                  ].map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => setForm({ ...form, lmpOrDue: opt.value as "lmp" | "due" })}
                      className="py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                      style={{
                        borderColor: form.lmpOrDue === opt.value ? "#FFB4A2" : "#EDD5C0",
                        backgroundColor: form.lmpOrDue === opt.value ? "#FFF5F3" : "#FDFAF7",
                        color: "#2D2A2E",
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <input type="date"
                  value={form.lmpOrDue === "lmp" ? form.lmp : form.dueDate}
                  onChange={(e) => setForm({ ...form, [form.lmpOrDue === "lmp" ? "lmp" : "dueDate"]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }} required />
              </div>

              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setStep("account")}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border"
                  style={{ borderColor: "#EDD5C0", color: "#5C5860" }}>
                  이전
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
                  style={{ backgroundColor: "#FFB4A2" }}>
                  {loading ? "저장 중..." : "시작하기 🌸"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: "#F5EBE0" }}>
            <p className="text-sm" style={{ color: "#5C5860" }}>
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="font-semibold" style={{ color: "#FFB4A2" }}>로그인</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
