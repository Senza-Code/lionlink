import { useEffect, useMemo, useState } from "react";
import { auth } from "../lib/firebase";
import { logout } from "../lib/logout";
import { getMyProfile, type UserProfile } from "../lib/profiles";
//import { updateMyProfile } from "../lib/updateProfile";

function csvToList(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function ProfileScreen() {
  const uid = auth.currentUser?.uid;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // form fields
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [coursesCsv, setCoursesCsv] = useState("");
  const [studyStyleCsv, setStudyStyleCsv] = useState("");
  const [modeCsv, setModeCsv] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const p = await getMyProfile(uid);
        setProfile(p);

        // hydrate form
        setName(p?.name ?? "");
        setMajor(p?.major ?? "");
        setYear(p?.year ?? "");
        setCoursesCsv((p?.enrolledCourses ?? []).join(", "));
        setStudyStyleCsv((p?.studyStyle ?? []).join(", "));
        setModeCsv((p?.mode ?? []).join(", "));
      } catch (e: any) {
        setErrMsg(e?.message ?? "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  const displayEmail = useMemo(() => auth.currentUser?.email ?? "", []);

  const onSave = async () => {
    if (!uid) return;
    setErrMsg(null);
    setSavedMsg(null);
    setSaving(true);
    try {
      const updates: Partial<UserProfile> = {
        name: name.trim(),
        major: major.trim(),
        year: year.trim(),
        enrolledCourses: csvToList(coursesCsv),
        studyStyle: csvToList(studyStyleCsv),
        mode: csvToList(modeCsv),
      };

      //await updateMyProfile(uid, updates);

      setSavedMsg("Saved ✅");
      // refresh local profile snapshot for display
      setProfile((prev) => (prev ? { ...prev, ...updates } as UserProfile : (updates as UserProfile)));
      setTimeout(() => setSavedMsg(null), 2000);
    } catch (e: any) {
      setErrMsg(e?.message ?? "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col px-6 pt-6 pb-16 bg-white">
      <header className="mb-4 space-y-1">
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-sm text-gray-600">
          Fill this out so LionLink can match you with the right people.
        </p>
      </header>

      <section className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-1">
        <p className="text-sm font-semibold text-gray-900">
          {profile?.name || name || "Your name"}
        </p>
        <p className="text-xs text-gray-600">{displayEmail}</p>
        {profile?.uni && <p className="text-xs text-gray-700">UNI: {profile.uni}</p>}
      </section>

      {loading ? (
        <p className="text-sm text-gray-600">Loading…</p>
      ) : (
        <div className="space-y-3">
          {errMsg && <p className="text-xs text-red-600">{errMsg}</p>}
          {savedMsg && <p className="text-xs text-green-600">{savedMsg}</p>}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-900">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="e.g. Pearl Senza"
            />
          </div>

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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-900">Courses (comma separated)</label>
            <input
              value={coursesCsv}
              onChange={(e) => setCoursesCsv(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="e.g. COMS W4701, COMS W3157"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-900">Study style tags (comma separated)</label>
            <input
              value={studyStyleCsv}
              onChange={(e) => setStudyStyleCsv(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="e.g. deep focus, pomodoro, whiteboard"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-900">Mode (comma separated)</label>
            <input
              value={modeCsv}
              onChange={(e) => setModeCsv(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="e.g. remote, in-person"
            />
          </div>

          <button
            onClick={onSave}
            disabled={saving || !uid}
            className="w-full rounded-full bg-blue-600 text-white py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>

          <button
            onClick={logout}
            className="w-full rounded-full bg-gray-900 text-white py-2.5 text-sm font-medium"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
