import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { weeklyGuide } from "@/lib/weeklyGuide";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function calcWeek(lmp: string): number {
  const lmpDate = new Date(lmp);
  const today = new Date();
  const days = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(40, Math.floor(days / 7) + 1));
}

function isNewWeekStart(lmp: string): boolean {
  const lmpDate = new Date(lmp);
  const today = new Date();
  const days = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
  return days > 0 && days % 7 === 0;
}

export async function GET(request: Request) {
  const secret = request.headers.get("x-cron-secret") ?? new URL(request.url).searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "Missing required environment variables" }, { status: 500 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL ?? "mailto:contact@airang.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 모든 임신 + 구독 조회
  const { data: pregnancies } = await supabase
    .from("pregnancies")
    .select("id, last_menstrual_period, baby_nickname, owner_id");

  if (!pregnancies?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const preg of pregnancies) {
    const week = calcWeek(preg.last_menstrual_period);
    const newWeek = isNewWeekStart(preg.last_menstrual_period);
    const guide = weeklyGuide.find((g) => g.week_number === week);

    // 이 임신에 속한 모든 구성원의 구독 조회
    const { data: members } = await supabase
      .from("family_members")
      .select("user_id")
      .eq("pregnancy_id", preg.id);

    if (!members?.length) continue;

    const userIds = members.map((m) => m.user_id);
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .in("user_id", userIds);

    if (!subs?.length) continue;

    // 알림 메시지 결정
    const notifications: Array<{ title: string; body: string; url: string; tag: string }> = [];

    if (newWeek) {
      notifications.push({
        title: `✨ ${week}주차가 시작됐어요!`,
        body: guide?.baby_info.size_comparison
          ? `아기가 ${guide.baby_info.size_comparison} 크기로 자랐어요`
          : `새로운 한 주를 기록해보세요`,
        url: `/week/${week}`,
        tag: `week-${week}`,
      });
    }

    if (guide?.exam_info && !newWeek) {
      notifications.push({
        title: `🏥 이번 주 ${guide.exam_info.name}이 있어요`,
        body: guide.exam_info.purpose,
        url: `/week/${week}`,
        tag: `exam-${week}`,
      });
    }

    if (!notifications.length) continue;

    for (const sub of subs) {
      for (const notif of notifications) {
        try {
          await webpush.sendNotification(
            sub.subscription as webpush.PushSubscription,
            JSON.stringify(notif)
          );
          sent++;
        } catch {
          // 구독 만료된 경우 무시
        }
      }
    }
  }

  return NextResponse.json({ sent });
}
