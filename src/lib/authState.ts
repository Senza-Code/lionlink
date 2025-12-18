// src/lib/authState.ts
//
// Notes to self:
// - This is the single source of truth for auth state changes.
// - Firebase calls this listener whenever the user logs in, logs out,
//   refreshes the page, or when the auth token updates.
// - App.tsx uses this to decide which screen to render.
// - Keeping this logic isolated avoids auth checks scattered across components

import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";

export function listenToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
