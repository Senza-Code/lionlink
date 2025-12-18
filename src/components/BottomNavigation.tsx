// src/components/BottomNavigation.tsx
//
// This component renders the persistent bottom navigation bar.
// It is intentionally simple and predictable, since it acts as
// the primary way users move between major sections of the app.
//
// Design notes to self:
// - Icons are intentionally neutral and monochrome (no emojis)
// - Navigation is state-driven, not route-driven, for demo stability
// - Safe-area padding is included for mobile devices (iOS especially)

import type { FC } from "react";
import { Home, Search, CalendarDays, User } from "lucide-react";

type Props = {
  // The currently active screen key (e.g. "home", "find")
  currentScreen: string;

  // Callback used to switch screens at the App level
  onNavigate: (screen: string) => void;
};

// Centralized tab configuration so labels/icons live in one place.
// This makes future edits or reordering low-risk.
const tabs = [
  { key: "home", label: "Home", icon: Home },
  { key: "find", label: "Find", icon: Search },
  { key: "sessions", label: "Sessions", icon: CalendarDays },
  { key: "profile", label: "Profile", icon: User },
];

const BottomNavigation: FC<Props> = ({ currentScreen, onNavigate }) => {
  return (
    <nav
      className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white"
      // This padding prevents the nav from being clipped by mobile safe areas
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4 px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onNavigate(tab.key)}
              className="flex flex-col items-center justify-center gap-1 py-2"
            >
              {/* Icons are intentionally minimal and consistent for clarity */}
              <Icon
                size={22}
                className={isActive ? "text-blue-600" : "text-gray-400"}
              />

              <span
                className={
                  "text-[11px] " +
                  (isActive ? "text-blue-600" : "text-gray-400")
                }
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;