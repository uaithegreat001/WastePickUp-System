import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: "#249D77",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#249D77",
            },
          },
        }}
      />
      <AppRoutes />
    </>
  );
}

export default App;
