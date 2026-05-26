"use client";

interface RecordFormLayoutProps {
  title: string;
  emoji: string;
  onBack: () => void;
  children: React.ReactNode;
}

export function RecordFormLayout({ title, emoji, onBack, children }: RecordFormLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFAF7" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b"
        style={{ backgroundColor: "#FDFAF7", borderColor: "#F5EBE0" }}>
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: "#F5EBE0" }}>
          ←
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <span className="font-semibold text-base" style={{ color: "#2D2A2E" }}>{title}</span>
        </div>
      </header>

      <div className="px-4 py-6 max-w-xl mx-auto">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
