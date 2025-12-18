// src/components/LoginScreen.tsx
//
// This screen is UNI-first on purpose.
// Notes to self:
// - I only support Columbia emails to reinforce trust in the demo story.
// - I treat UNI input like "ps3358" as "ps3358@columbia.edu" behind the scenes.
// - I keep signup + login in the same screen to reduce navigation complexity.
// - App.tsx handles routing after auth state changes, so I do not navigate here

import { useState } from "react";
import type { FC, FormEvent } from "react";
import { GraduationCap } from "lucide-react";
import { loginWithUni, signUpWithUni, resetPassword } from "../lib/auth";

type LoginScreenProps = {
  onNavigate: (screen: string) => void;
};

type Mode = "none" | "uni-login" | "uni-signup";

const LoginScreen: FC<LoginScreenProps> = () => {
  const [mode, setMode] = useState<Mode>("none");
  const [loading, setLoading] = useState(false);

  // I use message for success states (signup success / reset sent).
  const [message, setMessage] = useState<string | null>(null);

  // I use error for blocking states (bad password, bad email, etc.).
  const [error, setError] = useState<string | null>(null);

  // Shared form inputs for both login + signup.
  const [uniOrEmail, setUniOrEmail] = useState("");
  const [password, setPassword] = useState("");

  // I sign the user in with UNI/email + password.
  // App.tsx will route once Firebase auth state updates.
  const onUniLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await loginWithUni(uniOrEmail, password);
      // App.tsx will route based on auth state
    } catch (err: any) {
      setError(err?.message ?? "UNI sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  // I create a UNI account (restricted to @columbia.edu).
  // After signup, I show a success message and swap back to login mode.
  const onUniSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await signUpWithUni(uniOrEmail, password);
      setMessage(
        "Verification email sent. Check your Columbia inbox and verify before signing in."
      );

      // I send them back to login so the next action is clear.
      setMode("uni-login");

      // I clear the password so I am not holding it in state longer than necessary.
      setPassword("");
    } catch (err: any) {
      setError(err?.message ?? "UNI account creation failed.");
    } finally {
      setLoading(false);
    }
  };

  // I trigger password reset.
  // I require UNI/email input, otherwise the user has no idea where it went.
  const onForgotPassword = async () => {
    setError(null);
    setMessage(null);

    if (!uniOrEmail.trim()) {
      setError("Enter your UNI or @columbia.edu email first.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(uniOrEmail);
      setMessage("Password reset email sent.");
    } catch (err: any) {
      setError(err?.message ?? "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-500 px-8 pt-10 pb-9 text-center text-white shadow-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/30">
          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-blue-600">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">LionLink</h1>
        <p className="mt-2 text-sm text-blue-100">Link up. Lock in. Level up.</p>
        <p className="mt-2 text-xs text-blue-100/90">
          Requires a verified @columbia.edu email
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 px-8 pt-8 pb-8 flex flex-col">
        {/* Primary CTA */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setMode("uni-login")}
            className="w-full inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            <span>Continue with UNI</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("uni-signup")}
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Create UNI account
          </button>
        </div>

        {/* Status */}
        {error && <p className="mt-4 text-xs text-red-600 text-center">{error}</p>}
        {message && (
          <p className="mt-4 text-xs text-green-700 text-center">{message}</p>
        )}

        {/* Forms */}
        <div className="mt-6 space-y-4">
          {(mode === "uni-login" || mode === "uni-signup") && (
            <form
              onSubmit={mode === "uni-login" ? onUniLogin : onUniSignup}
              className="space-y-3"
            >
              <p className="text-xs text-gray-500">
                Enter your UNI (e.g. ps3358) or full @columbia.edu email.
              </p>

              <input
                value={uniOrEmail}
                onChange={(e) => setUniOrEmail(e.target.value)}
                placeholder="UNI or @columbia.edu email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {loading
                  ? "Working..."
                  : mode === "uni-login"
                  ? "Sign in"
                  : "Create account"}
              </button>

              {mode === "uni-login" && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:underline text-left"
                >
                  Forgot password?
                </button>
              )}
            </form>
          )}
        </div>

        <p className="mt-auto pt-6 text-[11px] text-gray-400 text-center leading-snug">
          By continuing, you agree to the Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
