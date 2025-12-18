// src/lib/useMyProfile.ts
//
// Notes to self:
// - This hook is the *single source of truth* for loading the current user's profile.
// - Screens should NOT fetch Firestore profiles directly.
// - This keeps auth logic and data-fetching cleanly separated.
//
// Pattern: auth user → profile document → U
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { getMyProfile } from "./profiles";

// I’m intentionally keeping this flexible:
// profile can be null (not logged in or not created yet)
export function useMyProfile(user: User | null) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // If there’s no authenticated user, there’s no profile to load.
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Firestore fetch is isolated to profiles.ts
        const p = await getMyProfile(user.uid);

        // Guard against setting state after unmount
        if (!cancelled) setProfile(p);
      } catch (e) {
        console.error("Failed to load my profile:", e);

        // I fail safely here — the app can still render without a profile.
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    // Cleanup pattern prevents React warnings during fast screen changes
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  return { profile, loading };
}
