// src/lib/sessionInterest.ts
//
// Notes to self:
// - This file ONLY answers one question:
//   “Is this specific user interested in this specific session?”
// - I am NOT touching counts here — that’s handled in sessionActions.ts.
// - This separation saved me from several bugs and re-renders.
//
// Data model reminder:
// sessions/{sessionId}/interested/{uid}
// - If the doc exists → user is interested
// - If it doesn’t → user is not interested
import {
  doc,
  serverTimestamp,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Explicitly set interest on or off for a user.
 *
 * Why this exists:
 * - Some screens need a simple “set true / set false”
 * - This avoids guessing or toggling blindly
 *
 * NOTE:
 * - This does NOT update interestedCount
 * - That’s intentionally handled elsewhere (sessionActions.ts)
 */
export async function setInterested(
  sessionId: string,
  uid: string,
  value: boolean
) {
  const ref = doc(db, "sessions", sessionId, "interested", uid);


  if (value) {
     // User is interested → ensure the doc exists.
    // Timestamp is useful later for analytics or ordering.
    await setDoc(ref, { createdAt: serverTimestamp() });
    return;
  }

   // User is not interested → remove the doc entirely.
  await deleteDoc(ref);
}

/**
 * Check whether the current user is interested in a session.
 *
 * I’m intentionally returning a boolean:
 * - true  → doc exists
 * - false → doc does not exist
 *
 * This keeps UI logic dead simple.
 */
export async function getMyInterest(sessionId: string, uid: string) {
  const ref = doc(db, "sessions", sessionId, "interested", uid);
  const snap = await getDoc(ref);
  return snap.exists();
}