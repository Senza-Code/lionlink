// src/lib/firebase.ts
//
// Notes to self:
// - This file is the single source of truth for Firebase setup.
// - Every other file imports auth/db from here (no re-initializing elsewhere).
// - Using environment variables keeps secrets out of the repo.
// - Vite exposes env vars via import.meta.env (NOT process.env).
// - The getApps() check prevents Firebase from crashing on hot reloads
//   or when the app mounts multiple times

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration pulled from environment variables.
// These are defined in .env and injected at build time
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

// Defensive check:
// If any env variable is missing, fail fast with a clear error.
// This saved me debugging time during deployment.
const missing = Object.entries(firebaseConfig)
  .filter(([_, v]) => !v)
  .map(([k]) => k);

if (missing.length) {
  throw new Error(
    `Missing Firebase env vars: ${missing.join(", ")}. Check .env and restart.`
  );
}

// Initialize Firebase once.
// getApps() prevents duplicate initialization during reloads.
export const app =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

// Export shared Firebase services.
// Everything else in the app imports from here.
export const auth = getAuth(app);
export const db = getFirestore(app);
