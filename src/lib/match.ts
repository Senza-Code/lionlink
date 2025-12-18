// src/lib/match.ts
//
// Notes to self:
// - This matcher is intentionally simple for the semester project demo.
// - I’m optimizing for clarity + believability, not algorithmic perfection.
// - Courses matter most, study style helps refine.
// - The goal is to avoid discouraging low matches during demos.

// I’m keeping the inputs super simple so I don’t fight TypeScript.
// I only need courses + style tags for the demo
type Me = {
  courses?: string[];
  studyStyleTags?: string[];
};

type Them = {
  courses?: string[];
  studyStyleTags?: string[];
};

// Defensive helper:
// - Firestore data changed shapes a few times during development.
// - This guarantees I always work with a clean string array
function asArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}


// Case-insensitive intersection count.
// I’m using sets to keep this readable and fast enough for UI
function intersectionCount(a: string[], b: string[]) {
  const setB = new Set(b.map((x) => x.toLowerCase()));
  return a.reduce((acc, x) => acc + (setB.has(x.toLowerCase()) ? 1 : 0), 0);
}

// Main scoring function.
//
// Design decisions (for future me / TA):
// - Starts with a friendly base score so nobody feels rejected.
// - Shared courses give a big boost (study partners need shared context).
// - Shared study styles add smaller boosts.
// - Final score is capped at 100 to keep UI sane
export function scorePartner(me: Me, them: Them) {
  const myCourses = asArray(me.courses);
  const theirCourses = asArray(them.courses);

  const myTags = asArray(me.studyStyleTags);
  const theirTags = asArray(them.studyStyleTags);

  const reasons: string[] = [];

  // Base score so it feels like a “recommendation engine” and not a punishment engine.
  let score = 35;

  // Courses are king for a study partner demo.
  const sharedCourses = intersectionCount(myCourses, theirCourses);
  if (sharedCourses > 0) {
    score += 45; // big bump
    reasons.push(`${sharedCourses} shared course${sharedCourses > 1 ? "s" : ""}`);
  }

  // Study style tags help fine-tune compatibility.
  const sharedTags = intersectionCount(myTags, theirTags);
  if (sharedTags > 0) {
    score += Math.min(20, sharedTags * 7);
    reasons.push(`${sharedTags} shared style tag${sharedTags > 1 ? "s" : ""}`);
  }

  // Hard cap to 100 because UI doesn’t need 143% match 😭
  score = Math.max(0, Math.min(100, score));

  return { score, reasons };
}