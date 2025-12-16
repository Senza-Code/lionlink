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

export type UserProfile = {
  uid: string;
  displayName: string;
  major?: string;
  year?: string;
  courses?: string[];
  studyStyleTags?: string[];
};

function normalizeProfile(id: string, data: DocumentData): UserProfile {
  return {
    uid: id,
    displayName: data.displayName ?? "Student",
    major: data.major ?? "",
    year: data.year ?? "",
    courses: Array.isArray(data.courses) ? data.courses : [],
    studyStyleTags: Array.isArray(data.studyStyleTags) ? data.studyStyleTags : [],
  };
}

/**
 * Live partner feed. You can filter by course later.
 */
export function listenToPartners(
  opts: { courseCode?: string; excludeUid?: string; max?: number },
  onData: (partners: UserProfile[]) => void,
  onError?: (e: unknown) => void
): Unsubscribe {
  const max = opts.max ?? 25;

  // Base query
  let q = query(collection(db, "users"), limit(max));

  // Optional: filter by course using array-contains
  if (opts.courseCode) {
    q = query(collection(db, "users"), where("courses", "array-contains", opts.courseCode), limit(max));
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