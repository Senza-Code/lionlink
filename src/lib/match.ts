export type MatchResult = {
  score: number;
  reasons: string[];
};

export type ProfileLike = {
  courses?: string[];
  goals?: string[];
  availability?: string[];
  major?: string;
  year?: string;
};

export type SessionLike = {
  courseCode?: string;
  courseName?: string;
  hostName?: string;
  startAt?: any; // Firestore Timestamp
  endAt?: any;   // Firestore Timestamp
};

function asArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

export function scoreSession(me: ProfileLike, session: SessionLike): MatchResult {
  const reasons: string[] = [];
  let score = 0;

  const myCourses = asArray(me?.courses);
  const myGoals = asArray(me?.goals);
  const myAvail = asArray(me?.availability);

  const courseCode = (session?.courseCode ?? "").trim();

  // 1) Course match (big weight)
  if (courseCode && myCourses.includes(courseCode)) {
    score += 70;
    reasons.push("In your courses");
  }

  // 2) Goal overlap (optional, safe)
  const sessionTags = asArray((session as any)?.tags); // if you add tags later
  const goalOverlap = myGoals.filter((g) => sessionTags.includes(g));
  if (goalOverlap.length > 0) {
    score += Math.min(20, goalOverlap.length * 10);
    reasons.push(`Matches your goals (${goalOverlap[0]})`);
  }

  // 3) Availability overlap (optional, safe)
  const sessionSlot = (session as any)?.timeSlot; // if you add timeSlot later
  if (sessionSlot && myAvail.includes(sessionSlot)) {
    score += 10;
    reasons.push("Fits your schedule");
  }

  // Clamp 0–100
  score = Math.max(0, Math.min(100, score));

  return { score, reasons };
}

/**
 * Optional (later): partner matching
 */
export function scorePartner(me: ProfileLike, them: ProfileLike): MatchResult {
  const reasons: string[] = [];
  let score = 0;

  const myCourses = asArray(me?.courses);
  const theirCourses = asArray(them?.courses);

  const sharedCourses = myCourses.filter((c) => theirCourses.includes(c));
  if (sharedCourses.length > 0) {
    score += Math.min(60, sharedCourses.length * 20);
    reasons.push(`Shared course: ${sharedCourses[0]}`);
  }

  const myGoals = asArray(me?.goals);
  const theirGoals = asArray(them?.goals);
  const sharedGoals = myGoals.filter((g) => theirGoals.includes(g));
  if (sharedGoals.length > 0) {
    score += Math.min(30, sharedGoals.length * 15);
    reasons.push(`Shared goal: ${sharedGoals[0]}`);
  }

  const myAvail = asArray(me?.availability);
  const theirAvail = asArray(them?.availability);
  const sharedAvail = myAvail.filter((a) => theirAvail.includes(a));
  if (sharedAvail.length > 0) {
    score += 10;
    reasons.push("Schedule overlaps");
  }

  score = Math.max(0, Math.min(100, score));
  return { score, reasons };
}