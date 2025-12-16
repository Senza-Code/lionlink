import { useState } from "react";
import type { FC, FormEvent } from "react";
import { GraduationCap } from "lucide-react";
import {
  loginWithEmail,
  loginWithUni,
  signUpWithEmail,
  resetPassword, // ✅ add this
} from "../lib/auth";

type LoginScreenProps = {
  onNavigate: (screen: string) => void;
};

type Mode = "none" | "uni" | "login" | "signup";

const LoginScreen: FC<LoginScreenProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<Mode>("none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uni, setUni] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleUniSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithUni(uni.trim(), password);
      // App.tsx handles navigation on auth state change
    } catch (err: any) {
      setError(err?.message ?? "UNI login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
    } catch (err: any) {
      setError(err?.message ?? "Email login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password);
    } catch (err: any) {
      setError(err?.message ?? "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);

    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }

    try {
      await resetPassword(email.trim());
      setError("Password reset email sent 📬 Check your inbox.");
    } catch (e: any) {
      setError(e?.message ?? "Could not send reset email.");
    }
  };

  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col bg-white">
      {/* Blue hero header */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-500 px-8 pt-10 pb-9 text-center text-white shadow-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/30">
          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-blue-600">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">LionLink</h1>
        <p className="mt-2 text-sm text-blue-100">Link up. Lock in. Level up.</p>
      </div>

      {/* Body */}
      <div className="flex-1 px-8 pt-8 pb-8 flex flex-col">
        {/* Main quick actions */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setMode("uni")}
            className="w-full inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            <span>Continue with your UNI</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("signup")}
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Sign Up with Email
          </button>

          <button
            type="button"
            onClick={() => setMode("login")}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Already have an account?
          </button>
        </div>

        {/* Error message */}
        {error && <p className="mt-4 text-xs text-red-600 text-center">{error}</p>}

        {/* Forms */}
        <div className="mt-6 space-y-4">
          {/* UNI login */}
          {mode === "uni" && (
            <form onSubmit={handleUniSubmit} className="space-y-3">
              <p className="text-xs text-gray-500">
                Use your university UNI. We&apos;ll treat it as{" "}
                <span className="font-mono">@columbia.edu</span> behind the scenes.
              </p>

              <input
                value={uni}
                onChange={(e) => setUni(e.target.value)}
                placeholder="Your UNI (e.g. ab1234)"
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
                {loading ? "Signing in..." : "Continue"}
              </button>
            </form>
          )}

          {/* Email login */}
          {mode === "login" && (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
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
                {loading ? "Logging in..." : "Log In"}
              </button>

              <button
                type="button"
                onClick={handleResetPassword}
                className="mt-1 text-xs text-blue-600 hover:underline text-left"
              >
                Forgot password?
              </button>
            </form>
          )}

          {/* Email signup */}
          {mode === "signup" && (
            <form onSubmit={handleEmailSignup} className="space-y-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
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
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>

        {/* Terms footer */}
        <p className="mt-auto pt-6 text-[11px] text-gray-400 text-center leading-snug">
          By signing up, you agree with our{" "}
          <button className="text-blue-600 hover:underline">Terms of Service</button>{" "}
          and{" "}
          <button className="text-blue-600 hover:underline">Privacy Policy</button>.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;