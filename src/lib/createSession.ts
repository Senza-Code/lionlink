// src/lib/createSession.ts
//
// Notes to self:
// - This helper creates a new study session in Firestore.
// - I’m keeping it intentionally small and focused:
//   no validation, no UI logic, just persistence.
// - For the demo, sessions are created elsewhere and rendered on Home.
// - In the future, this is where I’d add:
//   - input validation
//   - conflict checking
//   - permissions / role checks

import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

// I’m accepting plain JS Dates here so the UI stays simple.
// Firestore needs Timestamps, so I convert them inside this function
export async function createSession(input: {
  courseCode: string;
  courseName: string;
  hostName: string;
  location: string;
  startAt: Date;
  endAt: Date;
  createdBy: string;
}) {
  await addDoc(collection(db, "sessions"), {
     // Spread the basic session info
    ...input,

     // Convert Dates → Firestore Timestamps
    startAt: Timestamp.fromDate(input.startAt),
    endAt: Timestamp.fromDate(input.endAt),

   // Server-side timestamp so ordering is consistent 
    createdAt: serverTimestamp(),

  // I’m initializing this at 0 so the Home screen
  // can safely increment/decrement for the demo 
    interestedCount: 0,
  });
}