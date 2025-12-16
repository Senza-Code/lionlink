import React from "react";

type SessionsScreenProps = {
  onNavigate: (screen: string) => void;
};

export default function SessionsScreen({ onNavigate }: SessionsScreenProps) {
  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col px-6 pt-6 pb-16 bg-white">
      <header className="mb-4 space-y-1">
        <h1 className="text-xl font-semibold">Sessions</h1>
        <p className="text-sm text-gray-600">
          Track your upcoming and past accountability sessions.
        </p>
      </header>

      <main className="flex-1 space-y-4">
        <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <p className="font-semibold mb-1">No sessions scheduled yet</p>
          <p className="text-xs text-gray-600 mb-3">
            Once you start matching with partners, your focus sessions will show
            up here with reminders and check-in notes.
          </p>
          <button
            onClick={() => onNavigate("find")}
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-black transition-colors"
          >
            Find partners to schedule with
          </button>
        </section>

        <section className="space-y-2 text-xs text-gray-500">
          <p>Later we can add:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Calendar view of sessions</li>
            <li>Streaks and consistency metrics</li>
            <li>Notes after each session</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
