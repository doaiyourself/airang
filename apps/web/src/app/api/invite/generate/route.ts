import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("family_members")
    .select("pregnancy_id")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })
    .limit(1)
    .single();

  if (!membership) return NextResponse.json({ error: "No pregnancy found" }, { status: 404 });

  // 기존 유효 코드가 있으면 반환
  const { data: existing } = await supabase
    .from("invite_codes")
    .select("code, expires_at")
    .eq("pregnancy_id", membership.pregnancy_id)
    .is("used_by", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json({ code: existing.code, expires_at: existing.expires_at });
  }

  // 새 코드 생성 (충돌 시 재시도)
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from("invite_codes").insert({
      code,
      pregnancy_id: membership.pregnancy_id,
      created_by: user.id,
      expires_at: expiresAt,
    });

    if (!error) {
      return NextResponse.json({ code, expires_at: expiresAt });
    }
  }

  return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
}
