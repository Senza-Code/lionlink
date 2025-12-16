import type { User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export type UserProfile = {
  uid: string;
  email: string | null;
  uni?: string | null;

  name: string;
  major: string;
  year: string;

  courses: string[];
  goals: string[];
  availability: string[];

  createdAt?: any;
  updatedAt?: any;
};

function nameFromEmail(email: string | null) {
  const base = (email ?? "").split("@")[0] || "Student";
  return base.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function ensureUserProfile(
  user: User,
  opts?: { uni?: string | null; name?: string }
) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      uni: opts?.uni ?? null,

      name: opts?.name ?? nameFromEmail(user.email),
      major: "Undeclared",
      year: "—",

      // ✅ critical defaults so match.ts never crashes
      courses: [],
      goals: [],
      availability: [],

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, profile);
    return profile;
  }

  // If profile exists but missing fields, patch them (safe migrations)
  const data = snap.data() as Partial<UserProfile>;
  const patch: Partial<UserProfile> = {};

  if (!Array.isArray(data.courses)) patch.courses = [];
  if (!Array.isArray(data.goals)) patch.goals = [];
  if (!Array.isArray(data.availability)) patch.availability = [];
  if (typeof data.name !== "string") patch.name = nameFromEmail(user.email);
  if (typeof data.major !== "string") patch.major = "Undeclared";
  if (typeof data.year !== "string") patch.year = "—";

  if (Object.keys(patch).length > 0) {
    patch.updatedAt = serverTimestamp();
    await updateDoc(ref, patch);
  }

  return { ...data, ...patch };
}

export async function getMyProfile(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}