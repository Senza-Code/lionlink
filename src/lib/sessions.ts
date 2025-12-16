import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type StudySession = {
  id: string;
  courseCode: string;
  courseName: string;
  hostName: string;
  location: string;
  startAt: Timestamp;
  endAt: Timestamp;
  interestedCount: number;
  createdBy?: string;
};

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
