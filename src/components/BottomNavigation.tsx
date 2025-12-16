import React from "react";
import {
  Home,
  Search,
  Calendar,
  User,
} from "lucide-react";

type BottomNavigationProps = {
  currentScreen: string;
  onNavigate: (screen: string) => void;
};

const items = [
  { id: "home", label: "Home", icon: Home },
  { id: "find", label: "Find", icon: Search },
  { id: "sessions", label: "Sessions", icon: Calendar },
  { id: "profile", label: "Profile", icon: User },
];

export default function BottomNavigation({
  currentScreen,
  onNavigate,
}: BottomNavigationProps) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-2">
        {items.map((item) => {
          const active = currentScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-xs transition-colors ${
                active ? "text-blue-600 font-medium" : "text-gray-400"
              }`}
            >
              <Icon size={20} strokeWidth={2.2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
