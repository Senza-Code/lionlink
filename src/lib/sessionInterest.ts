import { doc, serverTimestamp, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function setInterested(sessionId: string, uid: string, value: boolean) {
  const ref = doc(db, "sessions", sessionId, "interested", uid);
  if (value) {
    await setDoc(ref, { createdAt: serverTimestamp() });
  } else {
    await deleteDoc(ref);
  }
}

export async function getMyInterest(sessionId: string, uid: string) {
  const ref = doc(db, "sessions", sessionId, "interested", uid);
  const snap = await getDoc(ref);
  return snap.exists();
}