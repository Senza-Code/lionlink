// src/lib/partners.ts
//
// Notes to self:
// - This file is the bridge between Firestore user documents and the UI.
// - Most “why does this say Student?” bugs originate here.
// - Normalize everything once so React components stay simple

import {
  collection,
  onSnapshot,
  query,
  where,
  limit,
  type Unsubscribe,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

// I’m defining what a “partner profile” looks like in the UI.
//
// Important:
// - UI uses `displayName` consistently.
// - Firestore stores the actual name under `name`.
// - I normalize that mismatch here so components don’t care
export type UserProfile = {
  uid: string;
  displayName: string;
  major?: string;
  year?: string;
  courses?: string[];
  studyStyleTags?: string[];
  mode?: string[];

  // Optional fields (safe to ignore if missing)
  freeTime?: string; 
  email?: string;    
};

// Normalize Firestore document → predictable UI shape.
//
// This is defensive on purpose because:
// - My schema evolved during the semester.
// - Firestore does not enforce types.
// - UI bugs are easier to debug when normalization is centralized
function normalizeProfile(id: string, data: DocumentData): UserProfile {
  return {
    uid: id,

   // Prefer Firestore "name", fallback to "displayName", then "Student".
   // This avoids blank cards when older docs are missing fields.
    displayName: data.name ?? data.displayName ?? "Student",

    major: data.major ?? "",
    year: data.year ?? "",

    // Prefer "enrolledCourses" (current schema),
    // fallback to "courses" (older seed data)
    courses: Array.isArray(data.enrolledCourses)
      ? data.enrolledCourses
      : Array.isArray(data.courses)
      ? data.courses
      : [],

    studyStyleTags: Array.isArray(data.studyStyleTags) ? data.studyStyleTags : [],

    mode: Array.isArray(data.mode) ? data.mode : [],

    // Optional extras (won’t break anything if missing)
    freeTime: typeof data.freeTime === "string" ? data.freeTime : "",
    email: typeof data.email === "string" ? data.email : "",
  };
}

/**
 * Live partner feed.
 *
 * Design notes:
 * - Uses Firestore `onSnapshot` for real-time updates.
 * - Optional course filter via array-contains.
 * - `excludeUid` keeps the current user out of their own results.
 *
 * This stays intentionally simple for demo reliability.
 */
export function listenToPartners(
  opts: { courseCode?: string; excludeUid?: string; max?: number },
  onData: (partners: UserProfile[]) => void,
  onError?: (e: unknown) => void
): Unsubscribe {
  const maxN = opts.max ?? 25;

  // Base query: fetch users collection.
  let q = query(collection(db, "users"), limit(maxN));

   // Optional course filter (used in FindPartnersScreen).
  if (opts.courseCode) {
    q = query(
      collection(db, "users"),
      where("enrolledCourses", "array-contains", opts.courseCode),
      limit(maxN)
    );
  }

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs
        .map((d) => normalizeProfile(d.id, d.data()))
        .filter((p) => (opts.excludeUid ? p.uid !== opts.excludeUid : true));

      onData(rows);
    },
    (err) => onError?.(err)
  );
}