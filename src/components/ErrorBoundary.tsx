// src/components/ErrorBoundary.tsx
//
// This component is a safety net for the entire app.
// If any child component throws during rendering,
// lifecycle methods, or constructors, this boundary
// prevents the whole app from crashing.
//
// Notes to self:
// - This is intentionally simple and global
// - Error details are shown for debugging during development
// - In a production app, this could log to an external service

import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: string;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  // React calls this when a child throws.
  // I store the error message so I can display something useful.
  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      error:
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Unknown error",
    };
  }

  // This still logs the full error for debugging.
  componentDidCatch(error: unknown) {
    console.error("Caught by ErrorBoundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: "system-ui" }}>
          <h2 style={{ color: "#b91c1c", fontWeight: 700 }}>
            LionLink encountered an error
          </h2>

          <p style={{ marginTop: 8 }}>
            {this.state.error ?? "Something went wrong."}
          </p>

          <p style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            Open the browser console for the full stack trace.
          </p>
        </div>
      );
    }

    // If nothing breaks, just render the app as usual.
    return this.props.children;
  }
}