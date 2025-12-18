// src/lib/logout.ts
//
// Notes to self:
// - This is a tiny helper so components don’t import Firebase directly.
// - Keeping auth actions centralized makes refactors easier later.
// - Returning the promise lets callers await or ignore it safely

import { signOut } from "firebase/auth";
import { auth } from "./firebase";

// Signs the current user out of Firebase Auth.
// App.tsx listens to auth state changes and will route automatically
export function logout() {
  return signOut(auth);
}
