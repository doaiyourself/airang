"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface PregnancyInfo {
  pregnancyId: string;
  currentWeek: number;
}

export function usePregnancy() {
  const [info, setInfo] = useState<PregnancyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: membership } = await supabase
        .from("family_members")
        .select("pregnancies(id, last_menstrual_period)")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false })
        .limit(1)
        .single();

      type PregData = { id: string; last_menstrual_period: string };
      const pregRaw = membership?.pregnancies;
      const pregnancy = (Array.isArray(pregRaw) ? pregRaw[0] : pregRaw) as PregData | null ?? null;

      if (pregnancy) {
        const lmpDate = new Date(pregnancy.last_menstrual_period);
        const today = new Date();
        const daysElapsed = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.max(1, Math.min(40, Math.floor(daysElapsed / 7) + 1));
        setInfo({ pregnancyId: pregnancy.id, currentWeek });
      }
      setLoading(false);
    })();
  }, []);

  return { info, loading };
}
