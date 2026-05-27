"use client";

import { useState } from "react";

export function InviteCodeCard() {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const res = await fetch("/api/invite/generate", { method: "POST" });
    const data = await res.json();
    if (data.code) {
      setCode(data.code);
      setExpiresAt(data.expires_at);
    }
    setLoading(false);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="rounded-3xl p-5" style={{ backgroundColor: "#FFF5F3", border: "2px solid #FFB4A2" }}>
      <h2 className="text-sm font-bold mb-1" style={{ color: "#2D2A2E" }}>🔗 초대 코드</h2>
      <p className="text-xs mb-4" style={{ color: "#9C8FA0" }}>
        파트너/가족에게 코드를 공유하면 함께 기록할 수 있어요
      </p>

      {!code ? (
        <button onClick={handleGenerate} disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
          style={{ backgroundColor: "#FFB4A2" }}>
          {loading ? "생성 중..." : "초대 코드 만들기"}
        </button>
      ) : (
        <div className="space-y-3">
          {/* 코드 표시 */}
          <div className="flex items-center justify-between p-4 rounded-2xl"
            style={{ backgroundColor: "white", border: "1px solid #FFB4A2" }}>
            <span className="text-3xl font-bold tracking-[0.3em] font-mono" style={{ color: "#FFB4A2" }}>
              {code}
            </span>
            <button onClick={() => handleCopy(code)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ backgroundColor: "#FFB4A2", color: "white" }}>
              {copied ? "복사됨 ✓" : "복사"}
            </button>
          </div>

          {/* 만료일 */}
          {daysLeft !== null && (
            <p className="text-xs text-center" style={{ color: "#9C8FA0" }}>
              {daysLeft > 0 ? `${daysLeft}일 후 만료` : "오늘 만료"}
            </p>
          )}

          {/* 링크 공유 */}
          <button
            onClick={() => handleCopy(`https://airang.vercel.app/signup?code=${code}`)}
            className="w-full py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "white", border: "1px solid #FFB4A2", color: "#FFB4A2" }}>
            {copied ? "링크 복사됨 ✓" : "📎 가입 링크 복사하기"}
          </button>

          {/* 새 코드 생성 */}
          <button onClick={handleGenerate} disabled={loading}
            className="w-full py-2 text-xs"
            style={{ color: "#9C8FA0" }}>
            새 코드 만들기
          </button>
        </div>
      )}
    </div>
  );
}
