import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

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

  await Promise.all(
    users.map((u) => setDoc(doc(collection(db, "users"), u.uid), u, { merge: true }))
  );
}
