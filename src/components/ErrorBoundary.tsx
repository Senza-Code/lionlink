import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: any) {
    return { hasError: true, error: err?.message ?? String(err) };
  }

  componentDidCatch(err: any) {
    console.error("Caught by ErrorBoundary:", err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: "system-ui" }}>
          <h2 style={{ color: "#b91c1c", fontWeight: 700 }}>
            LionLink crashed (but we caught it ✅)
          </h2>
          <p style={{ marginTop: 8 }}>{this.state.error}</p>
          <p style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            Open Console for the full stack trace.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}