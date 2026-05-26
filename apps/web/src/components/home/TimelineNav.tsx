"use client";

import Link from "next/link";

const WEEK_EMOJIS: Record<number, string> = {
  5: "🌱", 6: "🌱", 7: "🌱", 8: "🫐",
  9: "🍇", 10: "🍓", 11: "🍋", 12: "🍋",
  13: "🍑", 14: "🍑", 15: "🥭", 16: "🥭",
  17: "🍐", 18: "🍐", 19: "🥑", 20: "🍌",
  21: "🍌", 22: "🌽", 23: "🌽", 24: "🌽",
  25: "🥦", 26: "🥦", 27: "🥬", 28: "🍆",
  29: "🍆", 30: "🥕", 31: "🥕", 32: "🥥",
  33: "🥥", 34: "🍍", 35: "🍍", 36: "🍉",
  37: "🍉", 38: "🎃", 39: "🎃", 40: "👶",
};

interface TimelineNavProps {
  currentWeek: number;
}

export function TimelineNav({ currentWeek }: TimelineNavProps) {
  const weeks = Array.from({ length: 36 }, (_, i) => i + 5); // 5~40주

  return (
    <div className="px-4 py-3 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium" style={{ color: "#5C5860" }}>주차별 기록 보기</p>
        <Link href="/timeline" className="text-xs font-medium px-3 py-1 rounded-full"
          style={{ backgroundColor: "#F5EBE0", color: "#5C5860" }}>
          전체 타임라인 보기 →
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {weeks.map((week) => {
          const isCurrent = week === currentWeek;
          const isPast = week < currentWeek;
          return (
            <Link
              key={week}
              href={`/week/${week}`}
              className="flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-105"
              style={{
                backgroundColor: isCurrent ? "#FFB4A2" : isPast ? "#F5EBE0" : "#FFFFFF",
                border: isCurrent ? "none" : "1px solid #EDD5C0",
              }}
            >
              <span className="text-xl">{WEEK_EMOJIS[week] ?? "🌸"}</span>
              <span
                className="text-xs font-medium"
                style={{ color: isCurrent ? "white" : "#2D2A2E" }}
              >
                {week}주
              </span>
              {isCurrent && (
                <span className="text-xs text-white opacity-80">지금</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
