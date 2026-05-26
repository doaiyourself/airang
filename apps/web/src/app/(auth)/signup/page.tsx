"use client";

import Link from "next/link";
import { useState } from "react";

type Step = "account" | "pregnancy" | "done";
const STEPS = ["account", "pregnancy"] as const;

export default function SignupPage() {
  const [step, setStep] = useState<Step>("account");
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

  const handleAccountNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.role === "invite") {
      setStep("done");
    } else {
      setStep("pregnancy");
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FDFAF7" }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🌸</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#2D2A2E" }}>환영해요!</h2>
          <p className="text-sm mb-6" style={{ color: "#5C5860" }}>이제 아이랑과 함께 소중한 시간을 기록해요</p>
          <Link
            href="/home"
            className="inline-block px-8 py-3 rounded-xl text-white font-semibold text-sm"
            style={{ backgroundColor: "#FFB4A2" }}
          >
            시작하기
          </Link>
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

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((s) => (
            <div
              key={s}
              className="w-2 h-2 rounded-full transition-colors"
              style={{ backgroundColor: step === s ? "#FFB4A2" : "#EDD5C0" }}
            />
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          {step === "account" && (
            <form onSubmit={handleAccountNext} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2D2A2E" }}>
                  닉네임
                </label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="예: 봄이 엄마"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2D2A2E" }}>
                  이메일
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2D2A2E" }}>
                  비밀번호
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="8자 이상"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }}
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>
                  어떻게 참여하세요?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "mother", label: "🤰", desc: "임신 정보 직접 등록" },
                    { value: "invite", label: "💌", desc: "초대 코드로 가족 가입" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: opt.value as "mother" | "invite" })}
                      className="p-3 rounded-xl border-2 text-center transition-all"
                      style={{
                        borderColor: form.role === opt.value ? "#FFB4A2" : "#EDD5C0",
                        backgroundColor: form.role === opt.value ? "#FFF5F3" : "#FDFAF7",
                      }}
                    >
                      <div className="text-2xl mb-1">{opt.label}</div>
                      <div className="text-xs" style={{ color: "#5C5860" }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {form.role === "invite" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#2D2A2E" }}>
                    초대 코드
                  </label>
                  <input
                    type="text"
                    value={form.inviteCode}
                    onChange={(e) => setForm({ ...form, inviteCode: e.target.value.toUpperCase() })}
                    placeholder="예: A3F9K2"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none tracking-widest text-center font-mono"
                    style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 mt-2"
                style={{ backgroundColor: "#FFB4A2" }}
              >
                {form.role === "invite" ? "가족으로 참여하기" : "다음"}
              </button>
            </form>
          )}

          {step === "pregnancy" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("done");
              }}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2D2A2E" }}>
                  태명 (선택)
                </label>
                <input
                  type="text"
                  value={form.babyNickname}
                  onChange={(e) => setForm({ ...form, babyNickname: e.target.value })}
                  placeholder="예: 봄이, 해님이"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A2E" }}>
                  주차 계산 방법
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { value: "lmp", label: "마지막 생리일" },
                    { value: "due", label: "예정일" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, lmpOrDue: opt.value as "lmp" | "due" })}
                      className="py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                      style={{
                        borderColor: form.lmpOrDue === opt.value ? "#FFB4A2" : "#EDD5C0",
                        backgroundColor: form.lmpOrDue === opt.value ? "#FFF5F3" : "#FDFAF7",
                        color: "#2D2A2E",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  value={form.lmpOrDue === "lmp" ? form.lmp : form.dueDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [form.lmpOrDue === "lmp" ? "lmp" : "dueDate"]: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }}
                  required
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setStep("account")}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border"
                  style={{ borderColor: "#EDD5C0", color: "#5C5860" }}
                >
                  이전
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ backgroundColor: "#FFB4A2" }}
                >
                  시작하기 🌸
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: "#F5EBE0" }}>
            <p className="text-sm" style={{ color: "#5C5860" }}>
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="font-semibold" style={{ color: "#FFB4A2" }}>
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
