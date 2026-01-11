import AppRoutes from "./AppRoutes";
import { Toaster } from "react-hot-toast";
import SyncIndicator from "../components/SyncIndicator";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: "#fff",
              color: "#000",
              border: "1px solid #249D77",
            },
            iconTheme: {
              primary: "#249D77",
              secondary: "#fff",
            },
          },
          error: {
            style: {
              background: "#fff",
              color: "#000",
              border: "1px solid #ef4444",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <AppRoutes />
      <SyncIndicator />
    </>
  );
}

export default App;
