import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

window.onerror = function (message, source, lineno, colno, error) {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; color: #ef4444; font-family: sans-serif;">
        <h1 style="font-size: 24px; margin-bottom: 10px;">Runtime Error</h1>
        <p style="font-weight: bold;">${message}</p>
        <p>File: ${source}:${lineno}:${colno}</p>
        <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow: auto; margin-top: 10px;">
          ${error && error.stack ? error.stack : "No stack trace"}
        </pre>
      </div>
    `;
  }
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
