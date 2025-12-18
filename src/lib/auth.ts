// src/lib/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "./firebase";

const UNI_DOMAIN = "columbia.edu";

function toColumbiaEmail(input: string) {
  const v = input.trim().toLowerCase();
  if (!v) return "";

  // allow UNI ("ps3358") OR full email ("ps3358@columbia.edu")
  if (v.includes("@")) return v;
  return `${v}@${UNI_DOMAIN}`;
}

function assertColumbiaEmail(email: string) {
  const ok = email.toLowerCase().endsWith(`@${UNI_DOMAIN}`);
  if (!ok) throw new Error("Columbia email required (@columbia.edu).");
}

// --- UNI LOGIN ---
export async function loginWithUni(uniOrEmail: string, password: string) {
  const email = toColumbiaEmail(uniOrEmail);
  assertColumbiaEmail(email);
  return signInWithEmailAndPassword(auth, email, password);
}

// --- UNI SIGNUP (NO GMAIL) ---
export async function signUpWithUni(uniOrEmail: string, password: string) {
  const email = toColumbiaEmail(uniOrEmail);
  assertColumbiaEmail(email);

  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Send verification email
  await sendEmailVerification(cred.user);

  // Optional: sign out immediately until they verify (strongest “trust” stance)
  await signOut(auth);

  return cred;
}

// --- AUTH STATE ---
export function listenToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// --- PASSWORD RESET (ONLY @columbia.edu) ---
export async function resetPassword(uniOrEmail: string) {
  const email = toColumbiaEmail(uniOrEmail);
  assertColumbiaEmail(email);
  return sendPasswordResetEmail(auth, email);
}

// --- RESEND VERIFICATION ---
export async function resendVerification() {
  if (!auth.currentUser) throw new Error("No user session.");
  return sendEmailVerification(auth.currentUser);
}