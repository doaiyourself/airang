"use client";

import Link from "next/link";

const WEEK_DATA: Record<number, { emoji: string; fruit: string; milestone?: string; weightG?: number; lengthCm?: number }> = {
  5:  { emoji: "🌱", fruit: "참깨", weightG: 0, lengthCm: 0.1 },
  6:  { emoji: "🌱", fruit: "렌틸콩", weightG: 0, lengthCm: 0.3 },
  7:  { emoji: "🫐", fruit: "블루베리", weightG: 0, lengthCm: 0.8 },
  8:  { emoji: "🫐", fruit: "강낭콩", weightG: 1, lengthCm: 1.6, milestone: "첫 초음파" },
  9:  { emoji: "🍇", fruit: "포도", weightG: 2, lengthCm: 2.3 },
  10: { emoji: "🍓", fruit: "딸기", weightG: 4, lengthCm: 3.1 },
  11: { emoji: "🍋", fruit: "무화과", weightG: 7, lengthCm: 4.1 },
  12: { emoji: "🍋", fruit: "라임", weightG: 14, lengthCm: 5.4, milestone: "NT 검사" },
  13: { emoji: "🍑", fruit: "복숭아", weightG: 23, lengthCm: 7.4 },
  14: { emoji: "🍑", fruit: "레몬", weightG: 43, lengthCm: 8.7 },
  15: { emoji: "🥭", fruit: "사과", weightG: 70, lengthCm: 10.1 },
  16: { emoji: "🥭", fruit: "아보카도", weightG: 100, lengthCm: 11.6 },
  17: { emoji: "🍐", fruit: "배", weightG: 140, lengthCm: 13 },
  18: { emoji: "🍐", fruit: "고구마", weightG: 190, lengthCm: 14.2 },
  19: { emoji: "🥑", fruit: "망고", weightG: 240, lengthCm: 15.3 },
  20: { emoji: "🍌", fruit: "바나나", weightG: 300, lengthCm: 25.6, milestone: "정밀 초음파" },
  21: { emoji: "🍌", fruit: "당근", weightG: 360, lengthCm: 26.7 },
  22: { emoji: "🌽", fruit: "파파야", weightG: 430, lengthCm: 27.8 },
  23: { emoji: "🌽", fruit: "자몽", weightG: 500, lengthCm: 28.9 },
  24: { emoji: "🌽", fruit: "옥수수", weightG: 600, lengthCm: 30, milestone: "임당 검사" },
  25: { emoji: "🥦", fruit: "콜리플라워", weightG: 660, lengthCm: 34.6 },
  26: { emoji: "🥦", fruit: "상추", weightG: 760, lengthCm: 35.6 },
  27: { emoji: "🥬", fruit: "양배추", weightG: 875, lengthCm: 36.6 },
  28: { emoji: "🍆", fruit: "가지", weightG: 1005, lengthCm: 37.6, milestone: "후기 시작" },
  29: { emoji: "🍆", fruit: "호박", weightG: 1150, lengthCm: 38.6 },
  30: { emoji: "🥕", fruit: "오이", weightG: 1320, lengthCm: 39.9 },
  31: { emoji: "🥕", fruit: "아스파라거스", weightG: 1500, lengthCm: 41.1 },
  32: { emoji: "🥥", fruit: "코코넛", weightG: 1700, lengthCm: 42.4 },
  33: { emoji: "🥥", fruit: "파인애플", weightG: 1920, lengthCm: 43.7 },
  34: { emoji: "🍍", fruit: "멜론", weightG: 2150, lengthCm: 45 },
  35: { emoji: "🍍", fruit: "허니듀", weightG: 2380, lengthCm: 46.2 },
  36: { emoji: "🍉", fruit: "파파야", weightG: 2600, lengthCm: 47.4, milestone: "NST 시작" },
  37: { emoji: "🍉", fruit: "로마 토마토", weightG: 2860, lengthCm: 48.6 },
  38: { emoji: "🎃", fruit: "호박", weightG: 3080, lengthCm: 49.8 },
  39: { emoji: "🎃", fruit: "수박", weightG: 3290, lengthCm: 50.7 },
  40: { emoji: "👶", fruit: "만삭", weightG: 3400, lengthCm: 51.2, milestone: "출산 예정일" },
};

const FREE_WEEKS_LIMIT = 8; // 로그인 없이 볼 수 있는 마지막 주차

const TYPE_ICONS: Record<string, string> = {
  diary: "📔", photo: "📸", exam: "🏥", symptom: "🤒", emotion: "💭",
};

interface Props {
  currentWeek: number | null;
  recordsByWeek: Record<number, string[]>;
  pregnancyId: string | null;
  isLoggedIn: boolean;
}

export function PublicVerticalTimeline({ currentWeek, recordsByWeek, pregnancyId, isLoggedIn }: Props) {
  const weeks = Array.from({ length: 36 }, (_, i) => i + 5);

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      {/* 범례 */}
      <div className="flex items-center gap-4 mb-6 px-2 flex-wrap">
        {isLoggedIn && currentWeek && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FFB4A2" }} />
            <span className="text-xs" style={{ color: "#5C5860" }}>현재 주차</span>
          </div>
        )}
        {isLoggedIn && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#B5E4CA" }} />
            <span className="text-xs" style={{ color: "#5C5860" }}>기록 있음</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#EDD5C0" }} />
          <span className="text-xs" style={{ color: "#5C5860" }}>공식 가이드</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🏥</span>
          <span className="text-xs" style={{ color: "#5C5860" }}>검진 일정</span>
        </div>
      </div>

      {/* 타임라인 */}
      <div className="relative">
        {/* 세로 선 */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2"
          style={{ backgroundColor: "#D4C4BC" }} />

        <div className="space-y-0">
          {weeks.map((week, idx) => {
            const isCurrent = currentWeek === week;
            const isPast = currentWeek !== null && week < currentWeek;
            const hasRecord = !!recordsByWeek[week]?.length;
            const weekInfo = WEEK_DATA[week] ?? { emoji: "🌸", fruit: "성장 중" };
            const isLeft = idx % 2 === 0;
            const isLocked = !isLoggedIn && week > FREE_WEEKS_LIMIT;
            const href = isLocked ? "/signup" : `/week/${week}`;

            // 점 색상
            let dotBg = "white";
            let dotBorder = "#D4C4BC";
            let dotSize = 32;

            if (isCurrent) {
              dotBg = "#FFB4A2"; dotBorder = "#FFB4A2"; dotSize = 44;
            } else if (hasRecord) {
              dotBg = "#B5E4CA"; dotBorder = "#B5E4CA";
            } else if (isPast) {
              dotBg = "#F5EBE0"; dotBorder = "#D4C4BC";
            } else if (isLocked) {
              dotBg = "#EDE8F0"; dotBorder = "#BFB4C8";
            }

            return (
              <div key={week} className="relative flex items-center" style={{ minHeight: "68px" }}>
                {/* 왼쪽 */}
                <div className="flex-1 flex justify-end pr-6">
                  {isLeft && (
                    <WeekCard
                      week={week} weekInfo={weekInfo} isCurrent={isCurrent}
                      isPast={isPast} hasRecord={hasRecord}
                      recordTypes={recordsByWeek[week] ?? []}
                      isLocked={isLocked} href={href} align="right"
                    />
                  )}
                </div>

                {/* 중앙 점 */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-0.5">
                  <Link href={href}>
                    <div
                      className="flex items-center justify-center rounded-full border-2 transition-all hover:scale-110"
                      style={{
                        width: dotSize, height: dotSize,
                        backgroundColor: dotBg, borderColor: dotBorder,
                        boxShadow: isCurrent ? "0 0 0 6px rgba(255,180,162,0.25)" : "none",
                      }}
                    >
                      {isCurrent ? (
                        <span style={{ fontSize: dotSize * 0.4 }}>{weekInfo.emoji}</span>
                      ) : isLocked ? (
                        <span className="text-xs">🔒</span>
                      ) : hasRecord ? (
                        <span className="text-xs">✓</span>
                      ) : (
                        <span className="text-xs font-bold" style={{ color: isLocked ? "#9C8FA0" : isPast ? "#5C5860" : "#8A7E88", fontSize: 10 }}>
                          {week}
                        </span>
                      )}
                    </div>
                  </Link>
                  {isCurrent && (
                    <div className="px-2 py-0.5 rounded-full text-white font-bold"
                      style={{ backgroundColor: "#FFB4A2", fontSize: 10 }}>
                      지금
                    </div>
                  )}
                </div>

                {/* 오른쪽 */}
                <div className="flex-1 flex justify-start pl-6">
                  {!isLeft && (
                    <WeekCard
                      week={week} weekInfo={weekInfo} isCurrent={isCurrent}
                      isPast={isPast} hasRecord={hasRecord}
                      recordTypes={recordsByWeek[week] ?? []}
                      isLocked={isLocked} href={href} align="left"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 로그인 유도 배너 (비로그인, 8주 이후) */}
        {!isLoggedIn && (
          <div className="relative mt-2 mx-auto max-w-xs">
            <div className="p-5 rounded-3xl text-center shadow-lg border-2"
              style={{ backgroundColor: "white", borderColor: "#FFB4A2" }}>
              <div className="text-4xl mb-3">🌸</div>
              <p className="font-bold text-base mb-1" style={{ color: "#2D2A2E" }}>
                9주차부터 계속 보려면
              </p>
              <p className="text-sm mb-4" style={{ color: "#5C5860" }}>
                무료 가입하고 40주 전체 가이드를 확인하세요
              </p>
              <Link href="/signup"
                className="block w-full py-3 rounded-xl text-white font-semibold text-sm"
                style={{ backgroundColor: "#FFB4A2" }}>
                무료로 시작하기 🌸
              </Link>
              <Link href="/login"
                className="block mt-2 text-xs"
                style={{ color: "#5C5860" }}>
                이미 계정이 있어요 → 로그인
              </Link>
            </div>
          </div>
        )}

        {/* 출산 마커 */}
        <div className="relative flex justify-center mt-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2"
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

function WeekCard({ week, weekInfo, isCurrent, isPast, hasRecord, recordTypes, isLocked, href, align }: {
  week: number;
  weekInfo: { emoji: string; fruit: string; milestone?: string; weightG?: number; lengthCm?: number };
  isCurrent: boolean;
  isPast: boolean;
  hasRecord: boolean;
  recordTypes: string[];
  isLocked: boolean;
  href: string;
  align: "left" | "right";
}) {
  const isRight = align === "right";

  return (
    <Link href={href}
      className={`flex flex-col ${isRight ? "items-end" : "items-start"} gap-0.5 py-2 px-3 rounded-2xl transition-all hover:opacity-80 max-w-[148px] w-full`}
      style={{
        backgroundColor: isCurrent ? "#FFF5F3" : isLocked ? "#F3F0F6" : "transparent",
      }}>

      <span className={`font-bold ${isRight ? "text-right" : "text-left"}`}
        style={{ fontSize: 11, color: isCurrent ? "#FFB4A2" : isLocked ? "#9C8FA0" : isPast ? "#5C5860" : "#7A6E78" }}>
        {week}주차
      </span>

      <span className={`${isRight ? "text-right" : "text-left"}`}
        style={{ fontSize: 12, color: isCurrent ? "#2D2A2E" : isLocked ? "#9C8FA0" : isPast ? "#5C5860" : "#7A6E78" }}>
        {weekInfo.emoji} {weekInfo.fruit}
      </span>

      {weekInfo.weightG != null && weekInfo.weightG > 0 && (
        <span style={{ fontSize: 10, color: isLocked ? "#B5A8BE" : "#8A7E88" }}>
          {weekInfo.weightG < 1000
            ? `${weekInfo.weightG}g`
            : `${(weekInfo.weightG / 1000).toFixed(1)}kg`}
        </span>
      )}

      {weekInfo.milestone && (
        <span className="px-1.5 py-0.5 rounded-full font-medium"
          style={{ fontSize: 10, backgroundColor: "#B5E4CA", color: "#2D2A2E" }}>
          🏥 {weekInfo.milestone}
        </span>
      )}

      {hasRecord && recordTypes.length > 0 && (
        <div className={`flex gap-0.5 ${isRight ? "justify-end" : "justify-start"}`}>
          {[...new Set(recordTypes)].slice(0, 3).map((type) => (
            <span key={type} style={{ fontSize: 12 }}>{TYPE_ICONS[type] ?? "📄"}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
