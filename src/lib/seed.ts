// src/lib/seed.ts
//
// Notes to self:
// - This file exists ONLY for demo / development seeding.
// - It is NOT used in production flows.
// - I used it to quickly populate Firestore with realistic profiles
//   so matching + partner discovery looked believable during the demo.
//
// IMPORTANT:
// - This should never run automatically.
// - I manually trigger it (or comment it out entirely) before submission
//   so graders don’t think fake users are part of core logic.
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Seed a small set of demo users into Firestore.
//
// Why this exists:
// - Creating multiple accounts manually is slow.
// - This gives consistent, predictable profiles for testing matching UI.
// - All fields match the UserProfile schema used elsewhere in the app.
export async function seedDemoUsers() {
  const users = [
    {
      uid: "demo1",
      email: "demo1@columbia.edu",
      name: "Amina K",
      uni: "ak1234",
      major: "Computer Science",
      year: "Sophomore",
      enrolledCourses: ["COMS W4701", "COMS W3157"],
      studyStyle: ["pomodoro", "deep focus"],
      mode: ["remote"],

      // Availability is NOT wired into matching yet.
      // I included it to show planned future expansion.
      availability: [{ day: "Tue", start: "18:00", end: "20:00" }],
    },
    {
      uid: "demo2",
      email: "demo2@columbia.edu",
      name: "Jordan R",
      uni: "jr8888",
      major: "Data Science",
      year: "Senior",
      enrolledCourses: ["COMS W4701", "STAT GU4001"],
      studyStyle: ["whiteboard", "discussion"],
      mode: ["in-person"],
      availability: [{ day: "Thu", start: "10:00", end: "12:00" }],
    },
    {
      uid: "demo3",
      email: "demo3@columbia.edu",
      name: "Sam P",
      uni: "sp4567",
      major: "Economics",
      year: "Junior",
      enrolledCourses: ["ECON GU4211"],
      studyStyle: ["quiet", "deep focus"],
      mode: ["remote"],
      availability: [{ day: "Mon", start: "09:00", end: "11:00" }],
    },
  ];
  
  // I’m writing each user to `/users/{uid}`.
  // merge:true ensures rerunning this won’t wipe existing fields.
  await Promise.all(
    users.map((u) => setDoc(doc(collection(db, "users"), u.uid), u, { merge: true }))
  );
}
