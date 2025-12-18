// src/lib/updateProfile.ts
//
// Notes to self:
// - This file handles ALL profile updates from the UI.
// - Profile creation happens in profiles.ts (ensureUserProfile).
// - Components should never write directly to Firestore.
//
// Centralizing updates here avoids silent schema drift.

import { db } from "./firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import type { UserProfile } from "./profiles";

/**
 * Updates the current user's profile document.
 *
 * Design choices:
 * - Uses merge:true so partial updates don’t wipe fields
 * - Always updates updatedAt for traceability
 * - Explicitly prevents UID from ever being changed
 */
export async function updateMyProfile(uid: string, updates: Partial<UserProfile>) {
  const ref = doc(db, "users", uid);

  // Safety check:
  // Even if a caller accidentally passes `uid` inside updates,
  // I strip it out so Firestore document identity is never corrupted.
  const { uid: _ignore, ...safeUpdates } = updates as any;

  await setDoc(
    ref,
    {
      ...safeUpdates,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}