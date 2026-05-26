import Link from "next/link";
import type { WeeklyContent } from "@airang/db";

interface DiaryRecord {
  id: string;
  type: string;
  record_date: string;
  content: { [key: string]: unknown };
  visibility: string;
  created_at: string;
}

interface WeeklyContentSectionProps {
  content: WeeklyContent | null | undefined;
  week: number;
  records: DiaryRecord[];
  pregnancyId: string;
}

const TYPE_LABELS: { [key: string]: { icon: string; label: string } } = {
  diary: { icon: "📔", label: "일기" },
  photo: { icon: "📸", label: "사진" },
  exam: { icon: "🏥", label: "검사" },
  symptom: { icon: "🤒", label: "증상" },
  emotion: { icon: "💭", label: "감정" },
};

function SectionCard({ emoji, title, color, children }: {
  emoji: string; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: color }}>
          {emoji}
        </div>
        <h3 className="font-semibold text-base" style={{ color: "#2D2A2E" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function WeeklyContentSection({ content, week, records, pregnancyId }: WeeklyContentSectionProps) {
  const demoContent: WeeklyContent = content ?? {
    week_number: week,
    baby_info: { size_comparison: "자두", length_cm: 30, weight_g: 600, development: ["폐가 발달하고 있어요", "손발이 활발하게 움직여요"] },
    mom_info: { body_changes: ["배가 본격적으로 나오기 시작해요"], common_symptoms: ["허리 통증이 생길 수 있어요"] },
    essay: `${week}주차가 됐어요. 매일 조금씩 자라는 아기를 생각하면 신기하고 행복해요. 오늘도 수고 많으셨어요 💕`,
    checklist: ["철분제 챙겨먹기", "정기 검진 예약 확인"],
    exam_info: null,
    illustration_url: null,
  };

  return (
    <>
      {/* 이번 주 아기 */}
      <SectionCard emoji="🍼" title={`이번 주 아기 · ${demoContent.baby_info.size_comparison} 크기`} color="#FFF5F3">
        <div className="flex items-center gap-4 mb-3 p-3 rounded-xl" style={{ backgroundColor: "#FFF5F3" }}>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: "#FFB4A2" }}>{demoContent.baby_info.length_cm}cm</p>
            <p className="text-xs" style={{ color: "#5C5860" }}>키</p>
          </div>
          <div className="w-px h-8" style={{ backgroundColor: "#EDD5C0" }} />
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: "#FFB4A2" }}>{demoContent.baby_info.weight_g}g</p>
            <p className="text-xs" style={{ color: "#5C5860" }}>몸무게</p>
          </div>
        </div>
        <ul className="space-y-1.5">
          {demoContent.baby_info.development.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#5C5860" }}>
              <span className="mt-0.5 text-xs">✓</span>{d}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* 이번 주 엄마 */}
      <SectionCard emoji="💗" title="이번 주 엄마" color="#FFF0F5">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "#FFB4A2" }}>몸의 변화</p>
            <ul className="space-y-1">
              {demoContent.mom_info.body_changes.map((b, i) => (
                <li key={i} className="text-sm" style={{ color: "#5C5860" }}>• {b}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "#FFB4A2" }}>흔한 증상</p>
            <ul className="space-y-1">
              {demoContent.mom_info.common_symptoms.map((s, i) => (
                <li key={i} className="text-sm" style={{ color: "#5C5860" }}>• {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* 이번 주 이야기 */}
      <SectionCard emoji="📖" title="이번 주 이야기" color="#F0FFF8">
        <p className="text-sm leading-relaxed" style={{ color: "#5C5860" }}>{demoContent.essay}</p>
      </SectionCard>

      {/* 체크리스트 */}
      <SectionCard emoji="✅" title="이번 주 체크리스트" color="#F5EBE0">
        <ul className="space-y-2">
          {demoContent.checklist.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: "#B5E4CA" }} />
              <span className="text-sm" style={{ color: "#2D2A2E" }}>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* 검진 안내 */}
      {demoContent.exam_info && (
        <SectionCard emoji="🏥" title="검진 안내" color="#F0F8FF">
          <div className="p-3 rounded-xl" style={{ backgroundColor: "#F0F8FF" }}>
            <p className="font-semibold text-sm mb-1" style={{ color: "#2D2A2E" }}>{demoContent.exam_info.name}</p>
            <p className="text-xs mb-2" style={{ color: "#5C5860" }}>⏰ {demoContent.exam_info.timing}</p>
            <p className="text-xs leading-relaxed" style={{ color: "#5C5860" }}>{demoContent.exam_info.purpose}</p>
          </div>
        </SectionCard>
      )}

      {/* 우리의 기록 */}
      <SectionCard emoji="📝" title={`우리의 ${week}주차 기록`} color="#F5EBE0">
        {records.length > 0 ? (
          <ul className="space-y-2">
            {records.map((record) => {
              const typeInfo = TYPE_LABELS[record.type] ?? { icon: "📄", label: record.type };
              return (
                <li key={record.id}>
                  <Link
                    href={`/records/${record.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:opacity-80"
                    style={{ backgroundColor: "#FDFAF7" }}
                  >
                    <span className="text-xl">{typeInfo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "#2D2A2E" }}>{typeInfo.label}</p>
                      <p className="text-xs" style={{ color: "#5C5860" }}>{record.record_date}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">✏️</p>
            <p className="text-sm" style={{ color: "#5C5860" }}>
              아직 기록이 없어요.<br />오늘의 이야기를 남겨볼까요?
            </p>
          </div>
        )}
      </SectionCard>
    </>
  );
}
