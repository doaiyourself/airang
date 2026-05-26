"use client";

import Link from "next/link";

const WEEK_DATA: Record<number, { emoji: string; fruit: string; milestone?: string }> = {
  5:  { emoji: "🌱", fruit: "참깨" },
  6:  { emoji: "🌱", fruit: "렌틸콩" },
  7:  { emoji: "🫐", fruit: "블루베리" },
  8:  { emoji: "🫐", fruit: "강낭콩", milestone: "첫 초음파" },
  9:  { emoji: "🍇", fruit: "포도" },
  10: { emoji: "🍓", fruit: "딸기" },
  11: { emoji: "🍋", fruit: "무화과" },
  12: { emoji: "🍋", fruit: "라임", milestone: "NT 검사" },
  13: { emoji: "🍑", fruit: "복숭아" },
  14: { emoji: "🍑", fruit: "레몬" },
  15: { emoji: "🥭", fruit: "사과" },
  16: { emoji: "🥭", fruit: "아보카도" },
  17: { emoji: "🍐", fruit: "배" },
  18: { emoji: "🍐", fruit: "고구마" },
  19: { emoji: "🥑", fruit: "망고" },
  20: { emoji: "🍌", fruit: "바나나", milestone: "정밀 초음파" },
  21: { emoji: "🍌", fruit: "당근" },
  22: { emoji: "🌽", fruit: "파파야" },
  23: { emoji: "🌽", fruit: "자몽" },
  24: { emoji: "🌽", fruit: "옥수수", milestone: "임당 검사" },
  25: { emoji: "🥦", fruit: "콜리플라워" },
  26: { emoji: "🥦", fruit: "상추" },
  27: { emoji: "🥬", fruit: "양배추" },
  28: { emoji: "🍆", fruit: "가지", milestone: "후기 시작" },
  29: { emoji: "🍆", fruit: "호박" },
  30: { emoji: "🥕", fruit: "오이" },
  31: { emoji: "🥕", fruit: "아스파라거스" },
  32: { emoji: "🥥", fruit: "코코넛" },
  33: { emoji: "🥥", fruit: "파인애플" },
  34: { emoji: "🍍", fruit: "멜론" },
  35: { emoji: "🍍", fruit: "허니듀" },
  36: { emoji: "🍉", fruit: "파파야", milestone: "NST 시작" },
  37: { emoji: "🍉", fruit: "로마 토마토" },
  38: { emoji: "🎃", fruit: "호박" },
  39: { emoji: "🎃", fruit: "수박" },
  40: { emoji: "👶", fruit: "만삭!", milestone: "출산 예정일" },
};

const TYPE_ICONS: Record<string, string> = {
  diary: "📔", photo: "📸", exam: "🏥", symptom: "🤒", emotion: "💭",
};

interface VerticalTimelineProps {
  currentWeek: number;
  recordsByWeek: Record<number, string[]>;
  pregnancyId: string;
}

export function VerticalTimeline({ currentWeek, recordsByWeek, pregnancyId }: VerticalTimelineProps) {
  const weeks = Array.from({ length: 36 }, (_, i) => i + 5); // 5~40

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* 범례 */}
      <div className="flex items-center gap-4 mb-8 px-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FFB4A2" }} />
          <span className="text-xs" style={{ color: "#5C5860" }}>현재 주차</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#B5E4CA" }} />
          <span className="text-xs" style={{ color: "#5C5860" }}>기록 있음</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: "#EDD5C0", backgroundColor: "white" }} />
          <span className="text-xs" style={{ color: "#5C5860" }}>앞으로</span>
        </div>
      </div>

      {/* 타임라인 */}
      <div className="relative">
        {/* 세로 선 */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2"
          style={{ backgroundColor: "#EDD5C0" }} />

        <div className="space-y-0">
          {weeks.map((week, idx) => {
            const isCurrent = week === currentWeek;
            const isPast = week < currentWeek;
            const hasRecord = !!recordsByWeek[week]?.length;
            const weekInfo = WEEK_DATA[week] ?? { emoji: "🌸", fruit: "성장 중" };
            const isLeft = idx % 2 === 0; // 짝수 인덱스 = 왼쪽

            // 점 색상
            let dotColor = "white";
            let dotBorder = "#EDD5C0";
            if (isCurrent) { dotColor = "#FFB4A2"; dotBorder = "#FFB4A2"; }
            else if (hasRecord) { dotColor = "#B5E4CA"; dotBorder = "#B5E4CA"; }
            else if (isPast) { dotColor = "#F5EBE0"; dotBorder = "#EDD5C0"; }

            return (
              <div key={week} className="relative flex items-center" style={{ minHeight: "72px" }}>
                {/* 왼쪽 콘텐츠 */}
                <div className={`flex-1 flex ${isLeft ? "justify-end pr-6" : "justify-start pl-6"} ${!isLeft ? "order-2" : ""}`}>
                  {isLeft && (
                    <WeekCard
                      week={week}
                      weekInfo={weekInfo}
                      isCurrent={isCurrent}
                      isPast={isPast}
                      hasRecord={hasRecord}
                      recordTypes={recordsByWeek[week] ?? []}
                      pregnancyId={pregnancyId}
                      align="right"
                    />
                  )}
                </div>

                {/* 중앙 점 */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                  <div
                    className="flex items-center justify-center rounded-full border-2 transition-all"
                    style={{
                      width: isCurrent ? 44 : 32,
                      height: isCurrent ? 44 : 32,
                      backgroundColor: dotColor,
                      borderColor: dotBorder,
                      boxShadow: isCurrent ? "0 0 0 4px rgba(255,180,162,0.2)" : "none",
                    }}
                  >
                    {isCurrent ? (
                      <span className="text-base">{weekInfo.emoji}</span>
                    ) : hasRecord ? (
                      <span className="text-xs">✓</span>
                    ) : (
                      <span className="text-xs font-bold" style={{ color: isPast ? "#5C5860" : "#EDD5C0" }}>
                        {week}
                      </span>
                    )}
                  </div>
                  {isCurrent && (
                    <div className="mt-1 px-2 py-0.5 rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: "#FFB4A2" }}>
                      지금
                    </div>
                  )}
                </div>

                {/* 오른쪽 콘텐츠 */}
                <div className={`flex-1 flex ${!isLeft ? "justify-start pl-6" : "justify-end pr-6"} ${isLeft ? "order-2" : ""}`}>
                  {!isLeft && (
                    <WeekCard
                      week={week}
                      weekInfo={weekInfo}
                      isCurrent={isCurrent}
                      isPast={isPast}
                      hasRecord={hasRecord}
                      recordTypes={recordsByWeek[week] ?? []}
                      pregnancyId={pregnancyId}
                      align="left"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 출산 마커 */}
        <div className="relative flex justify-center mt-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2"
              style={{ backgroundColor: "#FFB4A2", borderColor: "#FFB4A2" }}>
              👶
            </div>
            <p className="text-sm font-semibold" style={{ color: "#FFB4A2" }}>출산 예정일</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeekCard({
  week, weekInfo, isCurrent, isPast, hasRecord, recordTypes, pregnancyId, align,
}: {
  week: number;
  weekInfo: { emoji: string; fruit: string; milestone?: string };
  isCurrent: boolean;
  isPast: boolean;
  hasRecord: boolean;
  recordTypes: string[];
  pregnancyId: string;
  align: "left" | "right";
}) {
  const textAlign = align === "right" ? "text-right" : "text-left";
  const itemsAlign = align === "right" ? "items-end" : "items-start";

  return (
    <Link href={`/week/${week}`}
      className={`flex flex-col ${itemsAlign} gap-1 py-2 px-3 rounded-2xl transition-all hover:opacity-80 max-w-[140px]`}
      style={{
        backgroundColor: isCurrent ? "#FFF5F3" : "transparent",
      }}>
      {/* 주차 번호 */}
      <span className={`text-xs font-bold ${textAlign}`}
        style={{ color: isCurrent ? "#FFB4A2" : isPast ? "#5C5860" : "#C4B8B0" }}>
        {week}주차
      </span>

      {/* 과일 크기 */}
      <span className={`text-xs ${textAlign}`}
        style={{ color: isCurrent ? "#2D2A2E" : isPast ? "#5C5860" : "#C4B8B0" }}>
        {weekInfo.emoji} {weekInfo.fruit}
      </span>

      {/* 마일스톤 */}
      {weekInfo.milestone && (
        <span className="px-1.5 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: "#B5E4CA", color: "#2D2A2E" }}>
          {weekInfo.milestone}
        </span>
      )}

      {/* 기록 아이콘 */}
      {hasRecord && recordTypes.length > 0 && (
        <div className={`flex gap-0.5 ${align === "right" ? "justify-end" : "justify-start"}`}>
          {[...new Set(recordTypes)].slice(0, 3).map((type) => (
            <span key={type} className="text-xs">{TYPE_ICONS[type] ?? "📄"}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
