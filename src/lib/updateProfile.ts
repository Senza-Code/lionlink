import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile } from "./profiles";

export async function updateMyProfile(
  uid: string,
  updates: Partial<UserProfile>
) {
  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
