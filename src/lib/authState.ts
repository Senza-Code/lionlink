// src/lib/authState.ts
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";

export function listenToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
