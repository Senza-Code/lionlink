import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import { listenToUpcomingSessions } from "../lib/sessions";
import { scoreSession } from "../lib/match";
import { auth } from "../lib/firebase";
import { useMyProfile } from "../lib/useMyProfile";
import { getMyInterest, setInterested } from "../lib/sessionInterest";

type HomeScreenProps = {
  onNavigate: (screen: string) => void;
};

function safeTimeLabel(v: any) {
  try {
    if (!v) return "—";
    // Firestore Timestamp has toDate()
    if (typeof v.toDate === "function") {
      return v.toDate().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
    // If it's already a Date
    if (v instanceof Date) {
      return v.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
    return "—";
  } catch {
    return "—";
  }
}

export const HomeScreen: FC<HomeScreenProps> = ({ onNavigate }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [myInterest, setMyInterestState] = useState<Record<string, boolean>>({});
  const [fatal, setFatal] = useState<string | null>(null);

  const user = auth.currentUser;
  const { profile: myProfile, loading: myProfileLoading } = useMyProfile(user);

  useEffect(() => {
    try {
      const unsub = listenToUpcomingSessions(setSessions);
      return () => unsub();
    } catch (e: any) {
      console.error(e);
      setFatal(e?.message ?? "HomeScreen crashed in sessions listener.");
      return;
    }
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid || sessions.length === 0) return;

    (async () => {
      const entries = await Promise.all(
        sessions.map(async (s) => [s.id, await getMyInterest(s.id, uid)] as const)
      );
      setMyInterestState(Object.fromEntries(entries));
    })().catch((e) => console.error("interest preload failed", e));
  }, [sessions]);

  const safeMyProfile = myProfile ?? {course: [], goals: [], availability: []};
  if (fatal) {
    return (
      <div className="h-full w-full max-w-md mx-auto flex flex-col px-6 pt-6 pb-16 bg-white">
        <h1 className="text-lg font-semibold text-red-600">Home crashed</h1>
        <p className="text-sm text-gray-700 mt-2">{fatal}</p>
        <p className="text-xs text-gray-500 mt-4">
          Check the terminal + browser console for the stack trace.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col px-6 pt-6 pb-16 bg-white">
      <header className="mb-6 space-y-1">
        <h1 className="text-xl font-semibold">Welcome back 👋</h1>
        <p className="text-sm text-gray-600">
          Find accountability partners and sessions.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => onNavigate("find")}
          className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left hover:bg-gray-100"
        >
          <p className="text-sm font-semibold">Find Study Partners</p>
          <p className="text-xs text-gray-600">Match by goals & schedule</p>
        </button>

        <button className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left hover:bg-gray-100">
          <p className="text-sm font-semibold">Post Study Request</p>
          <p className="text-xs text-gray-600">Create a new session</p>
        </button>
      </div>

      <section className="flex-1 space-y-4 overflow-auto">
        <h2 className="text-sm font-semibold text-gray-900">
          Upcoming Study Sessions
        </h2>

        {myProfileLoading && (
          <p className="text-xs text-gray-500">Loading your profile…</p>
        )}

        {sessions.length === 0 && !myProfileLoading && (
          <p className="text-xs text-gray-500">No upcoming sessions yet.</p>
        )}

        {sessions.map((s) => {
          const match = scoreSession(safeMyProfile, s);
          const recommended = match.score >= 70;
          const isInterested = !!myInterest[s.id];

          return (
            <div
              key={s.id}
              className="rounded-xl border border-gray-200 bg-white p-4 space-y-2"
            >
              {recommended && (
                <div className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  ⭐ Recommended for you
                </div>
              )}

              {recommended && match.reasons?.length > 0 && (
                <p className="text-[11px] text-blue-700/80 -mt-1">
                  {match.reasons.join(" · ")}
                </p>
              )}

              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {s.courseCode ?? "—"} — {s.courseName ?? "—"}
                  </p>
                  <p className="text-xs text-gray-600">With {s.hostName ?? "—"}</p>
                </div>
                <span className="text-xs text-gray-400">⋮</span>
              </div>

              <p className="text-xs text-gray-600">📍 {s.location ?? "—"}</p>

              <p className="text-xs text-gray-600">
                🕒 {safeTimeLabel(s.startAt)} – {safeTimeLabel(s.endAt)}
              </p>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={async () => {
                    const uid = auth.currentUser?.uid;
                    if (!uid) return;

                    const current = !!myInterest[s.id];
                    const next = !current;

                    setMyInterestState((prev) => ({ ...prev, [s.id]: next }));

                    try {
                      await setInterested(s.id, uid, next);
                    } catch (e) {
                      setMyInterestState((prev) => ({ ...prev, [s.id]: current }));
                      console.error(e);
                    }
                  }}
                  className={`text-xs font-medium ${
                    isInterested ? "text-blue-700" : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {isInterested ? "Interested ✅" : "Interested"}
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