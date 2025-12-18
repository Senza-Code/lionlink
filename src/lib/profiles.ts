// src/lib/profiles.ts
//
// Notes to self:
// - This file owns the *authoritative* shape of a user profile in Firestore.
// - All profile creation + reads flow through here.
// - Keeping this centralized prevents schema drift across the app.
import type { User } from "firebase/auth";
import { db } from "./firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

// Firestore user profile shape.
//
// IMPORTANT SCHEMA DECISIONS:
// - `enrolledCourses` is the canonical field name (not `courses`).
// - Some fields are optional to allow partial profiles during onboarding.
export type UserProfile = {
  uid: string;
  email?: string | null;
  uni?: string | null;

  name?: string;
  major?: string;
  year?: string;

  // IMPORTANT: we use enrolledCourses everywhere (not "courses")
  enrolledCourses?: string[];

  studyStyle?: string[];
  mode?: string[];

  createdAt?: any;
  updatedAt?: any;
};

// Helper: derive a readable fallback name from email.
// Example: "ps3358@columbia.edu" → "Ps3358
function nameFromEmail(email: string) {
  const base = email.split("@")[0] || "Student";
  return base
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}


// Ensure a Firestore profile exists for the authenticated user.
//
// Why this exists:
// - Firebase Auth users do NOT automatically get Firestore documents.
// - This guarantees every logged-in user has a profile doc.
// - Safe to call multiple times (idempotent).
export async function ensureUserProfile(
  user: User,
  opts?: { uni?: string | null; name?: string }
) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    // Profile already exists → just keep updatedAt fresh.
    await setDoc(ref, { updatedAt: serverTimestamp() }, { merge: true });
    return;
  }

   // First-time profile creation.
  const email = user.email ?? null;

  const initial: UserProfile = {
    uid: user.uid,
    email,
    uni: opts?.uni ?? null,

    // Prefer provided name → fallback to email-derived name → fallback to "Student".
    name: opts?.name ?? (email ? nameFromEmail(email) : "Student"),
    
    major: "",
    year: "",

    enrolledCourses: [],
    studyStyle: [],
    mode: [],

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  // Merge=true so future schema additions don’t break older users.
  await setDoc(ref, initial, { merge: true });
}

// Fetch the current user's profile.
//
// Notes:
// - Returns null if the document does not exist.
// - Caller is responsible for handling loading / empty states.
export async function getMyProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return snap.data() as UserProfile;
}