import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function createSession(input: {
  courseCode: string;
  courseName: string;
  hostName: string;
  location: string;
  startAt: Date;
  endAt: Date;
  createdBy: string;
}) {
  await addDoc(collection(db, "sessions"), {
    ...input,
    startAt: Timestamp.fromDate(input.startAt),
    endAt: Timestamp.fromDate(input.endAt),
    createdAt: serverTimestamp(),
    interestedCount: 0,
  });
}