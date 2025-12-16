import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function incrementInterested(sessionId: string) {
  const ref = doc(db, "sessions", sessionId);
  await updateDoc(ref, { interestedCount: increment(1) });
}