// src/components/VerifyEmailScreen.tsx
//
// Notes to self (aka the email verification saga):
// - This screen exists because the “Columbia-only” trust model needs email verification.
// - In practice, verification emails can be delayed, filtered, or blocked (spam/DMARC/etc.).
// - The biggest lesson: verification is not just code—it’s deliverability + domain reputation.
// - For the demo, I keep this flow simple and honest: resend, refresh, or log out.
//
// What I learned:
// - `sendEmailVerification()` is easy; getting users to actually receive it is the hard part.
// - Users get stuck here if the email never arrives, so the UI must provide escape hatches.
// - Relying on “refresh the whole page” is not elegant, but it is reliable for demos.
//
// What I would do next (future plan):
// - Add a “change email” flow for typos.
// - Add clearer troubleshooting steps (check spam, promotions, search “Firebase”, etc.).
// - Consider alternative trust signals (invite codes, Columbia SSO, admin approval).
// - Store verification status in the user profile and poll/reload gracefully instead of full refresh.

import { useState } from "react";
import { auth } from "../lib/firebase";
import { resendVerification } from "../lib/auth";
import { logout } from "../lib/logout";

export default function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // I’m showing the exact email on the session so the user can confirm it’s correct.
  const email = auth.currentUser?.email ?? "";

  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col px-6 pt-10 pb-16 bg-white">
      <h1 className="text-xl font-semibold mb-2">Verify your email</h1>
      <p className="text-sm text-gray-600 mb-6">
        A verification link was sent to <span className="font-medium">{email}</span>.
        Verify your @columbia.edu email to continue.
      </p>

      {/* I’m showing either an error or a success message. */}
      {err && <p className="text-xs text-red-600 mb-3">{err}</p>}
      {msg && <p className="text-xs text-green-700 mb-3">{msg}</p>}

      <button
        onClick={async () => {
          // I’m resending the verification email.
          // Lesson learned: resend needs to exist because delivery isn’t guaranteed.
          setErr(null);
          setMsg(null);
          setLoading(true);
          try {
            await resendVerification();
            setMsg("Verification email resent.");
          } catch (e: any) {
            setErr(e?.message ?? "Could not resend.");
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        className="w-full rounded-full bg-blue-600 text-white py-2.5 text-sm font-medium disabled:opacity-60"
      >
        {loading ? "Sending..." : "Resend verification email"}
      </button>

      <button
        onClick={async () => {
          // I’m doing the simplest possible “check again”: reload user, then refresh page.
          // For the demo, this is reliable. Future version should avoid full page reload.
          await auth.currentUser?.reload();
          window.location.reload(); // simplest for demo
        }}
        className="w-full mt-3 rounded-full border border-gray-300 bg-white py-2.5 text-sm font-medium"
      >
        I verified — refresh
      </button>

      <button
        onClick={logout}
        className="w-full mt-auto rounded-full bg-gray-900 text-white py-2.5 text-sm font-medium"
      >
        Log out
      </button>
    </div>
  );
}