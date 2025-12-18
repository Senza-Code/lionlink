// src/main.tsx

/*
  Notes to self:
  - This is the true entry point of the app.
  - ReactDOM.createRoot is required for React 18.
  - StrictMode is intentionally enabled:
      • It helps surface side-effect bugs during development.
      • It may cause some effects to run twice in dev, which is expected.
      • It does NOT affect production behavior.
  - ErrorBoundary wraps the entire app so a crash never blank-screens the demo.
*/

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/*
    If anything crashes, this prevents a white screen and shows a readable error.
    This was extremely helpful during late-stage debugging.
    */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);