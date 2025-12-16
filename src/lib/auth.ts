import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "./firebase";

const UNI_DOMAIN = "columbia.edu";

// ---------- AUTH ACTIONS ----------

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginWithUni(uni: string, password: string) {
  const email = `${uni}@${UNI_DOMAIN}`;
  return signInWithEmailAndPassword(auth, email, password);
}

// ---------- AUTH STATE LISTENER ----------

export function listenToAuth(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}

// --------- Forgot PW ---------// 

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}
