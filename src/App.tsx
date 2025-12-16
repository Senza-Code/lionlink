import { useEffect, useState } from "react";
import LoginScreen from "./components/LoginScreen";
import HomeScreen from "./components/HomeScreen";
import FindPartnersScreen from "./components/FindPartnersScreen";
import BottomNavigation from "./components/BottomNavigation";
import SessionsScreen from "./components/SessionsScreen";
import ProfileScreen from "./components/ProfileScreen";

import { listenToAuth } from "./lib/auth";
import { ensureUserProfile } from "./lib/profiles";
import type { User } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<string>("login");

  useEffect(() => {
    const unsub = listenToAuth(async (u) => {
      setUser(u);
      setAuthReady(true);

      if (u) {
        try {
          await ensureUserProfile(u);
        } catch (e) {
          console.error("Failed to ensure user profile:", e);
        }
        setCurrentScreen("home");
      } else {
        setCurrentScreen("login");
      }
    });

    return () => unsub();
  }, []);

  const handleNavigate = (screen: string) => setCurrentScreen(screen);
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

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

  // 1) While Firebase is checking session
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8 text-center">
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // 2) If NOT logged in, always show Login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="relative h-[700px] w-full max-w-md bg-white shadow-2xl rounded-xl overflow-hidden">
          <LoginScreen onNavigate={handleNavigate} />
        </div>
      </div>
    );
  }

  // 3) Logged in: show app screens
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative h-[700px] w-full max-w-md bg-white shadow-2xl rounded-xl overflow-hidden">
        {renderScreen()}
        <BottomNavigation currentScreen={currentScreen} onNavigate={handleNavigate} />
      </div>
    </div>
  );
}
