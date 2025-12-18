// src/lib/sessions.ts
//
// Notes to self:
// - This file is responsible ONLY for reading session data.
// - Creating sessions happens in createSession.ts
// - Interest toggling/counts happen in sessionActions.ts
// - UI formatting happens in components
//
// Keeping this file “read-only” avoids circular logic bugs.

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// This is the exact shape the UI expects for a study session.
// I include `id` explicitly because Firestore keeps it separate
// from the document data.
export type StudySession = {
  id: string;

  courseCode: string;
  courseName: string;
  hostName: string;
  location: string;

  startAt: Timestamp;
  endAt: Timestamp;

  interestedCount: number;

   // Optional metadata (useful later, not required for demo)
  createdBy?: string;
};

/**
 * Live listener for upcoming study sessions.
 *
 * Why this is a listener instead of a one-time fetch:
 * - Sessions may be added while users are on the Home screen
 * - Interested counts can update in real time
 *
 * Ordering:
 * - Sorted by startAt ascending so “next up” sessions appear first
 */
export function listenToUpcomingSessions(
  callback: (sessions: StudySession[]) => void
) {
  const q = query(collection(db, "sessions"), orderBy("startAt", "asc"));

  return onSnapshot(q, (snap) => {
    const sessions: StudySession[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<StudySession, "id">),
    }));
    callback(sessions);
  });
}
