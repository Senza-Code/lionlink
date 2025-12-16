import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { getMyProfile } from "./profiles";

export function useMyProfile(user: User | null) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const p = await getMyProfile(user.uid);
        if (!cancelled) setProfile(p);
      } catch (e) {
        console.error("Failed to load my profile:", e);
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  return { profile, loading };
}
