// src/components/SessionsScreen.tsx
//
// Notes to self:
// - This is intentionally lightweight for the demo.
// - “Upcoming sessions” live on HomeScreen, so this screen is a placeholder.
// - I keep the layout consistent with the rest of the app (same padding + scroll).
// - I use a clean icon (no emoji) for the back action.

import type { FC } from "react";

type Props = {
  onNavigate: (screen: string) => void;
};

const SessionsScreen: FC<Props> = ({ onNavigate }) => {
  return (
    <div className="h-full w-full max-w-md mx-auto bg-white">
      <div className="h-full overflow-y-auto px-6 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate("home")}
            className="text-sm text-gray-600 hover:text-gray-900"
            aria-label="Back"
          >
            ←
          </button>
          <h1 className="text-base font-semibold flex-1 text-center pr-6">
            Sessions
          </h1>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">Coming soon</p>
          <p className="text-xs text-gray-600 mt-1">
            For the demo, upcoming sessions are shown on the Home screen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionsScreen;