import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FDFAF7" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="text-xl font-bold" style={{ color: "#2D2A2E" }}>아이랑</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-medium rounded-full transition-colors" style={{ color: "#2D2A2E" }}>
            로그인
          </Link>
          <Link href="/signup" className="px-5 py-2 text-sm font-semibold rounded-full text-white transition-colors" style={{ backgroundColor: "#FFB4A2" }}>
            시작하기
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-3xl mx-auto">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: "#B5E4CA", color: "#2D2A2E" }}>
          <span>✨</span>
          <span>AI와 함께하는 임신 다이어리</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ color: "#2D2A2E" }}>
          아이랑 — 우리의 280일을<br />
          <span style={{ color: "#FFB4A2" }}>함께 기록해요</span>
        </h1>
        <p className="text-lg leading-relaxed mb-10" style={{ color: "#5C5860" }}>
          임신 5주부터 40주까지, 아기의 성장과 엄마의 이야기를 기록하세요.<br />
          AI가 초음파와 검사 결과를 분석해주고, 가족과 함께 나눌 수 있어요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className="px-8 py-4 text-base font-semibold rounded-2xl text-white transition-all hover:opacity-90 shadow-lg" style={{ backgroundColor: "#FFB4A2" }}>
            무료로 시작하기 🌸
          </Link>
          <Link href="/timeline" className="px-8 py-4 text-base font-semibold rounded-2xl transition-all hover:opacity-90" style={{ backgroundColor: "#F5EBE0", color: "#2D2A2E" }}>
            40주 가이드 보기
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/timeline" className="p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#2D2A2E" }}>40주 공식 가이드</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#5C5860" }}>
              매 주차마다 아기의 성장과 엄마 몸의 변화를 친절하게 알려드려요.
              체크리스트와 검진 안내도 함께 제공해요.
            </p>
            <p className="text-xs mt-3 font-medium" style={{ color: "#FFB4A2" }}>타임라인 보기 →</p>
          </Link>

          <div className="p-6 rounded-3xl shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#2D2A2E" }}>AI 초음파 분석</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#5C5860" }}>
              초음파 사진을 올리면 Claude AI가 측정값을 분석하고 정상 범위와 비교해드려요.
              검사지도 한국어로 쉽게 설명해줘요.
            </p>
          </div>

          <div className="p-6 rounded-3xl shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="text-4xl mb-4">👨‍👩‍👧</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#2D2A2E" }}>가족 함께 공유</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#5C5860" }}>
              초대 코드로 아빠, 양가 부모님과 함께해요. 부부만의 비밀 일기도 따로 쓸 수 있어요.
            </p>
          </div>
        </div>
      </section>

      {/* Weekly Timeline Preview */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="p-8 rounded-3xl" style={{ backgroundColor: "#F5EBE0" }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold" style={{ color: "#2D2A2E" }}>📅 40주 타임라인</h2>
            <Link href="/timeline" className="text-sm font-medium px-4 py-1.5 rounded-full" style={{ backgroundColor: "#FFB4A2", color: "white" }}>
              전체 보기 →
            </Link>
          </div>
          <p className="text-sm mb-8" style={{ color: "#5C5860" }}>임신 5주부터 40주까지, 매 주차의 이야기를 기록해요</p>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {[5, 8, 12, 16, 20, 24, 28, 32, 36, 40].map((week) => (
              <Link
                key={week}
                href={week <= 8 ? `/week/${week}` : `/timeline`}
                className="flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-105"
                style={{
                  backgroundColor: week === 12 ? "#FFB4A2" : "#FFFFFF",
                  color: week === 12 ? "#FFFFFF" : "#2D2A2E",
                }}
              >
                <span className="text-lg">
                  {week <= 8 ? "🌱" : week <= 16 ? "🍋" : week <= 24 ? "🌽" : week <= 32 ? "🥥" : week <= 39 ? "🍉" : "👶"}
                </span>
                <span className="text-xs font-medium">{week}주</span>
                {week > 8 && <span className="text-xs opacity-60">🔒</span>}
              </Link>
            ))}
          </div>
          <p className="text-xs mt-4 text-center" style={{ color: "#9C8FA0" }}>5~8주는 로그인 없이 무료로 볼 수 있어요</p>
        </div>
      </section>

      {/* Record Types */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: "#2D2A2E" }}>✏️ 5가지 기록</h2>
        <p className="text-center text-sm mb-10" style={{ color: "#5C5860" }}>일기부터 검사 기록까지, 임신의 모든 순간을 담아요</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: "📔", label: "일기", desc: "감정과 이야기" },
            { icon: "📸", label: "사진", desc: "배 사진, 초음파" },
            { icon: "🏥", label: "검사", desc: "AI 자동 분석" },
            { icon: "🤒", label: "증상", desc: "몸 상태 기록" },
            { icon: "💭", label: "감정", desc: "오늘의 기분" },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-2xl text-center" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-semibold mb-1" style={{ color: "#2D2A2E" }}>{item.label}</div>
              <div className="text-xs" style={{ color: "#5C5860" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4" style={{ color: "#2D2A2E" }}>지금 바로 시작해요 🌸</h2>
        <p className="text-base mb-8" style={{ color: "#5C5860" }}>
          소중한 40주의 이야기를 아이랑과 함께 써내려가요.<br />
          출산 후에도 다이어리북으로 평생 간직할 수 있어요.
        </p>
        <Link href="/signup" className="inline-block px-10 py-4 text-lg font-semibold rounded-2xl text-white transition-all hover:opacity-90 shadow-lg" style={{ backgroundColor: "#FFB4A2" }}>
          무료로 시작하기
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center border-t" style={{ borderColor: "#F5EBE0" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span>🌸</span>
          <span className="font-bold" style={{ color: "#2D2A2E" }}>아이랑</span>
        </div>
        <p className="text-xs" style={{ color: "#5C5860" }}>
          모든 AI 분석은 참고용이며 의학적 진단이 아닙니다. 반드시 산부인과 전문의와 상담하세요.
        </p>
      </footer>
    </main>
  );
}
