// src/components/HomeScreen.tsx
import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";

import { auth } from "../lib/firebase";
import { listenToUpcomingSessions } from "../lib/sessions";
import { useMyProfile } from "../lib/useMyProfile";

// NOTE TO SELF (demo mode):
// I’m intentionally NOT calling Firestore for “interested” right now.
// I ONLY want the UI to show ONE visible increment (e.g., 5 → 6) and never go down.
// This avoids the real toggle + realtime listener fighting my demo.

type HomeScreenProps = {
  onNavigate: (screen: string) => void;
};

type Session = {
  id: string;
  courseCode: string;
  courseName: string;
  hostName: string;
  location: string;
  startAt: any; // Firestore Timestamp
  endAt: any; // Firestore Timestamp
  interestedCount?: number;
};

const formatTime = (ts: any) =>
  ts?.toDate?.().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) ?? "";

// NOTE TO SELF:
// My match.ts export situation keeps changing, so I’m keeping the “Recommended” logic
// inside this file for stability.
// I’ll replace this with a shared matcher later.
function scoreSessionLocal(meCourses: string[], session: Session) {
  const reasons: string[] = [];
  let score = 0;

  if (Array.isArray(meCourses) && meCourses.includes(session.courseCode)) {
    score += 80;
    reasons.push("Same course");
  } else {
    score += 30;
  }

  // cap it becuase the UI doesnt need weir.d numbers
  score = Math.max(0, Math.min(100, score));
  return { score, reasons };
}

export const HomeScreen: FC<HomeScreenProps> = ({ onNavigate }) => {
  const meUser = auth.currentUser;

  const [sessions, setSessions] = useState<Session[]>([]);

  // I’m loading my profile so the greeting + matching can use real data.
  const { profile, loading: profileLoading } = useMyProfile(meUser);

  // I’m being defensive because I’ve used both field names at different times.
  const myCourses = useMemo(() => {
    const p: any = profile ?? null;
    return (p?.enrolledCourses ?? p?.courses ?? []) as string[];
  }, [profile]);

  const firstName = useMemo(() => {
    const p: any = profile ?? null;
    const raw = (p?.name ?? p?.displayName ?? "").trim();
    if (!raw) return "";
    return raw.split(/\s+/)[0] ?? raw;
  }, [profile]);

  // ----------------------------
  // DEMO-ONLY “INTERESTED” STATE
  // ----------------------------
  const [demoInterested, setDemoInterested] = useState<Record<string, boolean>>({});
  const [demoInterestCount, setDemoInterestCount] = useState<Record<string, number>>({});

  // 1) Sessions feed live from Firebase
  useEffect(() => {
    const unsub = listenToUpcomingSessions((rows: any[]) => {
      setSessions(rows as Session[]);
    });
    return () => unsub();
  }, []);

  // NOTE TO SELF:
  // One-time increment behavior:
  // - first click: show +1 and checkmark
  // - later clicks: do nothing (no decrement, no toggle)
  const onDemoInterested = (sessionId: string, originalCount: number) => {
    // If I already clicked, I stop here.
    if (demoInterested[sessionId]) return;

    // Mark as clicked (so the ✓ sticks).
    setDemoInterested((prev) => ({ ...prev, [sessionId]: true }));

    // Lock the displayed count at (original + 1).
    setDemoInterestCount((prev) => ({ ...prev, [sessionId]: originalCount + 1 }));
  };

  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col px-6 pt-6 pb-16 bg-white">
      {/* Header */}
      <header className="mb-6 space-y-1">
        <h1 className="text-xl font-semibold">
          Welcome back{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="text-sm text-gray-600">Find accountability partners and sessions.</p>
      </header>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => onNavigate("find")}
          className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left hover:bg-gray-100"
        >
          <p className="text-sm font-semibold">Find Study Partners</p>
          <p className="text-xs text-gray-600">Match by goals & schedule</p>
        </button>

        <button
          onClick={() => onNavigate("sessions")}
          className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left hover:bg-gray-100"
        >
          <p className="text-sm font-semibold">Post Study Request</p>
          <p className="text-xs text-gray-600">Create a new session</p>
        </button>
      </div>

      {/* Sessions */}
      <section className="flex-1 space-y-4 overflow-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Upcoming Study Sessions</h2>
          {profileLoading && <span className="text-xs text-gray-400">Loading profile…</span>}
        </div>

        {sessions.length === 0 && <p className="text-xs text-gray-500">No upcoming sessions yet.</p>}

        {sessions.map((s) => {
          const match = scoreSessionLocal(myCourses, s);
          const recommended = match.score >= 70;

          // NOTE TO SELF:
          // I always display the demo count if it exists, otherwise the Firestore count.
          const shownCount = demoInterestCount[s.id] ?? (s.interestedCount ?? 0);
          const clicked = !!demoInterested[s.id];

          return (
            <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              {recommended && (
                <div className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Recommended for you
                </div>
              )}

              {recommended && match.reasons.length > 0 && (
                <p className="text-[11px] text-blue-700/80 -mt-1">{match.reasons.join(" · ")}</p>
              )}

              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {s.courseCode} — {s.courseName}
                  </p>
                  <p className="text-xs text-gray-600">With {s.hostName}</p>
                </div>
                <span className="text-xs text-gray-400">⋮</span>
              </div>

              <p className="text-xs text-gray-600">{s.location}</p>

              <p className="text-xs text-gray-600">
                {formatTime(s.startAt)} – {formatTime(s.endAt)}
              </p>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => onDemoInterested(s.id, s.interestedCount ?? 0)}
                  className="text-xs text-gray-700 hover:text-gray-900"
                >
                  {clicked ? `Interested ✓ (${shownCount})` : `Interested (${shownCount})`}
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default HomeScreen;