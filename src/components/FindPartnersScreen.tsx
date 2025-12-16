import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import { auth } from "../lib/firebase";
import { listenToPartners, type UserProfile } from "../lib/partners";

type FindPartnersScreenProps = {
  onNavigate: (screen: string) => void;
};

export const FindPartnersScreen: FC<FindPartnersScreenProps> = ({ onNavigate }) => {
  const [includeCourse, setIncludeCourse] = useState(true);
  const [queryText, setQueryText] = useState("");
  const [partners, setPartners] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCourse = "COMS W4170"; // later: load from my profile / selected course

  useEffect(() => {
    setLoading(true);
    const unsub = listenToPartners(
      {
        courseCode: includeCourse ? currentCourse : undefined,
        excludeUid: auth.currentUser?.uid ?? undefined,
        max: 50,
      },
      (rows) => {
        setPartners(rows);
        setLoading(false);
      },
      (e) => {
        console.error("listenToPartners error:", e);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [includeCourse]);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter((p) => p.displayName.toLowerCase().includes(q));
  }, [partners, queryText]);

  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col bg-white">
      {/* top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="h-12 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="h-9 w-9 grid place-items-center rounded-full hover:bg-gray-100"
          >
            ←
          </button>
          <h1 className="text-sm font-semibold text-gray-900">Find Study Partners</h1>
          <div className="h-9 w-9" />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pt-4 pb-20">
        {/* course filter card */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-500 mb-2">Current Course:</p>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentCourse}
              </p>
              <p className="text-xs text-gray-600 truncate">Include in matching</p>
            </div>

            <button
              type="button"
              onClick={() => setIncludeCourse((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                includeCourse ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  includeCourse ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* search */}
        <div className="mt-4">
          <input
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search partners…"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        {/* list */}
        <div className="mt-4 space-y-3">
          {loading && <p className="text-xs text-gray-500">Loading partners…</p>}

          {!loading && filtered.length === 0 && (
            <p className="text-xs text-gray-500">No partners found yet.</p>
          )}

          {filtered.map((p) => (
            <div key={p.uid} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {p.displayName}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {p.year ? `${p.year}, ` : ""}{p.major ?? ""}
                  </p>
                </div>

                {/* Placeholder until we compute match score from profiles */}
                <div className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                  match
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert(`Connect → ${p.displayName} (coming soon)`)}
                className="mt-3 w-full rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FindPartnersScreen;