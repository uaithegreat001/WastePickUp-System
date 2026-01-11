import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./app/App.jsx";
import { AuthProvider } from "./features/auth/AuthContext.jsx";
import { initSyncManager } from "./services/syncService";
import { handleError } from "./lib/errorHandler";

// Offline Icon Registration (Explicit Bundling)
import { addIcon } from "@iconify/react";

const dashboardSquare02 = {
  body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.5 8.75v-2c0-1.644 0-2.466-.454-3.019a2 2 0 0 0-.277-.277C9.216 3 8.394 3 6.75 3s-2.466 0-3.019.454a2 2 0 0 0-.277.277C3 4.284 3 5.106 3 6.75v2c0 1.644 0 2.466.454 3.019q.125.152.277.277c.553.454 1.375.454 3.019.454s2.466 0 3.019-.454q.152-.125.277-.277c.454-.553.454-1.375.454-3.019ZM7.75 15.5h-2c-.698 0-1.047 0-1.33.086a2 2 0 0 0-1.334 1.333C3 17.203 3 17.552 3 18.25s0 1.047.086 1.33a2 2 0 0 0 1.333 1.334C4.703 21 5.052 21 5.75 21h2c.698 0 1.047 0 1.33-.086a2 2 0 0 0 1.334-1.333c.086-.284.086-.633.086-1.331s0-1.047-.086-1.33a2 2 0 0 0-1.333-1.334c-.284-.086-.633-.086-1.331-.086ZM21 17.25v-2c0-1.644 0-2.466-.454-3.019a2 2 0 0 0-.277-.277c-.553-.454-1.375-.454-3.019-.454s-2.466 0-3.019.454a2 2 0 0 0-.277.277c-.454.553-.454 1.375-.454 3.019v2c0 1.644 0 2.466.454 3.019q.125.152.277.277c.553.454 1.375.454 3.019.454s2.466 0 3.019-.454q.152-.125.277-.277C21 19.716 21 18.894 21 17.25ZM18.25 3h-2c-.698 0-1.047 0-1.33.086a2 2 0 0 0-1.334 1.333c-.086.284-.086.633-.086 1.331s0 1.047.086 1.33a2 2 0 0 0 1.333 1.334c.284.086.633.086 1.331.086h2c.698 0 1.047 0 1.33-.086a2 2 0 0 0 1.334-1.333C21 6.797 21 6.448 21 5.75s0-1.047-.086-1.33a2 2 0 0 0-1.333-1.334C19.297 3 18.948 3 18.25 3Z"/>',
  width: 24,
  height: 24,
};
const userGroup = {
  body: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M15.5 11a3.5 3.5 0 1 0-7 0a3.5 3.5 0 0 0 7 0"/><path d="M15.483 11.35q.484.149 1.017.15a3.5 3.5 0 1 0-3.483-3.85m-2.034 0a3.5 3.5 0 1 0-2.466 3.7M22 16.5c0-2.761-2.462-5-5.5-5m1 8c0-2.761-2.462-5-5.5-5s-5.5 2.239-5.5 5"/><path d="M7.5 11.5c-3.038 0-5.5 2.239-5.5 5"/></g>',
  width: 24,
  height: 24,
};
const settings01 = {
  body: '<g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="m21.318 7.141l-.494-.856c-.373-.648-.56-.972-.878-1.101c-.317-.13-.676-.027-1.395.176l-1.22.344c-.459.106-.94.046-1.358-.17l-.337-.194a2 2 0 0 1-.788-.967l-.334-.998c-.22-.66-.33-.99-.591-1.178c-.261-.19-.609-.19-1.303-.19h-1.115c-.694 0-1.041 0-1.303.19c-.261.188-.37.518-.59 1.178l-.334.998a2 2 0 0 1-.789.967l-.337.195c-.418.215-.9.275-1.358.17l-1.22-.345c-.719-.203-1.078-.305-1.395-.176c-.318.129-.505.453-.878 1.1l-.493.857c-.35.608-.525.911-.491 1.234c.034.324.268.584.736 1.105l1.031 1.153c.252.319.431.875.431 1.375s-.179 1.056-.43 1.375l-1.032 1.152c-.468.521-.702.782-.736 1.105s.14.627.49 1.234l.494.857c.373.647.56.971.878 1.1s.676.028 1.395-.176l1.22-.344a2 2 0 0 1 1.359.17l.336.194c.36.23.636.57.788.968l.334.997c.22.66.33.99.591 1.18c.262.188.609.188 1.303.188h1.115c.694 0 1.042 0 1.303-.189s.371-.519.59-1.179l.335-.997c.152-.399.428-.738.788-.968l.336-.194c.42-.215.9-.276 1.36-.17l1.22.344c.718.204 1.077.306 1.394.177c.318-.13.505-.454.878-1.101l.493-.857c.35-.607.525-.91.491-1.234s-.268-.584-.736-1.105l-1.031-1.152c-.252-.32-.431-.875-.431-1.375s.179-1.056.43-1.375l1.032-1.153c.468-.52.702-.781.736-1.105s-.14-.626-.49-1.234Z"/><path d="M15.52 12a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0Z"/></g>',
  width: 24,
  height: 24,
};
const navigation01 = {
  body: '<path fill="none" stroke="currentColor" stroke-width="1.5" d="M14 12a2 2 0 1 1-4 0a2 2 0 0 1 4 0Zm-12.05c-.034-1.035 4.454-3.47 4.877-2.987c.48.548-.667 2.177-.925 2.695c-.155.312-.15.448.026.76c.8 1.41 1.196 2.113.95 2.417c-.393.485-4.895-1.874-4.928-2.885ZM11.95 22c1.035.034 3.47-4.455 2.987-4.877c-.548.48-2.177.666-2.695.925c-.312.155-.448.15-.76-.026c-1.41-.8-2.113-1.196-2.417-.95c-.485.393 1.874 4.895 2.885 4.928ZM22 12.05c.034-1.035-4.454-3.47-4.877-2.987c-.48.548.666 2.177.925 2.695c.155.312.15.448-.026.76c-.8 1.41-1.196 2.113-.95 2.417c.393.485 4.895-1.874 4.928-2.885ZM11.95 2c1.035-.034 3.47 4.454 2.987 4.877c-.548.48-2.177-.667-2.695-.925c-.312-.155-.448-.15-.76.026c-1.41.8-2.113 1.196-2.417.95C8.58 6.533 10.939 2.032 11.95 2Z"/>',
  width: 24,
  height: 24,
};
const arrowDown01 = {
  body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9s-4.419 6-6 6s-6-6-6-6"/>',
  width: 24,
  height: 24,
};
const logout01 = {
  body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.5 8.04c-.041-1.16-.178-1.885-.636-2.453c-.653-.812-1.77-1.066-4.004-1.576l-1-.228c-3.395-.774-5.092-1.161-6.226-.27C2.5 4.405 2.5 6.126 2.5 9.568v4.864c0 3.442 0 5.164 1.134 6.055s2.83.504 6.225-.27l1.002-.228c2.233-.51 3.35-.764 4.003-1.576c.458-.567.595-1.293.636-2.453m3-6.948s3 2.21 3 3s-3 3-3 3m2.5-3H8.5"/>',
  width: 24,
  height: 24,
};
const menu01 = {
  body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5h16M4 12h16M4 19h16"/>',
  width: 24,
  height: 24,
};
const notification01 = {
  body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.5 18a3.5 3.5 0 1 1-7 0m10.731 0H4.77a1.769 1.769 0 0 1-1.25-3.02l.602-.603A3 3 0 0 0 5 12.256V9.5a7 7 0 0 1 14 0v2.756a3 3 0 0 0 .879 2.121l.603.603a1.77 1.77 0 0 1-1.25 3.02"/>',
  width: 24,
  height: 24,
};
const cancel01 = {
  body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 6L6 18m12 0L6 6"/>',
  width: 24,
  height: 24,
};
const note01 = {
  body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.5 2v3m-9-3v3M12 2v3m1-1.5h-2c-3.3 0-4.95 0-5.975 1.025S4 7.2 4 10.5V15c0 3.3 0 4.95 1.025 5.975S7.7 22 11 22h2c3.3 0 4.95 0 5.975-1.025S20 18.3 20 15v-4.5c0-3.3 0-4.95-1.025-5.975S16.3 3.5 13 3.5M8 15h4m-4-4h8"/>',
  width: 24,
  height: 24,
};
const location01 = {
  body: '<g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13.618 21.367A2.37 2.37 0 0 1 12 22a2.37 2.37 0 0 1-1.617-.633C6.412 17.626 1.09 13.447 3.685 7.38C5.09 4.1 8.458 2 12.001 2s6.912 2.1 8.315 5.38c2.592 6.06-2.717 10.259-6.698 13.987Z"/><path d="M15.5 11a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0Z"/></g>',
  width: 24,
  height: 24,
};
const calendar01 = {
  body: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M16 2v4M8 2v4m5-2h-2C7.229 4 5.343 4 4.172 5.172S3 8.229 3 12v2c0 3.771 0 5.657 1.172 6.828S7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172S21 17.771 21 14v-2c0-3.771 0-5.657-1.172-6.828S16.771 4 13 4M3 10h18"/><path d="M10 18.5v-4.653c0-.191-.137-.347-.305-.347H9m5 4.998l1.486-4.606a.3.3 0 0 0-.286-.392H13"/></g>',
  width: 24,
  height: 24,
};
const time01 = {
  body: '<g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"><path d="M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z"/><path stroke-linecap="round" d="M12.008 10.508a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m0 0V7m3.007 8.02l-1.949-1.948"/></g>',
  width: 24,
  height: 24,
};
const truckDelivery = {
  body: '<g fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 17.972c-1.097-.054-1.78-.217-2.268-.704s-.65-1.171-.704-2.268M9 18h6m4-.028c1.097-.054 1.78-.217 2.268-.704C22 16.535 22 15.357 22 13v-2h-4.7c-.745 0-1.117 0-1.418-.098a2 2 0 0 1-1.284-1.284C14.5 9.317 14.5 8.945 14.5 8.2c0-1.117 0-1.675-.147-2.127a3 3 0 0 0-1.926-1.926C11.975 4 11.417 4 10.3 4H2m0 4h6m-6 3h4"/><path stroke-linecap="round" stroke-linejoin="round" d="M14.5 6h1.821c1.456 0 2.183 0 2.775.354c.593.353.938.994 1.628 2.276L22 11"/></g>',
  width: 24,
  height: 24,
};

// Register icons globally
addIcon("hugeicons:dashboard-square-02", dashboardSquare02);
addIcon("hugeicons:user-group", userGroup);
addIcon("hugeicons:settings-01", settings01);
addIcon("hugeicons:navigation-01", navigation01);
addIcon("hugeicons:arrow-down-01", arrowDown01);
addIcon("hugeicons:logout-01", logout01);
addIcon("hugeicons:menu-01", menu01);
addIcon("hugeicons:notification-01", notification01);
addIcon("hugeicons:cancel-01", cancel01);
addIcon("hugeicons:note-01", note01);
addIcon("hugeicons:location-01", location01);
addIcon("hugeicons:calendar-01", calendar01);
addIcon("hugeicons:time-01", time01);
addIcon("hugeicons:truck-delivery", truckDelivery);

// Register Service Worker for Offline-First support
registerSW({ immediate: true });

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Use our error handler for logging
    handleError(error, "React Error Boundary");
  }

  render() {
    if (this.state.hasError) {
      const isTechUser = window.location.search.includes("debug=1");

      return (
        <div
          style={{
            padding: "20px",
            color: "#ef4444",
            fontFamily: "system-ui, sans-serif",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>
            🚨 Something went wrong
          </h1>
          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            {isTechUser
              ? "An unexpected error occurred. Check the details below for debugging."
              : "We're sorry, but something unexpected happened. Please refresh the page and try again."}
          </p>

          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              🔄 Refresh Page
            </button>
            <button
              onClick={() =>
                this.setState({ hasError: false, error: null, errorInfo: null })
              }
              style={{
                background: "#6b7280",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>

          {isTechUser && (
            <details style={{ marginTop: "20px" }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                Technical Details (for developers)
              </summary>
              <pre
                style={{
                  background: "#f3f4f6",
                  padding: "15px",
                  borderRadius: "4px",
                  overflow: "auto",
                  marginTop: "10px",
                  fontSize: "12px",
                  border: "1px solid #d1d5db",
                }}
              >
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "20px" }}>
            If the problem persists, please contact support with details about
            what you were doing.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize Offline Sync Manager
initSyncManager();

// Enhanced global error handler
window.onerror = function (message, source, lineno, colno, error) {
  handleError(error || new Error(message), "Global Runtime Error");

  // Only show fallback UI if React hasn't mounted
  const root = document.getElementById("root");
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `
      <div style="padding: 20px; color: #ef4444; font-family: system-ui, sans-serif; text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 10px;">🚨 Application Error</h1>
        <p>A critical error occurred while loading the application.</p>
        <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: '5px'; cursor: pointer; margin-top: 10px;">
          🔄 Reload Application
        </button>
      </div>
    `;
  }

  return false; // Prevent default error handling
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
