"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Supabase auth
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FDFAF7" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🌸</span>
            <span className="text-2xl font-bold" style={{ color: "#2D2A2E" }}>아이랑</span>
          </Link>
          <h1 className="text-xl font-bold" style={{ color: "#2D2A2E" }}>다시 만나서 반가워요 👋</h1>
          <p className="text-sm mt-1" style={{ color: "#5C5860" }}>로그인하고 오늘의 이야기를 기록해요</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#2D2A2E" }}>
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
                style={{ borderColor: "#EDD5C0", backgroundColor: "#FDFAF7" }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ backgroundColor: "#FFB4A2" }}
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: "#F5EBE0" }}>
            <p className="text-sm" style={{ color: "#5C5860" }}>
              아직 계정이 없으신가요?{" "}
              <Link href="/signup" className="font-semibold" style={{ color: "#FFB4A2" }}>
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
