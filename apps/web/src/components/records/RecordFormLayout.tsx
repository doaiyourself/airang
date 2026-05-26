"use client";

interface RecordFormLayoutProps {
  title: string;
  emoji: string;
  onBack: () => void;
  week?: number | null;
  onWeekChange?: (week: number) => void;
  children: React.ReactNode;
}

export function RecordFormLayout({ title, emoji, onBack, week, onWeekChange, children }: RecordFormLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFAF7" }}>
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b"
        style={{ backgroundColor: "#FDFAF7", borderColor: "#F5EBE0" }}>
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: "#F5EBE0" }}>
          ←
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl">{emoji}</span>
          <span className="font-semibold text-base" style={{ color: "#2D2A2E" }}>{title}</span>
        </div>
        {week != null && (
          <div className="flex items-center gap-1">
            {onWeekChange && week > 5 && (
              <button type="button" onClick={() => onWeekChange(week - 1)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: "#F5EBE0", color: "#5C5860" }}>
                ‹
              </button>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: "#FFB4A2" }}>
              {week}주차
            </span>
            {onWeekChange && week < 40 && (
              <button type="button" onClick={() => onWeekChange(week + 1)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: "#F5EBE0", color: "#5C5860" }}>
                ›
              </button>
            )}
          </div>
        )}
      </header>

      <div className="px-4 py-6 max-w-xl mx-auto">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
