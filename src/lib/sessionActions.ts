// src/lib/sessionActions.ts
//
// Notes to self:
// - This file is the “single source of truth” for the Interested button logic.
// - I’m using a Firestore transaction so the count stays correct even if
//   multiple people click at the same time.
//
// What this guarantees:
// - Either BOTH happen (toggle doc + count update) or neither happens.
// - The count never goes negative.
// - The UI can do optimistic updates, but this keeps the database consistent.
import { doc, runTransaction } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Toggle interest for a user AND keep sessions/{id}.interestedCount in sync.
 *
 * Data model:
 * - sessions/{sessionId}                 (stores interestedCount)
 * - sessions/{sessionId}/interested/{uid} (exists if user is interested)
 *
 * Why transaction:
 * - If two users click around the same time, the count still stays correct.
 */
export async function toggleInterestedWithCount(sessionId: string, uid: string) {
   // I’m reading both docs in the same transaction so they’re consistent.
  const sessionRef = doc(db, "sessions", sessionId);
  const interestedRef = doc(db, "sessions", sessionId, "interested", uid);

  await runTransaction(db, async (tx) => {
    const [sessionSnap, interestedSnap] = await Promise.all([
      tx.get(sessionRef),
      tx.get(interestedRef),
    ]);

    // If the session doc is missing, I can’t safely update the count.
    if (!sessionSnap.exists()) {
      throw new Error("Session not found");
    }

    const currentCount = (sessionSnap.data()?.interestedCount ?? 0) as number;

    if (interestedSnap.exists()) {
      // They were interested → now they’re not.
      tx.delete(interestedRef);

      // Defensive: don’t let the count drop below 0.
      tx.update(sessionRef, { interestedCount: Math.max(0, currentCount - 1) });
    } else {
      // They were not interested → now they are.
      // I’m keeping a timestamp for future analytics / ordering.
      tx.set(interestedRef, { createdAt: new Date() });
      tx.update(sessionRef, { interestedCount: currentCount + 1 });
    }
  });
}