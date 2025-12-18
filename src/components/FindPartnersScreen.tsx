// src/components/FindPartnersScreen.tsx
//
// This screen shows a live list of potential study partners from Firestore.
// I’m intentionally keeping this “demo-friendly”:
// - Search works locally on the fetched list
// - The X dismiss is local-only (does not delete anything in Firestore)
// - “Connect” is a placeholder CTA for the demo flow
//
// Notes to self:
// - User profile field names changed a few times during development, so I’m defensive
// - I try to support both `name` vs `displayName`, and `enrolledCourses` vs `courses`
// - Match logic is intentionally generous for the demo

import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";

import { auth } from "../lib/firebase";
import { listenToPartners, type UserProfile as PartnerProfile } from "../lib/partners";
import { useMyProfile } from "../lib/useMyProfile";
import { scorePartner } from "../lib/match";

// I’m using neutral icons instead of emojis.
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type Props = {
  onNavigate: (screen: string) => void;
};

// I’m generating initials for the avatar circle.
function initialsFromName(name?: string) {
  const n = (name ?? "").trim();
  if (!n) return "?";
  const parts = n.split(/\s+/).slice(0, 2);
  const chars = parts.map((p) => p[0]?.toUpperCase()).filter(Boolean);
  return chars.join("") || "?";
}

export const FindPartnersScreen: FC<Props> = ({ onNavigate }) => {
  const meUser = auth.currentUser;
  const myUid = meUser?.uid ?? null;

  // I’m loading my profile so I can match using my courses.
  const { profile: meProfile } = useMyProfile(meUser);

  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [queryText, setQueryText] = useState("");

  // I’m tracking “dismissed” cards locally so the X works in demo.
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  // I’m reading my courses (supporting both names because my schema shifted).
  const myCourses = useMemo(() => {
    const p: any = meProfile ?? {};
    return (p.enrolledCourses ?? p.courses ?? []) as string[];
  }, [meProfile]);

  // I’m using the first course as “current course” for a believable demo UI.
  const [includeCourseFilter, setIncludeCourseFilter] = useState(true);
  const currentCourse = myCourses[0] ?? "";

  // I’m subscribing to partners; optional course filtering for demo.
  useEffect(() => {
    const unsub = listenToPartners(
      {
        excludeUid: myUid ?? undefined,
        courseCode: includeCourseFilter && currentCourse ? currentCourse : undefined,
        max: 50,
      },
      setPartners,
      (e) => console.error("listenToPartners error:", e)
    );

    return () => unsub();
  }, [myUid, includeCourseFilter, currentCourse]);

  // I’m filtering by search text + removing dismissed cards.
  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();

    return partners
      .filter((p) => !dismissed[p.uid])
      .filter((p) => {
        if (!q) return true;

        const name = ((p as any).name ?? p.displayName ?? "").toString();
        const courses = ((p as any).enrolledCourses ?? p.courses ?? []) as string[];
        const tags = ((p as any).studyStyleTags ?? []) as string[];

        const hay = [name, p.major ?? "", p.year ?? "", ...courses, ...tags].join(" ").toLowerCase();
        return hay.includes(q);
      });
  }, [partners, queryText, dismissed]);

  return (
    <div className="h-full w-full max-w-md mx-auto bg-white">
      <div className="h-full overflow-y-auto px-6 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onNavigate("home")}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>

          <h1 className="text-base font-semibold">Find Study Partners</h1>

          <button
            type="button"
            className="text-gray-500 hover:text-gray-900"
            aria-label="Settings"
            onClick={() => alert("Demo: settings coming soon")}
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Current Course card */}
        <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Current Course:</p>

            <div className="mt-2 flex items-start gap-3">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-700"
                aria-label="Clear current course"
                onClick={() => setIncludeCourseFilter(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentCourse || "No course set"}
                </p>
                <p className="text-xs text-gray-500 truncate">With Professor Adams</p>
              </div>
            </div>
          </div>

          {/* Toggle */}
          <button
            type="button"
            onClick={() => setIncludeCourseFilter((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              includeCourseFilter ? "bg-blue-600" : "bg-gray-300"
            }`}
            aria-label="Toggle course filter"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                includeCourseFilter ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Search */}
        <input
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="Search partners..."
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 mb-4"
        />

        {/* Partner list */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-500">No partners found.</p>
          ) : null}

          {filtered.map((p) => {
            // I’m being defensive: name field might be `name` or `displayName`.
            const displayName = ((p as any).name ?? p.displayName ?? "Student") as string;

            const subtitle = [p.year ?? "", p.major ?? ""].filter(Boolean).join(", ");

            const theirCourses = (((p as any).enrolledCourses ?? p.courses ?? []) as string[]);
            const theirTags = (((p as any).studyStyleTags ?? []) as string[]);
            const theirFreeTime = (((p as any).freeTime ?? "") as string).trim();

            const match = scorePartner(
              { courses: myCourses },
              { courses: theirCourses, studyStyleTags: theirTags }
            );

            const percent = Math.max(0, Math.min(100, Math.round(match?.score ?? 0)));

            const studyStyleLine = theirTags.length > 0 ? theirTags.join(", ") : "";

            return (
              <div key={p.uid} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      className="text-gray-300 hover:text-gray-600"
                      aria-label="Dismiss partner"
                      onClick={() => setDismissed((d) => ({ ...d, [p.uid]: true }))}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>

                    <div className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shrink-0">
                      {initialsFromName(displayName)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-600 truncate">
                        {subtitle || "Profile incomplete"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {percent}% match
                  </div>
                </div>

                {studyStyleLine ? (
                  <p className="mt-3 text-xs text-gray-700">
                    <span className="font-medium">Study Style:</span> {studyStyleLine}
                  </p>
                ) : null}

                {theirFreeTime ? (
                  <p className="mt-2 text-xs text-gray-700 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <span>Free: {theirFreeTime}</span>
                  </p>
                ) : null}

                <button
                  className="mt-4 w-full rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  onClick={() => alert(`Demo: connect request sent to ${displayName}`)}
                >
                  Connect
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FindPartnersScreen;