// src/App.tsx
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";

import LoginScreen from "./components/LoginScreen";
import HomeScreen from "./components/HomeScreen";
import FindPartnersScreen from "./components/FindPartnersScreen";
import BottomNavigation from "./components/BottomNavigation";
import SessionsScreen from "./components/SessionsScreen";
import ProfileScreen from "./components/ProfileScreen";

import { listenToAuth } from "./lib/auth";
import { ensureUserProfile } from "./lib/profiles";

// Notes to self:
// - I’m keeping navigation local/simple (no React Router) to reduce demo risk.
// - Firebase auth is the source of truth for “logged in vs logged out”.
// - I intentionally keep Login visible for a short moment so it doesn’t blink away on refresh.
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function App() {
   // My current Firebase user session (null means logged out).
  const [user, setUser] = useState<User | null>(null);

  // I don’t render the app until Firebase finishes checking the session.
  const [authReady, setAuthReady] = useState(false);

   // My lightweight “router” for the demo.
  const [currentScreen, setCurrentScreen] = useState<string>("login");

  useEffect(() => {
    // I subscribe once; Firebase calls me back whenever auth state changes.
    const unsub = listenToAuth(async (u) => {
      // I want the login screen to be visible for at least a moment (demo polish)
      const minSplashMs = 900;
      const start = Date.now();

      // I update user immediately so the UI reflects real auth state.
      setUser(u);

      if (u) {
        // I create/merge a Firestore user profile doc if it’s missing.
        // This keeps “users/{uid}” consistent for Home + Find Partners.
        try {
          await ensureUserProfile(u);
        } catch (e) {
           // If profile creation fails, I still let the app run for demo stability.
          console.error("Failed to ensure user profile:", e);
        }

        // I enforce minimum time before switching to Home so it doesn’t “blink”
        const elapsed = Date.now() - start;
        if (elapsed < minSplashMs) await sleep(minSplashMs - elapsed);

        // Now I can render the app.
        setAuthReady(true);
        setCurrentScreen("home");
      } else {
        // Logged out path: show login.
        setAuthReady(true);
        setCurrentScreen("login");
      }
    });

     // Cleanup on unmount.
    return () => unsub();
  }, []);

  // Notes to self:
  // - I keep navigation as a single function so every screen can call it.
  const handleNavigate = (screen: string) => setCurrentScreen(screen);

  // Notes to self:
  // - This switch is my “router.”
  // - Default fallback is Home to avoid blank screens.
  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen onNavigate={handleNavigate} />;
      case "find":
        return <FindPartnersScreen onNavigate={handleNavigate} />;
      case "sessions":
        return <SessionsScreen onNavigate={handleNavigate} />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

 // Notes to self:
  // - While Firebase is still determining if a session exists, I show a stable loading container.
  // - This prevents UI flicker and avoids rendering screens that expect auth data too early. 
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="relative h-[700px] w-full max-w-md bg-white shadow-2xl rounded-xl overflow-hidden flex items-center justify-center">
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

 // Notes to self:
  // - If there’s no user, I ALWAYS show Login (and I do not show bottom nav).
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="relative h-[700px] w-full max-w-md bg-white shadow-2xl rounded-xl overflow-hidden">
          <LoginScreen onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  // Notes to self:
  // - Logged in path: render current screen + bottom navigation.
  // - Bottom nav stays visible across Home / Find / Sessions / Profile.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative h-[700px] w-full max-w-md bg-white shadow-2xl rounded-xl overflow-hidden">
        {renderScreen()}
        <BottomNavigation currentScreen={currentScreen} onNavigate={handleNavigate} />
      </div>
    </div>
  );
}