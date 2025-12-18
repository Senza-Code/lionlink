// src/components/ProfileScreen.tsx

import { useEffect, useMemo, useState } from "react";
import { auth } from "../lib/firebase";
import { logout } from "../lib/logout";
import { getMyProfile, type UserProfile } from "../lib/profiles";
import { updateMyProfile } from "../lib/updateProfile";

// ok, I’m letting people type comma-separated stuff, so I need to clean it into an array
function csvToList(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function ProfileScreen() {
  // I only want to write/read the profile if I have a logged-in user
  const uid = auth.currentUser?.uid ?? null;

  // I want the email shown, but it doesn’t need to re-calc constantly
  const displayEmail = useMemo(() => auth.currentUser?.email ?? "", []);

  // this is the profile as stored in Firestore
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // loading state for initial fetch
  const [loading, setLoading] = useState(true);

  // ok, these are my editable form fields
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [coursesCsv, setCoursesCsv] = useState("");
  const [studyStyleCsv, setStudyStyleCsv] = useState("");
  const [modeCsv, setModeCsv] = useState("");

  // saving + messages
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // ---------- load profile on mount ----------
  useEffect(() => {
    // if I’m not logged in, I can’t load anything
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // I don’t want state updates after unmount
    let cancelled = false;

    (async () => {
      try {
        const p = await getMyProfile(uid);
        if (cancelled) return;

        setProfile(p);

        // hydrate the form so it matches Firestore
        setName(p?.name ?? "");
        setMajor(p?.major ?? "");
        setYear(p?.year ?? "");
        setCoursesCsv((p?.enrolledCourses ?? []).join(", "));
        setStudyStyleCsv((p?.studyStyle ?? []).join(", "));
        setModeCsv((p?.mode ?? []).join(", "));
      } catch (e: any) {
        if (!cancelled) setErrMsg(e?.message ?? "Failed to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  // ---------- save handler ----------
  const onSave = async () => {
    if (!uid) return;

    setErrMsg(null);
    setSavedMsg(null);
    setSaving(true);

    try {
      // I’m building the exact shape Firestore expects
      const updates: Partial<UserProfile> = {
        name: name.trim(),
        major: major.trim(),
        year: year.trim(),
        enrolledCourses: csvToList(coursesCsv),
        studyStyle: csvToList(studyStyleCsv),
        mode: csvToList(modeCsv),
      };

      // actually push the update to Firestore
      await updateMyProfile(uid, updates);

      // nice, show success
      setSavedMsg("Saved");

      // update local state so UI reflects changes without refetch
      setProfile((prev) =>
        prev ? ({ ...prev, ...updates } as UserProfile) : ({ uid, ...updates } as UserProfile)
      );

      // clear the “Saved” message after 2 seconds
      setTimeout(() => setSavedMsg(null), 2000);
    } catch (e: any) {
      setErrMsg(e?.message ?? "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    // I want this screen to fill the phone frame
    <div className="h-full w-full max-w-md mx-auto bg-white">
      {/* IMPORTANT: everything must live INSIDE this scroll container,
          so the logout button doesn’t get cut off by bottom nav */}
      <div className="h-full overflow-y-auto px-6 pt-6 pb-24">
        {/* Header */}
        <header className="mb-4 space-y-1">
          <h1 className="text-xl font-semibold">Profile</h1>
          <p className="text-sm text-gray-600">
            Fill this out so matching can work well.
          </p>
        </header>

        {/* Identity card */}
        <section className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-1">
          <p className="text-sm font-semibold text-gray-900">
            {profile?.name || name || "Your name"}
          </p>
          <p className="text-xs text-gray-600">{displayEmail}</p>
          {profile?.uni ? (
            <p className="text-xs text-gray-700">UNI: {profile.uni}</p>
          ) : null}
        </section>

        {/* Loading vs form */}
        {loading ? (
          <p className="text-sm text-gray-600">Loading...</p>
        ) : (
          <div className="space-y-3">
            {/* messages */}
            {errMsg ? <p className="text-xs text-red-600">{errMsg}</p> : null}
            {savedMsg ? <p className="text-xs text-green-600">{savedMsg}</p> : null}

            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-900">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                placeholder="e.g. Pearl Senza"
              />
            </div>

            {/* Major / Year */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-900">Major</label>
                <input
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-900">Year</label>
                <input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="e.g. Senior"
                />
              </div>
            </div>

            {/* Courses */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-900">
                Courses (comma separated)
              </label>
              <input
                value={coursesCsv}
                onChange={(e) => setCoursesCsv(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                placeholder="e.g. COMS W4701, COMS W3157"
              />
            </div>

            {/* Study Style */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-900">
                Study style tags (comma separated)
              </label>
              <input
                value={studyStyleCsv}
                onChange={(e) => setStudyStyleCsv(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                placeholder="e.g. deep focus, pomodoro, whiteboard"
              />
            </div>

            {/* Mode */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-900">
                Mode (comma separated)
              </label>
              <input
                value={modeCsv}
                onChange={(e) => setModeCsv(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                placeholder="e.g. remote, in-person"
              />
            </div>

            {/* Save */}
            <button
              onClick={onSave}
              disabled={saving || !uid}
              className="w-full rounded-full bg-blue-600 text-white py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="w-full rounded-full bg-gray-900 text-white py-2.5 text-sm font-medium"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}